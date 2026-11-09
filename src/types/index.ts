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
  assignedLeaderId?: string | null;
}

export interface Leader {
  id: string;
  inviteCode: string;       // 专属邀请码，如 HUA888, CHAN888
  realName: string;         // 称呼，如 華姐, 陳太
  hkPhone: string;          // 8位香港手机号
  wechatId?: string;        // 楼长微信号
  wechatQrUrl?: string;     // 微信群二维码/个人二维码
  estateId: string;
  estateName: string;       // 如：深水埗蘇屋邨
  buildingId: string;
  buildingName: string;     // 如：牡丹樓
  whatsAppGroupUrl: string; // WhatsApp 订菜群邀请链接
  parentLeaderId?: string | null; // 带教业务导师 ID（若有）
  status: "ACTIVE" | "INACTIVE";
  isSelfDelivery?: boolean; // 【单人个性化打勾】：是否自行配送挂闸（打勾得运力费，不打勾则由平台统配）
  calcMode?: "PER_ORDER" | "PER_CATTY"; // 计酬方式：按单 or 按斤
  totalCommissionEarned?: number; // 累计赚取津贴 (HK$)
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
  boundLeaderId: string;    // 绑定的楼长 ID（无楼长大厦为 SYSTEM_RUNNER）
  boundInviteCode: string;  // 绑定的邀请码（无楼长为 PUBLIC）
  referrerPhone?: string | null; // 街坊转介绍人电话
  pointsBalance?: number;   // 买菜积分钱包（100分换1包菜）
  ordersCount?: number;     // 累计下单次数
  totalSpent?: number;      // 累计下单金额
  boundAt: string;          // 绑定时间
}

export interface Product {
  id: string;
  nameZh: string;           // 菜品名称，如：寧夏菜心苗
  subTitle: string;         // 规格与卖点，如：足500g保鮮裝 · 爽脆鮮嫩
  priceHkd: number;         // 街坊特惠零售价 (HK$)
  marketPriceHkd: number;   // 旺角街市参考价 (HK$)
  netWeight: string;        // 净重，如：500g
  imageUrl: string;         // 展示图片
  tag?: string;             // 标签，如：必搶爆款 / 街坊最愛
  inStock: boolean;         // 是否有货
}

export interface OrderItem {
  productId: string;
  nameZh: string;
  qty: number;
  priceHkd: number;
  netWeight: string;
}

export interface Order {
  id: string;
  orderNo: string;          // 订单编号，如 #SU-1025
  customerPhone: string;
  customerName: string;
  estateName: string;
  buildingName: string;
  flatNo: string;
  items: OrderItem[];
  totalAmountHkd: number;
  status: "PENDING_CONFIRMATION" | "DELIVERED" | "CANCELLED";
  directLeaderId?: string | null;
  directLeaderCommission?: number;
  mentorLeaderId?: string | null;
  mentorAllowance?: number;
  runnerDeliveryFee?: number;
  referrerPhone?: string | null;
  referrerBonusPoints?: number;
  createdAt: string;
}

export interface AppConfig {
  brandName: string;
  brandSubtitle: string;
  slogan: string;
  deliveryNotice: string;
  defaultWhatsAppGroupUrl: string;
  defaultWechatId: string;
  supportWhatsApp: string;
  freeShippingThreshold: number; // 满额包邮门槛 (默认 18.9 或 19.9)

  // 【全局规则打勾开关】
  enableLeaderCommission: boolean; // 是否启用楼长服务津贴 (打勾启用)
  leaderCommissionRate: number;    // 楼长服务津贴 (默认 2.00)
  
  enableMentorAllowance: boolean;  // 是否启用业务导师带教津贴 (打勾启用)
  mentorAllowanceRate: number;     // 导师带教津贴 (默认 0.50)

  enableRunnerDelivery: boolean;   // 是否启用步兵晨早挂闸运力费 (打勾启用)
  runnerDeliveryFee: number;       // 牙仔挂闸运力费 (默认 2.00)

  enableReferralPoints: boolean;   // 是否启用街坊转介绍买菜积分 (打勾启用)
  referralPointsPerOrder: number;  // 推荐人每单赠送买菜积分 (默认 100)
}

export interface RegisterPayload {
  inviteCode?: string;
  hkPhone: string;
  otp?: string;
  realName: string;
  estateId: string;
  buildingId: string;
  flatNo: string;
  referrerPhone?: string;
}
