import { NextResponse } from "next/server";

export async function GET() {
  const scriptUrl = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL;
  if (!scriptUrl) {
    return NextResponse.json(
      { success: false, error: "NEXT_PUBLIC_GOOGLE_SCRIPT_URL 환경변수가 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(scriptUrl, {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      throw new Error(`Google Script returned ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("GET error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch from Google Sheets" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const scriptUrl = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL;
  if (!scriptUrl) {
    return NextResponse.json(
      { success: false, error: "NEXT_PUBLIC_GOOGLE_SCRIPT_URL 환경변수가 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  try {
    const payload = await request.json();

    // Google Apps Script는 text/plain POST를 통해 302 리디렉션 처리
    const res = await fetch(scriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
      redirect: "follow",
    });

    if (!res.ok) {
      throw new Error(`Google Script returned ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("POST error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to post to Google Sheets" },
      { status: 500 }
    );
  }
}
