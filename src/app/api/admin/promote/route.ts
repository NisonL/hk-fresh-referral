import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerPhone, newInviteCode, assignedBuildingId, mentorLeaderId } = body;

    if (!customerPhone || !newInviteCode || !assignedBuildingId) {
      return NextResponse.json({ error: "缺少必要參數 (電話, 邀請碼, 指派大廈)" }, { status: 400 });
    }

    const result = db.promoteCustomerToLeader({
      customerPhone,
      newInviteCode,
      assignedBuildingId,
      mentorLeaderId,
    });

    return NextResponse.json({
      success: true,
      message: `成功將該街坊晉升為【${result.newLeader.buildingName}】愛心樓長！`,
      ...result,
    });
  } catch (err: any) {
    console.error("Promote error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
