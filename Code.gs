/**
 * ==========================================================================
 * Google Sheets 연동 Post-It To Do List CRUD Google Apps Script (GAS)
 * ==========================================================================
 * 
 * 구글 시트 정확한 열(Column) 구조 (총 7개 컬럼 A:G):
 * A (col 1): timestamp (고유 식별자 ID, 숫자/문자열)
 * B (col 2): datetime  (작성 일시, 예: 2026.10.11 (일) 14:30)
 * C (col 3): category  (카테고리/범주: 할 일 | 아이디어 | 기타)
 * D (col 4): content   (메모 내용 본문)
 * E (col 5): color     (노랑/분홍/초록/파랑: yellow | pink | green | blue)
 * F (col 6): state     (상태: 할 일 | 진행중 | 완료 등, 기본 카테고리와 연동)
 * G (col 7): order     (정렬 순서 / 인덱스, 0, 1, 2, ...)
 * 
 * API Endpoints:
 * - GET: 목록 조회 (Read)
 * - POST: 생성(create), 수정(update), 삭제(delete), 순서 동기화(reorder)
 */

const SHEET_NAME = "Sheet1";

/**
 * 시트 객체 및 7개 헤더 컬럼 검증/초기화 헬퍼 함수
 */
function getTargetSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.getSheets()[0];
  }

  // 헤더가 비어있거나 부족한 경우 7개 컬럼 헤더 자동 설정
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["timestamp", "datetime", "category", "content", "color", "state", "order"]);
    sheet.getRange(1, 1, 1, 7).setFontWeight("bold").setBackground("#F4F4F5");
  } else {
    // 1행 1~7열 헤더 검증
    const headers = sheet.getRange(1, 1, 1, 7).getValues()[0];
    if (headers[2] !== "category" || headers[6] !== "order") {
      sheet.getRange(1, 1, 1, 7).setValues([["timestamp", "datetime", "category", "content", "color", "state", "order"]]);
    }
  }

  return sheet;
}

/**
 * 1. GET 요청: 전체 메모 목록 조회 (Read)
 * A:G 7개 컬럼을 정확한 필드명으로 매핑하여 반환
 */
function doGet(e) {
  try {
    const sheet = getTargetSheet();
    const lastRow = sheet.getLastRow();

    if (lastRow <= 1) {
      return createJsonResponse({ success: true, data: [] });
    }

    // 2행부터 마지막 행까지 A열(1) ~ G열(7) 데이터 읽기
    const values = sheet.getRange(2, 1, lastRow - 1, 7).getValues();

    const data = values.map((row, idx) => {
      const orderVal = row[6];
      const parsedOrder = (orderVal !== "" && orderVal !== null && !isNaN(Number(orderVal)))
        ? Number(orderVal)
        : idx;

      return {
        timestamp: String(row[0] || ""),
        datetime: String(row[1] || ""),
        category: String(row[2] || "할 일"),
        content: String(row[3] || ""),
        color: String(row[4] || "yellow"),
        state: String(row[5] || row[2] || "할 일"),
        order: parsedOrder,
      };
    });

    // order 기준 오름차순 정렬
    data.sort((a, b) => a.order - b.order);

    return createJsonResponse({ success: true, data: data });
  } catch (error) {
    return createJsonResponse({ success: false, error: error.toString() });
  }
}

/**
 * 2. POST 요청: 메모 생성(create), 수정(update), 삭제(delete), 순서변경(reorder)
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  } catch (err) {
    return createJsonResponse({ success: false, error: "서버가 혼잡합니다. 잠시 후 다시 시도해주세요." });
  }

  try {
    const sheet = getTargetSheet();
    let body = {};

    if (e && e.postData && e.postData.contents) {
      body = JSON.parse(e.postData.contents);
    } else {
      return createJsonResponse({ success: false, error: "요청 본문(Body) 데이터가 없습니다." });
    }

    const action = body.action;
    const payload = body.data;

    switch (action) {
      case "create": {
        // [C] Create: 새 포스트잇 생성
        // payload: { timestamp, datetime, category, content, color, state, order }
        const timestamp = String(payload.timestamp || Date.now());
        const datetime = String(payload.datetime || "");
        const category = String(payload.category || payload.state || "할 일");
        const content = String(payload.content || "");
        const color = String(payload.color || "yellow");
        const state = String(payload.state || category || "할 일");
        
        // order가 명시적으로 전달되지 않은 경우 현재 행 순서 기반 계산
        let order = 0;
        if (payload.order !== undefined && payload.order !== null && !isNaN(Number(payload.order))) {
          order = Number(payload.order);
        } else {
          order = Math.max(0, sheet.getLastRow() - 1);
        }

        // A: timestamp, B: datetime, C: category, D: content, E: color, F: state, G: order
        sheet.appendRow([timestamp, datetime, category, content, color, state, order]);

        return createJsonResponse({
          success: true,
          message: "포스트잇이 성공적으로 등록되었습니다.",
          data: { timestamp, datetime, category, content, color, state, order },
        });
      }

      case "update": {
        // [U] Update: 특정 timestamp의 메모 수정
        // payload: { timestamp, category, content, color, state }
        const timestamp = String(payload.timestamp);
        const lastRow = sheet.getLastRow();
        if (lastRow <= 1) {
          return createJsonResponse({ success: false, error: "수정할 데이터가 없습니다." });
        }

        const timestamps = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
        let targetRowIndex = -1;

        for (let i = 0; i < timestamps.length; i++) {
          if (String(timestamps[i][0]) === timestamp) {
            targetRowIndex = i + 2;
            break;
          }
        }

        if (targetRowIndex === -1) {
          return createJsonResponse({ success: false, error: "해당 timestamp의 메모를 찾을 수 없습니다: " + timestamp });
        }

        // A(1): timestamp, B(2): datetime, C(3): category, D(4): content, E(5): color, F(6): state, G(7): order
        if (payload.datetime !== undefined) sheet.getRange(targetRowIndex, 2).setValue(payload.datetime);
        if (payload.category !== undefined) {
          sheet.getRange(targetRowIndex, 3).setValue(payload.category);
          sheet.getRange(targetRowIndex, 6).setValue(payload.category); // state도 함께 동기화
        }
        if (payload.content !== undefined) sheet.getRange(targetRowIndex, 4).setValue(payload.content);
        if (payload.color !== undefined) sheet.getRange(targetRowIndex, 5).setValue(payload.color);
        if (payload.state !== undefined) sheet.getRange(targetRowIndex, 6).setValue(payload.state);
        if (payload.order !== undefined && !isNaN(Number(payload.order))) {
          sheet.getRange(targetRowIndex, 7).setValue(Number(payload.order));
        }

        return createJsonResponse({
          success: true,
          message: "메모가 성공적으로 수정되었습니다.",
        });
      }

      case "delete": {
        // [D] Delete: 특정 timestamp의 메모 삭제
        // payload: { timestamp }
        const timestamp = String(payload.timestamp);
        const lastRow = sheet.getLastRow();
        if (lastRow <= 1) {
          return createJsonResponse({ success: false, error: "삭제할 데이터가 없습니다." });
        }

        const timestamps = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
        let targetRowIndex = -1;

        for (let i = 0; i < timestamps.length; i++) {
          if (String(timestamps[i][0]) === timestamp) {
            targetRowIndex = i + 2;
            break;
          }
        }

        if (targetRowIndex === -1) {
          return createJsonResponse({ success: false, error: "해당 timestamp의 메모를 찾을 수 없습니다: " + timestamp });
        }

        sheet.deleteRow(targetRowIndex);

        return createJsonResponse({
          success: true,
          message: "메모가 성공적으로 삭제되었습니다.",
        });
      }

      case "reorder": {
        // [U] Reorder: 드래그 앤 드롭 순서(G열) 일괄 갱신
        // payload: [{ timestamp: "...", order: 0 }, { timestamp: "...", order: 1 }, ...]
        if (!Array.isArray(payload)) {
          return createJsonResponse({ success: false, error: "reorder 데이터는 배열이어야 합니다." });
        }

        const lastRow = sheet.getLastRow();
        if (lastRow <= 1) {
          return createJsonResponse({ success: true, message: "갱신할 메모가 없습니다." });
        }

        const range = sheet.getRange(2, 1, lastRow - 1, 7);
        const rows = range.getValues();

        const orderMap = {};
        payload.forEach((item) => {
          orderMap[String(item.timestamp)] = Number(item.order);
        });

        for (let i = 0; i < rows.length; i++) {
          const rowTs = String(rows[i][0]);
          if (orderMap[rowTs] !== undefined) {
            rows[i][6] = orderMap[rowTs]; // G열 (col 7, index 6)
          }
        }

        range.setValues(rows);

        return createJsonResponse({
          success: true,
          message: "포스트잇 순서(order)가 성공적으로 저장되었습니다.",
        });
      }

      default:
        return createJsonResponse({ success: false, error: "지원하지 않는 action입니다: " + action });
    }
  } catch (error) {
    return createJsonResponse({ success: false, error: error.toString() });
  } finally {
    lock.releaseLock();
  }
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON
  );
}
