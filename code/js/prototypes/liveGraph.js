var max_label_amount = 50;

LiveGraph.prototype = new DataType();
LiveGraph.prototype.constructor = LiveGraph;
LiveGraph.prototype._key = ["LGID"];

function LiveGraph(LGID, timespan, group_by, where, lines, title) {
	this.LGID = LGID;
	this.timespan = timespan;
	this.group_by = group_by;
	this.where = where;
	this.lines = lines;
    this.title = title;   
    this._graph = undefined;

    this.get_graph = function () {
        console.log("In get_graph");
        if (this._graph) 
            return this._graph;
        var graph = {temp_GID: this.LGID, live: true, data_type: cache["LiveGraph"][this.LGID], data: [], options: {bezierCurve: false, scaleType: "date", useUtc: false, scaleShowLabels: true, line_map: {}}};
        var lines = this.lines;
        console.log("Iterating lineIndex");
        for (var lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            console.log("Setting line_map");
            graph.line_map[lines[lineIndex].LLID] = lineIndex;
            console.log("Setting graph data");
            graph.data[lineIndex] = {label: "", strokeColor: ""};
            graph.data[lineIndex].label = lines[lineIndex].label;
            graph.data[lineIndex].strokeColor = 'rgb(' + Math.floor(Math.random() * 255) + ', ' + Math.floor(Math.random() * 255) + ', ' + Math.floor(Math.random() * 255) + ')';
        }
        this._graph = graph;
        console.log("Ending get_graph");
        return this._graph;
    }
}

