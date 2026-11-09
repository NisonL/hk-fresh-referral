import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isValidHkPhone } from "@/lib/utils";
import { RegisterPayload } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body: RegisterPayload = await request.json();

    if (!isValidHkPhone(body.hkPhone)) {
      return NextResponse.json(
        { error: "請輸入正確的 8 位香港電話號碼（4/5/6/7/8/9 開頭）" },
        { status: 400 }
      );
    }

    if (!body.realName || body.realName.trim().length === 0) {
      return NextResponse.json({ error: "請填寫您的稱呼（如：陳太）" }, { status: 400 });
    }

    if (!body.flatNo || body.flatNo.trim().length === 0) {
      return NextResponse.json({ error: "請填寫您的房號（如：1204室）" }, { status: 400 });
    }

    // 执行注册与绑定
    const { customer, isNew } = db.registerCustomer(body);
    const leader = body.inviteCode ? db.getLeaderByInviteCode(body.inviteCode) : null;
    const config = db.getConfig();

    return NextResponse.json({
      success: true,
      isNew,
      message: isNew ? "登記成功！歡迎加入生鮮直通車" : "您已登記過，已為您更新地址資訊！",
      customer: {
        id: customer.id,
        realName: customer.realName,
        estateName: customer.estateName,
        buildingName: customer.buildingName,
        flatNo: customer.flatNo,
        boundLeaderName: leader?.realName || "平台公共專員",
        pointsBalance: customer.pointsBalance || 0,
      },
      whatsAppGroupUrl: leader?.whatsAppGroupUrl || config.defaultWhatsAppGroupUrl,
    });
  } catch (error: any) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: error.message || "系統繁忙，請稍後再試" },
      { status: 500 }
    );
  }
}
