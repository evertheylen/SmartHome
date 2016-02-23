/*
	Stijn i'm sure you'll do this better than me, i did this just for testing
*/

var dialog = document.getElementById('dlgSensor');
var showDialogButton = document.getElementById('btnAddSensor');
if (! dialog.showModal) {
dialogPolyfill.registerDialog(dialog);
}
showDialogButton.addEventListener('click', function() {
dialog.showModal();
});

