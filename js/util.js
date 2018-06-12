

const util = {
  getRandomColor: () => '#'+Math.floor(Math.random()*16777215).toString(16),

  getRandomLightColor: () => {
     var letters = '89ABCDEF'.split('');
     var color = '#';
     for (var i = 0; i < 6; i++ ) {
         color += letters[Math.floor(Math.random() * letters.length)];
     }
     return color;
  },

  counterFilter: (dataset, filter) => {
    selectedSeries.forEach((series_id) => {
      info[series_id].counter = 0;
    })
    var d = dataset.filter(filter)
    if (["date_sentiment", "series_sentiment"].includes(projectionMode)) {
      d = dataset.filter((row) => (row.date && (row.date == row.date)));
    }
    return d
  },

  getColorFn: () => {
    if (colorMode === "series") {
      return (d) => info[d.series_id].color;
    } else if (colorMode === "gender") {
      return (d) => info[d.series_id].genderColor;
    } else if (colorMode === "search") {
      return (d) => d.searchColor;
    }
  },

  getSelectionColorFn: () => {
    if (colorMode === "series") {
      return (d) => info[d.series_id].color;
    } else if (colorMode === "gender") {
      return (d) => info[d.series_id].genderColor;
    } else if (colorMode === "search") {
      return (d) => info[d.series_id].seriesSearchColor;
    }
  },

  selectBySeries: (dream) => {
    if (!selectedSeries.includes(dream.series_id)) {
      return false;
    }
    info[dream.series_id].counter++;
    if (info[dream.series_id].counter < max_n_per_series) {
      dream.displayed=true;
      return true;
    }
    return false;
  },

    updateSelectedSeries: (newSelectedSeries) => {
    return new Promise( resolve => {
      selectedSeries = newSelectedSeries;
      displayedDataset = util.counterFilter(dataset, util.selectBySeries);
      draw();

      if (dateProjection) {
        getX = projector["date_sentiment"].x(displayedDataset)
        svg.selectAll("circle")
          .transition()
          .attr("cx", getX)
          .duration(1000)
      }
    })
  },

  renderDate: (dream) => {
    let d = new Date(dream.date);
    if (d.getTime() === d.getTime()) {
      return d.toString().split(" ").slice(0, 4).join(" ");
    }
    return String(dream.head)

  },

  drawDateScale: () => {
    d3.select("svg").selectAll("text").remove()
    if (selectedSeries.length===0) {
      return false;
    }

    var n = 200;
    var step = 1;
    if (zoomLevel < 1.5) {
      n = 20;
      step = 10;
    }
    else if (1.5 < zoomLevel && zoomLevel < 4) {
      n = 40;
      step = 5;
    }

    Array.from({length: n}, (_,i) => {
      var year = 1900 + (i*step)
      x = getX({
        date: Date.parse(String(year) + "-01-01T00:00:01")
      })
      svg.append("text")
        .attr("x", x)
        .attr("y", (h_svg * 0.5) + (0.3 * h_svg / zoomLevel))
        .style("font-size", 20 / zoomLevel + "px")
        .style("fill", "white")
        .style("text-anchor", "middle")
        .text(year)
    });
    d3.select("svg").append("text")
      .attr("x", 5)
      .attr("y", 30)
      .style("font-size", "24px")
      .style("fill", "white")
      .text("↑ Positive Sentiment")
    d3.select("svg").append("text")
        .attr("x", 5)
        .attr("y", 48)
        .style("font-size", "24px")
        .style("fill", "white")
        .text("↓ Negative Sentiment")
  }

}
