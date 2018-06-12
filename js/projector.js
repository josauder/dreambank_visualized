var colorMode = "series";
// pca, tsne, autoencoder, sentiment


var dateProjection = false;

function changeProjectionFn(projectionMode) {
  handleAnalyze(false)
  if (projectionMode == "date_sentiment") {
    dateProjection = true;
  } else {
    dateProjection = false;
  }
  d3.select("svg").selectAll("text").remove()

  getX = projector[projectionMode].x(displayedDataset)
  getY = projector[projectionMode].y(displayedDataset)

  svg.selectAll("circle")
    .transition()
    .attr("cx", (d) => getX(d))
    .attr("cy", (d) => getY(d))
    .duration(1000)
}

const projector = {
  "tsne": {
    x: () => (d) => ((d.x_tsne / 3) + 0.5) * w_svg,
    y: () => (d) => ((d.y_tsne / 3) + 0.5) * h_svg,
  },

  "classifier": {
    x: () => (d) => ((d.x_classifier / 3) + 0.5) * w_svg,
    y: () => (d) => ((d.y_classifier / 3) + 0.5) * h_svg,
  },
  "autoencoder": {
    x: () => (d) => ((d.x_autoencoder / 3) + 0.5) * w_svg,
    y: () => (d) => ((d.y_autoencoder / 3) + 0.5) * h_svg,
  },

  "date_sentiment": {
    x: (data) => {
      let dateScaler = d3.scaleLinear()
        .domain(d3.extent(data, row => row.date))
        .range([10 , w_svg - 10]);
      setTimeout(util.drawDateScale, 100);
      return (d) => {
        return (d.date && (d.date == d.date)) ?
          dateScaler(d.date) :
          -100000
      }
    },
    y: () => (d) => ((-d.sentiment / 3.5) + 0.5) * h_svg,
  },
}


let getX = projector["tsne"].x();
let getY = projector["tsne"].y();
