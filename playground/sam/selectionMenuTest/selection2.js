var dropdownVisble = false;


function handleClick(clicked){
	var toChange = document.getElementById("clicker");
	toChange.innerHTML = clicked.firstElementChild.innerHTML;
	makeInvisible();
}

function makeVisible(){
	document.getElementById("visibilityID").className = "dropdownvisible_demo2";
	dropdownVisble = true;
}

function makeInvisible(){
	document.getElementById("visibilityID").className = "dropdownhidden_demo2";
	dropdownVisble = false;
}

function handleDropdown(){
	if (!dropdownVisble){
		makeVisible();
	}else{
		makeInvisible();
	}
}
