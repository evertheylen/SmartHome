function logInUser(dialog){
	/*
		TODO the user has clicked the button to log in in the dialog screen
		The dialog screen hasn't been closed yet
		Log in the user properly using the elements inside the dialog screen
		@argument dialog: the dialog screen I was talking about
	*/
	console.log("Trying to log in user.");
}

function SignupUser(dialog){
	/*
		TODO the user has clicked the button to sign up in the dialog screen
		The dialog screen hasn't been closed yet
		Sign up AND log in the user properly using the elements inside the dialog screen
		@argument dialog: the dialog screen I was talking about
	*/
	console.log("Trying to sign up user.");
}

function connectLoginDialog() {
	/*
		Makes sure the dialog is opened when the btnLogin is clicked
		Makes sure the dialog is opened when the btnLogin is clicked
		Makes sure the dialog is closed when the btnDialogBack is clicked
	*/
	var dialog = document.getElementById('dlgLogin');
	var showDialogButton = document.getElementById('btnLogin');
	if (! dialog.showModal){
		dialogPolyfill.registerDialog(dialog);
	}
	showDialogButton.addEventListener('click', function(){
		dialog.showModal();
	});
	document.getElementById('btnDialogBack').addEventListener('click', function(){
		dialog.close();
	});
	document.getElementById('btnDialogLogin').addEventListener('click', logInUser);
}
function connectSignupDialog() {
	/*
		Makes sure the dialog is opened when the btnLogin is clicked
		Makes sure the dialog is opened when the btnLogin is clicked
		Makes sure the dialog is closed when the btnDialogBack is clicked
	*/
	var dialog = document.getElementById('dlgSignup');
	var showDialogButton = document.getElementById('btnSignup');
	if (! dialog.showModal){
		dialogPolyfill.registerDialog(dialog);
	}
	showDialogButton.addEventListener('click', function(){
		dialog.showModal();
	});
	document.getElementById('btnSignupBack').addEventListener('click', function(){
		dialog.close();
	});
	document.getElementById('btnDialogSignup').addEventListener('click', SignupUser);
}

connectLoginDialog();
connectSignupDialog();
