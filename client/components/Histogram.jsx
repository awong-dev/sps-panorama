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
    };

    this.drawChart = this.drawChart.bind(this);
    this.getChartOptions = this.getChartOptions.bind(this);
    this.getSeries = this.getSeries.bind(this);
  }

  componentDidMount() {
    this.drawChart();
  }

  getChartOptions() {
    return {
      title: { text: `(distictive quest. score = ${Math.round(this.props.diff_score)})` },
      xAxis: {
        title: { text: this.props.data.xlabel },
        categories: this.props.data.categories
      },
      yAxis: {
        title: { text: this.props.data.ylabel }
      }
    };
  }

  drawChart() {
    const chart_options = this.getChartOptions();
    chart_options.plotOptions = {
	   column: {
		pointPadding: 0,
		shadow: false
	   }
	 };
    chart_options.series = this.getSeries();
    this.chart = Highcharts.chart(this.state.id, chart_options);
  }

  getSeries() {
    return this.props.data.series.map(d => Object.assign({ type: "column" }, d));
  }

  componentDidUpdate() {
    clearTimeout(this.chartIsUpdating);
    this.chartIsUpdating = setTimeout(() => {
      const series = this.getSeries();
      // Remove extraneious series.
      for (let i = this.chart.series.length - 1; i >= series.length; i--) {
        this.chart.series[i].remove();
      }

      series.forEach((s, idx) => {
        if (idx >= this.chart.series.length) {
          this.chart.addSeries(s, false);
        } else {
          this.chart.series[idx].update(s, false);
        }
      });
      this.chart.update(this.getChartOptions());
    }, 100);
  }

  render() {
    return (
      <ChartCard
        title={this.props.title}
        onResize={(contentRect) => this.setState({width: contentRect.bounds.width - 10})}>
        <div id={this.state.id} ref={(r) => this.chartRef = r} />
      </ChartCard>
    );
  }
}

export default Histogram;
