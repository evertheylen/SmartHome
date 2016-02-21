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
}

connectLoginDialog();
connectSignupDialog();
