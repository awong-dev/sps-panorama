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
      title: props.title
    };

    this.drawChart = this.drawChart.bind(this);
    this.getSeries = this.getSeries.bind(this);
  }

  componentDidMount() {
    this.drawChart();
  }

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
      series: this.getSeries()
    });
  }

  getSeries() {
    return this.props.data.series.map(d => Object.assign({ type: "column" }, d));
  }

  componentDidUpdate() {
    clearTimeout(this.chartIsUpdating);
    this.chartIsUpdating = setTimeout(() => {
      const series = this.getSeries();
      // TODO(awong): Delete later ones.
      // TODO(awong): Add new ones.
      series.forEach((s, idx) => {
        console.log(s, idx);
        this.chart.series[idx].setData(s.data, true);
      });
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
