
var currentSelectionRect = null;
var analyzeMode = false


var selectionRect = {
	element			: null,
	previousElement : null,
	currentY		: 0,
	currentX		: 0,
	originX			: 0,
	originY			: 0,
	setElement: function(ele) {
		this.previousElement = this.element;
		this.element = ele;
	},
	getNewAttributes: function() {
		var x = this.currentX<this.originX?this.currentX:this.originX;
		var y = this.currentY<this.originY?this.currentY:this.originY;
		var width = Math.abs(this.currentX - this.originX);
		var height = Math.abs(this.currentY - this.originY);
		return {
	        x       : x,
	        y       : y,
	        width  	: width,
	        height  : height
		};
	},
	getCurrentAttributes: function() {
		// use plus sign to convert srectElementtring into number
		var x = +this.element.attr("x");
		var y = +this.element.attr("y");
		var width = +this.element.attr("width");
		var height = +this.element.attr("height");
    return {
			x1  : x,
      y1	: y,
      x2  : x + width,
      y2  : y + height
		};
	},
	init: function(newX, newY) {
		var rectElement = svg.append("rect")

    rectElement
		    .attr("rx", 4)
        .attr("ry", 4)
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 0)
        .attr("height", 0)
    rectElement.classed("selection", true);
    this.setElement(rectElement);
		this.originX = newX;
		this.originY = newY;
		this.update(newX, newY);
	},
	update: function(newX, newY) {
		this.currentX = newX;
		this.currentY = newY;
    var attrs = this.getNewAttributes();
		this.element
      .attr("x", attrs.x)
      .attr("y", attrs.y)
      .attr("width", attrs.width)
      .attr("height", attrs.height)
	},
	focus: function() {
        this.element
            .style("stroke", "white")
            .style("stroke-width", "2.5");
  },
  remove: function() {
    if (this.element !== null) {
      this.element.remove();
    	this.element = null;
    }
  },
  removePrevious: function() {
  	if(this.previousElement) {
  		this.previousElement.remove();
  	}
  }
};



function dragStart() {
  if (analyzeMode) {
    var p = d3.mouse(this);
    selectionRect.init(p[0], p[1]);
  	selectionRect.removePrevious();
  }
}

function dragMove() {
  if (analyzeMode) {
  	var p = d3.mouse(this);
    selectionRect.update(p[0], p[1]);
  }
}

function filterDatasetByRect(rect) {
  return displayedDataset.filter((d) => {
    let x = getX(d);
    let y = getY(d);
    return (
      rect.x1 <= x && x <= rect.x2 &&
      rect.y1 <= y && y <= rect.y2 &&
      selectedSeries.includes(d.series_id)
    )
  })
}

function analyze(data) {
  screenBlock.raise()
  if (data.length == 0) {
    clearBottomBar();
    return false;
  }
  return new Promise( resolve => {
    term_frequency = {};
    document_frequency = {};
    series_frequency = {};
    sentiment = 0;

    data.forEach((d) => {
      sentiment += d.sentiment;
      if (series_frequency.hasOwnProperty(d.series_id)) {
        series_frequency[d.series_id]++;
      } else {
        series_frequency[d.series_id] = 1
      }

      var in_this_doc = new Set([]);
      var words = d.content.toLowerCase().match(/\w+/g);
      words.forEach((word) => {
        if (!stopwords.has(word)) {
          in_this_doc.add(word)
          if (term_frequency.hasOwnProperty(word)) {
            term_frequency[word]++;
          } else {
            term_frequency[word] = 1
          }
        }
      })
      in_this_doc.forEach((word) => {
        if (document_frequency.hasOwnProperty(word)) {
          document_frequency[word]++;
        } else {
          document_frequency[word] = 1
        }
      })
    })

    var sortable = [];
    for (var key in term_frequency) {
        sortable.push([key, term_frequency[key], document_frequency[key]]);
    }
    sortable.sort(function(a, b) {
        return b[1] - a[1];
    });

    var sortable_series = [];
    for (var key in series_frequency) {
        sortable_series.push([key, series_frequency[key], document_frequency[key]]);
    }
    sortable_series.sort(function(a, b) {
        return b[1] - a[1];
    });

    leftBottomDisplay.html(null);
    rightBottomDisplay.html(null);
    bottomBar.style("background-color", "white").style("height", bottomBarSize + "px")
    leftBottomDisplay.append("p").append("b").text("Most Common Words : Count (Percentage of Dreams)")
    sortable.slice(0,100).forEach((p) => {
      leftBottomDisplay
        .append("p")
        .text(p[0] + ": " + p[1] + " (" + Math.round(100 * p[2] / data.length) + "%)")
        .style("width", "100%");
    })
    var male = 0;
    var female = 0;
    sortable_series.forEach((p) => {
      if (info[p[0]].sex == "male") {
        male += p[1];
      } else {
        female += p[1];
      }
    })

    rightBottomDisplay.append("p").append("b").text("General")
    rightBottomDisplay.append("p").text("Total dreams: " + data.length)
    rightBottomDisplay.append("p").text("Male: " + male + " (" + Math.round(100 * male / data.length) +"%)")
    rightBottomDisplay.append("p").text("Female: " + female + " (" + Math.round(100 * female / data.length) +"%)")
    rightBottomDisplay.append("p").text("Average Sentiment: " + sentiment / data.length)

    rightBottomDisplay.append("p").append("b").text("Series")
    sortable_series.forEach((p) => {
      rightBottomDisplay
        .append("p")
        .text(p[0] + ": " + p[1] + " (" + Math.round(100 * p[1] / data.length) + "%)")
        .style("width", "100%");
    })
  })

}

function repeatAnalyze() {
  var finalAttributes = selectionRect.getCurrentAttributes();
  var inRect = filterDatasetByRect(finalAttributes);
  analyze(inRect)
}

function dragEnd() {
  if (!analyzeMode) {
    return false;
  }
	var finalAttributes = selectionRect.getCurrentAttributes();
	if(finalAttributes.x2 - finalAttributes.x1 > 1 && finalAttributes.y2 - finalAttributes.y1 > 1){
		// range selected
		var inRect = filterDatasetByRect(finalAttributes);
    analyze(inRect)
    try {
      d3.event.sourceEvent.preventDefault();
  		selectionRect.focus();
    } catch (e) {
    }
	} else {
      // single point selected
      selectionRect.remove();
      clearBottomBar();
      // trigger click event manually
    }
}

function toggleAnalyzer() {
  handleAnalyze(!analyzeMode)
}


var screenBlock = null;
function handleAnalyze(mode) {
  analyzeMode = mode;
  d3.select("#analyzeCheckbox")
  .property("checked", analyzeMode)
  .property("value", analyzeMode);
	if (screenBlock !== null) {
		screenBlock.remove()
		screenBlock = null;
	}

  if (!analyzeMode) {
    d3.select("svg").call(zoom);
    clearBottomBar();
    selectionRect.remove()
  } else {
    screenBlock = svg.append("rect")
    screenBlock
      .attr("x", -10000)
      .attr("y", -10000)
      .attr("width", 100000)
      .attr("height", 100000)
      .style("fill", "white")
      .style("fill-opacity", 0.15)

    d3.select("svg").on('.zoom', null);
    clearBottomBar();
  }
}
