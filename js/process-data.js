function processData(csv) {
  const scores = {
    "Very important": 4,
    "Rather important": 3,
    "Not very important": 2,
    "Not at all important": 1,
  };

  const data = [];
  const means = [];
  csv
    .map((d) => ({
      aspect: d["Important in life"],
      country: d["Country"],
      score: d3.sum(
        Object.entries(scores),
        ([key, value]) => ((d[key] || 0) / 100) * value
      ),
    }))
    .forEach((d) => {
      if (d.country === "TOTAL") {
        means.push(d);
      } else {
        data.push(d);
      }
    });

  const aspects = [...new Set(data.map((d) => d.aspect))];

  return {
    data,
    means,
    scores,
    aspects,
  };
}
