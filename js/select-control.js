class SelectControl {
  constructor({ el, options, initialValue, onChange }) {
    this.el = el;
    this.options = options;
    this.initialValue = initialValue;
    this.onChange = onChange;
    this.render();
  }

  render() {
    d3.select(this.el)
      .on("change", (event) => {
        this.onChange(event.currentTarget.value);
      })
      .selectAll("option")
      .data(this.options)
      .join("option")
      .attr("value", (d) => d)
      .attr("selected", (d) => (d === this.initialValue ? "selected" : null))
      .text((d) => d);
  }
}
