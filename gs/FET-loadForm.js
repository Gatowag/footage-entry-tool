// ░░░░░░░░░▓ LOADS SIDE-BAR FORM WHEN MENU ITEM IS SELECTED
function footageEntryTool() {
	const htmlForSidebar = HtmlService.createTemplateFromFile("FET-sidebarForm");
	const htmlOutput = htmlForSidebar.evaluate();
	htmlOutput.setTitle("Footage Entry Tool");
	const ui = SpreadsheetApp.getUi();
	ui.showSidebar(htmlOutput);
}

// ░░░░░░░░░▓ SIMPLIFIES ADDING ADDITIONAL HTML FILES
function include(filename){
	return HtmlService.createHtmlOutputFromFile(filename)
		.getContent();
}