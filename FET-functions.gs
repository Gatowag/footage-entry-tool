// ░░░░░░░░░▓ COMMON VARIABLES SCOPED GLOBALLY
const ss = SpreadsheetApp.getActiveSpreadsheet();
const tab1 = ss.getSheetByName("Production Order");
const tab2 = ss.getSheetByName("Release Order");
const newRow = tab1.getLastRow();
const rowOffset = newRow - 250;
var prodOffset = -1;
var dataArray = {
				unfinished: [],
				locationsWide: [],
				locationsNarrow: [],
				allLabels: [],
				allLabelsString: [],
				sponsors: []
				};


// ░░░░░░░░░▓ WRITES DATA TO SPREADSHEET
function addNewRow(rowData) {

	const rowPt1 = [
					rowData.dateRecorded,
					determineProdNum(rowData.type,rowData.cont,rowData.toggledLabel),
					];
	const rowPt2 = rowData.videoCardsData;
	const rowPt3 = [
					rowData.audioCard,
					rowData.duration,
					rowData.toggledLabel,
					determinePt(rowData.type,rowData.cont,rowData.toggledLabel),
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
	closeIncompletes(
		rowData.type,
		rowData.toggledLabel);
	setBackgroundColor(
		rowData.type);
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
function getSpreadsheetData(){
	const labelRange = tab1.getRange(rowOffset,12,newRow - (rowOffset-1),1);
	const locationWideRange = tab1.getRange(rowOffset,19,newRow - (rowOffset-1),1);
	const locationNarrowRange = tab1.getRange(rowOffset,20,newRow - (rowOffset-1),1);

		for ( i = 0; i < ((newRow + 1) - rowOffset); i++){
			if (labelRange.getBackgrounds()[i] == "#ffff00") {
				dataArray.unfinished.push(labelRange.getValues()[i])
			};

			if (locationWideRange.getValues()[i] != "") {
				dataArray.locationsWide.push(locationWideRange.getValues()[i]);
				dataArray.locationsNarrow.push(locationNarrowRange.getValues()[i]);
			};
				
			if (labelRange.getValues()[i] != "") {
				dataArray.allLabels.push(labelRange.getValues()[i])
			};
		};
		
	dataArray.sponsors = labelRange.getValues().filter(value => /^ad: /i.test(value));

	return dataArray;
}

// ░░░░░░░░░▓ DETERMINES PROD NUMBER
function determineProdNum(type, cont, label){
	const prodNumRange = tab1.getRange(rowOffset,2,newRow - (rowOffset - 1),1);
	const labelRange = tab1.getRange(rowOffset,12,newRow - (rowOffset-1),1);
	var prodArray = [];
	var prodNumIndex = [];
	var mostRecentNum;

	for ( i = 0; i < ((newRow + 1)  - rowOffset); i++){
		if (prodNumRange.getValues()[i] != "" && prodNumRange.getValues()[i] != "-")
		{ prodArray.push(Number(prodNumRange.getValues()[i])); };

		if (labelRange.getValues()[i] != "")
		{ dataArray.allLabelsString.push(String(labelRange.getValues()[i])) };

		prodNumIndex.push(Number(prodNumRange.getValues()[i]));
	};

	if (type == 1) {
		mostRecentNum = Math.max(...prodArray) + 1;
		prodOffset++;
		return mostRecentNum + prodOffset;
	} else if (type == 2) {
		if (cont === "NEW"){
			mostRecentNum = Math.max(...prodArray) + 1;
			prodOffset++;
			return mostRecentNum + prodOffset;
		} else if (cont === "CONT") {
			return prodNumIndex[dataArray.allLabelsString.indexOf(label)];
		}
	} else if (type == 3){
		return prodNumIndex[dataArray.allLabelsString.indexOf(label)];
	} else {
		return "-";
	}
}

// ░░░░░░░░░▓ DETERMINES PART NUMBER
function determinePt(type, cont, label){
	const labelRange = tab1.getRange(rowOffset,12,newRow - (rowOffset-1),1);
	const ptRange = tab1.getRange(rowOffset,13,newRow - (rowOffset - 1),1);
	var ptIndex = [];
	var labelList = [];

	for ( i = 0; i < ((newRow + 1)  - rowOffset); i++){
		if (labelRange.getValues()[i] != "")
			{ labelList.push(String(labelRange.getValues()[i])) };

		ptIndex.push(Number(ptRange.getValues()[i]));
	};

	if (type == 3) {
		return ptIndex[labelList.lastIndexOf(label)] + 1;
	} else if (type == 2) {
		if (cont === "CONT"){
			return ptIndex[labelList.lastIndexOf(label)] + 1;
		} else if (cont === "NEW") {
			return "1";
		}
	} else {
		return "";
	}
}

// ░░░░░░░░░▓ FORMATS THE COLOR OF THE NEW ROW BASED ON FOOTAGE TYPE
function setBackgroundColor(type) {

	// EPISODES
	if (type == "1"){
		tab1.setActiveSelection(newRow + ":" + newRow).setBackground("#76c1cc").setFontColor("black");
		
	// MULTI-PART: UNFINISHED
	} else if (type == "2"){
		tab1.setActiveSelection(newRow + ":" + newRow).setBackground("#ffff00").setFontColor("black");
		
	// MULTI-PART: COMPLETED
	} else if (type == "3"){
		tab1.setActiveSelection(newRow + ":" + newRow).setBackground("#458d97").setFontColor("black");
		
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
	tab1.getRange(newRow + ":" + newRow).setFontFamily("Arial").setVerticalAlignment("middle").setHorizontalAlignment("center");
	tab1.setRowHeightsForced(newRow, 1, 21);
	
	// formats recording date
	tab1.getRange("A" + newRow).setFontSize(8);
	
	// formats production number
	tab1.getRange("B" + newRow).setFontSize(9);
	
	// formats memory card cells
	tab1.getRange("C" + newRow + ":J" + newRow).setFontSize(8);
	
	// formats runtime cell
	tab1.getRange("K" + newRow).setNumberFormat("0:00:00").setFontSize(8);
	
	// formats label cell
	tab1.getRange("L" + newRow).setFontSize(10).setHorizontalAlignment("left");
	
	// formats part cell
	tab1.getRange("M" + newRow).setFontSize(8);
	
	// formats release number cells
	tab1.getRange("N" + newRow + ":O" + newRow).setFontSize(10);
	
	// formats air date cell and published link cell
	tab1.getRange("P" + newRow + ":Q" + newRow).setFontSize(8);
	tab1.getRange("Q" + newRow).setHorizontalAlignment("left");
	
	// formats sponsor cell and location cells
	tab1.getRange("R" + newRow + ":T" + newRow).setFontSize(10);
	tab1.getRange("S" + newRow + ":T" + newRow).setHorizontalAlignment("left");
	
	// formats crew cells
	tab1.getRange("U" + newRow + ":AD" + newRow).setFontSize(9).setHorizontalAlignment("left");
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

// ░░░░░░░░░▓ RECOLORS INCOMPLETE EPS IF CLOSED BY A MULIT-PART COMPLETE ENTRY
function closeIncompletes(type, label) {
	const labelRange = tab1.getRange(rowOffset,12,newRow - (rowOffset-1),1);
	let labelMatchedRow = [];
	let firstMatch;

	if (type == "3"){
		for ( i = 0; i < ((newRow + 1)  - rowOffset); i++){
			if (labelRange.getValues()[i] == label){
				labelMatchedRow.push(Number([i]) + rowOffset) };
		};

		firstMatch = labelMatchedRow.shift();
		tab1.getRange(firstMatch + ":" + firstMatch).setBackground("#76c1cc");
		labelMatchedRow.forEach(recolorIncompleteRowTab1);
	}
}

// ░░░░░░░░░▓ CLOSEINCOMPLETES -- THIS ACTUALLY SETS THE BACKGROUND COLOR
function recolorIncompleteRowTab1(item){
	tab1.getRange(item + ":" + item).setBackground("#e69138");
}

// ░░░░░░░░░▓ SUBMITS TITLE DATA TO TAB 2
function passToTab2(label, type, date){
	if (type === "1" || type === "3"){
		tab2.insertRowBefore(2);
		tab2.getRange("G2").setValue(label);
		tab2.getRange("I2").setValue(date);
	} else {
	}
}
