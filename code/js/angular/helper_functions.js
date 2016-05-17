var database = [];
var ws = connect_to_websocket();	// Websocket // TODO

function hasClass(el, className) {
  if (el.classList)
    return el.classList.contains(className)
  else
    return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'))
}

function addClass(el, className) {
  if (el.classList)
    el.classList.add(className)
  else if (!hasClass(el, className)) el.className += " " + className
}

function removeClass(el, className) {
  if (el.classList)
    el.classList.remove(className)
  else if (hasClass(el, className)) {
    var reg = new RegExp('(\\s|^)' + className + '(\\s|$)')
    el.className=el.className.replace(reg, ' ')
  }
}

function getCurrentDate() {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!

    var yyyy = today.getFullYear();
    if(dd<10){
        dd='0'+dd
    } 
    if(mm<10){
        mm='0'+mm
    } 
    var today = dd+'/'+mm+'/'+yyyy;
    return today;
}

function date_format(date) {
    today = new Date(date);
    var dd = today.getDate();
    var mm = today.getMonth()+1;

    var yyyy = today.getFullYear();
    if(dd<10){
        dd='0'+dd
    } 
    if(mm<10){
        mm='0'+mm
    } 
    var today = dd+'/'+mm+'/'+yyyy;
    return today;
}
    
function getIndexOfObjWithAttribute(array, attr, value) {
    for(var i = 0; i < array.length; i++) {
        if(array[i][attr] === value) {
            return i;
        }
    }
    return -1;
}

function addPoint(graph, dataset, x, y) {
    if (graph.data[dataset].data.length === 0) {
        graph.data[dataset].data.push({x: x, y: y});
        return;
    }
    var last_point = graph.data[dataset].data[graph.data[dataset].data.length-1];
    graph.data[dataset].data.push({x: x, y: last_point.y});
    graph.data[dataset].data.push({x: x,y: y});
}

function deletePoint(graph, dataset, x, y) {
    if (graph.data[dataset].data.length === 0) {
        return;
    }
    var copy = graph.data[dataset].data;
    for (i=graph.data[dataset].data.length-1; i>-1; i--) {
      if (graph.data[dataset].data[i].x === x) {
          copy.splice(i,1);
      }
    }
}
