///// history
// version 20260512:
//         1. When new submit incoming, store its responseID at the relative row in spreadsheet. 
//            

const PBS_SPREADSHEET_ID="1sIaMt1x5ZdwKNPBBAxCwJFct2Iiu6Fr4N5L_Z7GhR84";
const PBS_SPREADSHEET_DATA_NAME="Pubcasefinder-Users-sheet";

const COLNO_TIMESTAMP      = 1;
const COLNO_GOOGLE_ID      = 2;
const COLNO_RESPONSEID     = 16;

function onSubmit(e) {

  try{
    if (!e || !e.response) {
      Logger.log("No e.response");
      return;
    }

    const response = e.response;
    const responseId = response.getId();

    const email = response.getRespondentEmail();
    const timestamp = response.getTimestamp();
    
    const sheet = SpreadsheetApp.openById(PBS_SPREADSHEET_ID).getSheetByName(PBS_SPREADSHEET_DATA_NAME);

    const lastRow = sheet.getLastRow();
    if (lastRow < 2) {
      Logger.log("No sheet data." );
      return;
    }
    Logger.log("last row" + lastRow );

    const values = 
      sheet.getRange(
        2,              // start row
        1,              // start col: timestamp
        lastRow - 1,    // rows
        2               // cols.(timestamp,google id)
      ).getValues();
    Logger.log("selected spreadsheet rows " + values.length);
    for (let i = values.length - 1; i >= 0; i-- ) {

      const row = values[i];
      const rowTimestamp = row[0];
      const rowEmail = row[1];

      const sameTime = formatDate(rowTimestamp) == formatDate(timestamp);
      const sameEmail = rowEmail == email;

      if (sameTime && sameEmail) {

        //set responseId
        const sheetRow = i + 2;
        Logger.log("found row " + sheetRow + " at google spreadsheet.");
        sheet.getRange(sheetRow,COLNO_RESPONSEID).setValue(responseId);
        
        Logger.log("Set ResponseID at row: " + sheetRow);

        break;
      }
    }  
  }catch(error){
    Logger.log("Failed recording responseID due to :" + error);
    return;
  }
}


function formatDate(d) {

  return Utilities.formatDate(
    new Date(d),
    Session.getScriptTimeZone(),
    "yyyy-MM-dd HH:mm:ss"
  );
}

