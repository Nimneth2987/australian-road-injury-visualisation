/* =========================================================
   chart3.js — Bar chart: age pattern by year + road user
   ========================================================= */

(function() {
  const margin = { top: 30, right: 30, bottom: 70, left: 80 };
  const fullW = 1000, fullH = 460;
  const W = fullW - margin.left - margin.right;
  const H = fullH - margin.top - margin.bottom;

  const svg = d3.select("#chart3")
    .append("svg")
    .attr("viewBox", `0 0 ${fullW} ${fullH}`)
    .attr("preserveAspectRatio", "xMidYMid meet");

  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleBand().range([0, W]).padding(0.25);
  const y = d3.scaleLinear().range([H, 0]);

  const xAxisG = g.append("g").attr("class", "axis").attr("transform", `translate(0,${H})`);
  const yAxisG = g.append("g").attr("class", "axis");
  const gridG  = g.append("g").attr("class", "grid");

  g.append("text")
    .attr("class", "axis-label")
    .attr("text-anchor", "middle")
    .attr("x", W / 2)
    .attr("y", H + 50)
    .text("Age group");

  g.append("text")
    .attr("class", "axis-label")
    .attr("text-anchor", "middle")
    .attr("transform", `translate(-55,${H / 2}) rotate(-90)`)
    .text("Hospitalisations");

  let rawData = [];

  d3.csv("data/03_age_by_roaduser_year.csv", d => ({
    year: +d["Calendar year"],
    ageGroup: d["Age group"],
    roadUser: d["RoadUser_Group"],
    value: +d["Sum(Hospitalisations)"]
  })).then(data => {
    rawData = data;

    // Populate year dropdown
    const years = [...new Set(data.map(d => d.year))].sort();
    populateYearDropdown("#c3-year", years, true);
    // Set default to 2021
    d3.select("#c3-year").property("value", "2021");

    update();
  });

  d3.select("#c3-year").on("change", update);
  d3.select("#c3-roaduser").on("change", update);

  function update() {
    const year     = d3.select("#c3-year").property("value");
    const roadUser = d3.select("#c3-roaduser").property("value");

    let filtered = rawData;
    if (year     !== "All") filtered = filtered.filter(d => d.year === +year);
    if (roadUser !== "All") filtered = filtered.filter(d => d.roadUser === roadUser);

    // Aggregate by age group
    const rolled = AGE_ORDER.map(age => ({
      ageGroup: age,
      value: d3.sum(filtered.filter(d => d.ageGroup === age), d => d.value)
    }));

    x.domain(AGE_ORDER);
    y.domain([0, d3.max(rolled, d => d.value) * 1.1 || 100]);

    xAxisG.transition().duration(500).call(d3.axisBottom(x));
    yAxisG.transition().duration(500).call(d3.axisLeft(y).tickFormat(d3.format(",")).ticks(8));
    gridG.transition().duration(500).call(d3.axisLeft(y).tickSize(-W).tickFormat("").ticks(8));

    const barColour = roadUser === "All" ? "#0f2132" : getRoadUserColour(roadUser);

    const bars = g.selectAll(".bar").data(rolled, d => d.ageGroup);
    bars.exit().remove();

    const barsEnter = bars.enter()
      .append("rect")
      .attr("class", "bar")
      .attr("rx", 3)
      .attr("y", H)
      .attr("height", 0);

    barsEnter.merge(bars)
      .on("mouseover", function(event, d) {
        d3.select(this).attr("opacity", 0.8);
        const label = roadUser === "All" ? "All road users" : roadUser;
        const yearLabel = year === "All" ? "2011–2021" : year;
        showTooltip(`<div class="tt-label">${d.ageGroup} · ${label}</div>
                     <div class="tt-value">${fmt(d.value)}</div>
                     <div style="margin-top:4px; font-size:11px; color:#b8d4e4">hospitalisations · ${yearLabel}</div>`,
                    event);
      })
      .on("mousemove", moveTooltip)
      .on("mouseout", function() {
        d3.select(this).attr("opacity", 1);
        hideTooltip();
      })
      .transition().duration(500)
      .attr("x", d => x(d.ageGroup))
      .attr("y", d => y(d.value))
      .attr("width", x.bandwidth())
      .attr("height", d => H - y(d.value))
      .attr("fill", barColour);

    // Data labels on top of bars
    const labels = g.selectAll(".bar-label").data(rolled, d => d.ageGroup);
    labels.exit().remove();

    labels.enter()
      .append("text")
      .attr("class", "bar-label")
      .attr("text-anchor", "middle")
      .style("font-size", "11px")
      .style("font-weight", "600")
      .style("fill", "#4b5563")
      .merge(labels)
      .transition().duration(500)
      .attr("x", d => x(d.ageGroup) + x.bandwidth() / 2)
      .attr("y", d => y(d.value) - 6)
      .text(d => d.value > 0 ? fmt(d.value) : "");
  }
})();
