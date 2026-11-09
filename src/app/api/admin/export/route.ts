import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { formatHkDate } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("mode") || "gate"; // 'gate' 铁闸挂袋 或 'leader' 楼长汇总

  const orders = db.getAllOrders();
  const leaders = db.getAllLeaders();
  const customers = db.getAllCustomers();
  const bom = "\uFEFF"; // UTF-8 BOM 避免 Excel 乱码

  if (mode === "leader") {
    // 模式二：按楼长汇总的大宗自提/交接清册
    const headers = [
      "樓長姓名",
      "邀請碼",
      "聯絡電話",
      "負責大廈",
      "接貨履約方式",
      "關聯訂單總數",
      "累計銷售金額(HK$)",
      "樓長應得津貼(HK$)",
      "業務導師津貼(HK$)",
    ];

    const rows = leaders.map((leader) => {
      const leaderOrders = orders.filter((o) => o.directLeaderId === leader.id);
      const totalAmount = leaderOrders.reduce((sum, o) => sum + (o.totalAmountHkd || 0), 0);
      const totalCommission = leaderOrders.reduce((sum, o) => sum + (o.directLeaderCommission || 0), 0);
      const mentorCommission = orders
        .filter((o) => o.mentorLeaderId === leader.id)
        .reduce((sum, o) => sum + (o.mentorAllowance || 0), 0);

      return [
        `"${leader.realName}"`,
        `"${leader.inviteCode}"`,
        `"${leader.hkPhone}"`,
        `"${leader.buildingName}"`,
        `"自提/樓長分發"`,
        `"${leaderOrders.length}"`,
        `"HK$ ${totalAmount.toFixed(2)}"`,
        `"HK$ ${totalCommission.toFixed(2)}"`,
        `"HK$ ${mentorCommission.toFixed(2)}"`,
      ].join(",");
    });

    const csvContent = bom + [headers.join(","), ...rows].join("\r\n");
    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="leader-handover-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  }

  // 模式一（默认）：晨早防盗铁闸挂袋扫楼清册（按大厦、房号精细排序）
  const headers = [
    "序號",
    "訂單編號",
    "配送時段",
    "所屬屋邨",
    "大廈名稱",
    "房號",
    "街坊稱呼",
    "電話(脫敏)",
    "訂購菜品明細(足500g裝)",
    "實收金額(HK$)",
    "防偽封條號",
    "歸屬樓長",
    "配送狀態",
  ];

  // 按大厦名称与房号排序，方便步兵一行一行扫楼
  const sortedOrders = [...orders].sort((a, b) => {
    if (a.buildingName !== b.buildingName) return a.buildingName.localeCompare(b.buildingName);
    return a.flatNo.localeCompare(b.flatNo);
  });

  const rows = sortedOrders.map((ord, idx) => {
    const maskedPhone = ord.customerPhone ? `${ord.customerPhone.slice(0, 4)}****` : "----";
    const itemsText = ord.items ? ord.items.map((i) => `${i.nameZh} x${i.qty}`).join("；") : "自選蔬菜";
    const sealNo = `SEAL-${ord.orderNo.replace("#", "")}`;

    return [
      `"${idx + 1}"`,
      `"${ord.orderNo}"`,
      `"07:15 - 08:00"`,
      `"${ord.estateName}"`,
      `"${ord.buildingName}"`,
      `"${ord.flatNo}"`,
      `"${ord.customerName}"`,
      `"${maskedPhone}"`,
      `"${itemsText}"`,
      `"HK$ ${ord.totalAmountHkd?.toFixed(2) || "0.00"}"`,
      `"${sealNo}"`,
      `"${ord.directLeaderId ? ord.directLeaderId : "平台公共運力"}"`,
      `"待晨早掛鐵閘"`,
    ].join(",");
  });

  const csvContent = bom + [headers.join(","), ...rows].join("\r\n");
  return new NextResponse(csvContent, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="morning-gate-delivery-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
