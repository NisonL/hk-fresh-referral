import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const leaders = db.getAllLeaders();
  return NextResponse.json({ leaders });
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: "Missing leader id" }, { status: 400 });

    const updated = db.updateLeader(id, updates);
    return NextResponse.json({ success: true, leader: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
