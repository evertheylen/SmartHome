var max_label_amount = 50;

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
    

    /* Returns a VisualGraph object that can be used to display a graph.
     * in_cache: Set true if all aggregation objects are already stored in the cache (Performance).
     * only_values: Set true if the graph's timeline should stop if there is no more data.
    */
    this.get_visual = function (in_cache) {
        var graph = new VisualGraph("Line", "", [], [], [], this.GID, this.title);
        var elapsed_time = this.timespan.end - this.timespan.start;
        var total_days = Math.ceil((elapsed_time) / (60*60*24));

        var lines = this.lines;
        var label = "";
        switch (this.timespan.valueType) {
            case 'HourValue':
                graph.labelType = "hour ";
                var total_hours = (elapsed_time) / (60*60);
                var show_labels = (total_hours < max_label_amount);
                for (var i = 0; i < total_hours; i++) {
                    if (show_labels) { 
                        graph.labels.push("hour " + i);
                        continue;
                    }
                    graph.labels.push("");                    
                }
                break;
            case 'DayValue':
                graph.labelType = "day ";
                var show_labels = (total_days < max_label_amount);
                for (var i = 0; i < total_days; i++) {
                    if (show_labels) {
                        graph.labels.push("day " + i);
                        continue;
                    }
                    graph.labels.push("");
                }
                break;
            case 'MonthValue':
                graph.labelType = "month ";
                var show_labels = (total_days / 30 < max_label_amount);
                for (var i = 0; i < total_days; i += 30) {
                    if (show_labels) {                      
                        graph.labels.push("month " + i / 30);
                        continue;
                    }
                    graph.labels.push("");
                }
                break;
            case 'YearValue':
                graph.labelType = "year ";
                for (var i = 0; i < total_days; i += 365) {
                    var show_labels = (total_days / 365 < max_label_amount);                    
                    if (show_labels) {                     
                       graph.labels.push("year " + i / 365);
                       continue;
                    }
                    graph.labels.push("");
                }
                break;
        }

        for (var lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            var sensor_data = [];
            for (var valueIndex = 0; valueIndex < lines[lineIndex].values.length; valueIndex++) {
                sensor_data.push(lines[lineIndex].values[valueIndex][0]);
                if (this.timespan.valueType === "Value") 
                    graph.labels.push("");
            }
            // TODO
            graph.series.push("");
            graph.data.push(sensor_data);
        }
        return graph;
    }
}


function VisualGraph(type, labelType, labels, series, data, temp_GID, title) {
	this.type = type;
    this.labelType = labelType;
	this.labels = labels;
	this.series = series;
	this.data = data;
	this.temp_GID = temp_GID;
    this.title = title;
    this.full_labels = labels.length; 

    this.valueMode = function (isOn) {
        this.labels = [];
        var valueLength = full_labels;
        if (isOn)  
            valueLength = this.data[0].length;
        var show_labels = (valueLength < 50);
        for (var i = 0; i < valueLength; i++) {
            if (show_labels) {
                this.labels.push(labelType + i);
                continue;
            }
            this.labels.push("");
        } 
    }
}
