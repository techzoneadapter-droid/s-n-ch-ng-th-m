const SPREADSHEET_ID = '1o6xLDwoTUzStEJF-QBBTf7nzREtddJhuIdCq9XI09_A';
const TARGET_SHEET_GID = 0;

const HEADERS = [
  'Thời gian',
  'Họ và tên',
  'Số điện thoại',
  'Địa chỉ',
  'Màu',
  'Dung tích',
  'Số lượng',
  'Đơn giá',
  'Tạm tính',
  'Giảm giá',
  'Tổng thanh toán',
  'Quà tặng',
  'Vận chuyển',
  'Nguồn',
  'UTM Source',
  'UTM Medium',
  'UTM Campaign',
  'UTM Content',
  'UTM Term',
  'GCLID',
  'FBCLID',
  'Page URL'
];

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const payload = parsePayload_(e);
    const sheet = getTargetSheet_();
    ensureHeader_(sheet);
    sheet.appendRow(buildRow_(payload));
    return json_({success: true});
  } catch (error) {
    console.error(error);
    return json_({
      success: false,
      message: error && error.message ? error.message : 'Unknown error'
    });
  } finally {
    try {
      lock.releaseLock();
    } catch (error) {
      console.warn(error);
    }
  }
}

function parsePayload_(e) {
  if (!e || !e.postData || !e.postData.contents) {
    throw new Error('Missing request body');
  }
  return JSON.parse(e.postData.contents);
}

function getTargetSheet_() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheets().find(item => item.getSheetId() === TARGET_SHEET_GID);
  if (!sheet) {
    throw new Error('Target sheet gid 0 not found');
  }
  return sheet;
}

function ensureHeader_(sheet) {
  if (sheet.getLastRow() > 0) return;
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
}

function buildRow_(payload) {
  return [
    payload.timestamp || new Date().toISOString(),
    string_(payload.fullName),
    string_(payload.phone),
    string_(payload.address),
    string_(payload.color),
    string_(payload.capacity),
    number_(payload.quantity),
    number_(payload.unitPrice),
    number_(payload.subtotal),
    number_(payload.discount),
    number_(payload.total),
    string_(payload.gift),
    string_(payload.shipping),
    string_(payload.source),
    string_(payload.utm_source),
    string_(payload.utm_medium),
    string_(payload.utm_campaign),
    string_(payload.utm_content),
    string_(payload.utm_term),
    string_(payload.gclid),
    string_(payload.fbclid),
    string_(payload.pageUrl)
  ];
}

function string_(value) {
  return value === undefined || value === null ? '' : String(value);
}

function number_(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function json_(body) {
  return ContentService
    .createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON);
}
