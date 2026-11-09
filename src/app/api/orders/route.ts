import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isValidHkPhone } from "@/lib/utils";

export async function GET() {
  const orders = db.getAllOrders();
  return NextResponse.json({ orders });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!isValidHkPhone(body.customerPhone)) {
      return NextResponse.json({ error: "請輸入有效的 8 位香港電話號碼" }, { status: 400 });
    }

    if (!body.items || body.items.length === 0) {
      return NextResponse.json({ error: "購物車為空，請至少選購 1 樣新鮮蔬菜" }, { status: 400 });
    }

    const order = db.createOrder({
      customerPhone: body.customerPhone,
      customerName: body.customerName || "街坊",
      estateName: body.estateName || "深水埗蘇屋邨",
      buildingName: body.buildingName || "牡丹樓",
      flatNo: body.flatNo || "未知房號",
      items: body.items,
      totalAmountHkd: body.totalAmountHkd,
      inviteCode: body.inviteCode,
    });

    const config = db.getConfig();

    return NextResponse.json({
      success: true,
      order,
      whatsAppUrl: config.defaultWhatsAppGroupUrl,
      supportWhatsApp: config.supportWhatsApp,
      defaultWechatId: config.defaultWechatId,
    });
  } catch (err: any) {
    console.error("Create order error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
