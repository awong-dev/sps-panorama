const csv = require('csv-parser')
const fs = require('fs')
const results = [];

// report_type -> survey -> subject name [district or school] -> question -> [responses base don "answer mode"]
const reports = {};

const answer_modes = {};
const answer_texts = {};
const subject_names = {};
const surveys = {};

fs.createReadStream(process.argv[2])
  .pipe(csv())
  .on('data', (data) => {
    const raw_report_type = data['Report Type'];
    const raw_subject_name = data['Report Subject Name'];
    const raw_survey = data['Survey'];
    const raw_question = data['Question Text'];
    const raw_answer_mode = data['Answer Mode'];
    const raw_percent_favorable = parseInt(data['Percent Favorable']);
    const raw_total_respondents = parseInt(data['Total Respondents']);
    const raw_answers = [];
    const raw_answer_respondents = [];
    for (let i = 1; i <=7; i++) {
      const text = data[`Answer ${i} Text`];
      if (text) {
        raw_answers.push(text);
        raw_answer_respondents.push(parseInt(data[`Answer ${i} Respondents`]));
      }
    }
    surveys[raw_survey] = 1;
    subject_names[raw_subject_name] = 1;
    // Missing demographic info still.

    // Each row is a new question.
    if (raw_answers.length > 0) {
      const report = reports[raw_report_type] = reports[raw_report_type] || {};
      const survey = report[raw_survey] = report[raw_survey] || {};
      const subject = survey[raw_subject_name] = survey[raw_subject_name] || {};
      subject[raw_question] = {
        answers: raw_answers,
        answer_respondents: raw_answer_respondents
      };
      answer_modes[raw_answer_mode] = 1;
      answer_texts[JSON.stringify(raw_answers)] = 1;
    }
  })
  .on('end', () => {
    console.log(JSON.stringify({
      reports,
      surveys: Object.keys(surveys),
      subject_names: Object.keys(subject_names),
      answer_texts: Object.keys(answer_texts).map(s => JSON.parse(s)),
      answer_modes: Object.keys(answer_modes)
    } , null, 2));

    // Sanity check print-outs.
    //console.log(JSON.stringify(answer_texts, null, 2));
    //console.log(JSON.stringify(answer_modes, null, 2));
  });
