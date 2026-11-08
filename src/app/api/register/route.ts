import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isValidHkPhone } from "@/lib/utils";
import { RegisterPayload } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body: RegisterPayload = await request.json();

    // 1. 基础校验
    if (!body.inviteCode) {
      return NextResponse.json({ error: "缺少樓長邀請碼" }, { status: 400 });
    }

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

    // 2. 验证码校验（当前为测试阶段支持 1234，或者任何4位数字；预留后续接入 Twilio/阿里云国际）
    const cleanOtp = (body.otp || "").trim();
    if (cleanOtp.length < 4) {
      return NextResponse.json({ error: "請輸入 4 位驗證碼（測試環境輸入 1234 即可）" }, { status: 400 });
    }

    // 3. 执行持久化绑定与注册
    const { customer, isNew } = db.registerCustomer(body);
    const leader = db.getLeaderByInviteCode(body.inviteCode);

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
        boundLeaderName: leader?.realName,
      },
      whatsAppGroupUrl: leader?.whatsAppGroupUrl,
    });
  } catch (error: any) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: error.message || "系統繁忙，請稍後再試" },
      { status: 500 }
    );
  }
}
