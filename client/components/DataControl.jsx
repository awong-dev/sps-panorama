import React from 'react';
import Highcharts from 'highcharts'
import ChartCard from './ChartCard'
import Checkbox from './Checkbox'

function DataControl({school1, onSchoolChange}) {
   return (
     <ul className="mdc-list">
       <li className="mdc-list-item">
       Select school.
         <select value={school1} onChange={onSchoolChange}>
           <option value="Adams">Adams</option>
           <option value="BF Day">BF Day</option>
         </select>
       </li>
     </ul>
     );
}

export default DataControl;
