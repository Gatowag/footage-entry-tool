// ░░░░░░░░░▓ LOADS SIDE-BAR FORM WHEN MENU ITEM IS SELECTED
function loadForm() {
	const htmlForSidebar = HtmlService.createTemplateFromFile("FET-sidebarForm");
	const htmlOutput = htmlForSidebar.evaluate();
	htmlOutput.setTitle("Footage Entry Tool (a0.98)");
	const ui = SpreadsheetApp.getUi();
	ui.showSidebar(htmlOutput);
}

// ░░░░░░░░░▓ CREATES "AUTOMATION" > "FOOTAGE ENTRY TOOL" MENU ITEMS
function onOpen(){
	const ui = SpreadsheetApp.getUi();
	const menu = ui.createMenu("Automation");

	menu.addItem("Footage Entry Tool", "loadForm");
	menu.addToUi();
}

// ░░░░░░░░░▓ SIMPLIFIES ADDING ADDITIONAL HTML FILES
function include(filename){
	return HtmlService.createHtmlOutputFromFile(filename)
		.getContent();
};
