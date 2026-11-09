import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isValidHkPhone } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const phone = searchParams.get("phone") || "";

  if (!phone || !isValidHkPhone(phone)) {
    return NextResponse.json({ error: "請提供有效的 8 位香港手機號" }, { status: 400 });
  }

  const result = db.getCustomerPoints(phone);
  return NextResponse.json({
    phone,
    customer: result.customer
      ? {
          realName: result.customer.realName,
          estateName: result.customer.estateName,
          buildingName: result.customer.buildingName,
          flatNo: result.customer.flatNo,
          pointsBalance: result.customer.pointsBalance || 0,
          ordersCount: result.customer.ordersCount || 0,
        }
      : null,
    availablePoints: result.availablePoints,
    canRedeemVeggies: result.canRedeemVeggies,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, points = 100 } = body;

    if (!isValidHkPhone(phone)) {
      return NextResponse.json({ error: "請輸入有效的 8 位香港電話號碼" }, { status: 400 });
    }

    const ok = db.redeemCustomerPoints(phone, points);
    if (!ok) {
      return NextResponse.json({ error: "積分餘額不足，無法兌換" }, { status: 400 });
    }

    const updated = db.getCustomerPoints(phone);
    return NextResponse.json({
      success: true,
      message: `成功使用 ${points} 積分兌換 1 包新鮮蔬菜！將在下次晨早掛閘時一併送達`,
      availablePoints: updated.availablePoints,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
