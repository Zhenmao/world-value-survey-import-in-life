class Tooltip {
  constructor() {
    this.tooltip = d3.select("body").append("div").attr("class", "tooltip");
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
  }

  show(content, target) {
    this.tooltip.html(content);
    let { x, y, width, height } = target.getBoundingClientRect();
    let { width: tWidth, height: tHeight } = this.tooltip
      .node()
      .getBoundingClientRect();
    x = x + width - tWidth + window.pageXOffset;
    y = y + height - tHeight + window.pageYOffset - 40;
    this.tooltip
      .style("transform", `translate(${x}px,${y}px)`)
      .classed("is-visible", true);
  }

  hide() {
    this.tooltip.classed("is-visible", false);
  }
}
