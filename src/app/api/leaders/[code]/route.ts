import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { BRANDING_CONFIG } from "@/config/branding";

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  const code = params.code;
  const leader = db.getLeaderByInviteCode(code);

  if (!leader) {
    return NextResponse.json(
      { error: "未找到該樓長專屬碼，請核對二維碼連結" },
      { status: 404 }
    );
  }

  const estates = db.getEstates();
  const buildings = db.getBuildings();

  return NextResponse.json({
    leader: {
      inviteCode: leader.inviteCode,
      realName: leader.realName,
      estateId: leader.estateId,
      estateName: leader.estateName,
      buildingId: leader.buildingId,
      buildingName: leader.buildingName,
      whatsAppGroupUrl: leader.whatsAppGroupUrl || BRANDING_CONFIG.defaultWhatsAppGroupUrl,
    },
    estates,
    buildings,
    branding: {
      brandName: BRANDING_CONFIG.brandName,
      brandSubtitle: BRANDING_CONFIG.brandSubtitle,
      slogan: BRANDING_CONFIG.slogan,
      leaderTitle: BRANDING_CONFIG.leaderTitle,
      leaderPrefix: BRANDING_CONFIG.leaderPrefix,
      originBadge: BRANDING_CONFIG.originBadge,
    },
  });
}
