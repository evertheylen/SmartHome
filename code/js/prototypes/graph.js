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

{"type": "create_graph", "data": {"GID": "temp563320", "where": [{"value": [1, 2, 3, 4, 5, 6, 9], "op": "in", "field": "SID"}], "timespan": {"valueType": "HourValue", "end": 1463349540, "start": 1463263200}, "group_by": [], 

"lines": [{"sensors": [1], "grouped_by": [{"what": "Sensor", "SID": 1}], "label": "Sensor: Elec 1", "values": []}, {"sensors": [2], "grouped_by": [{"what": "Sensor", "SID": 2}], "label": "Sensor: Water 1", "values": []}, {"sensors": [3], "grouped_by": [{"what": "Sensor", "SID": 3}], "label": "Sensor: Gas 1", "values": []}, {"sensors": [4], "grouped_by": [{"what": "Sensor", "SID": 4}], "label": "Sensor: Elec 2", "values": [[0.0, 1463263200], [0.15, 1463266800], [0.0, 1463270400], [0.0, 1463274000], [0.0, 1463277600], [0.0, 1463281200], [0.0, 1463284800], [0.0, 1463288400], [0.0, 1463292000], [0.0, 1463295600], [0.0, 1463299200], [0.0, 1463302800], [0.0, 1463306400], [0.0, 1463310000], [0.0, 1463313600], [0.0, 1463317200], [0.0, 1463320800], [5.76, 1463324400], [0.0925, 1463328000], [0.0, 1463331600], [0.0, 1463335200], [0.96, 1463338800], [0.0, 1463342400], [1.1975, 1463346000]]}, {"sensors": [5], "grouped_by": [{"what": "Sensor", "SID": 5}], "label": "Sensor: Water 2", "values": [[0.0, 1463263200], [0.0, 1463266800], [0.0, 1463270400], [0.0, 1463274000], [0.0, 1463277600], [0.0, 1463281200], [0.0, 1463284800], [0.0, 1463288400], [0.0, 1463292000], [0.0, 1463295600], [0.0, 1463299200], [0.0, 1463302800], [0.0, 1463306400], [0.0, 1463310000], [0.0, 1463313600], [0.0, 1463317200], [0.0, 1463320800], [0.0, 1463324400], [0.0, 1463328000], [0.0, 1463331600], [0.0, 1463335200], [0.0, 1463338800], [0.0, 1463342400], [0.0, 1463346000]]}, {"sensors": [6], "grouped_by": [{"what": "Sensor", "SID": 6}], "label": "Sensor: Gas 2", "values": [[0.0, 1463263200], [0.45, 1463266800], [0.0, 1463270400], [0.0, 1463274000], [0.0, 1463277600], [0.0, 1463281200], [0.0, 1463284800], [0.0, 1463288400], [0.0, 1463292000], [0.0, 1463295600], [0.0, 1463299200], [0.0, 1463302800], [0.0, 1463306400], [0.0, 1463310000], [0.0, 1463313600], [0.0, 1463317200], [0.0, 1463320800], [0.0, 1463324400], [0.0, 1463328000], [0.0, 1463331600], [0.0, 1463335200], [0.0, 1463338800], [0.0, 1463342400], [1.96, 1463346000]]}, {"sensors": [9], "grouped_by": [{"what": "Sensor", "SID": 9}], "label": "Sensor: Douche", "values": [[0.0, 1463263200], [0.05, 1463266800], [0.0, 1463270400], [0.0, 1463274000], [0.0, 1463277600], [0.0, 1463281200], [0.0, 1463284800], [0.0, 1463288400], [0.0, 1463292000], [0.0, 1463295600], [0.0, 1463299200], [0.0, 1463302800], [0.0, 1463306400], [0.0, 1463310000], [0.0, 1463313600], [0.0, 1463317200], [0.0, 1463320800], [0.0, 1463324400], [0.0, 1463328000], [0.0, 1463331600], [0.0, 1463335200], [0.0, 1463338800], [0.0, 1463342400], [0.0, 1463346000]]
}], 


    this.get_graph = function () {
        if (this._graph) 
            return this._graph;
        var graph = {temp_GID: this.GID, data: [], options: {bezierCurve: false, scaleType: "date", useUtc: false, scaleShowLabels: true}};
        var lines = this.lines;
        for (var lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            var values = lines[lineIndex].values;
            if (values.length === 0) { 
                graph.data.push({data: []});
                continue;
            }
            graph.data.push({data: [{x: values[0][1] * 1000, y: values[0][0]}]});
            for (var valueIndex = 1; valueIndex < values.length; valueIndex++)
                addPoint(graph, lineIndex, values[valueIndex][1] * 1000, values[valueIndex][0]);
            graph.data[lineIndex].label = lines[lineIndex].label;
            graph.data[lineIndex].strokeColor = 'rgb(' + Math.floor(Math.random() * 255) + ', ' + Math.floor(Math.random() * 255) + ', ' + Math.floor(Math.random() * 255) + ')';
        }
        this._graph = graph;
        return this._graph;
    }
}


