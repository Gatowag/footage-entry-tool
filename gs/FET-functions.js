// ░░░░░░░░░▓ COMMON VARIABLES SCOPED GLOBALLY
const ss = SpreadsheetApp.getActiveSpreadsheet();
const tab1 = ss.getSheetByName("Footage List");
const tab2 = ss.getSheetByName("Published: MR");
const newRow = tab1.getLastRow() + 1;
var localProdNumOffset = -1;			// exists so that multiple episodes can be entered without pulling spreadsheet data every time
let determinedProdNum;
let determinedPart;
let allLabelMatches = [];
var dataArray = {
				unfinished: [],
				locationsWide: [],
				locationsNarrow: [],
				allLabels: [],
				allLabelsString: [],
				allSponsors: [],
				recSponsors: []
				};


// ░░░░░░░░░▓ WRITES DATA TO SPREADSHEET
function addNewRow(rowData) {

	generateIDs(rowData.type, rowData.cont, rowData.toggledLabel);

	const rowPt1 = [
					rowData.dateRecorded,
					determinedProdNum
					];
	const rowPt2 = rowData.videoCardsData;
	const rowPt3 = [
					rowData.audioCard,
					rowData.duration,
					rowData.toggledLabel,
					determinedPart,
					,
					,
					,
					,
					,
					rowData.property,
					rowData.room
					];
	const rowPt4 = rowData.crew;
	const rowCombined = rowPt1.concat(rowPt2,rowPt3,rowPt4);

	tab1.appendRow(
		rowCombined);
	setBackgroundColor(
		rowData.type,
		rowData.toggledLabel);
	setCellFormats();
	mergeCells(
		rowData.videoCardsLength,
		rowData.type);
	passToTab2(
		rowData.toggledLabel,
		rowData.type,
		rowData.dateRecorded);
	return true;
}


// ░░░░░░░░░▓ READS DATA FROM THE SPREADSHEET WHEN THE SIDEBAR LOADS,
// ░░░░░░░░░▓ ALL RELEVANT DATA GETS PASSED TO THEIR RESPECTIVE ARRAYS IN OBJECT "dataArray"
function getSheetDataFET() {
	const offset = 250;
	const rowStart = newRow - offset;
	const labelRange = tab1.getRange(rowStart,12,newRow - (rowStart-1),1);
	const locationWideRange = tab1.getRange(rowStart,19,newRow - (rowStart-1),1);
	const locationNarrowRange = tab1.getRange(rowStart,20,newRow - (rowStart-1),1);

		for ( i = 0; i < ((newRow + 1) - rowStart); i++){
			if (labelRange.getBackgrounds()[i] == "#ffff00") {
				dataArray.unfinished.push(labelRange.getValues()[i])
			} else if (locationWideRange.getValues()[i] != "") {
				dataArray.locationsWide.push(locationWideRange.getValues()[i]);
				dataArray.locationsNarrow.push(locationNarrowRange.getValues()[i]) };
		};
		
	dataArray.allSponsors = labelRange.getValues().filter(value => /^ad: /i.test(value));

	return dataArray;
}

// ░░░░░░░░░▓ HUB FUNCTION RUNNING FOR LOOPS TO DETERMINE IDENTIFIABLE DATA
function generateIDs(type, cont, label) {
	const offset = 100;
	const rowStart = newRow - 20;
	const prodNumRange = tab1.getRange(	rowStart, 2, newRow - (rowStart - 1),	1);
	const labelRange = tab1.getRange(	rowStart,  12, newRow - (rowStart   - 1),	1);
	const ptRange = tab1.getRange(		rowStart,  13, newRow - (rowStart   - 1),	1);
	let prodNumFilter = [];														// all recent prod numbers, filtered to only numbers
	let prodNumIndex = [];														// all recent prod numbers including NaN (- or null)
	let partIndex = [];
	let labelList = [];
	
	for ( i = 0; i < ((newRow + 1) - rowStart); i++ ){
		
		if (labelRange.getValues()[i] != "") {
			dataArray.allLabels.push(labelRange.getValues()[i]);
			dataArray.allLabelsString.push(String(labelRange.getValues()[i]));
		};
	
		// send 20 latest prod number cells to prodNumFilter - if not empty or dashed
		if (prodNumRange.getValues()[i] != "" && prodNumRange.getValues()[i] != "-")
			{ prodNumFilter.push(Number(prodNumRange.getValues()[i])); };
	
		// send 20 latest production numbers (unfiltered) to prodNumIndex
		prodNumIndex.push(Number(prodNumRange.getValues()[i]));
		
		// 
		if (labelRange.getValues()[i] != "")
			{ labelList.push(String(labelRange.getValues()[i])) };

		// send 20 latest part numbers to array partIndex
		partIndex.push(Number(ptRange.getValues()[i]));
		
		if (labelRange.getValues()[i] == label){
			allLabelMatches.push(Number([i]) + rowStart) };
	};
	
	let mostRecentNum = Math.max(...prodNumFilter) + 1;			// finds the largest listed prod num and increments it by 1
	const lastInstance = dataArray.allLabelsString.lastIndexOf(label);

	if (type == 1) {															// EPISODES
		localProdNumOffset++;		// increases local offset by 1
		determinedProdNum		= mostRecentNum + localProdNumOffset;
		determinedPart			= "";
	} else if (type == 2) {														// MULTI-PART UNFINISHED
		if (cont === "NEW"){
			localProdNumOffset++;	// increases local offset by 1
			determinedProdNum	= mostRecentNum + localProdNumOffset;
			determinedPart		= 1;
		} else if (cont === "CONT") {											// MULTI-PART CONTINUATION
			determinedProdNum	= prodNumIndex[lastInstance];
			determinedPart		= partIndex[lastInstance] + 1
		}
	} else if (type == 3){														// MULTI-PART COMPLETE
		determinedProdNum		= prodNumIndex[lastInstance];
		determinedPart			= partIndex[lastInstance] + 1;
	} else {																	// SPONSORS, PATREON, OTHER
		determinedProdNum		= "-";
		determinedPart			= "";
	};
}

// ░░░░░░░░░▓ FORMATS THE COLOR OF THE NEW ROW AND ANY ASSOCIATED ROWS BASED ON FOOTAGE TYPE
function setBackgroundColor(type, label) {
	let firstMatch = allLabelMatches.shift();
	
	// EPISODES
	if (type == "1"){
		tab1.setActiveSelection(newRow + ":" + newRow).setBackground("#76c1cc").setFontColor("black");
		
	// MULTI-PART: UNFINISHED
	} else if (type == "2"){
		tab1.setActiveSelection(newRow + ":" + newRow).setBackground("#ffff00").setFontColor("black");
		
	// MULTI-PART: COMPLETED
	} else if (type == "3"){
		tab1.setActiveSelection(newRow + ":" + newRow).setBackground("#458d97").setFontColor("black");
		console.log("firstMatch: "+firstMatch);
		console.log("allLabelMatches: "+allLabelMatches);
		tab1.getRange(firstMatch + ":" + firstMatch).setBackground("#76c1cc");
		allLabelMatches.forEach(recolorIncompleteRowTab1);
		
	// SPONSOR
	} else if (type == "4"){
		tab1.setActiveSelection(newRow + ":" + newRow).setBackground("#90eba6").setFontColor("black");
		
	// PATREON BONUS
	} else if (type == "5"){
		tab1.setActiveSelection(newRow + ":" + newRow).setBackground("#3c4043").setFontColor("white");
		
	// OTHER
	} else {
		tab1.setActiveSelection(newRow + ":" + newRow).setBackground("#f9cb9c").setFontColor("black");
	}
}

// ░░░░░░░░░▓ FORMATS APRX. TIME CELL TO SHOW H:MM:SS FROM UNFORMATTED NUMBER INPUT
function setCellFormats() {
	// general formats for the entire row
	tab1.getRange(newRow + ":" + newRow)
		.setFontFamily("Arial")
		.setFontSize(8)
		.setVerticalAlignment("middle")
		.setHorizontalAlignment("center");
	tab1.setRowHeightsForced(newRow, 1, 21);
	
	// formats production number
	tab1.getRange("B" + newRow)
		.setFontSize(10);
	
	// formats runtime cell
	tab1.getRange("K" + newRow)
		.setNumberFormat("0:00:00");
	
	// formats label cell
	tab1.getRange("L" + newRow)
		.setFontSize(10)
		.setHorizontalAlignment("left");
	
	// formats release number cells
	tab1.getRange("N" + newRow + ":O" + newRow)
		.setFontSize(10);
	
	// formats published link cell
	tab1.getRange("Q" + newRow)
		.setHorizontalAlignment("right");
	
	// formats sponsor cell and location cells
	tab1.getRange("R" + newRow + ":T" + newRow)
		.setFontSize(10);
	tab1.getRange("S" + newRow + ":T" + newRow)
		.setHorizontalAlignment("left");
	
	// formats crew cells
	tab1.getRange("U" + newRow + ":AD" + newRow)
		.setFontSize(9)
		.setHorizontalAlignment("left");
}

// ░░░░░░░░░▓ MERGES UNUSED CELLS
function mergeCells(length, type) {
	var mergeEnd;

	// THIS APPLIES TO THE VIDEO MEMORY CARD SECTION
	mergeEnd = "IHGFEDC"[length] || "C";

	tab1.getRange('C' + newRow + ':' + mergeEnd + newRow).merge();
  
	// THIS APPLIES TO THE "PT" COLUMN
	if (type == "2" || type == "3") {}
	else {tab1.getRange('L' + newRow + ':' + 'M' + newRow).merge();};
}

// ░░░░░░░░░▓ RECOLORS MULTI-PART INCOMPLETE ROWS WHEN COMPLETED
function recolorIncompleteRowTab1(item) {
	tab1.getRange(item + ":" + item).setBackground("#458d97");				// color: dark blue
}

// ░░░░░░░░░▓ SUBMITS TITLE DATA TO TAB 2
function passToTab2(label, type, date) {
	if (type === "1" || type === "3"){										// if NEW EP or COMPLETED MULTI-PART
		tab2.insertRowBefore(2);											// create new row at the top of tab 2
		tab2.getRange("G2")													// title cell
			.setValue(label)												// user-input label
			.setFontSize(10)
			.setHorizontalAlignment("left");
		tab2.getRange("I2")													// recording date cell
			.setValue(date)													// user-input date
			.setFontSize(8)
			.setVerticalAlignment("middle")
			.setHorizontalAlignment("center");
	} else {
	}
}
