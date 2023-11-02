function onOpen(e) {
//   SpreadsheetApp.getUi()
//   .createMenu('Kaardid')
//   .addItem('Kaardid', 'showSidebar')
//   .addToUi()
}

// on cell update
function onEdit(e) {
  const range = e.range
  const sheet = range.getSheet()
  // If sheet name is not "Kaardid", return
  if (sheet.getName() !== 'Kaardid') {
      return
  }
  const row = range.getRow()
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
  const columnLabel = headers[range.getColumn() - 1]
  const kirjekoodRe = /^EAK-[0-9]{6}$/
  const kirjekoodColumn = 1

  Logger.log(`row: ${row}, columnLabel: ${columnLabel}`)
  Logger.log(sheet.getRange(row, kirjekoodColumn).getValue())
  //  return, if "kirjekood" allready matches regex "^EAK-[0-9]{6}$"
  if ( sheet.getRange(row, kirjekoodColumn).getValue().match(kirjekoodRe) ) {
    return
  }
  // empty the kirjekood cell
  sheet.getRange(row, kirjekoodColumn).setValue('')

  // return, if any of the following columns are FALSE for row:
  // "OkPersoon", "OkFailinimi", "OkKuupäevad"
  const okPersoonColumn = headers.indexOf('OkPersoon') + 1
  const okFailinimiColumn = headers.indexOf('OkFailinimi') + 1
  const okKuupäevadColumn = headers.indexOf('OkKuupäevad') + 1
  const okPersoon = sheet.getRange(row, okPersoonColumn).getValue()
  const okFailinimi = sheet.getRange(row, okFailinimiColumn).getValue()
  const okKuupäevad = sheet.getRange(row, okKuupäevadColumn).getValue()
  if (okFailinimi * okKuupäevad === 0) {
    return
  }

  // Current max of Kirjekood is in column header "kirjekood (15)"
  // Lets regex extract it with "kirjekood \(([0-9]+)\)" and convert to int
  const kirjekoodMaxRe = /^kirjekood \(([0-9]+)\)$/
  const maxKirjekoodMatch = sheet.getRange(1, kirjekoodColumn).getValue().match(kirjekoodMaxRe)
  Logger.log(`maxKirjekoodMatch: ${maxKirjekoodMatch}`)
  const maxKirjekood = parseInt(maxKirjekoodMatch[1])
  const newKirjekood = maxKirjekood + 1
  Logger.log(`maxKirjekood: ${maxKirjekood}, newKirjekood: ${newKirjekood}`)
  sheet.getRange(row, kirjekoodColumn).setValue(newKirjekood)
}

function showSidebar() {
  var html = HtmlService
      .createTemplateFromFile('kaart')
      .evaluate()
      .setTitle('Kaart')
      .setWidth(300)

  SpreadsheetApp.getUi()
      .showSidebar(html)
}

const timer = new Timer('cell2form')
const spreadsheet = SpreadsheetApp.getActiveSpreadsheet()
const sheet = spreadsheet.getActiveSheet()

function cell2form() {

  function getCellData(cell) {
    return cell.getValues()[0][0]
  }
  function getColumnHeading(cell) {
    return cell.getSheet().getRange(1, cell.getColumn()).getValues()[0][0]
  }

  timer.log('cell2form()')
  const selectedRange = spreadsheet.getSelection().getActiveRange()
  timer.log('got active')

  const selectedCellData = {
    sheet: spreadsheet.getSheetName(),
    rangeA1: selectedRange.getA1Notation(),
    columnLabel: ''
  }

  if (selectedRange.getNumColumns() === 1) {
    selectedCellData.columnLabel = getColumnHeading(selectedRange)
    selectedCellData.selected = getCellData(selectedRange)
  }

  return selectedCellData
}

function form2cell() {
}

