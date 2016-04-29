Graph.prototype = new DataType();
Graph.prototype.constructor = Graph;
Graph.prototype._key = ["GID"];

function Graph(GID, timespan, group_by, where, lines, title) {
	this.GID = GID;
	this.timespan = timespan;
	this.group_by = group_by;
	this.where = where;
	this.lines = lines;
    this.title = title;
    

    /* Returns an object that can be used to display a graph.
     * in_cache: Set true if all aggregation objects are already stored in the cache (Performance).
     * only_values: Set true if the graph's timeline should stop if there is no more data.
    */
    this.get_visual = function (in_cache, only_values) {
        var graph = {type: "Line", labels: [], series: [], data: [], temp_GID: this.GID};
        var elapsed_time = this.timespan.start - this.timespan.end;
        var total_days = Math.ceil((elapsed_time) / (60*60*24));

        var lines = this.lines;
        var label = "";
        console.log("Only values: " + only_values);
        switch (this.timespan.value_type) {
            case 'HourValue':
                if (!only_values) { 
                    var total_hours = (elapsed_time) / (60*60);
                    console.log("In !only values for hours");
                    console.log("total hours: " + total_hours);
                    for (var i = 0; i < total_hours; i++) 
                        graph.labels.push("hour " + i);
                    break;
                }
                label = "hour ";
                break;
            case 'DayValue':
                if (!only_values) { 
                    for (var i = 0; i < total_days; i++)
                        graph.labels.push("day " + i);
                    break;
                }
                label = "day ";
                break;
            case 'MonthValue':
                if (!only_values) { 
                    for (var i = 0; i < total_days; i += 30)
                        graph.labels.push("month " + i / 30);
                    break;
                }
                label = "month ";
                break;
            case 'YearValue':
                if (!only_values) { 
                    for (var i = 0; i < total_days; i += 365) 
                        graph.labels.push("year " + i / 365);
                    break;
                }
                label = "year ";
        }

        if (only_values) {
            var show_labels = lines[0].values.length <= 50;
            for (var labelIndex = 0; labelIndex < lines[0].values.length; labelIndex++) {
                if (show_labels) {
                    graph.labels.push(label + labelIndex);
                    continue;
                }
            graph.labels.push(label);
            }
        }

        for (var lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            var sensor_data = [];
            for (var valueIndex = 0; valueIndex < lines[lineIndex].values.length; valueIndex++) {
                sensor_data.push(lines[lineIndex].values[valueIndex][0]);
                if (!only_values && this.timespan.value_type === "Value") 
                    graph.labels.push("");
            }
            // TODO
            graph.series.push("");
            graph.data.push(sensor_data);
        }
        return graph;
    }
}
