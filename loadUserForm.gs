function loadForm() {
	const htmlForSidebar = HtmlService.createTemplateFromFile("entryForm");
	const htmlOutput = htmlForSidebar.evaluate();
	htmlOutput.setTitle("Footage Entry Tool");
	const ui = SpreadsheetApp.getUi();
	ui.showSidebar(htmlOutput);
}

function createMenu(){
	const ui = SpreadsheetApp.getUi();
	const menu = ui.createMenu("Automation");

	menu.addItem("Footage Entry Tool", "loadForm");
	menu.addToUi();
}

function onOpen(){
	createMenu();
}