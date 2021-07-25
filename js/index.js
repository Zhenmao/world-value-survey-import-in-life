d3.csv("data/world-value-survey-important-in-life.csv").then((csv) => {
  const { data, aspects } = processData(csv);

  const state = {
    sortBy: "Name",
    filters: aspects.reduce((o, d) => {
      o[d] = [1, 4];
      return o;
    }, {}),
  };

  const copyFilters = (oldFilters) =>
    Object.entries(oldFilters).reduce((o, [key, value]) => {
      o[key] = [...value];
      return o;
    }, {});

  new AspectsLegend({
    el: document.querySelector("#aspects-legend"),
    aspects,
  });

  new SelectControl({
    el: document.querySelector("#sort-control"),
    options: ["Name", ...aspects],
    initialValue: state.sortBy,
    onChange: (sortBy) => {
      if (state.sortBy !== sortBy) {
        state.sortBy = sortBy;
        scoresByCountry.onSortByChange(state.sortBy);
      }
    },
  });

  new ScoresByAspect({
    el: document.querySelector("#scores-by-aspect"),
    data,
    filters: copyFilters(state.filters),
    onChange: (filters) => {
      if (JSON.stringify(state.filters) !== JSON.stringify(filters)) {
        state.filters = copyFilters(filters);
        scoresByCountry.onFiltersChange(state.filters);
      }
    },
  });

  const scoresByCountry = new ScoresByCountry({
    el: document.querySelector("#scores-by-country"),
    data,
    sortBy: state.sortBy,
    filters: copyFilters(state.filters),
  });
});
