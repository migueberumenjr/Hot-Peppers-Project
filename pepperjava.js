  //Define Margin
var width = 1500,
    height = 800,
    padding = 6 // separation between nodes
    maxRadius = 12;

var path,
    circle,
    force,
    nodes,
    locations,
    color,
    m,
    n,
    newlocations;

var div = d3.select("body").append("div")
    .attr('class', 'tooltip')
    .style("opacity", 0);

var svg = d3.select("body").append("svg")
          .attr("width", width)
          .attr("height", height);


$('.tablinks').click(function(event) {
    if (this.id === "color")  {
        codeChange("color");
    }
    else if (this.id === "origin") {
        codeChange("origin");
    }
    else {
        codeChange("species");
    }
});
    
function create_graph(category) {
    d3.csv("peppers.csv", function(d) {
        return {
            name: d.name,
            min: +d.min,
            max: +d.max,
            origin: d.origin,
            species: d.species,
            color: d.color,
        };
    }, function(data) {
        
        m = 0;
        n = 0;
         
        locations = []
        data.forEach(function(d) {
            if (category === "origin") {
                locations.push(d.origin);
                n = n + 1;
            }
            if (category === "species") {
                locations.push(d.species);
                n = n + 1;
            }
            if (category === "color") {
                locations.push(d.color);
                n = n + 1;
            }
        });
        
        newlocations = locations.filter(function(elem, pos) {
            return locations.indexOf(elem) == pos;
        }); 
        
        m = newlocations.length;
    
        
        //Define Color
        
        if (category === "color") {
            color = d3.scale.ordinal()
                .range(["#FFFF00","#008000","#FF0000", "#FFA500"]);
        }
        
        else {
        
        color = d3.scale.category20()
            .domain(d3.range(m));
        }
        
        
        var x = d3.scale.ordinal()
            .domain(newlocations)
            .rangePoints([0, width], 1),
            
            legend = d3.svg.axis()
                    .scale(x)
                    .orient("top")
        
        
        nodes = data.map(function(d) {
            if (category === "origin")
                var i = newlocations.indexOf(d.origin);
            if (category == "species")
                var i = newlocations.indexOf(d.species);
            if (category == "color")
                var i = newlocations.indexOf(d.color);
            v = d.max;
          return {
            name: d.name,
            min: d.min,
            max: d.max,
            avg: (d.min + d.max)/2,
            origin: d.origin,
            species: d.species,
            actcolor: d.color,
            radius: Math.sqrt(v) * 0.1,
            color: color(i),
            cx: x(newlocations[i]),
            cy: height / 2,
            image: "http://sweetclipart.com/multisite/sweetclipart/files/red_chili_pepper.png"
          };
        });
        
        
        
        force = d3.layout.force()
          .nodes(nodes)
          .size([width, height])
          .gravity(0)
          .charge(0)
          .on("tick", tick)
          .start();
        
        var gLegend = svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0, " + height * 0.9 + ")")
          .call(legend);
        gLegend.selectAll(".tick text")
          //.attr("fill", function(d, i) {
        .attr("fill", function(d, i) {
            return '#000000';
          });
        
        var reddd;
        

        circle = svg.append("g").selectAll("circle")
          .data(nodes)
          .enter().append("circle")
          .attr("r", function(d) {
            return d.radius;
          })
          .style("fill", function(d){
            if (d.actcolor == "red"){
                return '#FF0000';
            }else if (d.actcolor == "green"){
                return '#009933';
            }else if (d.actcolor == "yellow"){
                return '#ffd633';
            }else if (d.actcolor == "orange"){
                return '#ff8000';
            }
          })
            .on('mouseover', function(d) {
                div.transition()
                    .duration(200)
                    .style("opacity", .9);
                div.html("Name: " + d.name + "<br/>Minimum SHU: " + d.min + "<br/>Maximum SHU: " + d.max + "<br/>Average SHU: " + d.avg + "<br/>Origin: " + d.origin + "<br/>Species: " + d.species + "<br/>Color: " + d.actcolor + "<br/>")
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY) + "px");
            })
            .on('mouseout', function(d) {
                div.transition()
                    .duration(500)
                    .style("opacity", 0);
            })
          .call(force.drag);
    });
}
   

    function tick(e) {
      circle
        .each(gravity(.2 * e.alpha))
        .each(collide(.5))
        .attr("cx", function(d) {
          return d.x;
        })
        .attr("cy", function(d) {
          return d.y;
        });
    }

    // Move nodes toward cluster focus.
    function gravity(alpha) {
      return function(d) {
        d.y += (d.cy - d.y) * alpha;
        d.x += (d.cx - d.x) * alpha;
      };
    }

    // Resolve collisions between nodes.
    function collide(alpha) {
      var quadtree = d3.geom.quadtree(nodes);
      return function(d) {
        var r = d.radius + maxRadius + padding,
          nx1 = d.x - r,
          nx2 = d.x + r,
          ny1 = d.y - r,
          ny2 = d.y + r;
        quadtree.visit(function(quad, x1, y1, x2, y2) {
          if (quad.point && (quad.point !== d)) {
            var x = d.x - quad.point.x,
              y = d.y - quad.point.y,
              l = Math.sqrt(x * x + y * y),
              r = d.radius + quad.point.radius + (d.color !== quad.point.color) * padding;
            if (l < r) {
              l = (l - r) / l * alpha;
              d.x -= x *= l;
              d.y -= y *= l;
              quad.point.x += x;
              quad.point.y += y;
            }
          }
          return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
        });
      };
    }

    function clear_graph() {
        nodes = {};
        links = [];
        newlocations = [];
        svg.selectAll('g').remove();
    }

    function codeChange(category) {
        clear_graph();
        create_graph(category)
    }






    