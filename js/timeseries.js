/*
 *  DECLARATION BLOCK STARTS
 */


function timeseries() {

    var width = 400;
    var height = 400;

    var svg;

    var data;

    var margin = {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50
    };

    var x_scale;
    var y_scale;

    var y_axis;
    var x_axis;

    var confdata;
    var meandata;
    var raw;
    var casecode;
    var num_trials;


    var t = d3.transition()
        .duration(800);

    var valueline = d3.line()
        .x(function(d) {
            return x_scale(d.Week);
        })
        .y(function(d) {
            return y_scale(d[casecode]);
        });

    var confArea = d3.area()
        .x(function(d) {
            return x_scale(d.Week);
        })
        .y0(function(d) {
            return y_scale(d.LowerConf)
        })
        .y1(function(d) {
            return y_scale(d.UpperConf);
        });

    var draw = function() {};
    var updateHeight = function() {};
    var updateWidth = function() {};

    function chart(selection) {
        selection.each(function() {
            svg = d3.select(this)
                .append('svg')
                .attr('class', 'ts-svg')
                .attr('height', height)
                .attr('width', width)
                .append('g')
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

            width = width - margin.left - margin.right;
            height = height - margin.top - margin.bottom;

            x_scale = d3.scaleLinear()
                .range([0, width]);
            y_scale = d3.scaleLinear()
                .range([height, 0]);
            y_axis = d3.axisLeft(y_scale);
            x_axis = d3.axisBottom(x_scale);

            svg.append("g")
                .attr("class", "y axis")

            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + (height) + ")");

            svg.append("text")
                .attr('class', 'y label')
                .attr("transform", "translate(-30," + height / 2 + ")rotate(-90)")
                .attr("text-anchor", "end");

            svg.append("text")
                .attr('class', 'x label')
                .attr("transform", "translate(" + width / 2 + "," + (height + 30) + ")")
                .attr("text-anchor", "end");
        });

        updateWidth = function() {
            if (svg) {
                d3.select('.ts-svg')
                    //.transition(t)
                    .attr('width', width);

                width = width - margin.left - margin.right;

                x_scale.range([0, width]);

                d3.select('.x.label')
                    //.transition(t)
                    .attr('transform', "translate(" + width / 2 + "," + (height + 30) + ")")
            }
        }

        udateHeight = function() {
            if (svg) {
                d3.select('.ts-svg')
                    //.transition(t)
                    .attr('height', height);

                height = height - margin.top - margin.bottom;

                y_scale.range([height, 0]);

                d3.select('.y.label')
                    .attr('transform', "translate(-30," + height / 2 + ")rotate(-90)")
            }
        }

        draw = function() {
            if (svg && data) {

                svg.select('.x.axis')
                    .attr("transform", "translate(0," + (height) + ")");

                svg.select('.y.label')
                    .attr("transform", "translate(-30," + height / 2 + ")rotate(-90)")
                    .text("Time Units");

                svg.select('.x.label')
                    .attr("transform", "translate(" + width / 2 + "," + (height + 30) + ")")
                    .text("Average Waiting Time")

                x_scale.domain([0, d3.max(data, function(d) {
                    return d.Week;
                })]);

                y_scale.domain([0, d3.max(data, function(d) {
                    return d[casecode];
                })]);

                if (confdata) {
                    svg.append("path")
                        .datum(confdata)
                        .attr("class", "area")
                        .attr("d", confArea)
                        .attr("fill", "#ff6600")
                        .style("opacity", 0.25);
                };

                if (raw) {
                    for (t = 0; t < num_trials; t++) {
                        thisdata = data.filter(function(d) {
                            return d.Trial == t;
                        });
                        svg.append('path')
                            .datum(thisdata)
                            .attr("class", "line")
                            .attr("fill", "none")
                            .attr("stroke", "#E0E0E0")
                            .attr("stroke-width", 1)
                            .attr('d', valueline)
                            .on("mouseover", function(d) {
                                d3.select(this)
                                    .attr('stroke', "#8c8c8c")
                                    .attr("stroke-width", 2);
                                var tooltip = svg
                                    .append('g')
                                    .attr('id', 'tooltip');
                                tooltip
                                    .append("rect")
                                    .attr('x', d3.mouse(this)[0] - 35)
                                    .attr('width', 75)
                                    .attr('y', d3.mouse(this)[1] - 30)
                                    .attr('height', 20)
                                    .attr('fill', '#FFF3D1')
                                    .attr('stroke', '#ff9900')
                                    .attr('rx', 10)
                                    .attr('ry', 10);
                                tooltip
                                    .append('text')
                                    .attr('x', d3.mouse(this)[0] - 25)
                                    .attr('y', d3.mouse(this)[1] - 15)
                                    .text('Trial #' + d[0].Trial)
                            })
                            .on("mousemove", function(d) {
                                svg.select("#tooltip")
                                    .select('rect')
                                    .attr('x', d3.mouse(this)[0] - 35)
                                    .attr('y', d3.mouse(this)[1] - 30)
                                svg.select("#tooltip")
                                    .select('text')
                                    .attr('x', d3.mouse(this)[0] - 25)
                                    .attr('y', d3.mouse(this)[1] - 15)

                            })
                            .on("mouseout", function(d) {
                                d3.select(this)
                                    .attr('stroke', "#E0E0E0")
                                    .attr("stroke-width", 1);
                                svg_ts.select("#tooltip")
                                    .remove();
                            });
                    };
                };

                if (meandata) {
                    svg.append('path')
                        .datum(meandata)
                        .attr("class", "line")
                        .attr("fill", "none")
                        .attr("stroke", "#ff6600")
                        .attr("stroke-width", 2)
                        //.transition(t)
                        .attr('d', valueline);

                };
            }

            d3.select('.x.axis')
                //.transition(t)
                .call(d3.axisBottom(x_scale)
                    .ticks(10));
            d3.select('.y.axis')
                //.transition(t)
                .call(d3.axisLeft(y_scale)
                    .ticks(10));
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

    chart.raw = function(_) {
        if (!arguments.length) return raw;
        raw = _;
        draw();
        return chart;
    }

    chart.data = function(_) {
        if (!arguments.length) return data;
        data = _;
        draw();
        return chart;
    }

    chart.confdata = function(_) {
        if (!arguments.length) return confdata;
        confdata = _;
        draw();
        return chart;
    }

    chart.meandata = function(_) {
        if (!arguments.length) return meandata;
        meandata = _;
        draw();
        return chart;
    }

    chart.casecode = function(_) {
        if (!arguments.length) return casecode;
        casecode = _;
        draw();
        return chart;
    }

    chart.num_trials = function(_) {
        if (!arguments.length) return num_trials;
        num_trials = _;
        draw();
        return chart;
    }

    return chart;
}
