import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const leaders = db.getAllLeaders();
  const customers = db.getAllCustomers();
  const orders = db.getAllOrders();
  const products = db.getAllProducts();
  const config = db.getConfig();
  const buildingStats = db.getBuildingStats();
  const kocLeaderboard = db.getKocLeaderboard();

  const totalOrders = orders.length;
  const totalGmv = orders.reduce((sum, o) => sum + (o.totalAmountHkd || 0), 0);
  const totalCommissions = orders.reduce(
    (sum, o) => sum + (o.directLeaderCommission || 0) + (o.mentorAllowance || 0),
    0
  );

  const estates = db.getEstates();

  return NextResponse.json({
    stats: {
      totalLeaders: leaders.length,
      totalCustomers: customers.length,
      totalOrders,
      totalGmv: +totalGmv.toFixed(2),
      totalCommissions: +totalCommissions.toFixed(2),
      blankBuildingsCount: buildingStats.filter((b) => b.status === "VACANT_ACTIVE").length,
    },
    config,
    buildingStats,
    kocLeaderboard,
    leaders,
    customers,
    products,
    orders,
    estates,
  });
}
