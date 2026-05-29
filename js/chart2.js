/* =========================================================
   chart2.js — Donut chart: road user share by year + sex
   ========================================================= */

(function() {
  const fullW = 1000, fullH = 460;
  const radius = 170;

  const svg = d3.select("#chart2")
    .append("svg")
    .attr("viewBox", `0 0 ${fullW} ${fullH}`)
    .attr("preserveAspectRatio", "xMidYMid meet");

  // Donut on the left
  const donutG = svg.append("g")
    .attr("transform", `translate(${fullW * 0.30},${fullH / 2})`);

  // Center text
  const centerLabel = donutG.append("text")
    .attr("text-anchor", "middle")
    .attr("y", -8)
    .attr("class", "donut-center-label")
    .style("font-size", "12px")
    .style("font-weight", "600")
    .style("text-transform", "uppercase")
    .style("letter-spacing", "1.5px")
    .style("fill", "#6b7280");

  const centerValue = donutG.append("text")
    .attr("text-anchor", "middle")
    .attr("y", 22)
    .style("font-size", "32px")
    .style("font-weight", "700")
    .style("fill", "#0f2132");

  const centerSub = donutG.append("text")
    .attr("text-anchor", "middle")
    .attr("y", 44)
    .style("font-size", "12px")
    .style("fill", "#6b7280");

  // Legend on the right
  const legendG = svg.append("g")
    .attr("transform", `translate(${fullW * 0.58},${fullH / 2 - 130})`);

  const pie = d3.pie()
    .value(d => d.value)
    .sort(null);

  const arc = d3.arc()
    .innerRadius(radius * 0.6)
    .outerRadius(radius);

  const arcHover = d3.arc()
    .innerRadius(radius * 0.6)
    .outerRadius(radius + 8);

  let rawData = [];

  d3.csv("data/02_roaduser_share_by_year_sex.csv", d => ({
    year: +d["Calendar year"],
    sex: d["Sex"],
    roadUser: d["RoadUser_Group"],
    value: +d["Sum(Hospitalisations)"]
  })).then(data => {
    rawData = data;

    // Populate year dropdown
    const years = [...new Set(data.map(d => d.year))].sort();
    populateYearDropdown("#c2-year", years, true);

    update();
  });

  d3.select("#c2-year").on("change", update);
  d3.select("#c2-sex").on("change", update);

  function update() {
    const year = d3.select("#c2-year").property("value");
    const sex  = d3.select("#c2-sex").property("value");

    let filtered = rawData;
    if (year !== "All") filtered = filtered.filter(d => d.year === +year);
    if (sex  !== "All") filtered = filtered.filter(d => d.sex === sex);

    // Aggregate by road user
    const rolled = d3.rollups(
      filtered,
      v => d3.sum(v, d => d.value),
      d => d.roadUser
    )
    .map(([roadUser, value]) => ({ roadUser, value }))
    .sort((a, b) => ROADUSER_ORDER.indexOf(a.roadUser) - ROADUSER_ORDER.indexOf(b.roadUser));

    const total = d3.sum(rolled, d => d.value);

    // Update center label
    centerLabel.text("Total");
    centerValue.text(fmt(total));
    centerSub.text(
      (sex === "All" ? "all sexes" : sex.toLowerCase()) +
      " · " + (year === "All" ? "2011–2021" : year)
    );

    // Bind arcs
    const arcs = donutG.selectAll(".arc").data(pie(rolled), d => d.data.roadUser);
    arcs.exit().remove();

    const arcsEnter = arcs.enter()
      .append("path")
      .attr("class", "arc")
      .attr("stroke", "#fff")
      .attr("stroke-width", 2);

    arcsEnter.merge(arcs)
      .on("mouseover", function(event, d) {
        d3.select(this).transition().duration(150).attr("d", arcHover);
        const pct = (d.data.value / total * 100).toFixed(1);
        showTooltip(`<div class="tt-label">${d.data.roadUser}</div>
                     <div class="tt-value">${fmt(d.data.value)}</div>
                     <div style="margin-top:4px; font-size:11px; color:#b8d4e4">${pct}% of total</div>`,
                    event);
      })
      .on("mousemove", moveTooltip)
      .on("mouseout", function() {
        d3.select(this).transition().duration(150).attr("d", arc);
        hideTooltip();
      })
      .transition().duration(500)
      .attrTween("d", function(d) {
        const i = d3.interpolate(this._current || d, d);
        this._current = i(1);
        return t => arc(i(t));
      })
      .attr("fill", d => getRoadUserColour(d.data.roadUser));

    // Update legend
    const legend = legendG.selectAll(".legend-item").data(rolled, d => d.roadUser);
    legend.exit().remove();

    const legendEnter = legend.enter()
      .append("g")
      .attr("class", "legend-item")
      .attr("transform", (d, i) => `translate(0,${i * 32})`);

    legendEnter.append("rect")
      .attr("width", 16)
      .attr("height", 16)
      .attr("rx", 3);

    legendEnter.append("text")
      .attr("x", 24)
      .attr("y", 9)
      .attr("dy", "0.35em")
      .style("font-size", "14px")
      .style("fill", "#1f2937")
      .style("font-weight", "500");

    legendEnter.append("text")
      .attr("class", "legend-value")
      .attr("x", 24)
      .attr("y", 24)
      .attr("dy", "0.35em")
      .style("font-size", "12px")
      .style("fill", "#6b7280");

    const allLegend = legendEnter.merge(legend);
    allLegend.transition().duration(500).attr("transform", (d, i) => `translate(0,${i * 32})`);
    allLegend.select("rect").attr("fill", d => getRoadUserColour(d.roadUser));
    allLegend.select("text:not(.legend-value)").text(d => d.roadUser);
    allLegend.select(".legend-value").text(d => `${fmt(d.value)} · ${(d.value / total * 100).toFixed(1)}%`);
  }
})();
