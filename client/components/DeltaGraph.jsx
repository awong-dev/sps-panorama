import React from 'react'
import * as d3 from "d3";
import ChartCard from './ChartCard'

class DeltaGraph extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: this.props.surveyData.calculateDeltas('Negative'),
      width: 1024,
      height: 400
    };

    this.drawChart = this.drawChart.bind(this);
  }

  componentDidMount() {
    this.drawChart();
  }

  drawChart() {
    this.svg = d3.select(this.chartRef).selectAll("g").remove();
    this.svg = d3.select(this.chartRef)
      .attr("width", this.state.width)
      .attr("height", this.state.height)
      .append('g')
        .attr('class', 'chart-inner');

    this.processing();
  }

  componentWillUnmount() {
    clearInterval(this._interval);
  }

  componentDidUpdate() {
    this.drawChart();
  }

  processing() {
    const { xScale, yScale, colorScale } = this.getScales();

    const bars = this.svg.selectAll('g')
      .data(this.state.data, (d) => {
        return d.label;
      });

    const enterGElements = bars
      .enter()
        .append('g')
          .attr('class', 'added')
          .attr('transform', (x, i) => `translate(${xScale(x.label)}, 0)`);

    bars
      .attr('class', 'updated');

    const barStart = (val) => {
      if (val > 0) {
        return this.state.height / 2 - yScale(Math.abs(val));
      } else {
        return this.state.height / 2;
      }
    };

    enterGElements
      .append('rect')
        .attr("width", xScale.bandwidth())
        .attr('y', (d) => barStart(d.val))
        .attr("height", (d) => yScale(Math.abs(d.val)))
        .attr("fill", (d) => colorScale(d.val));

    bars
      .exit()
        .remove();
  }

  getScales() {
   const xScale = d3.scaleBand()
      .range([0, this.state.width])
      .padding(0.1)
      .domain(this.state.data.map((d) => d.label));

    const yScale = d3.scaleLinear()
      .domain([0, 4])
      .range([0, this.state.height / 2]);

    const colorScale = (val) => {
      if (val == -4) {
        return d3.color('Red');
      }
      if (val == -3) {
        return d3.color('HotPink');
      }
      if (val == -2) {
        return d3.color('Pink');
      }
      if (val == -1) {
        return d3.color('papayawhip');
      }
      if (val == 1) {
        return d3.color('aquamarine');
      }
      if (val == 2) {
        return d3.color('palegreen');
      }
      if (val == 3) {
        return d3.color('MediumSeaGreen');
      }
      if (val == 4) {
        return d3.color('Green');
      }
      return d3.color('Gray');
    };

    return { xScale, yScale, colorScale };
  }

  render() {
    return (
      <ChartCard
        title="Delta Graph"
        surveyData='Bar graph of deltas for Negative feelings from enter to "now"'
        onResize={(contentRect) => this.setState({width: contentRect.bounds.width})}>
        <svg ref={(r) => this.chartRef = r}>
        </svg>
      </ChartCard>
    );
  }
}

export default DeltaGraph;
