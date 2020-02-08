import React from 'react';
import Highcharts from 'highcharts'
import ChartCard from './ChartCard'
import {enableUniqueIds} from 'react-html-id';
import jStat from 'jstat';

function getTitle(category) {
  return `${category} Ratings Histogram`;
}

class Histogram extends React.Component {
  constructor(props) {
    super(props);
    enableUniqueIds(this);
    this.state = {
      id: this.nextUniqueId(),
      title: `Question`
    };

    this.drawChart = this.drawChart.bind(this);
  }

  componentDidMount() {
    this.drawChart();
  }

  /*
  getData() {
    const question = Object.keys(this.props.values)[3];
    const values = this.props.values[question];
    return [
      enter: [1, 9, 3],
      now: []
    ]
  }
  */

  drawChart() {

    this.chart = Highcharts.chart(this.state.id, {
	 title: { text: this.props.title },
	 xAxis: {
	   title: { text: this.props.data.xlabel },
	   categories: this.props.data.categories
	 },
	 yAxis: {
	   title: { text: this.props.data.ylabel }
	 },
	 plotOptions: {
	   column: {
		pointPadding: 0,
		shadow: false
	   }
	 },
      series: this.props.data.series.map(d => Object.assign({ type: "column" }, d))
    });
  }

  componentDidUpdate() {
    clearTimeout(this.chartIsUpdating);
    this.chartIsUpdating = setTimeout(() => {
      /*
      const data = this.getData();
      this.chart.title.update({ text: getTitle(this.props.dataControl.category) });
      this.chart.series[0].setData(data.enter, false);
      this.chart.series[1].setData(data.now, true);
      */
    }, 100);
  }

  render() {
    return (
      <ChartCard
        title={this.state.title}
        onResize={(contentRect) => this.setState({width: contentRect.bounds.width})}>
        <div id={this.state.id} ref={(r) => this.chartRef = r} />
      </ChartCard>
    );
  }
}

export default Histogram;
