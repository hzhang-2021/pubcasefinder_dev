const PBS_SPREADSHEET_ID="1cVd__YR2ypDfEqRhHeGxtw0_-qG1vlOvAV80RMMtfkI";
const PBS_SPREADSHEET_DATA_NAME="PubCaseFinder-Users-Sheet1";
const PBS_SPREADSHEET_MANAGEMENT_NAME="management-sheet";

const COL_NO_TIMESTAMP   =1;
const COL_NO_EMAIL       =2;
const COL_NO_FIRSTNAME   =3;
const COL_NO_LASTNAME    =4;
const COL_NO_AFFILIATION =5;
const COL_NO_ROLE        =6;
const COL_NO_GROUP       =7;
const COL_NO_UID         =8;
const COL_NO_AUTHENCODE  =9;
const COL_NO_ISEMAILVALID=10;
const COL_NO_ISREGISTED  =11;

const GETAUTHENTICATIONCODE_URL='http://pubcasefinder.bits.cc/google-signup-getAuthenticationCode';
const AUTHENTICATION_URL='http://pubcasefinder.bits.cc/google-signup-authenticate';
const CHECKAUTHENTICATION_URL='http://pubcasefinder.bits.cc/google-signup-checkAuthenticationStatus';

function getDataSheet(){
  var ss = SpreadsheetApp.openById(PBS_SPREADSHEET_ID);
  var sheet = ss.getSheetByName(PBS_SPREADSHEET_DATA_NAME);
  return sheet;
}



/*
function getSelectedRowsData() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const selectedRanges = sheet.getActiveRangeList().getRanges();
  
  selectedRanges.forEach(range => {
    const numRows = range.getNumRows();
    const startRow = range.getRow();
    const values = sheet.getRange(startRow, 2, numRows, 1).getValues(); // B列的数据，使用的是 A1 表示法（A列=1，B列=2，依此类推）
    
    values.forEach(row => {
      Logger.log(row[0]); // 输出 B 列数据到日志中
    });
  });
}
*/





function isValidEmail(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

function getAuthenticationCode(){
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var selection = sheet.getActiveRange();

  var row = selection.getRow();
  if (row == 1) {
    // column title row
    showAlert("Info", "Please select a data row first!");
  }else{
    var cell_email   = sheet.getRange(row,COL_NO_EMAIL);
    var emailAddress = cell_email.getValue();

    var cell_uid = sheet.getRange(row,COL_NO_UID);
    var uid = cell_uid.getValue();

    var cell_code = sheet.getRange(row,COL_NO_AUTHENCODE);
    var code = cell_code.getValue();
    if(code != ""){
      showAlert("Info", "Authentication Code for["+emailAddress+"] already existed at the selected row ["+row+"]]!");
      return;
    }

    if(isValidEmail(emailAddress)){

      var rowData = {
        'uid': uid,
        'email': emailAddress
      };
  
      var options = {
        'method': 'post',
        'payload': rowData
      };
      var response = UrlFetchApp.fetch(GETAUTHENTICATIONCODE_URL, options);
      var authentication_code = response.getContentText();
      cell_code.setValue(authentication_code);
      showAlert("Info", "Got Authentication Code for row["+row+"] from PubCaseFinder.");
    }else{
      showAlert("Info", "Please select a data row with valid email address first!");
    }
  }  
}

function sendAuthencationEmail(){
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var selection = sheet.getActiveRange();

  var row = selection.getRow();
  if (row == 1) {
    showAlert("Info", "Please select a data row first!");
  }else{

    var cell_email   = sheet.getRange(row,COL_NO_EMAIL);
    var emailAddress = cell_email.getValue();

    var cell_code = sheet.getRange(row,COL_NO_AUTHENCODE);
    var code = cell_code.getValue();

    var cell_name1 = sheet.getRange(row,COL_NO_FIRSTNAME);
    var name1      = cell_name1.getValue();

    var cell_name2 = sheet.getRange(row,COL_NO_LASTNAME);
    var name2      = cell_name2.getValue();

    var recipientName = name1 + " " + name2

    var cell_uid = sheet.getRange(row,COL_NO_UID);
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

        var verificationLink = AUTHENTICATION_URL + '?uid=' + uid + '&' + 'code='+ code;
        var subject = 'Please verify your email address';
        var body = "Dear " + recipientName + ",\n\n" +
             "Thank you for signing up for our service. To complete the registration process and verify your email address, please click on the following link:\n\n" +
             verificationLink + "\n\n" +
             "Once you have clicked the link, you will be redirected to our website where you can complete the authentication process.\n\n" +
             "If you did not sign up for our service, please ignore this email.\n\n" +
             "Thank you,\n" +
             "PubCaseFinder.dbcls.ac.jp";
        
        MailApp.sendEmail(emailAddress, subject, body);

        showAlert("Info", "Authentication Email Sent to user account["+emailAddress+"].");
      }
    }else{
      showAlert("Info", "Please select a data row with valid email address first!");
    }
  }  
}

function checkAuthenticationStatus() {

//open spreadsheet by ID
// for [ https://docs.google.com/spreadsheets/d/abc1234567/edit#gid=0 ] ID is “abc1234567”。
// The code below opens a spreadsheet using its ID.
// Note that the spreadsheet is NOT physically opened on the client side.
// It is opened on the server only (for modification by the script).
// var ss = SpreadsheetApp.openById("abc1234567");

//  const PBS_SPREADSHEET_ID = "1cVd__YR2ypDfEqRhHeGxtw0_-qG1vlOvAV80RMMtfkI";
//  const PBS_SPREADSHEET_NAME = "PubCaseFinder-Users-Sheet1";
//  var ss = SpreadsheetApp.openById(PBS_SPREADSHEET_ID);
//  var sheet = ss.getSheetByName(PBS_SPREADSHEET_NAME);
  var sheet = getDataSheet();
  
  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();

  // Iterate through each row
  var uid_list = [];
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    var uid  = row[COL_NO_UID-1];
    var code = row[COL_NO_AUTHENCODE-1];
    var isEmailValid = row[COL_NO_ISEMAILVALID-1];
    if(code && isEmailValid === 'NO'){
      uid_list.push(uid);
    }
  }

  if(uid_list.length > 0){

    var rowData = {'uid_list': uid_list.join(',')};

    var options = {
      'method': 'post',
      'payload': rowData
    };
    Logger.log("Check AuthenticationStatus for UIDs ["+uid_list.join(',')+"]"); 

    var response = UrlFetchApp.fetch(CHECKAUTHENTICATION_URL, options);
    var authenticated_uid_list_str = response.getContentText();
    
    Logger.log("Get new authenticated ITEMs ["+authenticated_uid_list_str+"]"); 

    var authenticated_uid_list = authenticated_uid_list_str.split(',');
    for(var i= 0; i < authenticated_uid_list.length; i++){
      var row = parseInt(authenticated_uid_list[i]);
      var cell_isEmailValid = sheet.getRange(row,COL_NO_ISEMAILVALID);
      cell_isEmailValid.setValue('YES');
    }
  }
}



function showAlert(title, message) {

  var ui = SpreadsheetApp.getUi();
  ui.alert('Information', message, ui.ButtonSet.OK);
  
/*  const html = `
    <html>
      <head>
        <base target="_top">
      </head>
      <body>
        <h1>${title}</h1>
        <p>${message}</p>
      </body>
    </html>`;
  const ui = HtmlService.createHtmlOutput(html)
      .setWidth(600)
      .setHeight(300);
  SpreadsheetApp.getUi().showModalDialog(ui, "Alert");
*/
}

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Pubcasefinder Menu')
      .addItem('Get Authentication Code From PubCaseFinder Server', 'getAuthenticationCode')
      .addItem('Send Authentication Email', 'sendAuthencationEmail')
      .addToUi();
}


function onFormSubmit(e) {
  //var responses = e.namedValues;
  // add additional cell data to the new data row which inserted from google form.
  var sheet = e.range.getSheet();
  var lastRow = sheet.getLastRow();
  var lastColumn = sheet.getLastColumn() - 3;
  var newRange = sheet.getRange(lastRow, lastColumn, 1, 4);
  
  var uid = lastRow;
  var authencationCode = "";
  var isEmailValid = "NO";
  var isRegisted = "NO";

  var values = [[uid, authencationCode, isEmailValid, isRegisted]];
  newRange.setValues(values);
}



