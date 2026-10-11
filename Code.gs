/**
 * ==========================================================================
 * Google Sheets 연동 Post-It To Do List CRUD Google Apps Script (GAS)
 * ==========================================================================
 * 
 * 스프레드시트 컬럼 구조:
 * A: timestamp (고유 식별자 ID 겸 생성 타임스탬프, 예: 1729750000000)
 * B: datetime  (포맷팅된 일시, 예: 2026.10.11 (일) 14:30)
 * C: content   (메모 내용)
 * D: color     (색상: yellow | pink | green | blue)
 * E: state     (카테고리/상태: 할 일 | 아이디어 | 기타)
 * F: order     (표시 순서 / 정렬 번호, 숫자)
 * 
 * API Endpoints:
 * - GET: 목록 조회 (read)
 * - POST: 생성(create), 수정(update), 삭제(delete), 순서 업데이트(reorder)
 */

const SHEET_NAME = "Sheet1"; // 시트 탭 이름 (필요시 변경 가능)

/**
 * 시트 객체 및 헤더 보장 헬퍼 함수
 */
function getTargetSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.getSheets()[0]; // 첫 번째 시트 기본 사용
  }

  // 헤더가 없을 경우 자동 초기화
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["timestamp", "datetime", "content", "color", "state", "order"]);
    sheet.getRange(1, 1, 1, 6).setFontWeight("bold").setBackground("#F4F4F5");
  }

  return sheet;
}

/**
 * 1. GET 요청: 전체 메모 목록 조회 (Read)
 * 요청 예시: GET https://script.google.com/macros/s/.../exec
 */
function doGet(e) {
  try {
    const sheet = getTargetSheet();
    const lastRow = sheet.getLastRow();

    if (lastRow <= 1) {
      // 데이터가 헤더 외에 없는 경우 빈 배열 반환
      return createJsonResponse({ success: true, data: [] });
    }

    // 2행부터 전체 데이터 읽기 (A:F)
    const values = sheet.getRange(2, 1, lastRow - 1, 6).getValues();

    const data = values.map((row) => ({
      timestamp: String(row[0] || ""),
      datetime: String(row[1] || ""),
      content: String(row[2] || ""),
      color: String(row[3] || "yellow"),
      state: String(row[4] || "할 일"),
      order: Number(row[5]) || 0,
    }));

    // order 순서대로 오름차순 정렬
    data.sort((a, b) => a.order - b.order);

    return createJsonResponse({ success: true, data: data });
  } catch (error) {
    return createJsonResponse({ success: false, error: error.toString() });
  }
}

/**
 * 2. POST 요청: 메모 생성(create), 수정(update), 삭제(delete), 순서변경(reorder)
 * 요청 payload: JSON 문자열
 * {
 *   "action": "create" | "update" | "delete" | "reorder",
 *   "data": { ... }
 * }
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  // 동시성 제어를 위해 10초간 대기
  try {
    lock.waitLock(10000);
  } catch (e) {
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
        // [C] Create: 새 포스트잇 추가
        // payload: { timestamp, datetime, content, color, state, order }
        const timestamp = String(payload.timestamp || Date.now());
        const datetime = String(payload.datetime || "");
        const content = String(payload.content || "");
        const color = String(payload.color || "yellow");
        const state = String(payload.state || "할 일");
        const order = Number(payload.order !== undefined ? payload.order : sheet.getLastRow());

        sheet.appendRow([timestamp, datetime, content, color, state, order]);

        return createJsonResponse({
          success: true,
          message: "포스트잇이 성공적으로 등록되었습니다.",
          data: { timestamp, datetime, content, color, state, order },
        });
      }

      case "update": {
        // [U] Update: 특정 timestamp의 메모 수정
        // payload: { timestamp, content, state, color }
        const timestamp = String(payload.timestamp);
        const lastRow = sheet.getLastRow();
        if (lastRow <= 1) {
          return createJsonResponse({ success: false, error: "수정할 데이터가 없습니다." });
        }

        const timestamps = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
        let targetRowIndex = -1;

        for (let i = 0; i < timestamps.length; i++) {
          if (String(timestamps[i][0]) === timestamp) {
            targetRowIndex = i + 2; // 실제 시트 행 번호
            break;
          }
        }

        if (targetRowIndex === -1) {
          return createJsonResponse({ success: false, error: "해당 timestamp의 메모를 찾을 수 없습니다." });
        }

        // 선택적 업데이트
        if (payload.content !== undefined) sheet.getRange(targetRowIndex, 3).setValue(payload.content);
        if (payload.color !== undefined) sheet.getRange(targetRowIndex, 4).setValue(payload.color);
        if (payload.state !== undefined) sheet.getRange(targetRowIndex, 5).setValue(payload.state);
        if (payload.datetime !== undefined) sheet.getRange(targetRowIndex, 2).setValue(payload.datetime);

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
          return createJsonResponse({ success: false, error: "해당 timestamp의 메모를 찾을 수 없습니다." });
        }

        sheet.deleteRow(targetRowIndex);

        return createJsonResponse({
          success: true,
          message: "메모가 성공적으로 삭제되었습니다.",
        });
      }

      case "reorder": {
        // [U] Reorder: 드래그 앤 드롭 정렬 순서 일괄 갱신
        // payload: [{ timestamp: "...", order: 0 }, { timestamp: "...", order: 1 }, ...]
        if (!Array.isArray(payload)) {
          return createJsonResponse({ success: false, error: "reorder 데이터는 배열이어야 합니다." });
        }

        const lastRow = sheet.getLastRow();
        if (lastRow <= 1) {
          return createJsonResponse({ success: true, message: "갱신할 메모가 없습니다." });
        }

        const range = sheet.getRange(2, 1, lastRow - 1, 6);
        const rows = range.getValues();

        const orderMap = {};
        payload.forEach((item) => {
          orderMap[String(item.timestamp)] = item.order;
        });

        for (let i = 0; i < rows.length; i++) {
          const rowTs = String(rows[i][0]);
          if (orderMap[rowTs] !== undefined) {
            rows[i][5] = orderMap[rowTs]; // order 컬럼 (F열)
          }
        }

        range.setValues(rows);

        return createJsonResponse({
          success: true,
          message: "포스트잇 순서가 성공적으로 저장되었습니다.",
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

/**
 * JSON 응답 생성 헬퍼 함수 (CORS 허용)
 */
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON
  );
}
