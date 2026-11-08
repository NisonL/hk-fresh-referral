export interface Estate {
  id: string;
  code: string;
  nameZh: string;
  district: string;
}

export interface Building {
  id: string;
  estateId: string;
  nameZh: string;
  blockCode: string;
}

export interface Leader {
  id: string;
  inviteCode: string; // 专属邀请码，如 HUA888, MING666
  realName: string;   // 称呼，如 華姐, 明哥
  hkPhone: string;    // 8位香港手机号
  wechatId?: string;  // 楼长微信号，如 hua_jie_so_uk
  wechatQrUrl?: string; // 微信群二维码/个人二维码
  estateId: string;
  estateName: string; // 如：深水埗蘇屋邨
  buildingId: string;
  buildingName: string; // 如：牡丹樓
  whatsAppGroupUrl: string; // 该大厦的 WhatsApp 订菜群邀请链接
  parentLeaderId?: string;  // 推荐上级（若有）
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
}

export interface Customer {
  id: string;
  hkPhone: string;          // 8位香港手机号
  realName: string;         // 街坊称呼，如：陳太
  estateId: string;
  estateName: string;
  buildingId: string;
  buildingName: string;     // 所属大厦，如：牡丹樓
  flatNo: string;           // 房号，如：1204室
  isSeniorCitizen: boolean; // 70岁以上长者关爱标识（提供送菜上门）
  boundLeaderId: string;    // 永久锁定的楼长 ID
  boundInviteCode: string;  // 绑定的邀请码
  boundAt: string;          // 绑定时间
}

export interface RegisterPayload {
  inviteCode: string;
  hkPhone: string;
  otp: string;
  realName: string;
  estateId: string;
  buildingId: string;
  flatNo: string;
  isSeniorCitizen: boolean;
}
