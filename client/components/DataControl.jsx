import React from 'react';
import Highcharts from 'highcharts'
import ChartCard from './ChartCard'
import Checkbox from './Checkbox'

function DataControl({school1, onSchoolChange, schools}) {
  const school_options = [];
  schools.forEach((school, idx) => school_options.push(
    <option key={idx} value={school}>{school}</option>
  ));
  return (
    <ul className="mdc-list">
      <li className="mdc-list-item">
          Select school.
        <select value={school1} onChange={onSchoolChange}>
          {school_options}
        </select>
      </li>
    </ul>
  );
}

export default DataControl;
