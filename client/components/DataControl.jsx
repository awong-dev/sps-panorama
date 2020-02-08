import React from 'react';
import Highcharts from 'highcharts'
import ChartCard from './ChartCard'
import Checkbox from './Checkbox'

function DataControl({data, report_type, survey, subjects, onChange}) {
  if (!data) {
    return (<div>Loading Data</div>);
  }

  const makeOptions = (types) => {
    const options = [];
    [ "", ...types].forEach((type, idx) => options.push(
      <option key={idx} value={type}>{type}</option>
    ));
    return options;
  };

  // Setup report type Elements.
  const raw_report_types = Object.keys(data);
  const report_type_options = makeOptions(raw_report_types);

  // Setup survey Elements.
  const raw_surveys = data[report_type] ? Object.keys(data[report_type]) : [];
  const survey_options = makeOptions(raw_surveys);

  // Setup subject Elements.
  const raw_subjects = data[report_type] && data[report_type][survey] ? Object.keys(data[report_type][survey]) : [];
  const subject_options = makeOptions(raw_subjects);

  const subject_choices = [];
  subjects.forEach((subject, idx) => {
    subject_choices.push(
      <li className="mdc-list-item">
        Subject {idx+1}:
        <select key={`choice-${idx}`} data-type="subject" data-ordinal={idx} value={subject} onChange={onChange}>
            {subject_options}
        </select>
      </li>
    );
  });

  return (
    <ul className="mdc-list">
      <li>
        <label htmlFor="report-type">Report Type:</label>
        <select name="report-type" value={report_type} data-type="report" onChange={onChange}>
            {report_type_options}
        </select>
      </li>
      <li>
        <label htmlFor="survey">Survey:</label>
        <select name="survey" value={survey} data-type="survey" onChange={onChange}>
            {survey_options}
        </select>
      </li>
      <hr />
      {subject_choices}
    </ul>
  );
}

export default DataControl;
