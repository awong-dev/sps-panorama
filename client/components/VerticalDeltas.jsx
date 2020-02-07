import React from 'react'
import Highcharts from 'highcharts'
import HighchartsMore from 'highcharts/highcharts-more.src'
import ChartCard from './ChartCard'
HighchartsMore(Highcharts);

class VerticalDeltas extends React.Component {
  constructor(props) {
    super(props);
    const data = this.props.surveyData.getEnteredNowValues(props.category);
    const series_name = 'Enter -> Now';
    this.state = {
      data: props.gotBetter ? data.got_better : data.got_worse,
      color: props.gotBetter ? 'green' : 'red',
      series_name,
      revsere_y: props.gotBetter,
      id: `vertical-deltas-${props.category}-${props.gotBetter}-container`,
      title: `${series_name} : ${props.category}`,
    };
  }

  componentDidMount() {
    this.drawChart();
  }

  drawChart() {
    Highcharts.chart(this.state.id, {
	 chart: {
	   type: 'columnrange',
	   inverted: true
	 },
	 title: {
	   text: this.state.title,
	 },
	 xAxis: {
	   title: { text: 'Entry' },
	 },
	 yAxis: {
	   title: { text: 'Ratings' },
        reversed: this.state.revsere_y,
	 },
	 plotOptions: {
	   columnrange: {
		dataLabels: {
		  enabled: true,
		  formatter: function () {
		    return this.y;
		  }
		}
	   }
	 },
	 series: [{
        turboThreshold: 2000,
	   name: this.state.series_name,
	   data: this.state.data,
        color: this.state.color,
	 }]
    });
  }

  componentDidUpdate() {
    this.drawChart();
  }

  render() {
    return (
      <ChartCard
        title={this.state.title}
        surveyData="Count of enter/now values"
        onResize={(contentRect) => this.setState({width: contentRect.bounds.width})}>
        <div id={this.state.id} ref={(r) => this.chartRef = r} />
      </ChartCard>
    );
  }
}

export default VerticalDeltas;
