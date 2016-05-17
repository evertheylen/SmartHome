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
        var graph = {temp_GID: this.GID, live: false, data_type: cache["Graph"][GID], data: [], options: {bezierCurve: false, animation: false, scaleType: "date", scaleDateFormat: "dd mmm yy", scaleTimeFormat: "h:MM", useUtc: true, scaleShowLabels: true,legendTemplate : '<table>'
                            +'<% for (var i=0; i<datasets.length; i++) { %>'
                            +'<tr><td><div style=\"color:<%=datasets[i].strokeColor%>\"></div></td>'
                            +'<% if (datasets[i].label) { %><td><%= datasets[i].label %></td><% } %></tr><tr height="5"></tr>'
                            +'<% } %>'
                            +'</table>',
            multiTooltipTemplate: "<%= datasetLabel %> - <%= value %>"}};
        var lines = this.lines;
        for (var lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            var values = lines[lineIndex].values;
            if (values.length === 0) { 
                graph.data.push({data: []});
                continue;
            }
            graph.data.push({data: [{x: values[0][1], y: values[0][0]}]});
            for (var valueIndex = 1; valueIndex < values.length; valueIndex++)
                addPoint(graph, lineIndex, values[valueIndex][1], values[valueIndex][0]);
            graph.data[lineIndex].label = lines[lineIndex].label;
            var random_color = 'rgb(' + Math.floor(Math.random() * 255) + ', ' + Math.floor(Math.random() * 255) + ', ' + Math.floor(Math.random() * 255) + ')';
            graph.data[lineIndex].strokeColor = random_color;
            //graph.data[lineIndex].fillColor = random_color;
        }
        this._graph = graph;
        return this._graph;
    }
}


