// ░░░░░░░░░▓ FUNCTIONS TO RUN WHEN THE SPREADSHEET OPENS
function onOpen() {
	menu();
	tab2Breaks();
}

function menu() {
	SpreadsheetApp.getUi()
		.createMenu("Automation")
			.addSubMenu(SpreadsheetApp.getUi().createMenu('Modern Rogue')
  				.addItem("Footage Entry Tool", "footageEntryTool")
				.addItem("Full Close-Out", "closeOutButton")
  				.addItem("Populate Latest MR Video", "populateLatestMR"))
			.addSubMenu(SpreadsheetApp.getUi().createMenu('Scam Stuff')
				.addItem("Populate Latest SS", "populateScamStuffLatest")
				.addItem("Expand Link", "expandScamStuffLink"))
		.addToUi();
}

function tab2Breaks() {
	// get the date values in the top 35 cells in tab 2
	let topCells = tab2.getRange("C2:C35").getValues();
	// initializes this variable as a date if the cell isn't empty,
	// and by existing outside the for loop, it can carry data over between loops
	let xCellMonth = topCells[0] != "" ? new Date(topCells[0]) : "";

	// loop through each value
	for (i = 2; i < 35; i++) {
		// the topCell array index associated with i as the row number
		let index = i - 2;
		// if the cell doesn't include anything
		if (topCells[index] == "" && topCells[index + 1] == "") {
			// start the loop over
			continue;
		// but if the cell does include something
		} else if (topCells[index] == "" && topCells[index + 1] != "") {
			xCellMonth = new Date(topCells[index + 1]);
			// but if the cell does include something
		} else {
			// get the value of the cell beneath it
			let yCellMonth = new Date(topCells[index + 1]);
			// if the current cell has the same month as the next cell
			if (xCellMonth.getMonth() == yCellMonth.getMonth()) {
				// then change the bottom border of this row to nothing
				tab2.getRange(i + ":" + i).setBorder(
					// null: no change, true: border, false: no border
					null,		// top
					null,		// left
					false,		// bottom
					null,		// right
					null,		// vertical
					null);		// horizontal
			// but if the current cell has a different month than the next cell
			} else {
				// diagnostic output
				console.log("C" + i + ": " + xCellMonth.getMonth() + " | C" + (i+1) + ": " + yCellMonth.getMonth());
				console.log("row of a new month: " + i);
				// then change the bottom border of this row to dark grey
				tab2.getRange(i + ":" + i).setBorder(
					// null: no change, true: border, false: no border
					null,		// top
					null,		// left
					true,		// bottom
					null,		// right
					null,		// vertical
					null,		// horizontal
					"#434343",	// color (dark grey)
					SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
			}
			// optimizes by passing one calculation to the next loop
			xCellMonth = yCellMonth;
		}
	}
}