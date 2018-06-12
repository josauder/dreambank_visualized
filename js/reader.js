var dataset = null;
var info = {};
reader = {

  readData: () => {
    svg.append("text")
      .attr("x", w_svg * 0.5)
      .attr("y", h_svg * 0.5)
      .style("fill", "white")
      .style("text-anchor", "middle")
      .text("Loading...")

    d3.csv("dreams_min.csv")
      .row((d, i) => {
        return {
          series_id: d.dream_series_id,
          content: d.content,
          x_tsne: +d.x_tsne,
          y_tsne: +d.y_tsne,
          x_classifier: +d.x_classifier,
          y_classifier: +d.y_classifier,
          x_autoencoder: +d.x_autoencoder,
          y_autoencoder: +d.y_autoencoder,
          neighbor_0: +d.neighbor_0,
          neighbor_1: +d.neighbor_1,
          neighbor_2: +d.neighbor_2,
          neighbor_3: +d.neighbor_3,
          neighbor_4: +d.neighbor_4,
          neighbor_5: +d.neighbor_5,
          neighbor_6: +d.neighbor_6,
          neighbor_7: +d.neighbor_7,
          neighbor_8: +d.neighbor_8,
          neighbor_9: +d.neighbor_9,
          head: d.head,
          date: Date.parse(d.date),
          sentiment: +d.sentiment_score + ((Math.random() - 0.5) / 100),
          searchColor: "grey",
        };
      })
      .get((error, rows) => {
        console.log("Loaded " + rows.length + " rows");
        dataset = rows;
        reader.readInfo()
    })
  },

  readInfo: () => {
    d3.csv("info.csv")
      .row( (d, i) => {
        info[d.dream_series_id] = {
          description: d.description,
          series: d.series,
          sex: d.sex,
          n_dreams: d.n_dreams,
          year: d.year,
          color: util.getRandomLightColor(),
          genderColor: (d.sex === "female") ? "#ffcc99" : "#66ccff",
          seriesSearchColor: "grey",
        };
      })
      .get((error) => {
        Object.keys(info)
          .sort()
          .forEach((d) => {
            var li = seriesSelection.append("li")
            li.attr("id", d)
              .style("background-color", util.getSelectionColorFn()({series_id: d}))

            li.append("input")
              .attr("name", d)
              .attr("type", "checkbox")
              .attr("checked", (selectedSeries.includes(d)) ? true : undefined)
              .attr("onclick", "check(this)")

            li.append("p").text(info[d].series +  " (" + info[d].n_dreams + ")")
              .classed("unselectable", true)
              .attr("id", d + "_color")
            $("#"+d + "_color").smallColorPicker({
                placement: { popup: true },
                colors: { colorOld: info[d].color, colorNew: info[d].color }
            }).on({
                scp_ok: function(picker, color) {
                  info[d].color = color;
                  changeColorFn(colorMode)
                },
                scp_cancel: function(color, picker) { /* color not selected */ },
                scp_show: function(picker) { /* picker shown */ },
                scp_hide: function(picker) { /* picker hidden */ }
            });
          })
        svg.selectAll("text").remove()
        util.updateSelectedSeries(selectedSeries)

      })
  }
}
