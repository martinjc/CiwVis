function histogram() {

    /*
     * BEGIN USER VARIABLES
     * all these variables are modifiable to
     * end user via accessor methods on the chart object
     */
    var width = 400;

    var height = 400;

    var svg;

    var numberofbins;

    var data;
    /*
     * END USER VARIABLES
     */


    // Internal variables
    //

    var margin = {
        top: 50,
        bottom: 50,
        left: 70,
        right: 50
    };

    var tooltip;

    var formatCount = d3.format(",.0f");

    var t = d3.transition()
        .duration(2000);

    // draw doesn't do anything until
    // we instantiate it at the same time
    // as the chart itself
    var draw = function() {};
    var updateWidth = function() {};
    var updateHeight = function() {};

    var x_scale = d3.scaleLinear();
    var y_scale = d3.scaleLinear();

    // chart object
    function chart(selection) {
        selection.each(function() {

            // initialise the svg for drawing
            svg = d3.select(this)
                .append('svg')
                .attr('class', 'histogram-svg')
                .attr('height', height)
                .attr('width', width)
                .append('g')
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

            // only use inner portion (inside margin) for drawing
            width = width - margin.left - margin.right;
            height = height - margin.top - margin.bottom;

            // add the chart labels
            svg.append("text")
                .attr('class', 'y axis-label')
                .attr("transform", "translate(-50," + height / 2 + ")rotate(-90)")
                .attr("text-anchor", "middle");


            svg.append("text")
                .attr('class', 'x axis-label')
                .attr("transform", "translate(" + width / 2 + "," + (height + 30) + ")")
                .attr("text-anchor", "end");

            // empty groups to draw axes in later
            svg.append("g")
                .attr("class", "axis axis--y");

            svg.append("g")
                .attr("transform", "translate(0," + height + ")")
                .attr("class", "axis axis--x");

        });

        updateWidth = function() {
            if (svg) {
                d3.select('.histogram-svg')
                    //.transition(t)
                    .attr('width', width);

                width = width - margin.left - margin.right;

                x_scale.rangeRound([0, width]);

                d3.select('.histogram-svg')
                    .select('.x.axis-label')
                    //.transition(t)
                    .attr("transform", "translate(" + width / 2 + "," + (height + 30) + ")");
            }
        }

        updateHeight = function() {
            if (svg) {
                d3.select('.histogram-svg')
                    //.transition(t)
                    .attr('height', height);

                height = height - margin.top - margin.bottom;

                y_scale.rangeRound([height, 0]);

                d3.select('.histogram-svg')
                    .select('.y.axis-label')
                    //.transition(t)
                    .attr("transform", "translate(-50," + height / 2 + ")rotate(-90)")
            }
        }

        // now we can draw the chart
        draw = function() {

            // as long as our svg and data exist
            if (svg && data) {

                // Calculate data bounds
                var maxValue = d3.max(data, function(d) {
                    return d.Waiting_time;
                });

                x_scale.domain([0, maxValue]);

                // set up histogram
                var binedges = [];
                for (i = 0; i < numberofbins + 1; i++) {
                    var s = i * (maxValue / numberofbins);
                    binedges.push(s)
                };

                var bins = d3.histogram()
                    .domain(x_scale.domain())
                    .thresholds(binedges)
                    (data.map(function(d) {
                        return d.Waiting_time;
                    }));

                y_scale.domain([0, d3.max(bins, function(d) {
                    return d.length;
                })]);

                var bar_width = x_scale(bins[0].x1) - x_scale(bins[0].x0) - 1;

                // draw the bars
                var bar = svg
                    .selectAll(".bar")
                    .data(bins);

                bar
                    .exit()
                    //.transition(t)
                    .remove();

                var newbar = bar
                    .enter()
                    .append("g")
                    .attr("class", "bar")

                newbar
                    .append('rect')
                    .attr('class', 'histogram-bar-rect')
                    .attr("height", 0)
                    .attr("y", 0);

                newbar.merge(bar)
                    .select('.histogram-bar-rect')
                    //.transition(t)
                    .attr("x", function(d) {
                        return (d.x0 * width) / maxValue;
                    })
                    .attr("fill", "#ff6600")
                    .attr("width", x_scale(bins[0].x1) - x_scale(bins[0].x0))
                    .attr("height", function(d) {
                        return height - y_scale(d.length);
                    })
                    .attr("y", function(d) {
                        return y_scale(d.length);
                    })

                newbar
                    .select('.histogram-bar-rect')
                    .on("mouseover", function(d) {

                        d3.select(this)
                            .attr("fill", "#ff9900");

                        tooltip
                            .attr('display', null)
                            .attr('transform', 'translate(' + (d3.event.offsetX + 5) + ',' + (d3.event.offsetY - 60) + ')')

                        tooltip
                            .select('#tspantop')
                            .text('Count: ' + d.length)

                        tooltip
                            .select('#tspanbottom')
                            .text('Interval: (' + d.x0.toFixed(2) + ', ' + d.x1.toFixed(2) + ')');

                    })
                    .on("mousemove", function(d) {
                        tooltip
                            .attr('transform', 'translate(' + (d3.event.offsetX + 5) + ',' + (d3.event.offsetY - 60) + ')');
                    })
                    .on("mouseout", function(d) {
                        d3.select(this)
                            .attr("fill", "#ff6600");
                        tooltip
                            .attr('display', 'none');
                    });

                d3.select('#tooltip')
                    .remove();

                // create a blank tooltip, and hide it
                tooltip = d3.select('.histogram-svg')
                    .append('g')
                    .attr('id', 'tooltip')
                    .attr('display', 'none')

                tooltip
                    .append("rect")
                    .attr('width', 160)
                    .attr('height', 55)
                    .attr('fill', '#FFF3D1')
                    .attr('stroke', '#ff9900')
                    .attr('rx', 10)
                    .attr('ry', 10);

                var text = tooltip
                    .append('text')
                    .attr('dx', 10)
                    .attr('dy', 20)

                text
                    .append('tspan')
                    .attr('id', 'tspantop')

                text
                    .append('tspan')
                    .attr('id', 'tspanbottom')
                    .attr('x', 10)
                    .attr('dy', 20);

                d3.select('.axis.axis--y')
                    //.transition(t)
                    .call(d3.axisLeft(y_scale));

                d3.select('.axis.axis--x')
                    //.transition(t)
                    .call(d3.axisBottom(x_scale)
                        .tickValues(binedges));

                svg.select('.y.axis-label')
                    .text("Frequency");

                svg.select('.x.axis-label')
                    .text("Waiting Time");
            }
        }
        draw();
    }

    chart.width = function(_) {
        if (!arguments.length) return width;
        width = _;
        updateWidth();
        return chart;
    }

    chart.height = function(_) {
        if (!arguments.length) return height;
        height = _;
        updateHeight();
        return chart;
    }

    chart.numberofbins = function(_) {
        if (!arguments.length) return numberofbins;
        numberofbins = _;
        draw();
        return chart;
    }

    chart.data = function(_) {
        if (!arguments.length) return data;
        data = _;
        draw();
        return chart;
    }

    return chart;
}
