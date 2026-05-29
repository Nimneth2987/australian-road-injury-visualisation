/* =========================================================
   main.js — Shared constants and helpers
   ========================================================= */

// Consistent colour palette for road users across all charts
const ROADUSER_COLOURS = {
  "Car driver":    "#2563eb",
  "Car passenger": "#60a5fa",
  "Motorcyclist":  "#f59e0b",
  "Pedal cyclist": "#10b981",
  "Pedestrian":    "#8b5cf6",
  "Other":         "#9ca3af"
};

const ROADUSER_ORDER = [
  "Car driver", "Car passenger", "Motorcyclist",
  "Pedal cyclist", "Pedestrian", "Other"
];

const AGE_ORDER = ["0-7", "8-16", "17-25", "26-39", "40-64", "65-74", "75+"];

const COUNTERPARTY_COLOURS = {
  "Car / van":             "#2563eb",
  "Non-collision":         "#f59e0b",
  "Fixed object":          "#dc2626",
  "Heavy transport / bus": "#7c3aed",
  "Pedal cycle":           "#10b981",
  "Motorcycle":            "#ea580c",
  "Pedestrian / animal":   "#0891b2",
  "Other / unspecified":   "#9ca3af",
  "Bus":                   "#7c3aed"
};

// Tooltip helper
const tooltip = d3.select("#tooltip");

function showTooltip(html, event) {
  tooltip
    .style("opacity", 1)
    .html(html)
    .style("left", (event.pageX + 14) + "px")
    .style("top",  (event.pageY - 10) + "px");
}

function moveTooltip(event) {
  tooltip
    .style("left", (event.pageX + 14) + "px")
    .style("top",  (event.pageY - 10) + "px");
}

function hideTooltip() {
  tooltip.style("opacity", 0);
}

// Number formatter
const fmt = d3.format(",");

// Helper: get colour for a road user (fallback grey)
function getRoadUserColour(name) {
  return ROADUSER_COLOURS[name] || "#9ca3af";
}

// Helper: populate a year dropdown with all years from a dataset
function populateYearDropdown(selectId, years, includeAll = true) {
  const sel = d3.select(selectId);
  sel.selectAll("option:not([data-keep])").remove();
  if (includeAll) {
    sel.append("option").attr("value", "All").attr("data-keep", true).text("All years (2011–2021)");
  }
  years.forEach(y => {
    sel.append("option").attr("value", y).text(y);
  });
}
