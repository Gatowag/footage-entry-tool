// ░░░░░░░░░▓ CREATES "AUTOMATION" MENU ITEMS
function onOpen(){
  SpreadsheetApp.getUi()
	  .createMenu("Automation")
    .addItem("Footage Entry Tool", "footageEntryTool")
    .addItem("Close Out Episode", "closeOutButton")
    .addSeparator()
    .addSubMenu(SpreadsheetApp.getUi().createMenu('ScamStuff')
      .addItem("Populate Latest (not functional)", "populateScamStuffLatest")
      .addItem("Expand Link", "expandScamStuffLink"))
	  .addToUi();
}