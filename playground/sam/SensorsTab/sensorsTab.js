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



var dialog2 = document.getElementById('dlgLocation');
var showDialogButton2 = document.getElementById('btnAddLoc');
if (! dialog2.showModal) {
dialogPolyfill.registerDialog(dialog2);
}
showDialogButton2.addEventListener('click', function() {
dialog2.showModal();
});

