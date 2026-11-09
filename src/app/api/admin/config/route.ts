import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const config = db.getConfig();
  return NextResponse.json({ config });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = db.updateConfig(body);
    return NextResponse.json({ success: true, config: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
