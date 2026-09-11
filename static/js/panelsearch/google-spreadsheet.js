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
////

const PUBCASEFINDER_WEB_SERVER='http://pcf.bits.cc';
const PUBCASEFINDER_WEB_SERVER_SECRET_KEY='58b05930-bbaf-45f9-b96c-05df7b53f23e';
const AUTH_TYPE='pubcasefinder';

var REGIST_USER_URL    = PUBCASEFINDER_WEB_SERVER + '/google-signup-regist-user';
var AUTHENTICATION_URL = PUBCASEFINDER_WEB_SERVER + '/google-signup-authenticate';
var CHECK_STATUS_URL   = PUBCASEFINDER_WEB_SERVER + '/google-signup-check-status';
var CHANGE_STATUS_URL  = PUBCASEFINDER_WEB_SERVER + '/google-signup-change-status';


const PBS_SPREADSHEET_ID="10mCo1rCrPu90f8vkXjBvnNIA9w8k9yaaHPdv9Oe2QRA";
const PBS_SPREADSHEET_DATA_NAME="PubCaseFinder-Users-Sheet1";

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
const COLNO_GROUP_EN       = 12;
const COLNO_GROUP_NL       = 13;
const COLNO_UID            = 14;
const COLNO_AUTHENCODE     = 15;
const COLNO_ISEMAILVALID   = 16;
const COLNO_ISREGISTED     = 17;

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
      Logger.log("Finished checking status"); 
    } else if (json.status === "error") {
      Logger.log("Error: error ocurred at check user status("+ json.message+")");
      return "Error: error ocurred at check user status("+ json.message+")";
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


//
// triggers
//

// add menu to the spreadsheet
function trigger_onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('PanelSearch-Menu')
      .addItem('Check User Status','trigger_checkStatus')
      .addToUi();
}


// trigger on form submit:
function trigger_onFormSubmit(e) {

  const sheet      = e.range.getSheet();
  const lastRow    = sheet.getLastRow();
  const rowIdx     = e.range.getRow();
  //const sheet      = getDataSheet();
  //const lastRow    = 2;
  //const rowIdx     = 2;

  const lastColumn = sheet.getLastColumn() - 3;
  const newRange   = sheet.getRange(rowIdx, lastColumn, 1, 4);

  const maxRows = sheet.getMaxRows();
  const threshold = 150;
  if (maxRows - lastRow < threshold) {
    sheet.insertRowsAfter(maxRows, 1000);
    Logger.log(`Added 1000 rows. Total now: ${sheet.getMaxRows()}`);
  }

  // 1. set additional cell init value to the new added row
  var uid              = 'PCF-'+lastRow; // construct UID with prefix('PCF-') and line number.
  var authencationCode = "";
  var isEmailValid     = "NO";
  var isRegisted       = "NO";
  
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
    'group_en':       rowValues[COLNO_GROUP_EN -1],
    'group_nl':       rowValues[COLNO_GROUP_NL -1],
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
      const cell_code = sheet.getRange(rowIdx,COLNO_AUTHENCODE);
      cell_code.setValue(json.authentication_code);
      Logger.log("Info: Got Authentication Code for row["+rowIdx+"] from PubCaseFinder.");
    } else if (json.status === "error") {
      Logger.log("Error: error ocurred at regist user("+ json.message+")");
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

      var authenticated_uid_list_str  = json.authenticated_uid_list_str;

      if(authenticated_uid_list_str.length > 0){

        var ret = change_user_status_to_pubcasefinder(authenticated_uid_list_str,'', '','', '','','');
        if(ret !== "done"){
          Logger.log("Error", ret);
          return;
        }

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

