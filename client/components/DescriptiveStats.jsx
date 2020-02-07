import React from 'react';
import ChartCard from './ChartCard'
import jStat from 'jstat';

function getStats(jstat_obj) {
  const mean = jstat_obj.mean();
  const stdev = jstat_obj.stdev();
  const stderr = stdev / Math.sqrt(jstat_obj.cols());
  const ci95 = jstat_obj.normalci(mean, 0.05);
  return {
    mean, stdev, stderr, ci95
  }
}

function getData(values) {
  const enter_values = values.map(d => d.enter);
  const now_values = values.map(d => d.now);
  return {
    num_samples: values.length,
    enter_stats: getStats(jStat(enter_values)),
    now_stats: getStats(jStat(now_values)),
  };
}

function round(num) {
  return Math.round(num*1000)/1000;
}

const DescriptiveStats = ({values}) => {
  const data = getData(values);
  return (
    <ChartCard title="Descriptive Stats">
      <div className="mdc-layout-grid">
        <div className="mdc-layout-grid__inner">
          Basic stats:
          <table className="stats-table">
            <tbody>
              <tr>
                <td>Enter</td>
                <td>Mean: {round(data.enter_stats.mean)}</td>
                <td>Stderr: {round(data.enter_stats.stderr)}</td>
                <td>Stddev: {round(data.enter_stats.stdev)}</td>
                <td>CI: [{round(data.enter_stats.ci95[0])},
                  {round(data.enter_stats.ci95[1])}]</td>
              </tr>
              <tr>
                <td>Now</td>
                <td>Mean: {round(data.now_stats.mean)}</td>
                <td>Stderr: {round(data.now_stats.stderr)}</td>
                <td>Stddev: {round(data.now_stats.stdev)}</td>
                <td>CI: [{round(data.now_stats.ci95[0])},
                  {round(data.now_stats.ci95[1])}]</td>
              </tr>
              <tr><td>Num Samples: {data.num_samples}</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </ChartCard>
  );
};

export default DescriptiveStats;
