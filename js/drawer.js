
const sidebarSize = 250;
const bottomBarSize = 200;
var w_svg = window.innerWidth - sidebarSize;
var h_svg = window.innerHeight - 4;

const circleSize = 12;


var zoom = d3.zoom()
   .scaleExtent([0.5, 10000])
   .on("zoom", function() {
      var transform = d3.zoomTransform(this);
      zoomLevel = Math.pow(transform.k, 0.92);
      if (Math.abs(transform.k - zoomLevel) > 0.0001) {
        yOffset += transform.y - yLevel
      }
      yLevel = transform.y;
      svg.attr("transform", transform);
      if (transform.k !== 0) {
        svg.selectAll("circle")
          .attr("r", circleSize / zoomLevel)
          .attr("stroke-width", 3 / zoomLevel)
        svg.selectAll("line")
          .attr("stroke-width", 3 / zoomLevel)
      }
      if (dateProjection) {
        util.drawDateScale();
      }
    })

var svg = d3.select(".graphic")
 .append("svg")
 .attr("width", w_svg)
 .attr("height", h_svg)
 .attr("class", "graph-svg-component")
 .call(zoom)
 .append("g")


function draw() {
  svg.selectAll("circle")
   .remove();

  svg.selectAll("circle")
   .data(displayedDataset)
   .enter()
   .append("circle")
   .attr("r", circleSize / zoomLevel)
   .attr("cx", (d) => getX(d))
   .attr("cy", (d) => getY(d))
   .attr("id", (d, i) => "_"+i)
   .style("fill", util.getColorFn())
   .style("fill-opacity", 0.5)
   .on("click", (d, i) => {
     if (i == displayedDreamId){
       clearBottomBar()
       displayedDreamId = null;
     } else {
       displayDream(d,i)
     }
   })
   .on("mouseover", (d,i) => {
     d3.select("#_"+i)
       .attr("r", 1.5 * circleSize / zoomLevel)
       .style("fill-opacity", 0.8)
   })
   .on("mouseout", (d,i) => {
     d3.select("#_"+i)
       .attr("r", circleSize / zoomLevel)
       .style("fill-opacity", 0.5)
   })
}

function updateNPerSeries() {
  max_n_per_series = d3.select("#nPerSeriesField").property("value")
  util.updateSelectedSeries(selectedSeries)
  if (analyzeMode) {
    repeatAnalyze()
  }
}


var displayedDreamId = null;
function displayDream(d, i) {
  if (!d) {
    d = displayedDataset[i]
  }
  bottomBar
    .style("background-color", util.getColorFn()(d))
    .style("height", bottomBarSize + "px");
  leftBottomDisplay.html(null)
  leftBottomDisplay.append("p").append("b").text("Dream")      .style("stroke-width", 0)
    svg.select("#_"+displayedDreamId  )
      .style("stroke", null)
  leftBottomDisplay.append("p").text(util.renderDate(d));
  leftBottomDisplay.append("p").text(d.content);
  leftBottomDisplay.append("p").text("Sentiment: " + (+d.sentiment.toFixed(1)))
  var seriesInfo = info[d.series_id]
  rightBottomDisplay.html(null)
  rightBottomDisplay.append("p").append("b").text("Dream Series")
  rightBottomDisplay.append("p").text(seriesInfo.series)
  rightBottomDisplay.append("p").text("Date: " + seriesInfo.year)
  rightBottomDisplay.append("p").text("Number of dreams: " + seriesInfo.n_dreams)
  rightBottomDisplay.append("p").text("Description: " + info[d.series_id].description)


  displayedDreamId = i;
  svg.select("#_"+i)
    .style("stroke", "white")

  drawNearestNeighbors(d)
}

function drawNearestNeighbors(d) {

  svg.selectAll("line").remove()
  Array.from({length: 10}, (_,n) => {
    var neighbor = dataset[d["neighbor_"+n]];
    if (neighbor.displayed && selectedSeries.includes(neighbor.series_id)) {
      var x2 = getX(neighbor);
      var y2 = getY(neighbor);
      if (x2 > -1000) {
        svg.append("line")
          .attr("x1",getX(d))
          .attr("x2", x2)
          .attr("y1",getY(d))
          .attr("y2", y2)
          .attr("stroke-width", 3 / zoomLevel)
          .style("stroke", "white")
          .style("stroke-opacity", 1 - (n / 10))
          .lower()        
      }
    }
  })
}

function clearBottomBar(d, i) {
  if (displayedDreamId) {
    svg.selectAll("line").remove()
    svg.select("#_"+displayedDreamId  )
      .style("stroke", null)
    displayedDreamId = null;
  }
  bottomBar.style("background-color", "transparent").style("height", "0")
  leftBottomDisplay.selectAll("p").remove();
  rightBottomDisplay.selectAll("p").remove();
}

var searchField = d3.select("#searchField")
