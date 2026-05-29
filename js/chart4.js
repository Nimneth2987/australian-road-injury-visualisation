/* =========================================================
   chart4.js — Horizontal bar: crash interaction by road user + year
   ========================================================= */

(function() {
  const margin = { top: 30, right: 100, bottom: 50, left: 180 };
  const fullW = 1000, fullH = 460;
  const W = fullW - margin.left - margin.right;
  const H = fullH - margin.top - margin.bottom;

  const svg = d3.select("#chart4")
    .append("svg")
    .attr("viewBox", `0 0 ${fullW} ${fullH}`)
    .attr("preserveAspectRatio", "xMidYMid meet");

  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear().range([0, W]);
  const y = d3.scaleBand().range([0, H]).padding(0.25);

  const xAxisG = g.append("g").attr("class", "axis").attr("transform", `translate(0,${H})`);
  const yAxisG = g.append("g").attr("class", "axis");
  const gridG  = g.append("g").attr("class", "grid");

  g.append("text")
    .attr("class", "axis-label")
    .attr("text-anchor", "middle")
    .attr("x", W / 2)
    .attr("y", H + 40)
    .text("Hospitalisations");

  let rawData = [];

  d3.csv("data/04_counterparty_by_roaduser_year.csv", d => ({
    year: +d["Calendar year"],
    roadUser: d["RoadUser_Group"],
    counterparty: d["Counterparty_Group"],
    value: +d["Sum(Hospitalisations)"]
  })).then(data => {
    rawData = data;

    // Populate year dropdown
    const years = [...new Set(data.map(d => d.year))].sort();
    populateYearDropdown("#c4-year", years, true);

    update();
  });

  d3.select("#c4-roaduser").on("change", update);
  d3.select("#c4-year").on("change", update);

  function update() {
    const roadUser = d3.select("#c4-roaduser").property("value");
    const year     = d3.select("#c4-year").property("value");

    let filtered = rawData.filter(d => d.roadUser === roadUser);
    if (year !== "All") filtered = filtered.filter(d => d.year === +year);

    // Aggregate by counterparty
    const rolled = d3.rollups(
      filtered,
      v => d3.sum(v, d => d.value),
      d => d.counterparty
    )
    .map(([counterparty, value]) => ({ counterparty, value }))
    .sort((a, b) => b.value - a.value);

    const total = d3.sum(rolled, d => d.value);

    x.domain([0, d3.max(rolled, d => d.value) * 1.1 || 100]);
    y.domain(rolled.map(d => d.counterparty));

    xAxisG.transition().duration(500).call(d3.axisBottom(x).tickFormat(d3.format(",")).ticks(6));
    yAxisG.transition().duration(500).call(d3.axisLeft(y));
    gridG.transition().duration(500).call(d3.axisBottom(x).tickSize(H).tickFormat("").ticks(6))
         .attr("transform", `translate(0,0)`);

    const bars = g.selectAll(".bar-h").data(rolled, d => d.counterparty);
    bars.exit().remove();

    const barsEnter = bars.enter()
      .append("rect")
      .attr("class", "bar-h")
      .attr("rx", 3)
      .attr("x", 0)
      .attr("width", 0);

    barsEnter.merge(bars)
      .on("mouseover", function(event, d) {
        d3.select(this).attr("opacity", 0.8);
        const pct = total > 0 ? (d.value / total * 100).toFixed(1) : "0.0";
        const yearLabel = year === "All" ? "2011–2021" : year;
        showTooltip(`<div class="tt-label">${d.counterparty}</div>
                     <div class="tt-value">${fmt(d.value)}</div>
                     <div style="margin-top:4px; font-size:11px; color:#b8d4e4">${pct}% of ${roadUser.toLowerCase()} · ${yearLabel}</div>`,
                    event);
      })
      .on("mousemove", moveTooltip)
      .on("mouseout", function() {
        d3.select(this).attr("opacity", 1);
        hideTooltip();
      })
      .transition().duration(500)
      .attr("y", d => y(d.counterparty))
      .attr("height", y.bandwidth())
      .attr("width", d => x(d.value))
      .attr("fill", d => COUNTERPARTY_COLOURS[d.counterparty] || "#9ca3af");

    // Value labels at end of bars
    const labels = g.selectAll(".bar-label-h").data(rolled, d => d.counterparty);
    labels.exit().remove();

    labels.enter()
      .append("text")
      .attr("class", "bar-label-h")
      .attr("dy", "0.35em")
      .style("font-size", "12px")
      .style("font-weight", "600")
      .style("fill", "#4b5563")
      .merge(labels)
      .transition().duration(500)
      .attr("x", d => x(d.value) + 8)
      .attr("y", d => y(d.counterparty) + y.bandwidth() / 2)
      .text(d => fmt(d.value));
  }
})();
