var max_label_amount = 50;

Graph.prototype = new DataType();
Graph.prototype.constructor = Graph;
Graph.prototype._key = ["GID"];

function Graph(LGID, timespan, group_by, where, lines, title) {
	this.GID = GID;
	this.timespan = timespan;
	this.group_by = group_by;
	this.where = where;
	this.lines = lines;
    this.title = title;   
    this._chart = undefined;

    this.get_chart = function (ctx) {
        if (this._chart) 
            return this._chart;
        var lines = this.lines;
        var data = {};
        for (var lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            var values = lines[lineIndex].values;
            var value_data = [];
            for (var valueIndex = 0; valueIndex < values.length; valueIndex++)
                value_data.push({x: values[valueIndex][0], y: values[valueIndex][1]};
            data.push({
                strokeColor: '#007ACC',
                pointColor: '#007ACC',
                pointStrokeColor: '#fff',
                label: lines[lineIndex].label,  
                data: value_data   
            });
        }
        this._chart = new Chart(ctx).Scatter(data);
        this._chart.live = false;
        return this._chart;
    }
}
