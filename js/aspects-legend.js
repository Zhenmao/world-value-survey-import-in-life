class AspectsLegend {
  constructor({ el, aspects }) {
    this.el = el;
    this.aspects = aspects;
    this.render();
  }

  render() {
    this.container = d3.select(this.el).classed("aspects-legend", true);

    this.legendItem = this.container
      .selectAll(".legend-item")
      .data(this.aspects)
      .join("div")
      .attr("class", "legend-item");

    this.legendItem
      .append("div")
      .attr("class", "legend-item__icon")
      .text((d) => d.substring(0, 2));

    this.legendItem
      .append("div")
      .attr("class", "legend-item__label")
      .text((d) => d);
  }
}
