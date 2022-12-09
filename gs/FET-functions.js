// ░░░░░░░░░▓ COMMON VARIABLES SCOPED GLOBALLY
const ss = SpreadsheetApp.getActiveSpreadsheet();
const tab1 = ss.getSheetByName("Footage List");
const tab2 = ss.getSheetByName("Published: MR");
const newRow = tab1.getLastRow() + 1;
var localProdNumOffset = -1;			// exists so that multiple episodes can be entered without pulling spreadsheet data every time
let doubleRow = false;
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
	let memCardRow1a = rowData.audioCardsData;
	let memCardRow2 = [];
	let memCardLength = rowData.videoCardsLength + rowData.audioCardsLength;
	const rowPt1 = [
					rowData.dateRecorded,
					determinedProdNum
					];

	let rowPt2 = [];
	let rowPt2Row2 = [];
	let memCardRow1b = [];

	// IF MORE MEMORY CARDS WERE USED THAN CAN FIT IN ONE ROW...
	if ((memCardLength) > 8) {

		// SET "doubleRow" STATUS TO TRUE FOR FUTURE USE
		doubleRow = true;

		// LOOP THROUGH THE FIRST 8 MEM CARD SLOTS AFTER ALREADY FILLING AUDIO CARDS...
		for (i = 0; i < 8 - rowData.audioCardsLength; i++) {
			// SET ASIDE THE FIRST 8 VIDEO MEM CARDS IN ORDER INSIDE OF "memCardRow1b"
			memCardRow1b.push(rowData.videoCardsData[i]);
		};

		// SEND FIRST BATCH OF VIDEO CARDS TO THE BEGINNING OF "memCardRow1"
		let memCardRow1 = memCardRow1b.concat(memCardRow1a);

		// LOOP THROUGH THE 8 MEM CARD CELLS IN ROW 2...
		for (j = 0; j < 8; j++) {
			// AND FOR THE RIGHT-MOST REMAINING SLOTS...
			if (i < memCardLength - rowData.audioCardsLength) {
				// ADD THE REST OF THE VIDEO CARDS
				memCardRow2.push(rowData.videoCardsData[i]);
			// AND FOR ALL THE CELLS IN BETWEEN...
			} else {
				// ADD EMPTY VALUES
				memCardRow2.unshift("");
			}
			i++;
			console.log("j: " + j + " i: " + i + " memCardRow2: " + memCardRow2);
		};

		rowPt2 = memCardRow1;
		rowPt2Row2 = memCardRow2;
	} else {
		rowPt2 = rowData.videoCardsData.concat(rowData.audioCardsData);
		for (i = 0; rowPt2.length < 8; i++){
			rowPt2.unshift("");
		}
	};

	const rowPt3 = [
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
	const rowCombined = rowPt1.concat(rowPt2, rowPt3, rowPt4);

	if (doubleRow == true) {
		tab1.appendRow(
			rowCombined);
		let r2Empty = [,];
		tab1.appendRow(
			r2Empty.concat(rowPt2Row2));
	} else {
		tab1.appendRow(
			rowCombined);
	}
	setBackgroundColor(
		rowData.type,
		rowData.toggledLabel);
	setCellFormats();
	mergeCells(
		memCardLength,
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
	const labelRange = tab1.getRange(			rowStart, 12, newRow - (rowStart - 1), 1);
	const locationWideRange = tab1.getRange(	rowStart, 19, newRow - (rowStart - 1), 1);
	const locationNarrowRange = tab1.getRange(	rowStart, 20, newRow - (rowStart - 1), 1);

		for (i = 0; i < ((newRow + 1) - rowStart); i++){
			if (labelRange.getBackgrounds()[i] == "#ffff00") {
				dataArray.unfinished.push(labelRange.getValues()[i])
			} else if (locationWideRange.getValues()[i] != "") {
				dataArray.locationsWide.push(locationWideRange.getValues()[i]);
				dataArray.locationsNarrow.push(locationNarrowRange.getValues()[i]) };
		};

	dataArray.allSponsors = labelRange.getValues().filter(value => /ad: /i.test(value));
		
	/*let rawSponsors = labelRange.getValues().filter(value => /ad: /i.test(value));
	let rawSponsorsString = [].concat.apply([], rawSponsors);
	rawSponsorsString.forEach(function(adName) {
		dataArray.allSponsors.push(adName.slice(4));
	});

	console.log("rawSponsors: " + rawSponsors);
	console.log("dataArray.allSponsors: " + dataArray.allSponsors);*/

	return dataArray;
}


// ░░░░░░░░░▓ HUB FUNCTION RUNNING FOR LOOPS TO DETERMINE IDENTIFIABLE DATA
function generateIDs(type, cont, label) {
	const offset = 100;
	const rowStart = newRow - offset;
	const prodNumRange = tab1.getRange(	rowStart, 2,  newRow - (rowStart - 1),	1);
	const labelRange = tab1.getRange(	rowStart, 12, newRow - (rowStart - 1),	1);
	const ptRange = tab1.getRange(		rowStart, 13, newRow - (rowStart - 1),	1);
	let prodNumFilter = [];			// all recent prod numbers, filtered to only numbers
	let prodNumIndex = [];			// all recent prod numbers including NaN (- or null)
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
		
		// send 20 latest labels to labelList
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
		localProdNumOffset++;													// increases local offset by 1
		determinedProdNum		= mostRecentNum + localProdNumOffset;
		determinedPart			= "";
	} else if (type == 2) {														// MULTI-PART UNFINISHED
		if (cont === "NEW"){
			localProdNumOffset++;												// increases local offset by 1
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
	let extraRow;

	if (doubleRow == true) { extraRow = newRow + 1; }
	else { extraRow = newRow; };
	
	// EPISODES
	if (type == "1"){
		tab1.setActiveSelection(newRow + ":" + extraRow).setBackground("#76c1cc").setFontColor("black");
		
	// MULTI-PART: UNFINISHED
	} else if (type == "2"){
		tab1.setActiveSelection(newRow + ":" + extraRow).setBackground("#ffff00").setFontColor("black");
		
	// MULTI-PART: COMPLETED
	} else if (type == "3"){
		tab1.setActiveSelection(newRow + ":" + extraRow).setBackground("#458d97").setFontColor("black");
		console.log("firstMatch: "+firstMatch);
		console.log("allLabelMatches: "+allLabelMatches);
		tab1.getRange(firstMatch + ":" + firstMatch).setBackground("#76c1cc");
		allLabelMatches.forEach(recolorIncompleteRowTab1);
		
	// SPONSOR
	} else if (type == "4"){
		tab1.setActiveSelection(newRow + ":" + extraRow).setBackground("#90eba6").setFontColor("black");
		
	// PATREON BONUS
	} else if (type == "5"){
		tab1.setActiveSelection(newRow + ":" + extraRow).setBackground("#3c4043").setFontColor("white");
		
	// OTHER
	} else {
		tab1.setActiveSelection(newRow + ":" + extraRow).setBackground("#f9cb9c").setFontColor("black");
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
	mergeEnd = "JIHGFEDC"[length] || "C";

	tab1.getRange("C" + newRow + ":" + mergeEnd + newRow).merge();

	// THIS APPLIES TO THE "PT" COLUMN
	if (type == "2" || type == "3") {}
	else {tab1.getRange("L" + newRow + ":M" + newRow).merge();};

	// IF TWO ROWS ARE BEING CREATED...
	if (doubleRow == true) {
		mergeEnd = "IHGFEDC"[(length - 8)] || "C";
		tab1.getRange("A" + (newRow) + ":B" + (newRow + 1)).mergeVertically();
		tab1.getRange("C" + (newRow + 1) + ":" + mergeEnd + (newRow + 1)).merge();
		tab1.getRange("K" + (newRow) + ":K" + (newRow + 1)).mergeVertically();
		tab1.getRange("L" + (newRow) + ":M" + (newRow + 1)).merge();
		tab1.getRange("N" + (newRow) + ":AL" + (newRow + 1)).mergeVertically();
	}
	
}

// ░░░░░░░░░▓ RECOLORS MULTI-PART INCOMPLETE ROWS WHEN COMPLETED
function recolorIncompleteRowTab1(item) {
	tab1.getRange(item + ":" + item).setBackground("#458d97");				// color: dark blue
}

// ░░░░░░░░░▓ SUBMITS TITLE DATA TO TAB 2
function passToTab2(label, type, date) {
	if (type === "1" || type === "3") {										// if NEW EP or COMPLETED MULTI-PART
		tab2.insertRowBefore(2);											// create new row at the top of tab 2
		tab2.getRange("G2")													// title cell
			.setValue(label)												// user-input label
			.setFontSize(10)
			.setHorizontalAlignment("left");
		tab2.getRange("O2")													// recording date cell
			.setValue(date)													// user-input date
			.setFontSize(8)
			.setVerticalAlignment("middle")
			.setHorizontalAlignment("center");
		tab2.getRange("H2:M2")
			.insertCheckboxes()
			.setFontSize(7)
			.setFontColor("#000000");
	} else if (type === "4") {														// if SPONSOR
		let publishBorder = findRow();												// row number where unpublished videos ends
		let sponsVal = tab2.getRange("Q2:Q" + publishBorder).getValues();			// get all possible sponsor values
		let sponsBg = tab2.getRange("Q2:Q" + publishBorder).getBackgrounds();		// get all possible sponsor cell colors

		for (i = 0; i < publishBorder; i++) {										// cycle through the sponsor listings
			if (sponsBg[i] != "#e6b8af") {											// if the background is not red
				sponsVal[i] = "";													// clear the sponsor name
			};
		};

		let tab2AdRow = suggestReverseMatch(label, sponsVal);						// find the row containing the best possible ad match

		tab2.getRange("Q" + tab2AdRow)												// go to the sponsor cell in that row
			.setBackground("#ffffff");												// reset the background to white
	}
}

// ░░░░░░░░░▓ SUGGESTS THE NEAREST CANDIDATE TO CORRECT A TYPO
function suggestReverseMatch(ad, adList){
	
	let adStr = ad.slice(4).toLocaleLowerCase();									// user input set to all lower case
	let adArr = [].concat.apply([], adList);										// a flattened array of recorded sponsors
	let filteredCandidates = [];													// a list of each candidate's confidence rating
	let bestMatch;																	// the lowest number from filteredCandidates

	adArr.forEach(function(adCandidate) {											// run through each ad candidate
		let candidateSearchStr = adCandidate.toLocaleLowerCase();					// lowercases each candidate
		let canLength = candidateSearchStr.length;									// length of candidate string before filtering
		let deviations = 0;															// how many letters are input but not matched
		let consBonus = 0;															// cumulative consecutive matches
		let consCount = -1;															// variable consecutive match counter
		let adLength = adStr.length;												// length of user input as a number

		if (adCandidate.length == 0){ filteredCandidates.push(0);					// if there's nothing in the cell, return a confidence rating of 0%
		} else {																	// if there is something in the cell, figure out the confidence rating
			for ( i = 0; i < adLength; i++) {											// runs through each letter of the user input
					
				if (candidateSearchStr.includes(adStr[i]) == true) {				// if the letter exists in the candidate, then...
					let x = candidateSearchStr.indexOf(adStr[i]);						// where the letter is first found
					let str1 = candidateSearchStr.slice(0, x);							// cut everything before the letter
					let str2 = candidateSearchStr.slice(x + 1);							// cut everything after the letter
					candidateSearchStr = str1 += str2;									// combine the strings to remove the letter
					consCount++;	
						
				} else {															// but if it can't be found in the candidate...
					deviations++;														// ... then it increases total length
					if (consCount >= 1){ consBonus = consBonus + consCount };			// send consecutive bonus if it's built up
					consCount = -1;														// reset consecutive bonus	
				};
				
				if ([i] == (adLength - 1) && (consCount == -1))	{consBonus = consBonus + 0}
				else if ([i] == (adLength - 1) && (consCount != -1)) {consBonus = consBonus + consCount};
			};

			let roundedLength = Math.round(100*											// rounds to hundredth place
				(candidateSearchStr.length + deviations)*								// adds mismatches from the user input to the total length
				((canLength - consBonus) / canLength))									// applies a bonus based on consecutive matches
				/100;																	// completes the rounding
			let proportionalLength = Math.round(										// rounds to nearest integer
				(1 - (roundedLength / (canLength + candidateSearchStr.length + deviations)))
				* 100);																	// final length as a percentage of start length + mismatches
			
			filteredCandidates.push(proportionalLength);								// send filtered candidate string to list
		}
	});

	bestMatch = Math.max(...filteredCandidates);									// find the candidate with the lowest number
	return (filteredCandidates.lastIndexOf(bestMatch) + 2);							// returns the lowest relevant row number with the best matched ad
}																					// "+ 2" accounts for lastIndex counting from 0, and the candidates starting on row 2