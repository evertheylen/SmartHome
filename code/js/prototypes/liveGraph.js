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
        if (this._graph) 
            return this._graph;
        var graph = {temp_GID: this.LGID, live: true, data_type: cache["LiveGraph"][this.LGID], data: [], line_map: {}, options: {bezierCurve: false, scaleType: "date", useUtc: false, scaleShowLabels: true}};
        var lines = this.lines;
        for (var lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            graph.line_map[lines[lineIndex].LLID] = lineIndex;
            graph.data[lineIndex].label = lines[lineIndex].label;
            graph.data[lineIndex].strokeColor = 'rgb(' + Math.floor(Math.random() * 255) + ', ' + Math.floor(Math.random() * 255) + ', ' + Math.floor(Math.random() * 255) + ')';
            graph.data[lineIndex].data = [];
        }
        this._graph = graph;
        return this._graph;
    }
}

