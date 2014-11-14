

function make_sample(population_size, sample_size, seed) {
  Math.seedrandom(seed); 
  var rainbow = new Rainbow();
  var n = population_size,
      array = d3.range(n),
      actions = reservoir_sample(array.slice(), sample_size).reverse();
  rainbow.setNumberRange(0, n);
  rainbow.setSpectrum('FF0000', 'FFFF00', '00FF00', '00FFFF', '0000FF', 'FF00FF');
  var margin = {top: 180, right: 40, bottom: 180, left: 40},
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

  var y = d3.scale.ordinal()
      .domain([2, 1, 0])
      .rangeRoundBands([height, 0], .3);

  var x = d3.scale.ordinal()
      .domain(d3.range(n))
      .rangePoints([0, width]);


  var a = d3.scale.linear()
      .domain([0, n - 1])
      .range([-45, 45]);

  d3.select("body").select("svg").remove();

  var svg = d3.select("body").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("index", 1)
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var line = svg.append("g")
      .attr("class", "line")
    .selectAll("line")
      .data(array.map(function(v, i) {
        return {
          value: v,
          index: i,
          array: 0
        };
      }))
    .enter().append("line")
      .style("stroke", function(d) {  var color = "#"+rainbow.colourAt(d.index); 
            return color;
          })
      .attr("index", get_index)
      .attr("transform", transform)
      .attr("y2", -y.rangeBand());

  var line0 = line[0],
      line1 = new Array(n),
      line2 = new Array(n);

  var transition = d3.transition()
      .duration(200)
      .each("start", function start() {
        var action = actions.pop();
        switch (action.type) {
          case "copy": {
            var i = action[0],
                j = action[1],
                e = line1[j] = line0[i],
                d = e.__data__;
            d.index = j;
            d.array = (d.array + 1) & 1;
            transition.each(function() { d3.select(e).transition().attr("transform", transform); });
            break;
          }
          case "swap": {
            var t = line0;
            line0 = line1;
            line1 = t;
            break;
          }
          case "swap_out": {
          var i = action[0],
                j = action[1],
                e = line2[j] = line0[i],
                d = e.__data__;
            d.index = d.value;
            d.array = (d.array + 1);
            transition.each(function() { d3.select(e).transition().attr("transform", transform); });
            break;
          }
        }
        if(actions.length) {
          transition = transition.transition().each("start", start);
        } else {
          console.log(line1);
        }
      });
  
  function transform(d) {
    return "translate(" + x(d.index) + "," + y(d.array) + ")rotate(" + a(d.value) + ")";
  }

  function get_index(d) {
    return d.index;
  }


  function reservoir_sample (population, n) {
    /*
      reservoir is the "bus"
      actions is the list of actions for d3 to perform
    */
    var trash_index = 0;
    var reservoir = new Array(n),
          actions = [];
    if(n > population.length) {
      console.log("ERROR: SAMPLE LARGER THAN POPULATION");
      return;
    }
    // place first n elements into sample
    for( var i = 0; i < n; i++ ) {
      reservoir.push(population[i]);
      actions.push({type: "copy", "0": i, "1": i});
    }

    /* 
    for each remaining element, perform a biased coin flip
    with decreasing probability
    */
    var p;
    for( var i = n; i < population.length; i++ ) {
      p = Math.floor(Math.random()*i);
      if( p < n ) {
        reservoir[p] = population[i];
        // remove selected item from "bus"
        actions.push({type: "swap"});
        actions.push({type: "swap_out", "0": p, "1": trash_index++});
        // add new item to "bus"
        actions.push({type: "swap"});
        actions.push({type: "copy", "0": i, "1": p}); 

      }
    }
    return actions;

  }
}


function start_sample() {
  var sample = parseInt(document.getElementById("sample")['value']);
  var population = parseInt(document.getElementById("population")['value']);
  var seed = parseInt(document.getElementById("seed")['value']);
  console.log(population, sample);
  make_sample(population, sample, seed);
}
