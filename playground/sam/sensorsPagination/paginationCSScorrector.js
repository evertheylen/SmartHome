function test4(){
    var el = document.getElementById("sensorPG");
    console.log(el.getElementsByTagName("UL")[0].childElementCount);

    if (el.getElementsByTagName("UL")[0].childElementCount == 5){
        var el2 = document.getElementById("sensorPGContainer");
        el2.className = "pagination--length1Container";
        el.className = "pagination--length1";
        console.log("yay");
    }

    if (el.getElementsByTagName("UL")[0].childElementCount == 6){
        var el2 = document.getElementById("sensorPGContainer");
        el2.className = "pagination--length2Container";
        el.className = "pagination--length2";
        console.log("yay");
    }

    if (el.getElementsByTagName("UL")[0].childElementCount == 7){
        var el2 = document.getElementById("sensorPGContainer");
        el2.className = "pagination--length3Container";
        el.className = "pagination--length3";
        console.log("yay");
    }

    if (el.getElementsByTagName("UL")[0].childElementCount == 8){
        var el2 = document.getElementById("sensorPGContainer");
        el2.className = "pagination--length4Container";
        el.className = "pagination--length4";
        console.log("yay");
    }

    if (el.getElementsByTagName("UL")[0].childElementCount > 8){
        var el2 = document.getElementById("sensorPGContainer");
        el2.className = "pagination--fullContainer";
        el.className = "pagination--full";
        console.log("yay");
    }
}
