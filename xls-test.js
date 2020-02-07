
const excel_filename = 'All_Climate_Survey_Data_Accessible_ADA.xlsx';

/*
const fs = require('fs');
const xlsx = require('xlsx');
const workbook = xlsx.readFile(excel_filename);
xlsx.stream.to_csv(worksheet).pipe(
  fs.createWriteStream(output_file_name);
);
*/

const fs = require('fs');
const exceljs = require('exceljs');
const workbook = new exceljs.Workbook();
workbook.xlsx.readFile(excel_filename)
  .then(() => {
    workbook.eachSheet((worksheet, sheetId) => {
      const stream = fs.createWriteStream(`data-${worksheet.name.replace(/ /g, '-')}.csv`);
      workbook.csv.write(stream, { sheetId: sheetId });
    });
  })
  .then(() => { console.log("done"); });
