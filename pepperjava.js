    //Define Margin
var width = 960,
    height = 500,
    padding = 6 // separation between nodes
    maxRadius = 12;
    

    //Get Data 
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
        
        var m = 0;
        var n = 0;
        var locations = []
        data.forEach(function(d) {
            locations.push(d.origin);
            n = n + 1;
        });
        
        var newlocations = locations.filter(function(elem, pos) {
            return locations.indexOf(elem) == pos;
        }); 
        
        m = newlocations.length;
    
        
        //Define Color
        var color = d3.scale.category10()
            .domain(d3.range(m));
        
        
        var x = d3.scale.ordinal()
            .domain(newlocations)
            .rangePoints([0, width], 1),
            
            legend = d3.svg.axis()
                    .scale(x)
                    .orient("top")
        
        
        var nodes = data.map(function(d) {
          var i = newlocations.indexOf(d.origin),
            v = d.max;
          return {
            radius: Math.sqrt(v) * 0.1,
            color: color(i),
            cx: x(newlocations[i]),
            cy: height / 2
          };
        });
        
        console.log(nodes);
        
        var force = d3.layout.force()
          .nodes(nodes)
          .size([width, height])
          .gravity(0)
          .charge(0)
          .on("tick", tick)
          .start();
        
        var svg = d3.select("body").append("svg")
          .attr("width", width)
          .attr("height", height),
          gLegend = svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0, " + height * 0.9 + ")")
          .call(legend);
        gLegend.selectAll(".tick text")
          .attr("fill", function(d, i) {
            return color(i);
          });
        
//        d3.select("body").attr("align", "center");


        var circle = svg.selectAll("circle")
          .data(nodes)
          .enter().append("circle")
          .attr("r", function(d) {
            return d.radius;
          })
          .style("fill", function(d) {
            return d.color;
          })
          .call(force.drag);

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
        
        
   

    });




    