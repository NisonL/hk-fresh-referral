import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { formatHkDate } from "@/lib/utils";

export async function GET() {
  const customers = db.getAllCustomers();
  const leaders = db.getAllLeaders();
  const leaderMap = new Map(leaders.map((l) => [l.id, l]));

  // CSV 表头
  const headers = [
    "登記時間",
    "街坊姓名",
    "香港電話",
    "所屬屋邨",
    "大廈房號",
    "70歲長者送菜",
    "歸屬樓長",
    "樓長邀請碼",
  ];

  const rows = customers.map((c) => {
    const leader = leaderMap.get(c.boundLeaderId);
    return [
      `"${formatHkDate(c.boundAt)}"`,
      `"${c.realName}"`,
      `"${c.hkPhone}"`,
      `"${c.estateName}"`,
      `"${c.buildingName} ${c.flatNo}"`,
      `"${c.isSeniorCitizen ? "是 (愛心送戶)" : "否 (自提)"}"`,
      `"${leader?.realName || c.boundLeaderId}"`,
      `"${c.boundInviteCode}"`,
    ].join(",");
  });

  // 添加 UTF-8 BOM 确保 Windows Excel 打开不乱码
  const bom = "\uFEFF";
  const csvContent = bom + [headers.join(","), ...rows].join("\r\n");

  return new NextResponse(csvContent, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="hk-fresh-customers-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
