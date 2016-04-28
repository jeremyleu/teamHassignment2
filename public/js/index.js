(function(d3) {
  "use strict";

  var map = L.map('mapid', { zoomControl: false }).setView([32.969, -117.334], 10);


  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    maxZoom: 18,
    id: 'p9kim.ppgijk1l',
    accessToken: 'pk.eyJ1IjoicDlraW0iLCJhIjoiY2luaGkweGh5MHZwMnU4a2p4aXAxaTh3ayJ9.v238swAmvFaC86OpYv7HXA'
  }).addTo(map);

  map.dragging.disable();
map.touchZoom.disable();
map.doubleClickZoom.disable();
map.scrollWheelZoom.disable();
map.keyboard.disable();

var svg = d3.select(map.getPanes().overlayPane).append("svg"),
    g = svg.append("g").attr("class", "leaflet-zoom-hide");

d3.json("./data/san-diego.geojson", function(error, collection) {
  if (error) throw error;

  var transform = d3.geo.transform({point: projectPoint}),
      path = d3.geo.path().projection(transform);

  var feature = g.selectAll("path")
      .data(collection.features)
    .enter().append("path");

  map.on("viewreset", reset);
  reset();

  // Reposition the SVG to cover the features.
  function reset() {
    var bounds = path.bounds(collection),
        topLeft = bounds[0],
        bottomRight = bounds[1];

    svg .attr("width", bottomRight[0] - topLeft[0])
        .attr("height", bottomRight[1] - topLeft[1])
        .style("left", topLeft[0] + "px")
        .style("top", topLeft[1] + "px");

    g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");

    feature.attr("d", path);
  }

  // Use Leaflet to implement a D3 geometric transformation.
  function projectPoint(x, y) {
    var point = map.latLngToLayerPoint(new L.LatLng(y, x));
    this.stream.point(point.x, point.y);
  }
});


/*d3.json("/agencycrimes", function(err, data) {
    if (err) {
      console.log(err);
      return;
    }
    makeDelphiChart(data);
  });*/

})(d3);

/*getColor = function(d, max) {
  var color = d3.scale.linear()
      .domain([0, 0.5, 1])
      .range(["green", "yellow", "red"]);

  return color(d/max);
};

getCountyData = function(agency) {
  d3.json('/agencies/' + agency, function(err, data) {
    if (err) {
      console.log(err);
      return;
    }
    makeDonutChart(data);
  });
}

makeDelphiChart = function(data) {
  var w = window.innerWidth;

  var margin = {top: 20, right: 0, bottom: 100, left:75},
      width = (w / 2) - margin.right - margin.left,
      height = 800 - margin.top - margin.bottom;

  var innerWidth  = width; //  - margin.left - margin.right;
  var innerHeight = height - margin.top  - margin.bottom;
  var maxRating = d3.max( data.map(function(d){ return parseInt(d.total); }) );

  var xScale = d3.scale.ordinal().rangeRoundBands([0, innerWidth], 0);
  var yScale = d3.scale.linear().range([0, innerHeight]);

  // Define the chart
  var chart = d3
    .select(".chart")
    .append("svg")
    .attr("width", width + margin.right + margin.left)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" +  margin.left + "," + margin.right + ")");

  // Render the chart
  xScale.domain( data.map(function (d){ return d.agency; }) );
  yScale.domain([maxRating, 0]);

  chart
    .selectAll(".bar")
    .data(data.map(function(d){ return d.total; }) )
    .enter().append("rect")
    .attr("class", "bar")
    .attr("id", function (d, i){ return data[i].agency; })
    .attr("x", function(d, i) { return ((innerWidth / data.length)*i) + 10; })
    .attr("width", (innerWidth / data.length) - 20)
    .attr("y", function(d) { return innerHeight - (innerHeight*(d / maxRating)); })
    .attr("height", function(d) { return innerHeight*d/maxRating;  })
    .on("click", function(d, i) { getCountyData(data[i].agency); })
    .style("fill", function(d) { return getColor(d, maxRating); });
  // Orient the x and y axis
  var xAxis = d3.svg.axis().scale(xScale).orient("bottom");
  var yAxis = d3.svg.axis().scale(yScale).orient("left");

  // TODO: Append X axis
  chart
    .append("g")
    .attr("transform", "translate(" + 0 + "," + innerHeight + ")")
    .call(xAxis)
    .selectAll("text")
    .attr("transform", "rotate(" + -45 + ")")
    .style("text-anchor", "end");

  // TODO: Append Y axis
  chart
    .append("g")
    .call(yAxis);

};


makeDonutChart = function(data) {
  var w = window.innerWidth;

  var width = w / 3,
      height = 600,
      radius = Math.min(width, height) / 2;

  var max = d3.max( data.map(function(d){ return parseInt(d.total); }) );
  var sum = d3.sum( data.map(function(d){ return parseInt(d.total); }) );

  var color = d3.scale.ordinal()
    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

  var remove = d3
    .select(".chart2")
    .select("svg")
    .remove()

  var arc = d3.svg.arc()
    .innerRadius(radius - 75)
    .outerRadius(radius);

  var pie = d3.layout.pie()
    .value(function(d) { return d.total; })
    .sort(null);

  var chart = d3.select(".chart2")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height * 4 / 9 + ")");

  var g = chart
    .selectAll(".arc")
    .data( pie(data) )
    .enter()
    .append("g")
    .attr("class", "arc");

  g.append("path")
    .attr("d", arc)
    .style("fill", function(d, i) { return color(i); });

  var xCoor = -60;
  var yCoor = 20;

  g.append("text")
    .attr("transform", function(d) { return "translate(" + xCoor + "," + yCoor + ")"; })
    .style("opacity", "0")
    .style("font-size", "5em")
    .text(function(d) { return (Math.round(d.value/sum * 100) + "% "); });

};
*/