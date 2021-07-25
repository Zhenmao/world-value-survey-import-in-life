class ScoresByCountry {
  constructor({ el, data, sortBy, filters }) {
    this.el = el;
    this.data = data;
    this.sortBy = sortBy;
    this.filters = filters;
    this.resize = this.resize.bind(this);
    this.init();
  }

  init() {
    this.wrangleData();

    this.r = 8;
    this.margin = {
      top: 4,
      right: this.r,
      bottom: 16,
      left: this.r,
    };
    this.height = this.margin.top + this.margin.bottom + this.r * 2;
    this.rowHeight =
      this.height +
      22 + // line height
      8 + // margin top
      16; // margin bottom

    this.x = d3.scaleLinear().domain([1, 4]);

    this.y = d3
      .scaleBand()
      .domain(this.sortedCountries)
      .range([0, this.rowHeight * this.sortedCountries.length]);

    this.tooltip = new Tooltip();

    this.container = d3
      .select(this.el)
      .classed("country-charts", true)
      .style("height", `${this.y.range()[1]}px`);
    this.row = this.container
      .selectAll(".country-chart")
      .data(this.dataByCountry, ([country]) => country)
      .join("div")
      .style("transform", ([country]) => `translateY(${this.y(country)}px)`)
      .attr("class", "country-chart")
      .on("mouseover", (event, d) => {
        this.tooltip.show(this.tooltipContent(d), event.currentTarget);
      })
      .on("mouseout", (event, d) => {
        this.tooltip.hide();
      });
    this.row
      .append("div")
      .attr("class", "country-name")
      .text(([country]) => country);
    this.svg = this.row.append("svg").attr("class", "country-svg");
    this.gX = this.svg
      .append("g")
      .attr("class", "axis-g")
      .attr("transform", `translate(0,${this.height - this.margin.bottom})`);
    this.span = this.svg
      .append("rect")
      .attr("class", "span-rect")
      .attr("y", this.margin.top - 1)
      .attr("height", this.r * 2 + 2)
      .attr("rx", this.r + 1);
    this.gScore = this.svg
      .append("g")
      .attr("class", "country-scores")
      .attr("transform", `translate(0,${this.margin.top + this.r})`)
      .selectAll(".country-score")
      .data(
        ([, values]) =>
          values.slice().sort((a, b) => d3.ascending(a.score, b.score)),
        ({ aspect }) => aspect
      )
      .join("g")
      .attr("class", "country-score")
      .call((g) =>
        g
          .append("circle")
          .attr("class", "country-score-circle")
          .attr("r", this.r)
      )
      .call((g) =>
        g
          .append("text")
          .attr("class", "country-score-label")
          .attr("dy", "0.32em")
          .attr("text-anchor", "middle")
          .text(({ aspect }) => aspect.substring(0, 2))
      );

    this.resize();
    window.addEventListener("resize", this.resize);
  }

  resize() {
    this.width = this.el.clientWidth;

    this.x.range([this.margin.left, this.width - this.margin.right]);

    this.svg.attr("viewBox", [0, 0, this.width, this.height]);

    this.render();
  }

  wrangleData() {
    if (!this.dataByCountry) {
      this.dataByCountry = d3.group(this.data, (d) => d.country);

      this.countries = [...this.dataByCountry.keys()];
    }

    this.filteredCountries = new Set(
      this.countries.filter((country) => {
        const values = this.dataByCountry.get(country);
        for (const { aspect, score } of values) {
          const filter = this.filters[aspect];
          if (score < filter[0] || score > filter[1]) return false;
        }
        return true;
      })
    );

    const filteredInCountries = [];
    const filteredOutCountries = [];
    this.countries
      .sort((a, b) => {
        if (this.sortBy === "Name") {
          return d3.ascending(a, b);
        } else {
          return d3.descending(
            this.dataByCountry.get(a).find((d) => d.aspect === this.sortBy)
              .score,
            this.dataByCountry.get(b).find((d) => d.aspect === this.sortBy)
              .score
          );
        }
      })
      .forEach((country) => {
        if (this.filteredCountries.has(country)) {
          filteredInCountries.push(country);
        } else {
          filteredOutCountries.push(country);
        }
      });
    this.sortedCountries = [...filteredInCountries, ...filteredOutCountries];

    if (this.y) {
      this.y.domain(this.sortedCountries);
      this.render();
    }
  }

  render() {
    this.gX.call(d3.axisBottom(this.x).ticks(4));

    this.span
      .attr(
        "x",
        ([, values]) => this.x(d3.min(values, (d) => d.score)) - this.r - 1
      )
      .attr(
        "width",
        ([, values]) =>
          this.x(d3.max(values, (d) => d.score)) -
          this.x(d3.min(values, (d) => d.score)) +
          this.r * 2 +
          2
      );

    this.gScore.attr(
      "transform",
      ({ score }) => `translate(${this.x(score)},0)`
    );

    this.row
      .classed("is-highlighted", ([country]) =>
        this.filteredCountries.has(country)
      )
      .style("transform", ([country]) => `translateY(${this.y(country)}px)`);
  }

  tooltipContent([country, values]) {
    return `<table class="${
      this.filteredCountries.has(country) ? "is-highlighted" : ""
    }">
      <tbody>
        <tr>
          <td colspan="2">${country}</td>
        </tr>
        ${values
          .map(
            ({ aspect, score }) => `<tr>
          <td> 
            <div class="aspect-name">
              <div class="aspect-name__icon">${aspect.substring(0, 2)}</div>
              <div class="aspect-name__label">${aspect}</div>
            </div>
          </td>
          <td>${score.toFixed(2)}</td>
        </tr>`
          )
          .join("")}
      </tbody>
    </table>`;
  }

  onSortByChange(sortBy) {
    this.sortBy = sortBy;
    this.wrangleData();
  }

  onFiltersChange(filters) {
    this.filters = filters;
    this.wrangleData();
  }
}
