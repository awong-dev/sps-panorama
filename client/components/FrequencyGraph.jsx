import React from 'react'
import * as d3 from "d3";
import ChartCard from './ChartCard'

const kCirclePadding = 1; // This is a hack to do position calculations.
class FrequencyGraph extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: this.extractFrequencies(this.props.surveyData.calculateDeltas('Negative')),
      width: 1024,
      height: 400
    };

    this.drawChart = this.drawChart.bind(this);
  }

  extractFrequencies(deltas) {
    let distance = 0;
    const frequencies = [];
    for (let i in deltas) {
      const d = deltas[i];
      const sort_order = d.val + 4; // Shift it so there's no negatives.
      frequencies[sort_order] = frequencies[sort_order] || {
        count: 0, 
        label: d.val,
        sort_order: sort_order
      };
      frequencies[sort_order].count++;
    }
    frequencies.sort((a, b) => {
      if (a.sort_order < b.sort_order)
        return -1;
      if (a.sort_order > b.sort_order) 
        return 1;
      return 0;
    });
    for (let i in frequencies) {
      const f = frequencies[i];
      const radius = Math.sqrt(f.count) / 2;
      const center = radius  + distance + kCirclePadding;
      distance += radius * 2 + kCirclePadding;
      f.radius = radius;
      f.center = center;
    }
    return frequencies;
  }

  componentDidMount() {
    this.drawChart();
  }

  drawChart() {
    d3.select(this.chartRef).selectAll("g").remove();
    this.svg = d3.select(this.chartRef)
      .attr("width", this.state.width)
      .attr("height", this.state.height)
      .attr("class", 'graph-svg-component')
      .append('g')
          .attr('class', 'chart-inner');

    this.processing();
  }

  componentDidUpdate() {
    this.drawChart();
  }

  processing() {
    const { xScale, yScale, colorScale } = this.getScales();

    const circles = this.svg.selectAll('g')
      .data(this.state.data, (d) => {
        return d.label;
      });

    const enterGElements = circles
      .enter()
        .append('g')
          .attr('class', 'added')
          .attr('transform', (x, i) => `translate(${xScale(x.label)}, 0)`);

    circles
      .attr('class', 'updated');

    enterGElements
      .append('circle')
        .attr("cx", (d) => xScale(d.center))
        .attr('cy', (d) => this.state.height - yScale(d.radius))
        .attr("r", (d) => yScale(d.radius))
        .attr("fill", (d) => colorScale(d.label));

    const text = this.svg.append("g")
      .attr("class", "labels")
      .selectAll("text")
        .data(this.state.data)
        .enter().append("text")
        .attr("dx", (d) => xScale(d.center))
        .attr('dy', (d) => this.state.height - yScale(d.radius))
        .text(d => d.label);

    circles
      .exit()
        .remove();
  }

  getScales() {
    const firstElement = this.state.data[0];
    const lastElement = this.state.data[this.state.data.length - 1];
    const rightMostPoint = lastElement.center + lastElement.radius * 2 + kCirclePadding;
    const topMostRadius = Math.max(... this.state.data.map(d => d.radius));
    const xScale = d3.scaleLinear()
    .domain([- 2 * kCirclePadding, rightMostPoint + 4 * kCirclePadding])  // This is wrong.
      .range([0, this.state.width]);

    const yScale = d3.scaleLinear()
      .domain([0, Math.ceil(topMostRadius)])
      .range([0, this.state.height / 2]);

    const colorScale = (val) => {
      let color = d3.color('Gray');
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
        title="Delta Frequncy Graph"
        surveyData="Visual Representation of frequency for various deltas"
        onResize={(contentRect) => this.setState({width: contentRect.bounds.width})}>
        <svg ref={(r) => this.chartRef = r}>
        </svg>
      </ChartCard>
    );
  }
}

export default FrequencyGraph;
