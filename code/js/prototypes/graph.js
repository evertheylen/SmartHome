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
    this._graph = undefined;

    this.get_graph = function () {
        if (this._graph) 
            return this._graph;
        this._graph = {};
        this._graph.data = [];
        this._graph.options = {bezierCurve: false};
        var lines = this.lines;
        for (var lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            var values = lines[lineIndex].values;
            this._graph.data[lineIndex].data.push({x: values[0][0], y: values[0][1]});
            for (var valueIndex = 1; valueIndex < values.length; valueIndex++)
                addPoint(this._graph, lineIndex, values[valueIndex][0], values[valueIndex][1]);
            this._graph.data[lineIndex].label = lines[lineIndex].label;
        }
        return this._graph;
    }
}


