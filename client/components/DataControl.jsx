import React from 'react';
import Highcharts from 'highcharts'
import ChartCard from './ChartCard'
import Checkbox from './Checkbox'

function DataControl({schoolList, onSchoolChange, schools}) {
  const school_options = [];
  school_options.push(
    <option key="default" value=""></option>
  )
  schools.forEach((school, idx) => school_options.push(
    <option key={idx} value={school}>{school}</option>
  ));
  const choices = [];
  schoolList.forEach((school, idx) => {
    choices.push(
      <li className="mdc-list-item">
        School {idx+1}:
        <select key={`choice-${idx}`} data-ordinal={idx} value={school} onChange={onSchoolChange}>
            {school_options}
        </select>
      </li>
    );
  });
  return (
    <ul className="mdc-list">
        {choices}
    </ul>
  );
}

export default DataControl;
