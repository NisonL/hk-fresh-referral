import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const phone = searchParams.get("phone");

  let leader = null;
  if (code) {
    leader = db.getLeaderByInviteCode(code);
  } else if (phone) {
    leader = db.getLeaderByPhone(phone);
  }

  if (!leader) {
    return NextResponse.json({ error: "未找到該樓長帳號" }, { status: 404 });
  }

  const customers = db.getCustomersByLeaderId(leader.id);
  const orders = db.getAllOrders().filter((o) => o.directLeaderId === leader.id);
  const mentorOrders = db.getAllOrders().filter((o) => o.mentorLeaderId === leader.id);

  const directCommission = orders.reduce((sum, o) => sum + (o.directLeaderCommission || 0), 0);
  const mentorCommission = mentorOrders.reduce((sum, o) => sum + (o.mentorAllowance || 0), 0);

  return NextResponse.json({
    leader,
    stats: {
      totalCustomers: customers.length,
      totalOrders: orders.length,
      directCommission,
      mentorCommission,
      totalCommission: directCommission + mentorCommission,
    },
    customers,
  });
}
