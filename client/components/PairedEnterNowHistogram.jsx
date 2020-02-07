import React from 'react';
import Highcharts from 'highcharts'
import ChartCard from './ChartCard'
import {enableUniqueIds} from 'react-html-id';
import jStat from 'jstat';

function getTitle(category) {
  return `${category} Enter-Now Histogram`;
}

const xLabels = ['5', '4', '3', '2', '1'];
const xLabelsRld = (()=>{
  const array = [];
  for (let enter = 5; enter >= 1; enter--) {
    for (let now = 5; now >= 1; now--) {
      array.push(`(${enter},${now})`);
    }
  }
  return array;
})();

function round(num) {
  return Math.round(num*1000)/1000;
}

function getMean(bucket) {
  let sum = 0;
  let cnt = 0;
  for (const val of bucket) {
    const score = parseInt(xLabels[val[0]]);
    sum += score * val[1];
    cnt += val[1];
  }
  return round(sum/cnt);
}


class PairedEnterNowHistogram extends React.Component {
  constructor(props) {
    super(props);
    enableUniqueIds(this);

    this.state = {
      id: this.nextUniqueId(),
      title: `Histrogram of Now Ratings, Grouped by Enter Rating`, 
      remove_zero_change: false,
    };

    this.drawChart = this.drawChart.bind(this);
  }

  countValues(data) {
    const buckets = {};
    for (const val of data) {
      buckets[val] = buckets[val] ? buckets[val] + 1 : 1;
    }
    const results = [];
    for (const label of xLabels) {
      results.push([xLabels.indexOf(label), buckets[label]]);
    }
    return results;
  }

  componentDidMount() {
    this.drawChart();
  }

  getData() {
    const values = this.props.values;
    return {
      now_buckets: {
        5: this.countValues(values.filter(d => d.now == 5).map(d => `${d.enter}`)),
        4: this.countValues(values.filter(d => d.now == 4).map(d => `${d.enter}`)),
        3: this.countValues(values.filter(d => d.now == 3).map(d => `${d.enter}`)),
        2: this.countValues(values.filter(d => d.now == 2).map(d => `${d.enter}`)),
        1: this.countValues(values.filter(d => d.now == 1).map(d => `${d.enter}`)),
      },
      enter_buckets: {
        5: this.countValues(values.filter(d => d.enter == 5).map(d => `${d.now}`)),
        4: this.countValues(values.filter(d => d.enter == 4).map(d => `${d.now}`)),
        3: this.countValues(values.filter(d => d.enter == 3).map(d => `${d.now}`)),
        2: this.countValues(values.filter(d => d.enter == 2).map(d => `${d.now}`)),
        1: this.countValues(values.filter(d => d.enter == 1).map(d => `${d.now}`)),
      }
    };
  }

  drawChart() {
    const data = this.getData();
    this.chart = Highcharts.chart(this.state.id, {
	 title: { text: getTitle(this.props.dataControl.category) },
	 xAxis: {
	   title: { text: 'Rating at Enter' },
	   categories: xLabels,
	 },
	 yAxis: {
	   title: { text: 'Count' }
	 },
	 plotOptions: {
	   column: {
		pointPadding: 0,
		shadow: false
	   }
	 },
      series: [
        {
          name: 'Now = 5',
          type: 'column',
          data: data.now_buckets[5],
        }, {
          name: 'Now = 4',
          type: 'column',
          data: data.now_buckets[4],
        }, {
          name: 'Now = 3',
          type: 'column',
          data: data.now_buckets[3],
        }, {
          name: 'Now = 2',
          type: 'column',
          data: data.now_buckets[2],
        }, {
          name: 'Now = 1',
          type: 'column',
          data: data.now_buckets[1],
        },
      ]
    });
  }

  componentDidUpdate() {
    clearTimeout(this.chartIsUpdating);
    this.chartIsUpdating = setTimeout(() => {
        this.chart.title.update({ text: getTitle(this.props.dataControl.category) });
        this.chart.series[0].setData(this.data.now_buckets[5], false);
        this.chart.series[1].setData(this.data.now_buckets[4], false);
        this.chart.series[2].setData(this.data.now_buckets[3], false);
        this.chart.series[3].setData(this.data.now_buckets[2], false);
        this.chart.series[4].setData(this.data.now_buckets[1], true);
      }, 100);
  }

  render() {
    this.data = this.getData();
    let summary = "";
    if (this.data) {
      summary = (
        <section className="mdc-card__supporting-text detail-box">
          <span className="details">avg_exit@5={getMean(this.data.enter_buckets[5])}</span>
          <span className="details">avg_exit@4={getMean(this.data.enter_buckets[4])}</span>
          <span className="details">avg_exit@3={getMean(this.data.enter_buckets[3])}</span>
          <span className="details">avg_exit@2={getMean(this.data.enter_buckets[2])}</span>
          <span className="details">avg_exit@1={getMean(this.data.enter_buckets[1])}</span>
        </section>);
    }
    return (
      <ChartCard
        title={this.state.title}
        onResize={(contentRect) => this.setState({width: contentRect.bounds.width})}>
        <div id={this.state.id} ref={(r) => this.chartRef = r} />
        {summary}
      </ChartCard>
    );
  }
}

export default PairedEnterNowHistogram;
