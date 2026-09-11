///// history
// version 20241025: 
//          1. add "company email" to the form question list.
// version 20241116: 
//          1. change "company email" to 'affiliation email'.
//          2. modify confirm dialog message when register account
//          3. modify confirm dialog message when refuse account
// version 20241205: 
//          1. change dialog message content to 'affiliation email'.
//          2. change menu 
// version 20250909:
//          1. changes for pubcasefinder auth change
//          2. add times to check the user status change made at pubcasefinder admin page, and send email to user.
// version 20250926:
//          1. changes for some google form items
//          2. change for the reset user authentication after expired.
// version 20251015:
//          1. add test data
//          2. when submit from form, check the left empty rows, if less then 150, do enlargement
// version 20251025:
//          1. change all of the send mail task from spreadsheet to pubcasefinder server by SMTP
// version 20251107:
//          1. change google form items
// version 20251216:
//          1. after user finished email authentication, do not wait for check status from google spreadsheet,
//             directly pass the user's registration and send accept email to user at pubcasefinder web server. 
// version 20260427:
//          1. add menu items: acceptUser,rejectUser
// version 20260512:
//          1. add a new column to store the responseid for the new submit
//          2. add check if user is in deleted status @pubcasefinder server
//          3. if user is in deleted status, remove this response  from google form based on its responseid
//             and set the status column to be deleted.
////

const PUBCASEFINDER_WEB_SERVER='https://staging-pubcasefinder.dbcls.jp';

const PUBCASEFINDER_WEB_SERVER_SECRET_KEY='58b05930-bbaf-45f9-b96c-05df7b53f23e';
const AUTH_TYPE='pubcasefinder';

var REGIST_USER_URL    = PUBCASEFINDER_WEB_SERVER + '/google-signup-regist-user';
var AUTHENTICATION_URL = PUBCASEFINDER_WEB_SERVER + '/google-signup-authenticate';
var CHECK_STATUS_URL   = PUBCASEFINDER_WEB_SERVER + '/google-signup-check-status';
var CHANGE_STATUS_URL  = PUBCASEFINDER_WEB_SERVER + '/google-signup-change-status';


const PBS_SPREADSHEET_ID="1sIaMt1x5ZdwKNPBBAxCwJFct2Iiu6Fr4N5L_Z7GhR84";

const PBS_SPREADSHEET_DATA_NAME="Pubcasefinder-Users-sheet";

const PBS_GOOGLEFORM_ID="1FAIpQLSfvnti395I7zw5z0eSOk6U9VlzHtyeHpk__OlBCLpnlAfbOgQ";

const COLNO_TIMESTAMP      = 1;
const COLNO_GOOGLE_ID      = 2;
const COLNO_LAST_NAME_EN   = 3;
const COLNO_LAST_NAME_NL   = 4;
const COLNO_FIRST_NAME_EN  = 5;
const COLNO_FIRST_NAME_NL  = 6;
const COLNO_AFFILIATION_EN = 7;
const COLNO_AFFILIATION_NL = 8;
const COLNO_EMAIL          = 9;
const COLNO_JOB_TITLE_EN   = 10;
const COLNO_JOB_TITLE_NL   = 11;
const COLNO_UID            = 12;
const COLNO_AUTHENCODE     = 13;
const COLNO_ISEMAILVALID   = 14;
const COLNO_ISREGISTED     = 15;
const COLNO_RESPONSEID     = 16;


//
// utils
//
function getDataSheet(){
  var ss = SpreadsheetApp.openById(PBS_SPREADSHEET_ID);
  var sheet = ss.getSheetByName(PBS_SPREADSHEET_DATA_NAME);
  return sheet;
}

//
// actions
//

function change_user_status_to_pubcasefinder(
  passed_uid_list_str,
  rejected_uid_list_str,
  expired_uid_list_str,
  deleted_uid_list_str,
  reset_expire_uid_list_str,
  cancelled_uid_list_str,
  blocked_uid_list_str
  ){

  var rowData = {
    'passed_uid_list_str':       passed_uid_list_str,
    'rejected_uid_list_str':     rejected_uid_list_str,
    'expired_uid_list_str':      expired_uid_list_str,
    'deleted_uid_list_str':      deleted_uid_list_str,
    'reset_expire_uid_list_str': reset_expire_uid_list_str,
    'cancelled_uid_list_str':    cancelled_uid_list_str,
    'blocked_uid_list_str':      blocked_uid_list_str,
    'auth_type':                 AUTH_TYPE,
    'secret_key':                PUBCASEFINDER_WEB_SERVER_SECRET_KEY
  };

  var options = {
    'method':      'post',
    "contentType": "application/json",
    'payload':     JSON.stringify(rowData),
    "muteHttpExceptions": true
  };
  
  try {
    var response = UrlFetchApp.fetch(CHANGE_STATUS_URL, options);  
    var json = JSON.parse(response.getContentText());
    if(json.status === "success"){
      Logger.log("Finished changing status"); 
    } else if (json.status === "error") {
      Logger.log("Error: error ocurred at change user status("+ json.message+")");
      return "Error: error ocurred at change user status("+ json.message+")";
    } else{
      Logger.log("Unknown response status: " + json.status); 
      return "Unknown response status: " + json.status;
    }
  } catch(err){
    Logger.log("Request failed: " + err);
    return "Request failed: " + err;
  }

  return "done";
}

function acceptUser() {

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const lastRow = sheet.getLastRow();
  const selectedRanges   = sheet.getActiveRangeList().getRanges();
  
  var user_list = [];
  var uid_list  = [];
  var user_email_list = [];
  selectedRanges.forEach(range => {
    var numRows = range.getNumRows();
    var startRow = range.getRow();
    for(var rowIdx=startRow; rowIdx<startRow+numRows; rowIdx++){
      if(rowIdx > 1 && rowIdx <= lastRow){
        
        var cell_code         = sheet.getRange(rowIdx,COLNO_AUTHENCODE);
        var code              = cell_code.getValue();

        var cell_email        = sheet.getRange(rowIdx,COLNO_EMAIL);
        var emailAddress      = cell_email.getValue();

        var cell_uid          = sheet.getRange(rowIdx,COLNO_UID);
        var uid               = cell_uid.getValue();
        uid_list.push(uid);
        user_list.push(rowIdx);
        user_email_list.push(emailAddress);
      }
    }
  });

  if(uid_list.length === 0){
    showAlert("Info", "Please select a data row with validated email address first!");
    return;
  } 

  var ui = SpreadsheetApp.getUi();
  var res = ui.alert(
    'Confirmation',
    "Are you sure to accept these users["+user_email_list.join(',')+"] to PubCaseFinder Server?",
    ui.ButtonSet.YES_NO);

  if (res == ui.Button.YES) {

    var ret = change_user_status_to_pubcasefinder(uid_list.join(','),'','','','','','');
    if(ret !== "done"){
      showAlert("Error", ret);
      return;
    }

    for(var i = 0; i < user_list.length; i++){
      var row = user_list[i];
      var cell_isRegisted = sheet.getRange(row,COLNO_ISREGISTED);
      cell_isRegisted.setValue('YES');
      var cell_isEmailValid = sheet.getRange(row,COLNO_ISEMAILVALID);
      cell_isEmailValid.setValue('YES')
    }
  }
}


function rejectUser() {

  var sheet            = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var lastRow          = sheet.getLastRow();
  var selectedRanges   = sheet.getActiveRangeList().getRanges();
  
  var user_list = [];
  var uid_list = [];
  var user_email_list = [];
  selectedRanges.forEach(range => {
    var numRows = range.getNumRows();
    var startRow = range.getRow();
    for(var rowIdx=startRow; rowIdx<startRow+numRows; rowIdx++){
      if(rowIdx > 1 && rowIdx <= lastRow){
        var cell_code         = sheet.getRange(rowIdx,COLNO_AUTHENCODE);
        var code              = cell_code.getValue();

        var cell_email        = sheet.getRange(rowIdx,COLNO_EMAIL);
        var emailAddress      = cell_email.getValue();

        var cell_uid          = sheet.getRange(rowIdx,COLNO_UID);
        var uid               = cell_uid.getValue();

        if(code){
          user_list.push(rowIdx);
          uid_list.push(uid);
          user_email_list.push(emailAddress);
        }
      }
    }
  });

  if(user_list.length === 0){
    showAlert("Info", "Please select a data row first!");
    return;
  } 

  var ui = SpreadsheetApp.getUi();
  var res = ui.alert(
    'Confirmation',
    "Are you sure to refuse these users["+user_email_list.join(',')+"] ?",
    ui.ButtonSet.YES_NO);

  if (res == ui.Button.YES) {


    var ret = change_user_status_to_pubcasefinder('',uid_list.join(','),'','','','','');
    if(ret !== "done"){
      showAlert("Error", ret);
      return;
    }

    for(var i = 0; i < user_list.length; i++){
      var row = user_list[i];
      var cell_isRegisted = sheet.getRange(row,COLNO_ISREGISTED);
      cell_isRegisted.setValue('REJECTED');
      cell_isRegisted.setBackground("white");
    }

    showAlert("Info", user_list.length + " users were set to be rejected to PubCaseFinder Server!");
  }
}

function fillMissingResponseIds() {

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(PBS_SPREADSHEET_DATA_NAME);

  // ===== 取得header =====
  const data = sheet.getDataRange().getValues();

  if (data.length < 2) {
    return;
  }

  const timestampCol  = COLNO_TIMESTAMP - 1;
  const emailCol      = COLNO_GOOGLE_ID - 1;
  const responseIdCol = COLNO_RESPONSEID -1;

  // ===== 建立 spreadsheet lookup =====
  // key = timestamp + email
  const rowMap = {};

  for (let i = 1; i < data.length; i++) {

    const row = data[i];

    const timestamp = row[timestampCol];
    const email = row[emailCol];
    const responseId = row[responseIdCol];

    // 已有 responseID 就跳过
    if (responseId) {
      continue;
    }

    if (!timestamp || !email) {
      continue;
    }

    const key =
      normalizeTimestamp(timestamp) +
      "||" +
      String(email).trim().toLowerCase();

    rowMap[key] = i + 1; // spreadsheet row number
  }

  // ===== 取得 Form =====
  const form = FormApp.openById(PBS_GOOGLEFORM_ID);

  const responses = form.getResponses();

  // ===== 遍历 Form responses =====
  for (const response of responses) {

    const timestamp = response.getTimestamp();

    let email = "";

    // 取得 respondent email
    try {
      email = response.getRespondentEmail();
    } catch (e) {
      continue;
    }

    if (!email) {
      continue;
    }

    const key =
      normalizeTimestamp(timestamp) +
      "||" +
      String(email).trim().toLowerCase();

    const rowNumber = rowMap[key];

    if (!rowNumber) {
      continue;
    }

    const currentValue = sheet.getRange(rowNumber, responseIdCol + 1).getValue();

    // 只有为空时才写
    if (!currentValue) {

      sheet
        .getRange(rowNumber, responseIdCol + 1)
        .setValue(response.getId());

      Logger.log(
        "Updated row " +
        rowNumber +
        " with responseId " +
        response.getId()
      );
    }
  }
}


// ===== timestamp normalization =====
function normalizeTimestamp(ts) {

  return Utilities.formatDate(
    new Date(ts),
    Session.getScriptTimeZone(),
    "yyyy-MM-dd HH:mm:ss"
  );
}

function showAlert(title, message) {
  var ui = SpreadsheetApp.getUi();
  ui.alert('Information', message, ui.ButtonSet.OK);
}



//
// triggers
//

// add menu to the spreadsheet
function trigger_onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('PanelSearch-Menu')
      .addItem('Check User Status','trigger_checkStatus')
      .addItem('Accept selected users','acceptUser')
      .addItem('Reject selected users','rejectUser')
      .addItem('Fill Missing ResponseIDs','fillMissingResponseIds')
      .addToUi();
}




// trigger on form submit:
function trigger_onFormSubmit(e) {

  const sheet      = e.range.getSheet();
  const lastRow    = sheet.getLastRow();
  const rowIdx     = e.range.getRow();
  //const sheet      = getDataSheet();
  //const lastRow    = 6;
  //const rowIdx     = 6;

  const maxRows = sheet.getMaxRows();
  const threshold = 150;
  if (maxRows - lastRow < threshold) {
    sheet.insertRowsAfter(maxRows, 1000);
    Logger.log(`Added 1000 rows. Total now: ${sheet.getMaxRows()}`);
  }

  // 1. set additional cell init value to the new added row
  var uid              = 'PCF-'+rowIdx; // construct UID with prefix('PCF-') and line number.
  var authencationCode = "";
  var isEmailValid     = "NO";
  var isRegisted       = "NO";

  const lastColumn = sheet.getLastColumn() - 4;
  const newRange   = sheet.getRange(rowIdx, lastColumn, 1, 4);
  
  var values = [[uid, authencationCode, isEmailValid, isRegisted]];
  newRange.setValues(values);

  Logger.log("Info: New user uid["+uid+"].");


  // 2. regist new user to pubcasefinder server
  const rowValues = sheet.getRange(rowIdx, 1, 1, sheet.getLastColumn()).getValues()[0];
  var rowData = {
    'uid':            uid,
    'google_id':      rowValues[COLNO_GOOGLE_ID-1],
    'first_name_en':  rowValues[COLNO_FIRST_NAME_EN-1],
    'first_name_nl':  rowValues[COLNO_FIRST_NAME_NL-1],
    'last_name_en':   rowValues[COLNO_LAST_NAME_EN-1],
    'last_name_nl':   rowValues[COLNO_LAST_NAME_NL-1],
    'affiliation_en': rowValues[COLNO_AFFILIATION_EN-1],
    'affiliation_nl': rowValues[COLNO_AFFILIATION_NL-1],
    'email':          rowValues[COLNO_EMAIL -1],
    'job_title_en':   rowValues[COLNO_JOB_TITLE_EN -1],
    'job_title_nl':   rowValues[COLNO_JOB_TITLE_NL -1],
    'auth_type':      AUTH_TYPE,
    'secret_key':     PUBCASEFINDER_WEB_SERVER_SECRET_KEY
  };

  var options = {
    'method':             'post',
    "contentType":        "application/json",
    'payload':            JSON.stringify(rowData),
    "muteHttpExceptions": true
  };

  try {
    var response = UrlFetchApp.fetch(REGIST_USER_URL, options);
    var json = JSON.parse(response.getContentText());
    if(json.status === "success"){
      Logger.log("Info: Registed new user uid["+uid+"] to pubcasefinder server.");
      var cell_code = sheet.getRange(rowIdx,COLNO_AUTHENCODE);
      cell_code.setValue(json.authentication_code);
      Logger.log("Info: Got Authentication Code for row["+rowIdx+"] from PubCaseFinder.");
    } else if (json.status === "error") {
      Logger.log("Error: error ocurred at regist user("+ json.message+")");
      var cell_code = sheet.getRange(rowIdx,COLNO_AUTHENCODE);
      cell_code.setValue(json.message);
      var cell_isEmailValid = sheet.getRange(rowIdx,COLNO_ISEMAILVALID);
      cell_isEmailValid.setValue('ERROR');
      var cell_isRegisted = sheet.getRange(rowIdx,COLNO_ISREGISTED);
      cell_isRegisted.setValue('ERROR');
      return;
    } else{
      Logger.log("Unknown response status: " + json.status); 
      return;
    }
  } catch(err){
    Logger.log("Request failed: " + err);
    return;
  }
}


// trigger check user Status
function trigger_checkStatus() {
  var sheet                     = getDataSheet();
  var lastRow                   = sheet.getLastRow();
  var columnRange_uid           = sheet.getRange(2, COLNO_UID, lastRow, 1);
  var columnValues_uid          = columnRange_uid.getValues();
  var columnRange_authencode    = sheet.getRange(2, COLNO_AUTHENCODE, lastRow, 1);
  var columnValues_authencode   = columnRange_authencode.getValues();
  var columnRange_isemailvalid  = sheet.getRange(2, COLNO_ISEMAILVALID, lastRow, 1);
  var columnValues_isemailvalid = columnRange_isemailvalid.getValues();
  
  // Iterate through each row
  var uid_list = [];
  for (var i = 0; i < columnValues_uid.length; i++) { //skip the title row which is 0;
    var uid          = columnValues_uid[i][0];
    var code         = columnValues_authencode[i][0];
    var isEmailValid = columnValues_isemailvalid[i][0];
    if(code && isEmailValid === 'NO'){
      uid_list.push(uid);
    }
  }

  var rowData = {
    'uid_list':   uid_list.join(','),
    'auth_type':  AUTH_TYPE,
    'secret_key': PUBCASEFINDER_WEB_SERVER_SECRET_KEY
  };

  var options = {
    'method':             'post',
    "contentType":        "application/json",
    'payload':            JSON.stringify(rowData),
    "muteHttpExceptions": true
  };
  
  try {

    var response = UrlFetchApp.fetch(CHECK_STATUS_URL, options);  
    var json = JSON.parse(response.getContentText());
    if(json.status === "success"){

      const authenticated_uid_list_str  = json.authenticated_uid_list_str;
      if(authenticated_uid_list_str.length > 0){
        var authenticated_uid_list = authenticated_uid_list_str.split(',');
        for(var i= 0; i < authenticated_uid_list.length; i++){
          var authenticated_uid = authenticated_uid_list[i];
          for(var j= 0; j < columnValues_uid.length; j++){
            if(authenticated_uid === columnValues_uid[j][0]){
              var row = j+2;
              var cell_isEmailValid = sheet.getRange(row,COLNO_ISEMAILVALID);
              cell_isEmailValid.setValue('YES');
              var cell_isRegisted = sheet.getRange(row,COLNO_ISREGISTED);
              cell_isRegisted.setValue('YES');
            }
          }
        }
        Logger.log("Info: users("+authenticated_uid_list_str+") newly finished email authentication!");
      }

      const cancelled_to_go_uid_list_str = json.cancelled_to_go_uid_list_str;
      if(cancelled_to_go_uid_list_str.length > 0){

        const google_form = FormApp.openById(PBS_GOOGLEFORM_ID);

        var cancelled_to_go_uid_list = cancelled_to_go_uid_list_str.split(',');
        for(var i= 0; i < cancelled_to_go_uid_list.length; i++){
          var cancelled_uid = cancelled_to_go_uid_list[i];
          for(var j= 0; j < columnValues_uid.length; j++){
            if(cancelled_uid === columnValues_uid[j][0]){
              var row = j+2;
              var cell_isEmailValid = sheet.getRange(row,COLNO_ISEMAILVALID);
              cell_isEmailValid.setValue('YES');
              var cell_isRegisted = sheet.getRange(row,COLNO_ISREGISTED);
              cell_isRegisted.setValue('CANCELLED');

              var cell_google_id = sheet.getRange(row, COLNO_GOOGLE_ID);
              var google_id = cell_google_id.getValue();

              var cell_response_id = sheet.getRange(row, COLNO_RESPONSEID);
              var response_id = cell_response_id.getValue();
              google_form.deleteResponse(response_id);
              
              Logger.log("Info: Google Form Response("+google_id+") was deleted due to user cancelled his/her account!");
            }
          }
        }

        var ret = change_user_status_to_pubcasefinder('','','','','',cancelled_to_go_uid_list_str,'');
        if(ret !== 'done'){
          Logger.log("Error occured during expire users: msg(" + ret + ')');
        }else{
          Logger.log("users("+cancelled_to_go_uid_list_str+") cancelled."); 
        }



      }

      Logger.log("info: finished checking status");

    } else if (json.status === "error") {
      Logger.log("Error: error ocurred at check user status("+ json.message+")");
    } else{
      Logger.log("Unknown response status: " + json.status); 
    }
  } catch(err){
    Logger.log("Request failed: " + err);
  }

}

function trigger_checkAuthenticationExpiredStatus() {

  // get and set the newest status 
  trigger_checkStatus();

  var sheet = getDataSheet();
  var lastRow = sheet.getLastRow();
  var columnRange_isemailvalid = sheet.getRange(2, COLNO_ISEMAILVALID, lastRow, 1);
  var columnValues_isemailvalid = columnRange_isemailvalid.getValues();

  // Get the current date and time
  var now = new Date();
  
  // Calculate the date 3 days ago
  var threeDaysAgo = new Date();
  threeDaysAgo.setDate(now.getDate() - 3);

  var expired_uid_list = [];

  for (var i = 0; i < columnValues_isemailvalid.length; i++) {
    var isemailvalid = columnValues_isemailvalid[i][0];
    if(isemailvalid === 'NO'){
      // check time stamp

      var row_idx = i+2;
      var cell_timestamp = sheet.getRange(row_idx,COLNO_TIMESTAMP);
      var timestamp = cell_timestamp.getValue();
      var timestampDate = new Date(timestamp);
      if (timestampDate < threeDaysAgo) {

          var cell_isEmailValid = sheet.getRange(row_idx,COLNO_ISEMAILVALID);
          cell_isEmailValid.setValue('EXPIRED');

          var cell_uid = sheet.getRange(row_idx,COLNO_UID);
          var uid = cell_uid.getValue();

          expired_uid_list.push(uid);
      }
    }
  }

  if(expired_uid_list.length > 0){

    var expired_uid_list_str = expired_uid_list.join(',');

    var ret = change_user_status_to_pubcasefinder('','', expired_uid_list_str,'','','');
    if(ret !== 'done'){
      Logger.log("Error occured during expire users: msg(" + ret + ')');
    }else{
      Logger.log("users("+expired_uid_list_str+") registration was expired."); 
    }
  }
}


function ensureEnoughRows() {
  const sheet = getDataSheet();
  const lastRow = sheet.getLastRow();
  const maxRows = sheet.getMaxRows();
  const threshold = 100;  // 如果剩余不足 100 行，就自动加行
  const rowsLeft = maxRows - lastRow;

  if (rowsLeft < threshold) {
    sheet.insertRowsAfter(maxRows, 1000); // 一次加 1000 行
    Logger.log("Added 1000 rows. New total: " + sheet.getMaxRows());
  }
}
