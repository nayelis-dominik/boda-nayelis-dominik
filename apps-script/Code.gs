// Recibe las confirmaciones de la invitación y añade una fila por invitado a la hoja "Confirmaciones".
// Instrucciones de instalación en apps-script/INSTRUCCIONES.md.

const SHEET_NAME = 'Confirmaciones';
const COLUMNS = [
  ['Fecha', null],
  ['Nombre', 'name'],
  ['Asistencia', 'attendance'],
  ['Pareja', 'partner'],
  ['Nombre de la pareja', 'partnerName'],
  ['Alergias o intolerancias', 'allergy'],
  ['¿Cuál?', 'allergyDetail'],
  ['Niños', 'kids'],
  ['Nº de niños', 'kidsCount'],
  ['Transporte al banquete', 'bus'],
  ['Canción', 'song'],
];

function doPost(e) {
  const params = (e && e.parameter) || {};
  // Campo trampa invisible: solo lo rellenan los bots.
  if (params.website) return reply({ ok: true });
  if (!String(params.name || '').trim()) return reply({ ok: false, error: 'Falta el nombre' });

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = getSheet();
    const row = COLUMNS.map(([, key]) => key ? clean(params[key]) : new Date());
    sheet.appendRow(row);
  } finally {
    lock.releaseLock();
  }
  return reply({ ok: true });
}

function doGet() {
  return reply({ ok: true, info: 'Formulario de confirmaciones activo' });
}

function getSheet() {
  const book = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = book.getSheetByName(SHEET_NAME) || book.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(COLUMNS.map(([title]) => title));
    sheet.getRange(1, 1, 1, COLUMNS.length).setFontWeight('bold').setBackground('#efe7d4');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// Texto limitado y sin fórmulas: un valor que empieza por = + - @ se guardaría como fórmula.
function clean(value) {
  const text = String(value == null ? '' : value).trim().slice(0, 600);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function reply(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON);
}
