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
        var graph = {data: [], options: {bezierCurve: false}};
        var lines = this.lines;
        for (var lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            console.log("LineIndex: " + lineIndex);
            var values = lines[lineIndex].values;
            if (values.length === 0) { 
                graph.data.push({data: []});
                break;
            }
            graph.data.push({data: [{x: values[0][0], y: values[0][1]}]});
            for (var valueIndex = 1; valueIndex < values.length; valueIndex++)
                addPoint(graph, lineIndex, values[valueIndex][0], values[valueIndex][1]);
            graph.data[lineIndex].label = lines[lineIndex].label;
        }
        this._graph = graph;
        return this._graph;
    }
}


