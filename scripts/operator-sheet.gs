/**
 * InstaTickets bus operator registrations -> Google Sheet.
 *
 * Paste this whole file into Extensions > Apps Script in the Google Sheet, set the
 * script property OPERATOR_SHEET_SECRET, and deploy it as a web app
 * (Execute as: Me, Who has access: Anyone). Full steps: docs/OPERATOR_PORTAL.md.
 *
 * The website POSTs {"secret": "...", "row": [["Reference","OP-0001"], ["Company","..."], ...]}.
 * Columns are matched by heading, so the order on the sheet can be changed freely and
 * extra columns the team adds (Owner, Notes, ...) are left alone.
 */
var SHEET_NAME = 'Operators';
var TEAM_COLUMNS = ['Owner', 'Notes'];

function doPost(e) {
  try {
    var body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    var secret = PropertiesService.getScriptProperties().getProperty('OPERATOR_SHEET_SECRET');
    if (!secret || body.secret !== secret) return reply({ ok: false, error: 'bad secret' });
    if (!Array.isArray(body.row) || body.row.length === 0) return reply({ ok: false, error: 'empty row' });

    var lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      appendRow(body.row);
    } finally {
      lock.releaseLock();
    }
    return reply({ ok: true });
  } catch (err) {
    return reply({ ok: false, error: String(err) });
  }
}

/** Visiting the web app address in a browser shows this, which proves the deployment works. */
function doGet() {
  return reply({ ok: true, message: 'InstaTickets operator sheet is ready.' });
}

function appendRow(pairs) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

  var headers = sheet.getLastColumn() > 0
    ? sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(String)
    : [];
  if (headers.length === 0) {
    headers = pairs.map(function (p) { return String(p[0]); }).concat(TEAM_COLUMNS);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  // A field the website starts sending later gets its own new column at the end.
  pairs.forEach(function (p) {
    if (headers.indexOf(String(p[0])) === -1) {
      headers.push(String(p[0]));
      sheet.getRange(1, headers.length).setValue(String(p[0])).setFontWeight('bold');
    }
  });

  var values = headers.map(function () { return ''; });
  pairs.forEach(function (p) {
    values[headers.indexOf(String(p[0]))] = p[1] == null ? '' : String(p[1]);
  });

  var rowIndex = sheet.getLastRow() + 1;
  var range = sheet.getRange(rowIndex, 1, 1, headers.length);
  range.setNumberFormat('@'); // plain text, so +263... numbers keep their plus sign
  range.setValues([values]);
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
