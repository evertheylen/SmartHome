var max_label_amount = 50;

LiveGraph.prototype = new DataType();
LiveGraph.prototype.constructor = LiveGraph;
LiveGraph.prototype._key = ["GID"];

function LiveGraph(LGID, timespan, group_by, where, lines, title) {
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
        var graph = {temp_GID: this.GID, data: [], options: {bezierCurve: false, scaleType: "date", useUtc: false, scaleShowLabels: true}};
        var lines = this.lines;
        for (var lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            graph.data[lineIndex].label = lines[lineIndex].label;
            graph.data[lineIndex].strokeColor = 'rgb(' + Math.floor(Math.random() * 255) + ', ' + Math.floor(Math.random() * 255) + ', ' + Math.floor(Math.random() * 255) + ')';
        }
        this._graph = graph;
        return this._graph;
    }

    this.get_chart = function (ctx) {
        if (this._chart) 
            return this._chart;
        var lines = this.lines;
        var data = {};
        var line_map = {};
        for (var lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            line_map[lines[lineIndex].LLID] = lineIndex;
            data.push({
                strokeColor: '#007ACC',
                pointColor: '#007ACC',
                pointStrokeColor: '#fff',
                label: lines[lineIndex].label,  
                data: []   
            });
        }
        this._chart = new Chart(ctx).Scatter(data);
        this._chart.line_map = line_map;
        this._chart.live = true;
        return this._chart;
    }
}

/*
    // Create temporary graph
    1. 
    REQUEST
	{
		"type": "create_live_graph",	
		"group_by": [ {
			"what": "Location"
			"IDs": [1,2,3,4,5,6]
		}, ...],
		"where": [{
			"field": "SID",
			"op": "in"
			"value": [1,2,3,4,5,6],
		}],
		"timespan": {
			"valueType": "Value",
			"start": -3600,
			"end": 0,
		}
	}
    
    RESPONSE
	{
		"type": "create_live_graph",
		"data": 	{
		    "LGID": "temp123",
		    "timespan": ...
		    "group_by": ...
		    "where": ...
		    "lines": [
			    {
				    "LLID": "temp132456",
				    "grouped_by": [{
					    "what": "Location",
					    "LID": 1
				    }, {
					    "what": "Type",
					    "ID": "Electricity"
				    }],
				    "sensors": [1,45,23,789],
			    }, {
			    }
		    ]
	    }
	}


    2. 
    REQUEST
	{
		"type": "get_liveline_values",
		"graph": "temp123"
	}

    
    RESPONSE
	{
		"type": "get_liveline_values",
		"graph": "temp123",
		"lines": [
			{
				"LLID": <ID (or temporary ID) of LiveLine>
				"values": [[value, time], [value, time], ...]
			}, {
				"LLID": <ID (or temporary ID) of LiveLine>
				"values": [[value, time], [value, time], ...]
			}, ...
		]
	}



*/

