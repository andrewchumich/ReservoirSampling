(function() {

var n = 120,
    array = d3.range(n).map(function(d, i) { return {value: d, index: i}; });

var margin = {top: 60, right: 60, bottom: 60, left: 60},
    width = 960 - margin.left - margin.right,
    height = 180 - margin.top - margin.bottom;

var x = d3.scale.ordinal()
    .domain(d3.range(n))
    .rangePoints([0, width]);

var a = d3.scale.linear()
    .domain([0, n - 1])
    .range([-45, 45]);

var p = d3.select("#fisher-yates-shuffle")
    .on("click", click);

var svg = p.append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var line = svg.append("g")
  .selectAll("line")
    .data(array)
  .enter().append("line")
    .attr("class", "line line--inactive")
    .attr("transform", transform)
    .attr("y2", -height);

p.append("button")
    .text("▶ Play");

whenFullyVisible(p.node(), click);

function click() {
  var swaps = shuffle(array.slice()).reverse(),
      swapped = array.slice();

  p
      .classed("animation--playing", true);

  line
      .each(function(d, i) { d.index = i; })
      .attr("transform", transform)
      .attr("class", "line")
      .interrupt();

  (function nextTransition() {
    var swap = swaps.pop(),
        i = swap[0],
        j = swap[1],
        t;

    t = swapped[i];
    swapped[i] = swapped[j];
    swapped[j] = t;
    swapped[i].index = i;
    swapped[j].index = j;

    d3.selectAll([line[0][swapped[j].value], line[0][swapped[i].value]])
        .attr("class", "line line--active")
        .each(function() { this.parentNode.appendChild(this); })
      .transition()
        .duration(750)
        .attr("transform", transform)
        .each("end", function(d, i) {
          d3.select(this).attr("class", i || swap[0] === swap[1] ? "line line--inactive" : "line");
          if (i || swap[0] === swap[1]) {
            if (swaps.length) nextTransition();
            else p.classed("animation--playing", false);
          }
        });
  })();
}

function transform(d) {
  return "translate(" + x(d.index) + "," + height + ")rotate(" + a(d.value) + ")";
}

function shuffle(array) {
  var swaps = [],
      m = array.length,
      t,
      i;

  while (m) {
    i = Math.floor(Math.random() * m--);
    t = array[m];
    array[m] = array[i];
    array[i] = t;
    swaps.push([m, i]);
  }

  return swaps;
}

})()