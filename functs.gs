// ░░░░░░░░░▓ COMMON VARIABLES SCOPED GLOBALLY
const ss = SpreadsheetApp.getActiveSpreadsheet();
const tab1 = ss.getSheetByName("Production Order");
const tab2 = ss.getSheetByName("Release Order");
const rangeOffset = 810;
var prodOffset = -1;
var dataArray = {
				unfinished: [],
				locations: [],
				allLabels: [],
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
	setNumberFormat();
	mergeCells(
		rowData.videoCardsLength,
		rowData.type);
	passToTab2(
		rowData.toggledLabel,
		rowData.type,
		rowData.dateRecorded);
	return true;
}


// ░░░░░░░░░▓ READS FOOTAGE LABELS FROM SPREADSHEET,
// ░░░░░░░░░▓ FILTERS TO ONLY "UNFINISHED" ENTRIES AND RETURNS THOSE TITLES
// ░░░░░░░░░▓ IN AN ARRAY WHEN THE FUNCTION IS CALLED IN ENTRYFORM
function getSpreadsheetData(){
	const lastRow = tab1.getLastRow();
	const labelRange = tab1.getRange(rangeOffset,12,lastRow - (rangeOffset-1),1);
	const locationRange = tab1.getRange(810,19,lastRow - (810-1),2);

	for ( i = 0; i < ((lastRow + 1) - rangeOffset); i++){
		if (labelRange.getBackgrounds()[i] == "#ffff00")
			{ dataArray.unfinished.push(labelRange.getValues()[i]) };

		if (locationRange.getValues()[i] != "")
			{ dataArray.locations.push(locationRange.getValues()[i]); };
	}

	return dataArray;
}

// ░░░░░░░░░▓ DETERMINES PROD NUMBER
function determineProdNum(type, cont, label){
	const lastRow = tab1.getLastRow();
	const prodNumRange = tab1.getRange(rangeOffset,2,lastRow - (rangeOffset - 1),1);
	const labelRange = tab1.getRange(rangeOffset,12,lastRow - (rangeOffset-1),1);
	var prodArray = [];
	var prodNumIndex = [];
	var mostRecentNum;

	for ( i = 0; i < ((lastRow + 1)  - rangeOffset); i++){
		if (prodNumRange.getValues()[i] != "" && prodNumRange.getValues()[i] != "-")
		{ prodArray.push(Number(prodNumRange.getValues()[i])); };

		if (labelRange.getValues()[i] != "")
		{ dataArray.allLabels.push(String(labelRange.getValues()[i])) };

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
			return prodNumIndex[dataArray.allLabels.indexOf(label)];
		}
	} else if (type == 3){
		return prodNumIndex[dataArray.allLabels.indexOf(label)];
	} else {
		return "-";
	}
}

// ░░░░░░░░░▓ DETERMINES PART NUMBER
function determinePt(type, cont, label){
	const lastRow = tab1.getLastRow();
	const labelRange = tab1.getRange(rangeOffset,12,lastRow - (rangeOffset-1),1);
	const ptRange = tab1.getRange(rangeOffset,13,lastRow - (rangeOffset - 1),1);
	var ptIndex = [];
	var labelList = [];

	for ( i = 0; i < ((lastRow + 1)  - rangeOffset); i++){
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
	const newRow = tab1.getLastRow();

	if (type == "1"){
		tab1.setActiveSelection(newRow + ":" + newRow).setBackground("#f1c232").setFontColor("black");
	} else if (type == "2"){
		tab1.setActiveSelection(newRow + ":" + newRow).setBackground("#ffff00").setFontColor("black");
	} else if (type == "3"){
		tab1.setActiveSelection(newRow + ":" + newRow).setBackground("#e69138").setFontColor("black");
	} else if (type == "5"){
		tab1.setActiveSelection(newRow + ":" + newRow).setBackground("#3c4043").setFontColor("white");
	} else {
		tab1.setActiveSelection(newRow + ":" + newRow).setBackground("#f9cb9c").setFontColor("black");
	}
}

// ░░░░░░░░░▓ FORMATS APRX. TIME CELL TO SHOW H:MM:SS FROM UNFORMATTED NUMBER INPUT
function setNumberFormat() {
	const newRow = tab1.getLastRow();
	const cell = tab1.getRange("K" + newRow);

	cell.setNumberFormat("0:00:00");
}

// ░░░░░░░░░▓ MERGES UNUSED CELLS
function mergeCells(length, type) {
	const newRow = tab1.getLastRow();
	var mergeEnd;

	// THIS APPLIES TO THE VIDEO MEMORY CARD SECTION
	mergeEnd = "IHGFEDC"[length] || "C";

	tab1.getRange('C' + newRow + ':' + mergeEnd + newRow).merge();
  
	// THIS APPLIES TO THE "PT" COLUMN
	if(type == "2" || type == "3"){}
	else {tab1.getRange('L' + newRow + ':' + 'M' + newRow).merge();};
}

// ░░░░░░░░░▓ RECOLORS INCOMPLETE EPS IF CLOSED BY A MULIT-PART COMPLETE ENTRY
function closeIncompletes(type, label) {
	const newRow = tab1.getLastRow();
	const labelRange = tab1.getRange(rangeOffset,12,newRow - (rangeOffset-1),1);
	let labelMatchedRow = [];
	let firstMatch;

	if (type == "3"){
		for ( i = 0; i < ((newRow + 1)  - rangeOffset); i++){
			if (labelRange.getValues()[i] == label){
				labelMatchedRow.push(Number([i]) + rangeOffset) };
		};

		firstMatch = labelMatchedRow.shift();
		tab1.getRange(firstMatch + ":" + firstMatch).setBackground("#f1c232");
		labelMatchedRow.forEach(recolorIncompleteRotab1);
	}
}

// ░░░░░░░░░▓ CLOSEINCOMPLETES -- THIS ACTUALLY SETS THE BACKGROUND COLOR
function recolorIncompleteRotab1(item){
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