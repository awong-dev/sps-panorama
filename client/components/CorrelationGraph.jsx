import React from 'react'
import * as d3 from "d3";
import ChartCard from './ChartCard'

class CorrelationGraph extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: this.props.surveyData.getCorrelations(
        props.category,
        props.is_mental_health_provider,
        props.is_other_healthcare_provider,
        props.is_midaged_male),
      width: this.props.width,
      height: this.props.height
    };

    this.drawChart = this.drawChart.bind(this);
  }

  componentDidMount() {
    this.drawChart();
  }

  // Redraw on size change.
  componentDidUpdate() {
    this.drawChart();
  }

  drawChart() {
    // Remove all SVG subcomponents.
    d3.select(this.chartRef).selectAll("g").remove();

    // Setup the SVG.
    this.svg = d3.select(this.chartRef)
      .attr("width", this.state.width)
      .attr("height", this.state.height)
      .attr("class", 'graph-svg-component')
      .append('g')
          .attr('class', 'chart-inner');

    this.processing();
  }

  processing() {
    const { xScale, yScale, colorScale } = this.getScales();

    const row = this.svg.selectAll('.correlation-row')
    .data(this.state.data.table);
    const rowenter = row.enter().append("g")
      .attr("class", "correlation-row")
      .attr("transform", (_, i) => `translate(0, ${yScale(i)})`);

    const cell = row.merge(rowenter).selectAll('.correlation-cell')
      .data((d) => d)
      .enter().append("g")
      .attr("class", "correlation-cell")
      .attr("transform", (_, i) => `translate(${xScale(i)}, 0)`);

    cell.append('rect')
      .attr("width", xScale.bandwidth())
      .attr("height", yScale.bandwidth())
      .style("stroke-width", 0)
	  .style("fill", colorScale);

    cell.append("text")
	    .attr("dy", ".32em")
	    .attr("x", xScale.bandwidth() / 2)
	    .attr("y", yScale.bandwidth() / 2)
	    .attr("text-anchor", "middle")
	    .style("fill", 'white')
	    .text((d, i) => { return d; });


    cell
      .exit()
        .remove();
    row
      .exit()
        .remove();
  }

  getScales() {
   const xScale = d3.scaleBand()
      .domain([0,1,2,3,4])
      .range([0, this.state.width]);

   const yScale = d3.scaleBand()
      .domain([0,1,2,3,4])
      .range([0, this.state.height]);

   const colorScale = d3.scaleLinear()
      .domain([0, this.state.data.max_value])
      .range(["lightBlue", "red"]);

    return { xScale, yScale, colorScale };
  }

  render() {
    // TODO(ajwong): Extract charge container.
    return (
      <ChartCard
        title={`Correlation Graph for ${this.props.extraTitle}`}
        subtitle="Enter vs Now correlations">
        <svg ref={(r) => this.chartRef = r}>
        </svg>
      </ChartCard>
    );
  }
}

export default CorrelationGraph;
