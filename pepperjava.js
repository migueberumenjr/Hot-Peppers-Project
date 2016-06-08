//Define Margin
var width = document.getElementById('container').offsetWidth-30,
    height = 1000,
    padding = 6, // separation between nodes
    maxRadius = 70, // maximum size of a circle
    minRadius = 3;

var svg = d3.select("body").append("svg")
          .attr("width", width)
          .attr("height", height);

var path,circle,force,nodes,locations,color,m,n,newlocations;

var div = d3.select("body").append("div")
    .attr('class', 'tooltip')
    .style("opacity", 0);

/******All of the following code up to function create_graph() is for the buttons.
    The same code is copied in the codeChange function because it doesn't
    work without it
******/
var bWidth= 100; //button width
var bHeight= 65; //button height
var bSpace= 20; //space between buttons
var x0= document.getElementById('container').offsetWidth/2-230; //x offset
var y0= 10; //y offset

//button labels
var labels= ["Color","Region","Species","Scoville"];

//colors for different button states 
var defaultColor= "Orange"
var hoverColor= "Yellow"
var pressedColor= "Red"

//container for all buttons
var allButtons= svg.append("g")
    .attr("id","allButtons")

//groups for each button (which will hold a rect and text)
var buttonGroups= allButtons.selectAll("g.button")
    .data(labels)
    .enter()
    .append("g")
    .attr("class","button")
    .style("cursor","pointer")
    .on("click",function(d,i) {
        updateButtonColors(d3.select(this), d3.select(this.parentNode))
        codeChange(d)
    })
    .on("mouseover", function() {
        if (d3.select(this).select("rect").attr("fill") != pressedColor) {
            d3.select(this)
                .select("rect")
                .attr("fill",hoverColor);
        }
    })
    .on("mouseout", function() {
        if (d3.select(this).select("rect").attr("fill") != pressedColor) {
            d3.select(this)
                .select("rect")
                .attr("fill",defaultColor);
        }
    })

//adding a rect to each toggle button group
//rx and ry give the rect rounded corner
buttonGroups.append("rect")
    .attr("class","buttonRect")
    .attr("width",bWidth)
    .attr("height",bHeight)
    .attr("x",function(d,i) {return x0+(bWidth+bSpace)*i;})
    .attr("y",y0)
    .attr("rx",10) //rx and ry give the buttons rounded corners
    .attr("ry",10)
    .attr("fill",defaultColor)

//adding text to each toggle button group, centered 
//within the toggle button rect
buttonGroups.append("text")
    .attr("class","buttonText")
    .attr("font-family","FontAwesome")
    .attr("font-size", "22px")
    .attr("x",function(d,i) {
        return x0 + (bWidth+bSpace)*i + bWidth/2;
    })
    .attr("y",y0+bHeight/2)
    .attr("text-anchor","middle")
    .attr("dominant-baseline","central")
    .attr("fill","black")
    .text(function(d) {return d;})

function create_graph(category) {
    d3.csv("peppers.csv", function(d) {
        return {
            name: d.name,
            min: +d.min,
            max: +d.max,
            region: d.region,
            country: d.country,
            species: d.species,
            color: d.color,
            picture: d.picture
        };
    },

    function(data) {
        m = 0;
        n = 0;
        locations = [];
        
        data.forEach(function(d) {
            if (category === "Region") {
                locations.push(d.region);
                n = n + 1;
            }
            if (category === "Species") {
                locations.push(d.species);
                n = n + 1;
            }
            if (category === "Color") {
                locations.push(d.color);
                n = n + 1;
            }
            if (category === "Scoville") {
                locations.push(d.max);
                n = n + 1;
            }
        });
        
        /* Here we figure out the maximum and minimum values of the Peppers' Scoville units */
        var minSpicy = d3.min(data, function(d){ return d.max; });
        var maxSpicy = d3.max(data, function(d){ return d.max; });
        var radiusScale = d3.scale.sqrt()
            .domain([minSpicy, maxSpicy])
            .range([minRadius,maxRadius]);

        newlocations = locations.filter(function(elem, pos) {
            return locations.indexOf(elem) == pos;
        }); 

        m = newlocations.length;

        //Define Color
        if (category === "color") {
            color = d3.scale.ordinal()
                .range(["Yellow","Orange","Red","Purple","Green","Brown"]);
        }
        else {
            color = d3.scale.category20()
                .domain(d3.range(m));
        }

        var x = d3.scale.ordinal()
            .domain(newlocations)
            .rangePoints([100, width-100], 1),

            legend = d3.svg.axis()
                .scale(x)
                .orient("top")
        
        nodes = data.map(function(d) {
            if (category === "Region")
                var i = newlocations.indexOf(d.region);
            if (category == "Species")
                var i = newlocations.indexOf(d.species);
            if (category == "Color")
                var i = newlocations.indexOf(d.color);
            if (category == "Scoville")
                var i = newlocations.indexOf(d.max);
            v = d.max;
            
            return {
                name: d.name,
                min: d.min,
                max: d.max,
                avg: (d.min + d.max)/2,
                region: d.region,
                country: d.country,
                species: d.species,
                actcolor: d.color,
                radius: radiusScale(d.max),
                color: color(i),
                cx: x(newlocations[i]),
                cy: height / 2,
                picture: d.picture
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
            .attr("fill", function(d, i) {
                return '#000000';
            })
            .attr("transform", "rotate(45)");

        circle = svg.append("g").selectAll("circle")
            .data(nodes)
            .enter().append("circle")
            .style("fill", function(d){
                return d.actcolor;
            })
            .on('mouseover', function(d) {
                div.transition()
                    .duration(200)
                    .style("opacity", .9);
                div.html("<center><img src=" + d.picture + "></center>" + "<br/><center>" + d.name + "</center><br/>Minimum SHU: <right>" + d.min + "</right><br/>Maximum SHU: <right>" + d.max + "</right><br/>Average SHU: <right>" + d.avg + "</right><br/>Region: <right>" + d.region + "</right><br/>Country: <right>" + d.country + "</right><br/>Species: <right>" + d.species + "</right><br/>Color: <right>" + d.actcolor + "</right>")
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY-230) + "px");
            })
            .on("mousemove", function(d) {
                div.style("top", (event.pageY-230)+"px").style("left", (event.pageX)+"px");
            })
            .on('mouseout', function(d) {
                div.transition()
                .duration(500)
                .style("opacity", 0);
            })
            .call(force.drag);

        circle.transition()
            .duration(1000)
            .delay(function(d, i) { return i * 10; })
            .attrTween("r", function(d) {
                var i = d3.interpolate(0, d.radius);
                return function(t) { return d.radius = i(t); };
            });
    } 
)}
           
function tick(e) {
    circle.each(gravity(.2 * e.alpha))
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

function updateButtonColors(button, parent) {
    parent.selectAll("rect")
        .attr("fill",defaultColor)
    button.select("rect")
        .attr("fill",pressedColor)
}

function clear_graph() {
    nodes = {};
    links = [];
    newlocations = [];
    svg.selectAll('.tick text').remove();
    svg.selectAll('circle').remove();
    
}

function codeChange(category) {
    clear_graph();
    create_graph(category);
}