const asyncLib = require('async');
const csvParse = require('csv-parse');
const fs = require('fs');
const where = require('node-where');
const url = require('url');
const child_process = require('child_process');

const kSurveyBecame8Min = new Date('2015-08-07 05:00:00 GMT').getTime();

const IntegralFields = {
  'Entered-Negative': null,
  'Entered-Suicidal': null,
  'Now-Negative': null,
  'Now-Suicidal': null,
  'Entry Id': null,
};

const BooleanFields = {
  'male ages 36-64': null,
  'mental health provider': null,
  'other healthcare provider': null,
};

const DateTimeFields = {
  "Entry Date": null,
  "Payment Date": null,
};

// Parse the data.
const parser = csvParse({delimiter: ','});
const output = [];
parser.on('readable', () => {
  while(record = parser.read()){
    output.push(record);
  }
});

const ip_to_id = {};
let current_ip_id = 1;
function anonymize_ip(ip) {
  if (ip_to_id[ip] === undefined) {
    ip_to_id[ip] = current_ip_id;
    current_ip_id = current_ip_id + 1;
  }
  return ip_to_id[ip];
}

// Converts field data from strings to more suitable types.
// Scrubs data fields except for User IP.
function clean_fields(item, header) {
  for (let x = 0; x < item.length; x++) {
    const header_value = header[x];
    if (IntegralFields.hasOwnProperty(header_value)) {
      item[x] = parseInt(item[x]);
    } else if (BooleanFields.hasOwnProperty(header_value)) {
      item[x] = item[x] !== '';
    } else if (DateTimeFields.hasOwnProperty(header_value)) {
      item[x] = (new Date(`${item[x]} GMT`)).getTime();  // NMN database runs in GMT.
    }

    // Only keep the pathname. Drop query string for privacy. Drop host name for space.
    if (header_value === 'Source Url') {
      item[x] = url.parse(item[x]).pathname;
    }

    if (header_value === 'User Agent') {
      // Sometimes the user agent is quoted. Remove that.
      if (item[x][0] === '"') {
        item[x] = item[x].slice(1, -1);
      }
    }
  }
}

function process_row(row, header, cb) {
  const ipIndex = header.indexOf('User IP');
  // Overwite IP with anonymized verison.
  const ip = row[ipIndex];
  row[ipIndex] = anonymize_ip(ip);

  clean_fields(row, header);

  const uaIndex = header.indexOf('User Agent');
  const entryDateIndex = header.indexOf('Entry Date');
  const entryDate = row[entryDateIndex];
  const options = {
    input: row[uaIndex]
  };
  const result = child_process.execSync('php is_mobile.php', options).toString();
  const is_mobile = result.match(/.*,1\n/) !== null;
  let survey_time = 1;
  if (is_mobile === false) {
    if (entryDate < kSurveyBecame8Min) {
      survey_time = 3;
    } else {
      survey_time = 8;
    }
  }

  row.push(is_mobile, survey_time);
  fill_in_geo(ip, row, cb, 3);
}

function output_results(err, header, rows) {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  const HeadersForOutput = {
    "Entered-Negative": null,
    "Entered-Suicidal": null,
    "Now-Negative": null,
    "Now-Suicidal": null,
    "male ages 36-64": null,
    "mental health provider": null,
    "other healthcare provider": null,
    "Entry Date": null,
    "Source Url": null,
    "User IP": null,
    "Is Mobile": null,
    "Survey Time": null,
    'State': null,
    'Country': null
  };

  // Initialize Headers.
  for (let i = 0; i < header.length; i++) {
    const header_value = header[i];
    if (HeadersForOutput.hasOwnProperty(header_value)) {
      HeadersForOutput[header_value] = i;
    }
  }
  const results = {
    header: Object.keys(HeadersForOutput),
    data: {},
  }
  const entryIdIndex = header.indexOf('Entry Id');
  for (let r of rows) {
    const new_row = [];
    for (let i = 0; i < r.length; i++) {
      const header_value = header[i];
      if (HeadersForOutput.hasOwnProperty(header_value)) {
        new_row[results.header.indexOf(header_value)] =
          r[HeadersForOutput[header_value]];
      }
    }
    results.data[r[entryIdIndex]] = new_row;
  }
  console.log(JSON.stringify(results));
}

function fill_in_geo(ip, item, cb, retries) {
  where.is(ip, (err, result) =>{
    if (err === null) {
      item.push(result.get('region') || null,
                result.get('country') || null);
    } else {
      if (retries > 0) {
        // Hacky back-off with jitter on failure.
        const waitTill = new Date(new Date().getTime() + Math.floor(Math.random() * (10 - 2 + 1) + 2));
        while(waitTill > new Date()){}
        fill_in_geo(ip, item, cb, retries - 1);
        return;
      }
      console.error(`Unable to lookup ${ip}`, err);
    }
    cb(null, item);
  });
}

// Catch any error
parser.on('error', (err) => {
  console.log(err.message);
  process.exit(1);
});

// When we are done, test that the parsed output matched what expected
parser.on('finish', () =>{
  const header = output[0];
  header.push('Is Mobile', 'Survey Time', 'State', 'Country');

  const data_rows = output.slice(1);
  asyncLib.map(data_rows,
               (row, cb) => process_row(row, header, cb),
               (err, rows) => output_results(err, header, rows));
});

// command is : node myscript.js filename
fs.createReadStream(process.argv[2]).pipe(parser);
