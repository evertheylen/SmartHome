Graph.prototype = new DataType();
Graph.prototype.constructor = Graph;
Graph.prototype._key = ["GID"];

function Graph(GID, timespan, group_by, where, lines, title) {
	this.GID = GID;
	this.timespan = timespan;
	this.group_by = group_by; // [{"grouped_by": [..], "sensors": [..], "values": []}, ... ] 
	this.where = where;
	this.lines = lines;
    this.title = title;
    
    this.get_visual = function (in_cache) {
        var graph = {type: "Line", labels: [], series: [], data: [], temp_GID: this.GID};
        var lines = this.lines;
        console.log("Lines length: " + lines.length);
        var label = "";
        switch (this.timespan.value_type) {
            case 'HourValue':
                label = "hour ";
                break;
            case 'DayValue':
                label = "day ";
                break;
            case 'MonthValue':
                label = "month ";
                break;
            case 'YearValue':
                label = "year ";
        }
        var show_labels = lines[0].values.length <= 50;
        console.log("values length: " + lines[0].values.length);
        for (var labelIndex = 0; labelIndex < lines[0].values.length; labelIndex++) {
            if (show_labels) {
                graph.labels.push(label + labelIndex);
                continue;
            }
            graph.labels.push(label);
        }

        for (var lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            var sensor_data = [];
            for (var valueIndex = 0; valueIndex < lines[lineIndex].values.length; valueIndex++) {
                sensor_data.push(lines[lineIndex].values[valueIndex][0]);
                console.log("Generating data");
            }
            // TODO
            graph.series.push("");
            graph.data.push(sensor_data);
            console.log("Pushing data");
        }

        return graph;
    }
}
