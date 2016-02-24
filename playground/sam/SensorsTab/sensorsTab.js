/*
	Stijn i'm sure you'll do this better than me, i did this just for testing
	TODO connect the correct buttons to the correct dialog (same as in the login screen)
*/

var dialog = document.getElementById('dlgSensor');
var showDialogButton = document.getElementById('btnAddSensor');
if (! dialog.showModal) {
dialogPolyfill.registerDialog(dialog);
}
showDialogButton.addEventListener('click', function() {
dialog.showModal();
});



var dialog = document.getElementById('dlgLocation');
var showDialogButton = document.getElementById('btnAddLoc');
if (! dialog.showModal) {
dialogPolyfill.registerDialog(dialog);
}
showDialogButton.addEventListener('click', function() {
dialog.showModal();
});

