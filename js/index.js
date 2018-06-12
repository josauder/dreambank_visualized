

var zoomLevel = 1;
var yLevel = 1;
var yOffset = 0;
var seriesSelection = d3.select("#series")
var bottomBar = d3.select(".bottomBar")
var leftBottomDisplay = d3.select(".leftBottomDisplay")
var rightBottomDisplay = d3.select(".rightBottomDisplay")
let max_n_per_series = 200
var selectedSeries = ["arlie", "jasmine2", "melissa", "vietnam_vet", "wedding"]
var displayedDataset = []

reader.readData();

function check(checkbox) {
  selectedSeries = selectedSeries.filter((series_id) => (series_id !== checkbox.name));
  if (checkbox.checked) {
    selectedSeries.push(checkbox.name)
  }
  util.updateSelectedSeries(selectedSeries)
  if (analyzeMode) {
    repeatAnalyze()
  }

}

function search() {
  var keywords = searchField.property("value").split("|");
  if (keywords.length == 1 && keywords[0].length==0) {
    return false;
  }
  d3.select("#colorMode").property("value", "search")
  Object.keys(info)
    .forEach((d) => {
      info[d].seriesSearchColor = "grey";
    })

  dataset.forEach((d) => {
    d.searchColor = "grey";
    keywords.forEach((keyword) => {
      keyword = keyword.toLowerCase();
      if (d.content.toLowerCase().includes(keyword)) {
        d.searchColor = "green";
        info[d.series_id].seriesSearchColor = "green";
      }
    })
  })
  changeColorFn("search");
  return false;
}


function changeColorFn(newMode) {
  colorMode = newMode;
  Object.keys(info)
    .forEach((d) => {
      var li = d3.selectAll("#"+d)
        .style("background-color", util.getSelectionColorFn()({series_id: d}))
    })
  svg.selectAll("circle")
    .transition()
    .style("fill", util.getColorFn())
    .duration(1000)
  if (displayedDreamId) {
    displayDream(null, displayedDreamId);
  }
}

d3.select("#colorMode")
  .attr("onchange", "changeColorFn(this.value)");

d3.select("#projectionMode")
  .attr("onchange", "changeProjectionFn(this.value)");


var dragBehavior = d3.drag()
    .on("drag", dragMove)
    .on("start", dragStart)
    .on("end", dragEnd);

svg.call(dragBehavior);

function dragstarted(d) {
  d3.select(this).raise().classed("active", true);
}

function dragged(d) {
  d3.select(this).select("text")
    .attr("x", d.x = d3.event.x)
    .attr("y", d.y = d3.event.y);
  d3.select(this).select("rect")
    .attr("x", d.x = d3.event.x)
    .attr("y", d.y = d3.event.y);
}

function dragended(d) {
  d3.select(this).classed("active", false);
}

var resizeTimeout = null;
bottomBar.style("width", w_svg + "px");
function resize() {
  clearTimeout(resizeTimeout);
  resizeId = setTimeout(updateScreenSize, 200);
}

function updateScreenSize() {
  w_svg = window.innerWidth - sidebarSize;
  h_svg = window.innerHeight - 4;
  bottomBar.style("width", w_svg + "px");

  d3.select("svg")
    .attr("height", h_svg)
    .attr("width", w_svg)
  draw()
}
