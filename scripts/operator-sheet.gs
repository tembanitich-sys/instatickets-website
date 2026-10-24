/**
 * InstaTickets onboarding pipeline -> Google Sheet.
 *
 * Paste this whole file into Extensions > Apps Script in the Google Sheet, set the script
 * property OPERATOR_SHEET_SECRET, and deploy it as a web app (Execute as: Me, Who has
 * access: Anyone). Full steps: docs/OPERATOR_PORTAL.md.
 *
 * The website POSTs {"secret": "...", "sheet": "Partners", "key": "Reference",
 *                    "row": [["Reference","OP-0001"], ["Stage","Submitted"], ...]}.
 * - "sheet" picks the tab: Expressions of interest, Partners or Events (created on first use).
 * - "key" (optional) updates the row whose value in that column matches, instead of adding
 *   a new one, so each partner keeps one row as its stage changes.
 * Columns are matched by heading, so the team can reorder them and add its own columns
 * (Owner, Notes, ...); the website never touches columns it does not send.
 * The website never sends bank details, ID numbers or document links.
 */
var SHEETS = ['Expressions of interest', 'Partners', 'Events'];
var DEFAULT_SHEET = 'Expressions of interest';
var TEAM_COLUMNS = ['Owner', 'Notes'];

function doPost(e) {
  try {
    var body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    var secret = PropertiesService.getScriptProperties().getProperty('OPERATOR_SHEET_SECRET');
    if (!secret || body.secret !== secret) return reply({ ok: false, error: 'bad secret' });
    if (!Array.isArray(body.row) || body.row.length === 0) return reply({ ok: false, error: 'empty row' });
    var name = SHEETS.indexOf(body.sheet) >= 0 ? body.sheet : DEFAULT_SHEET;

    var lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      writeRow(name, body.row, typeof body.key === 'string' ? body.key : null);
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

function writeRow(name, pairs, key) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name) || ss.insertSheet(name);

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

  // Find the existing row for this key, if any.
  var rowIndex = -1;
  if (key) {
    var keyCol = headers.indexOf(key);
    var keyValue = null;
    pairs.forEach(function (p) { if (String(p[0]) === key) keyValue = String(p[1]); });
    if (keyCol >= 0 && keyValue && sheet.getLastRow() > 1) {
      var keys = sheet.getRange(2, keyCol + 1, sheet.getLastRow() - 1, 1).getValues();
      for (var i = 0; i < keys.length; i++) {
        if (String(keys[i][0]) === keyValue) { rowIndex = i + 2; break; }
      }
    }
  }

  if (rowIndex > 0) {
    // Update only the cells the website sent; team columns stay as they are.
    pairs.forEach(function (p) {
      var cell = sheet.getRange(rowIndex, headers.indexOf(String(p[0])) + 1);
      cell.setNumberFormat('@');
      cell.setValue(p[1] == null ? '' : String(p[1]));
    });
    return;
  }

  var values = headers.map(function () { return ''; });
  pairs.forEach(function (p) {
    values[headers.indexOf(String(p[0]))] = p[1] == null ? '' : String(p[1]);
  });
  var range = sheet.getRange(sheet.getLastRow() + 1, 1, 1, headers.length);
  range.setNumberFormat('@'); // plain text, so +263... numbers keep their plus sign
  range.setValues([values]);
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
