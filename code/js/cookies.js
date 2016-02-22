function setCookie(key, value, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = key + "=" + value + "; " + expires;
} 

function getCookie(key) {
    var name = key + "=";
    var cookies = document.cookie.split(';');
    for(var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        while (cookie.charAt(0)==' ') cookie = cookie.substring(1);
        if (cookie.indexOf(name) == 0) return cookie.substring(name.length, cookie.length);
    }
    return "";
} 


/*
function checkCookie() {
    var user=getCookie("username1");
    if (user != "") {
        alert("Welcome again " + user + " with age " + age);
    } else {
       user = prompt("Please enter your name:","");
       if (user != "" && user != null) {
           setCookie("username1", user, 30);
       }
       age = prompt("Please enter your age:","");
       if (user != "" && user != null) {
           setCookie("age", age, 30);
       }
    }
}
*/