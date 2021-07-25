class ScoresByAspect {
  constructor({ el, data, filters, onChange }) {
    this.el = el;
    this.data = data;
    this.filters = filters;
    this.onChange = onChange;
    this.resize = this.resize.bind(this);
    this.brushed = this.brushed.bind(this);
    this.init();
  }

  init() {
    this.wrangleData();

    this.margin = {
      top: 4,
      right: 8,
      bottom: 20,
      left: 8,
    };
    this.height = 52;
    this.boundedHeight = this.height - this.margin.top - this.margin.bottom;

    this.x = d3.scaleLinear().domain([1, 4]);

    this.brush = d3.brushX().on("brush end", this.brushed);

    this.container = d3.select(this.el).classed("aspect-charts", true);
    this.row = this.container
      .selectAll(".aspect-chart")
      .data(this.dataByAspect, ([aspect]) => aspect)
      .join("div")
      .attr("class", "aspect-chart");
    this.row
      .append("div")
      .attr("class", "aspect-name")
      .call((div) =>
        div
          .append("div")
          .attr("class", "aspect-name__icon")
          .text(([aspect]) => aspect.substring(0, 2))
      )
      .call((div) =>
        div
          .append("div")
          .attr("class", "aspect-name__label")
          .text(([aspect]) => aspect)
      );
    this.svg = this.row.append("svg").attr("class", "aspect-svg");
    this.tick = this.svg
      .append("g")
      .selectAll(".aspect-tick")
      .data(([, values]) => values)
      .join("line")
      .attr("class", "aspect-tick")
      .attr("r", this.r)
      .attr("y1", this.margin.top)
      .attr("y2", this.height - this.margin.bottom);
    this.gX = this.svg
      .append("g")
      .attr("class", "axis-g")
      .attr("transform", `translate(0,${this.height - this.margin.bottom})`);
    this.gBrush = this.svg
      .append("g")
      .attr("class", "brush-g")
      .call(this.brush);
    this.gBrush
      .selectAll(".handle--custom")
      .data([{ type: "w" }, { type: "e" }])
      .enter()
      .append("path")
      .attr("class", "handle--custom")
      .attr("cursor", "ew-resize")
      .attr("d", (d) => {
        const e = +(d.type == "e"),
          x = e ? 1 : -1,
          y = this.boundedHeight / 2;
        return (
          "M" +
          0.5 * x +
          "," +
          y +
          "A6,6 0 0 " +
          e +
          " " +
          6.5 * x +
          "," +
          (y + 6) +
          "V" +
          (2 * y - 6) +
          "A6,6 0 0 " +
          e +
          " " +
          0.5 * x +
          "," +
          2 * y +
          "Z" +
          "M" +
          2.5 * x +
          "," +
          (y + 8) +
          "V" +
          (2 * y - 8) +
          "M" +
          4.5 * x +
          "," +
          (y + 8) +
          "V" +
          (2 * y - 8)
        );
      });

    this.resize();
    window.addEventListener("resize", this.resize);
  }

  wrangleData() {
    this.dataByAspect = d3.rollup(
      this.data,
      (v) => {
        const aspect = v[0].aspect;
        const values = v
          .map((d) => ({
            aspect,
            score: d.score,
          }))
          .sort((a, b) => d3.ascending(a.score, b.score));
        return values;
      },
      (d) => d.aspect
    );
  }

  resize() {
    this.width = this.el.clientWidth;

    this.x.range([this.margin.left, this.width - this.margin.right]);

    this.brush.extent([
      [this.margin.left, this.margin.top],
      [this.width - this.margin.right, this.height - this.margin.bottom],
    ]);

    this.svg.attr("viewBox", [0, 0, this.width, this.height]);

    this.gBrush
      .call(this.brush)
      .call(this.brush.move, ([aspect]) => this.filters[aspect].map(this.x));

    this.render();
  }

  render() {
    this.tick.attr("transform", ({ score }) => `translate(${this.x(score)},0)`);

    this.gX.call(d3.axisBottom(this.x).ticks(4));
  }

  brushed({ selection, type }, [brushedAspect]) {
    this.filters[brushedAspect] = selection.map(this.x.invert);

    this.gBrush
      .filter(([aspect]) => aspect === brushedAspect)
      .selectAll(".handle--custom")
      .attr(
        "transform",
        (d, i) =>
          `translate(${selection[i]},${
            -this.boundedHeight / 4 + this.margin.top
          })`
      );

    this.tick
      .filter(({ aspect }) => aspect === brushedAspect)
      .classed(
        "is-highlighted",
        ({ score }) =>
          score >= this.filters[brushedAspect][0] &&
          score <= this.filters[brushedAspect][1]
      );

    if (type === "end") this.onChange(this.filters);
  }
}
