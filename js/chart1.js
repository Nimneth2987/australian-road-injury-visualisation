/* =========================================================
   chart1.js — Trend over time, road user + remoteness filters
   ========================================================= */

(function() {
  const margin = { top: 30, right: 30, bottom: 60, left: 80 };
  const fullW = 1000, fullH = 460;
  const W = fullW - margin.left - margin.right;
  const H = fullH - margin.top - margin.bottom;

  const svg = d3.select("#chart1")
    .append("svg")
    .attr("viewBox", `0 0 ${fullW} ${fullH}`)
    .attr("preserveAspectRatio", "xMidYMid meet");

  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  // Scales
  const x = d3.scaleLinear().range([0, W]);
  const y = d3.scaleLinear().range([H, 0]);

  // Axes containers
  const xAxisG = g.append("g").attr("class", "axis").attr("transform", `translate(0,${H})`);
  const yAxisG = g.append("g").attr("class", "axis");
  const gridG  = g.append("g").attr("class", "grid");

  // Axis labels
  g.append("text")
    .attr("class", "axis-label")
    .attr("text-anchor", "middle")
    .attr("x", W / 2)
    .attr("y", H + 45)
    .text("Year");

  g.append("text")
    .attr("class", "axis-label")
    .attr("text-anchor", "middle")
    .attr("transform", `translate(-55,${H / 2}) rotate(-90)`)
    .text("Hospitalisations");

  // Line generator
  const line = d3.line()
    .x(d => x(d.year))
    .y(d => y(d.value))
    .curve(d3.curveMonotoneX);

  let rawData = [];

  d3.csv("data/01_trend_by_roaduser_remoteness.csv", d => ({
    year: +d["Calendar year"],
    remoteness: d["ABS remoteness area"],
    roadUser: d["RoadUser_Group"],
    value: +d["Sum(Hospitalisations)"]
  })).then(data => {
    rawData = data;
    update();
  });

  d3.select("#c1-roaduser").on("change", update);
  d3.select("#c1-remoteness").on("change", update);

  function update() {
    const roadUser   = d3.select("#c1-roaduser").property("value");
    const remoteness = d3.select("#c1-remoteness").property("value");

    // Filter
    let filtered = rawData;
    if (roadUser !== "All")   filtered = filtered.filter(d => d.roadUser === roadUser);
    if (remoteness !== "All") filtered = filtered.filter(d => d.remoteness === remoteness);

    // Aggregate by year
    const rolled = d3.rollups(
      filtered,
      v => d3.sum(v, d => d.value),
      d => d.year
    )
    .map(([year, value]) => ({ year, value }))
    .sort((a, b) => a.year - b.year);

    // Update scales
    x.domain(d3.extent(rolled, d => d.year));
    y.domain([0, d3.max(rolled, d => d.value) * 1.1]);

    // Update axes
    xAxisG.transition().duration(500).call(
      d3.axisBottom(x).tickFormat(d3.format("d")).ticks(rolled.length)
    );
    yAxisG.transition().duration(500).call(
      d3.axisLeft(y).tickFormat(d3.format(",")).ticks(8)
    );

    // Grid
    gridG.transition().duration(500).call(
      d3.axisLeft(y).tickSize(-W).tickFormat("").ticks(8)
    );

    // Line
    const lineColour = roadUser === "All" ? "#0f2132" : getRoadUserColour(roadUser);

    const path = g.selectAll(".trend-line").data([rolled]);
    path.enter()
      .append("path")
      .attr("class", "trend-line")
      .attr("fill", "none")
      .attr("stroke-width", 3)
      .attr("stroke-linecap", "round")
      .attr("stroke-linejoin", "round")
      .merge(path)
      .transition().duration(500)
      .attr("d", line)
      .attr("stroke", lineColour);

    // Dots
    const dots = g.selectAll(".dot").data(rolled, d => d.year);
    dots.exit().remove();

    const dotsEnter = dots.enter()
      .append("circle")
      .attr("class", "dot")
      .attr("r", 5)
      .attr("stroke", "#fff")
      .attr("stroke-width", 2);

    dotsEnter.merge(dots)
      .on("mouseover", function(event, d) {
        d3.select(this).attr("r", 8);
        const label = (roadUser === "All" ? "All road users" : roadUser)
                    + (remoteness !== "All" ? " · " + remoteness : "");
        showTooltip(`<div class="tt-label">${d.year} — ${label}</div>
                     <div class="tt-value">${fmt(d.value)}</div>
                     <div style="margin-top:4px; font-size:11px; color:#b8d4e4">hospitalisations</div>`,
                    event);
      })
      .on("mousemove", moveTooltip)
      .on("mouseout", function() {
        d3.select(this).attr("r", 5);
        hideTooltip();
      })
      .transition().duration(500)
      .attr("cx", d => x(d.year))
      .attr("cy", d => y(d.value))
      .attr("fill", lineColour);
  }
})();
