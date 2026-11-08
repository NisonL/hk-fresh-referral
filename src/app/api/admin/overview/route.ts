import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const leaders = db.getAllLeaders();
  const customers = db.getAllCustomers();

  const totalLeaders = leaders.length;
  const totalCustomers = customers.length;
  const seniorCount = customers.filter((c) => c.isSeniorCitizen).length;

  return NextResponse.json({
    stats: {
      totalLeaders,
      totalCustomers,
      seniorCount,
    },
    leaders: leaders.map((l) => {
      const boundCount = customers.filter((c) => c.boundLeaderId === l.id).length;
      return {
        ...l,
        boundCount,
      };
    }),
    customers,
  });
}
