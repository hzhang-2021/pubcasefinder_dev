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
//          1. change the parameter name from service to auth_type at the ajax to pubcasefinder server
////

const PUBCASEFINDER_WEB_SERVER='http://pubcasefinder.bits.cc';
const PUBCASEFINDER_WEB_SERVER_SECRET_KEY='58b05930-bbaf-45f9-b96c-05df7b53f23e';
const AUTH_TYPE='panelsearch_nanbyo';

var REGIST_USER_URL    = PUBCASEFINDER_WEB_SERVER + '/google-signup-regist-user';
var AUTHENTICATION_URL = PUBCASEFINDER_WEB_SERVER + '/google-signup-authenticate';
var CHECK_STATUS_URL   = PUBCASEFINDER_WEB_SERVER + '/google-signup-check-status';
var CHANGE_STATUS_URL  = PUBCASEFINDER_WEB_SERVER + '/google-signup-change-status';


const PBS_SPREADSHEET_ID="1kss4hHDajL0dxoeXO8qO8hpUruElcsdt_61RNMhqvFo";
const PBS_SPREADSHEET_DATA_NAME="PubCaseFinder-PanelSearch-Users-Sheet1";

const COLNO_TIMESTAMP        =1;
const COLNO_GOOGLE_ID        =2;
const COLNO_LAST_NAME_NL     =3;
const COLNO_LAST_NAME_EN     =4;
const COLNO_FIRST_NAME_NL    =5;
const COLNO_FIRST_NAME_EN    =6;
const COLNO_AFFILIATION      =7;
const COLNO_EMAIL            =8;
const COLNO_JOB_TITLE        =9;
const COLNO_UID              =10;
const COLNO_AUTHENCODE       =11;
const COLNO_ISEMAILVALID     =12;
const COLNO_ISREGISTED       =13;


const AUTH_MAIL_SUBJECT='Please verify your email address at PubCaseFinder Panelsearch(nanbyo)';
const AUTH_MAIL_BODY=`
Dear __firstname__ __lastname__,

Thank you for signing up for our service. To complete the registration process and verify your email address, please click on the following link:

__link__

Once you have clicked the link, you will be redirected to our website where you can complete the authentication process.

If you did not sign up for our service, please ignore this email.

Thank you,
PubCaseFinder.dbcls.ac.jp
`;

NOTIFICATION_MAIL_ACCOUNT='hzhang@bits.cc,banbanbigelow@gmail.com,shin@dbcls.rois.ac.jp';
NOTIFICATION_MAIL_SUBJECT='There are __num__ accounts finished Email verification for PubCaseFinder PanelSearch(nanbyo) Sign Up !';
NOTIFICATION_MAIL_BODY=`There are __num__ accounts finished Email verification for PubCaseFinder PanelSearch(nanbyo) Sign Up !`;

//
// utils
//
function getDataSheet(){
  var ss = SpreadsheetApp.openById(PBS_SPREADSHEET_ID);
  var sheet = ss.getSheetByName(PBS_SPREADSHEET_DATA_NAME);
  return sheet;
}
function isValidEmail(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}
function removeDuplicates(arr) {
    return arr.filter((item,
        index) => arr.indexOf(item) === index);
}
function getAllSelectedRows(){
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var selectedRanges = sheet.getActiveRangeList().getRanges();
  var row_list = [];
  selectedRanges.forEach(range => {
    var numRows = range.getNumRows();
    var startRow = range.getRow();
    for(var rowIdx=startRow; rowIdx<startRow+numRows; rowIdx++){
      if(rowIdx > 1){
          row_list.push(rowIdx);
      }
    }
  });
  if(row_list.length > 1){
    return removeDuplicates(row_list);
  }
  return row_list;
}


//
// actions
//
function sendAuthencationEmail(){
  var authenmail_subject_temp = AUTH_MAIL_SUBJECT;
  var authenmail_body_temp    = AUTH_MAIL_BODY;

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var selection = sheet.getActiveRange();

  var row = selection.getRow();
  if (row == 1) {
    showAlert("Info", "Please select a data row first!");
  }else{

    var cell_email   = sheet.getRange(row,COLNO_EMAIL);
    var emailAddress = cell_email.getValue();

    var cell_code = sheet.getRange(row,COLNO_AUTHENCODE);
    var code = cell_code.getValue();

    var cell_name1 = sheet.getRange(row,COLNO_FIRST_NAME_EN);
    var name1      = cell_name1.getValue();

    var cell_name2 = sheet.getRange(row,COLNO_LAST_NAME_EN);
    var name2      = cell_name2.getValue();

    var cell_uid = sheet.getRange(row,COLNO_UID);
    var uid = cell_uid.getValue();

    if(code == ""){
      showAlert("Info", "Get Authentication Code from PubCaseFinder first!");
      return;
    }

    if(isValidEmail(emailAddress)){
      var ui = SpreadsheetApp.getUi();
      var response = ui.alert(
        'Confirmation',
        "Are you sure to send an authencation request email to user account ["+emailAddress+"]?",
        ui.ButtonSet.YES_NO);

      if (response == ui.Button.YES) {
        var url_str = AUTHENTICATION_URL + "?auth_type="+AUTH_TYPE+"&uid="+uid+"&code="+encodeURIComponent(code)+"&";
        var subject = authenmail_subject_temp;
        var body    = authenmail_body_temp.replace('__firstname__', name1)
                                  .replace('__lastname__', name2)
                                  .replace('__link__',     url_str);
        try {        
            MailApp.sendEmail(emailAddress, subject, body);
            showAlert("Info", "Authentication Email Sent to user account["+emailAddress+"].");
        } catch (e) {
          Logger.log(`❌ Failed to send to ${emailAddress}: ${e.message}`);
        }
      }
    }else{
      showAlert("Info", "Please select a data row with valid email address first!");
    }
  }  
}



function registerUser() {

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

        var cell_isEmailValid = sheet.getRange(rowIdx,COLNO_ISEMAILVALID);
        var isEmailValid      = cell_isEmailValid.getValue();

        var cell_isRegisted   = sheet.getRange(rowIdx,COLNO_ISREGISTED);
        var isRegisted        = cell_isRegisted.getValue();

        if(code && isRegisted == "NO" && isEmailValid == "YES"){
          var cell_uid          = sheet.getRange(rowIdx,COLNO_UID);
          var uid               = cell_uid.getValue();
          uid_list.push(uid);
          user_list.push(rowIdx);
          user_email_list.push(emailAddress);
        }
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
    "Are you sure to register these users["+user_email_list.join(',')+"] to PubCaseFinder Server?",
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
      cell_isRegisted.setBackground("white");
    }
  }
}

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

        var cell_isEmailValid = sheet.getRange(rowIdx,COLNO_ISEMAILVALID);
        var isEmailValid      = cell_isEmailValid.getValue();

        var cell_isRegisted   = sheet.getRange(rowIdx,COLNO_ISREGISTED);
        var isRegisted        = cell_isRegisted.getValue();

        var cell_uid          = sheet.getRange(rowIdx,COLNO_UID);
        var uid               = cell_uid.getValue();

        if(code && isRegisted == "NO" && isEmailValid == "YES"){
          user_list.push(rowIdx);
          uid_list.push(uid);
          user_email_list.push(emailAddress);
        }
      }
    }
  });

  if(user_list.length === 0){
    showAlert("Info", "Please select a data row with isValidated(YES) and isRegisted(NO) first!");
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
      .addItem('Accept Selected Users and Send notification Email to User',          'registerUser')
      .addItem('Reject Selected Users and Send notification Email to User',          'rejectUser')
      .addSeparator()
      .addItem('1.Send authentication request email to the selected user account',   'sendAuthencationEmail')
      .addItem('2.Check User Status',                                                'trigger_checkStatus')
      .addItem('3.Send Notification Email about validated Account to Admin Account', 'trigger_sendNotificationEmail')
      .addItem('4.Check All User Authentication Expired Status',                     'trigger_checkAuthenticationExpiredStatus')
      //.addSeparator()
      //.addItem('Sort by PSN number',                            'sortByPSNNumber')
      .addToUi();
}


// trigger on form submit:
// 1. set additional cell init value to the new added row
// 2. regist new user to pubcasefinder and get authentication code back
// 3. send an authentication request email to the new sign up user at the new added row
function trigger_onFormSubmit(e) {
  const sheet      = e.range.getSheet();
  const lastRow    = sheet.getLastRow();
  const rowIdx     = e.range.getRow();
  const lastColumn = sheet.getLastColumn() - 3;
  const newRange   = sheet.getRange(rowIdx, lastColumn, 1, 4);


  const maxRows = sheet.getMaxRows();
  const threshold = 150;
  if (maxRows - lastRow < threshold) {
    sheet.insertRowsAfter(maxRows, 1000);
    Logger.log(`Added 1000 rows. Total now: ${sheet.getMaxRows()}`);
  }




  // 1. set additional cell init value to the new added row
  var uid              = 'PSN-'+lastRow; // construct UID with prefix('PSN-') and line number.
  var authencationCode = "";
  var isEmailValid     = "NO";
  var isRegisted       = "NO";
  
  var values           = [[uid, authencationCode, isEmailValid, isRegisted]];
  newRange.setValues(values);
  Logger.log("Info: New user uid["+uid+"].");

  // 2. get authentication code from pubcasefinder for the new row
  const rowValues = sheet.getRange(rowIdx, 1, 1, sheet.getLastColumn()).getValues()[0];
  var rowData = {
    'uid':            uid,
    'google_id':      rowValues[COLNO_GOOGLE_ID-1],
    'first_name_en':  rowValues[COLNO_FIRST_NAME_EN-1],
    'first_name_nl':  rowValues[COLNO_FIRST_NAME_NL-1],
    'last_name_en':   rowValues[COLNO_LAST_NAME_EN-1],
    'last_name_nl':   rowValues[COLNO_LAST_NAME_NL-1],
    'affiliation':    rowValues[COLNO_AFFILIATION-1],
    'job_title':      rowValues[COLNO_JOB_TITLE -1],
    'email':          rowValues[COLNO_EMAIL -1],
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
// for those not finishing email authentication user, go to pubcasefinder server and check there status.
// from pubcasefinder server, get those pass_to_go, reject_to_go items and do email notification and change status
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
      var passed_to_go_uid_list_str   = json.passed_to_go_uid_list_str;
      var rejected_to_go_uid_list_str = json.rejected_to_go_uid_list_str;
      var deleted_to_go_uid_list_str  = json.deleted_to_go_uid_list_str;
      var reset_expire_uid_list_str   = json.reset_expire_uid_list_str;
      var cancelled_to_go_uid_list_str= json.cancelled_to_go_uid_list_str;
      var blocked_to_go_uid_list_str  = json.blocked_to_go_uid_list_str;      

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
              cell_isRegisted.setBackground("yellow");
            }
          }
        }
        Logger.log("Info: users("+authenticated_uid_list_str+") newly finished email authentication!");
      }


      if(passed_to_go_uid_list_str.length     > 0 || rejected_to_go_uid_list_str.length > 0 || 
          deleted_to_go_uid_list_str.length   > 0 || reset_expire_uid_list_str.length   > 0 || 
          cancelled_to_go_uid_list_str.length > 0 || blocked_to_go_uid_list_str.length  > 0){

        var ret = change_user_status_to_pubcasefinder(
          passed_to_go_uid_list_str, 
          rejected_to_go_uid_list_str, 
          '', 
          deleted_to_go_uid_list_str, 
          reset_expire_uid_list_str,
          cancelled_to_go_uid_list_str,
          blocked_to_go_uid_list_str
        );
        if(ret !== "done"){
          Logger.log("Error", ret);
          return;
        }

      }

      var action_list = [
        {'action': 'finished all registration process', 'data':passed_to_go_uid_list_str},
        {'action': 'rejected',                          'data':rejected_to_go_uid_list_str},
        {'action': 'deleted',                           'data':deleted_to_go_uid_list_str},
        {'action': 'reset email authentication',        'data':reset_expire_uid_list_str},
        {'action': 'cancelled',                         'data':cancelled_to_go_uid_list_str},
        {'action': 'blocked',                           'data':blocked_to_go_uid_list_str}
      ];

      for(var action_item of action_list){
        if(action_item.data.length > 0){
          var uid_list = action_item.data.split(',');
          for(var i= 0; i < uid_list.length; i++){
            var uid = uid_list[i];
            for(var j= 0; j < columnValues_uid.length; j++){
              if(uid === columnValues_uid[j][0]){
                var row = j+2;
                var cell_isEmailValid  = sheet.getRange(row,COLNO_ISEMAILVALID);
                var cell_timestamp     = sheet.getRange(row,COLNO_TIMESTAMP);
                var cell_isRegisted    = sheet.getRange(row,COLNO_ISREGISTED);
               
                cell_isRegisted.setBackground("white");

                if(action_item.action === 'finished all registration process'){
                  cell_isEmailValid.setValue('YES');
                  cell_isRegisted.setValue('YES');
                }else if(action_item.action === 'rejected'){
                  cell_isEmailValid.setValue('REJECTED');
                  cell_isRegisted.setValue('REJECTED');
                }else if(action_item.action === 'deleted'){
                  cell_isEmailValid.setValue('DELETED');
                  cell_isRegisted.setValue('DELETED');
                }else if(action_item.action === 'reset email authentication'){
                  cell_isEmailValid.setValue('NO');
                  var now = new Date(); 
                  cell_timestamp.setValue(now);
                  cell_isRegisted.setValue('NO');
                }else if(action_item.action === 'cancelled'){
                  cell_isEmailValid.setValue('CANCELLED');
                  cell_isRegisted.setValue('CANCELLED');
                }else if(action_item.action === 'blocked'){
                  cell_isEmailValid.setValue('BLOCKED');
                  cell_isRegisted.setValue('BLOCKED');
                }
              }
            }
          }
          Logger.log("Info: users("+ action_item['data'] + ") newly "+ action_item.action +"!");
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

// trigger check validated email and send notification email to administrator.
function trigger_sendNotificationEmail(){
  
  var sheet = getDataSheet();
  var lastRow                   = sheet.getLastRow();
  var columnRange_uid           = sheet.getRange(2, COLNO_UID, lastRow, 1);
  var columnValues_uid          = columnRange_uid.getValues();
  var columnRange_authencode    = sheet.getRange(2, COLNO_AUTHENCODE, lastRow, 1);
  var columnValues_authencode   = columnRange_authencode.getValues();
  var columnRange_isemailvalid  = sheet.getRange(2, COLNO_ISEMAILVALID, lastRow, 1);
  var columnValues_isemailvalid = columnRange_isemailvalid.getValues();
  var columnRange_isregisted    = sheet.getRange(2, COLNO_ISREGISTED, lastRow, 1);
  var columnValues_isregisted   = columnRange_isregisted.getValues();

  // Iterate through each row
  var uid_list = [];
  for (var i = 0; i < columnValues_uid.length; i++) { //skip the title row which is 0;
    var uid          = columnValues_uid[i][0]; // because data index start from 0.
    var code         = columnValues_authencode[i][0];
    var isEmailValid = columnValues_isemailvalid[i][0];
    var isRegisted   = columnValues_isregisted[i][0];
    if(code && isEmailValid === 'YES'&& isRegisted === 'NO'){
      uid_list.push(uid);
    }
  }

  var num = uid_list.length;
  if(num > 0){
    var subject      = NOTIFICATION_MAIL_SUBJECT.replace('__num__ ', num);
    var body         = NOTIFICATION_MAIL_BODY.replace('__num__ ', num);
    var accounts     = NOTIFICATION_MAIL_ACCOUNT;

    try {        
      MailApp.sendEmail(accounts, subject, body);
      Logger.log("Info: Successfully sent notification email to " + accounts + " .");
    } catch (e) {
      Logger.log(`❌ Failed to send to ${accounts}: ${e.message}`);
    }
  }else{
    Logger.log("Info: There is no validated users need to do registration!");
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

    var ret = change_user_status_to_pubcasefinder('','', expired_uid_list_str,'','','','');
    if(ret !== 'done'){
      Logger.log("Error occured during expire users: msg(" + ret + ')');
    }else{
      Logger.log("users("+expired_uid_list_str+") registration was expired."); 
    }
  }
}



function sortByPSNNumber() {
  //const sheet = SpreadsheetApp.getActiveSheet();
  const sheet = getDataSheet();
  const range = sheet.getDataRange(); // 或者改成你需要的范围
  const values = range.getValues();

  // 
  values.sort((a, b) => {
    const a_text= a[COLNO_UID-1].replace('PSN-','');
    const b_text= b[COLNO_UID-1].replace('PSN-','');
    const numA = parseInt(a_text) || 0;
    const numB = parseInt(b_text) || 0;
    return numA - numB;
  });

  // 
  range.setValues(values);
}


function setPSNNumber() {

  var sheet = getDataSheet();
  var lastRow                   = sheet.getLastRow();
  var columnRange_uid           = sheet.getRange(2, COLNO_UID, lastRow, 1);
  var columnValues_uid          = columnRange_uid.getValues();

  
  // Iterate through each row
  var uid_list = [];
  for (var i = 0; i < columnValues_uid.length; i++) { //skip the title row which is 0;
    var row = i+2;
    var uid = columnValues_uid[i][0];
    var val = parseInt(uid.replace('PSN-',''));
    var cell_no = sheet.getRange(row,COLNO_ORDER);
    cell_no.setValue(val);
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


function add_Test_data() {

  const sheet = getDataSheet();

  // 
  const data_dummy = [
[new Date("2024/11/16 11:41:21"),"mutoisamu@gmail.com","武藤","MUTO","勇","Isamu","ビッツ株式会社・ライフサイエンス","imuto@bits.cc","エンジニア","PSN-6","nss0wUFlWjn0McvE3GE_YRGTui5T31DNvQLLeEzq","YES","YES"],
[new Date("2024/12/05 10:13:53"),"shin@dbcls.rois.ac.jp","Shin","Shin","Jaemoon","Jaemoon","DBCLS","shin@dbcls.rois.ac.jp","Researcher","PSN-7","zJV9saHP0_x_EbRhgoN_RVHEmXutDKqNI_3aIZMh","YES","YES"],
[new Date("2024/12/05 10:16:28"), "fujiwara@dbcls.rois.ac.jp","藤原","Fujiwara","豊史","Toyofumi","ライフサイエンス統合データベースセンター・ホゲグループ","fujiwara@dbcls.rois.ac.jp","特任准教授","PSN-8","HLQV_uLpc6JyrL3DsdKebswrkDgrw7aSp-c5LIIB","YES","YES"],
[new Date("2025/02/07 14:13:16"), "swallow.ds.jp@gmail.com","浅野","Asano","ゆい","Yui","SDS","yui.asano@swallow.design","Designer","PSN-9","CZVUF2m7f--e0GMYwW03NuUCcyH9MRkSajG2D3si", "YES","YES"]
  ];

const data_dummy1 = [

];

  // 在最后一行追加
  data_dummy.forEach(row => {
    sheet.appendRow(row);
  });

  Logger.log("提交成功！");
}

