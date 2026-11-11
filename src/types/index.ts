export interface Estate {
  id: string;
  code: string;
  nameZh: string;
  district: string;
  freeShippingThresholdOverride?: number; // 战区独立免运门槛 (未填则遵循全局)
  deliveryFeeOverride?: number;           // 战区独立小额运费 (未填则遵循全局)
  runnerDeliveryFeeOverride?: number;     // 战区独立送货员津贴 (如中环可调高)
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
  inviteCode: string;       // 专属邀请码，如 SOUK_LEAFLET, NISON, YUN, NGAI, HUA888
  realName: string;         // 称呼/主体名称，如：公司苏屋地推池、李欣(Nison)、阿运、牙仔、华姐
  roleType?: "COMPANY" | "PARTNER" | "BUILDING_LEADER"; // 账号角色类型
  equityShare?: string;     // 股份或分红说明
  hkPhone: string;          // 8位香港手机号
  wechatId?: string;        // 微信号
  wechatQrUrl?: string;     // 微信二维码
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
  totalOrdersCount?: number;      // 累计绑单数
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
  boundPromoterCode?: string; // 归属拓展渠道码 (SOUK_LEAFLET, NISON, YUN, NGAI, HUA888)
  referrerPhone?: string | null; // 街坊转介绍人电话
  pointsBalance?: number;   // 买菜积分钱包（100分换1包菜）
  ordersCount?: number;     // 累计下单次数
  totalSpent?: number;      // 累计下单金额
  boundAt: string;          // 绑定时间
}

export interface Product {
  id: string;
  nameZh: string;           // 菜品名称，如：寧夏菜心苗
  subTitle: string;         // 规格与卖点描述，如：足500g保鮮裝 · 爽脆鮮嫩
  priceHkd: number;         // 街坊特惠零售价 (HK$)
  marketPriceHkd?: number;  // 旺角街市参考价 (HK$)
  stallSuggestedPriceHkd?: number; // 档口合伙人实地建议价 (AB方案结合)
  stallPriceNote?: string;  // 档口合伙人探店备忘
  showMarketPrice?: boolean;// 【打勾控制】：是否对比/展示街市参考价 (打勾就有，不打勾就没有)
  netWeight: string;        // 净重/规格标牌，如：500g 或 足500T 或 約2-3條
  imageUrl: string;         // 展示图片
  tag?: string;             // 标签，如：必搶爆款 / 街坊最愛 / 當造推薦
  inStock: boolean;         // 库存状态：是否有货
  isActive?: boolean;       // 【打勾控制】：是否上架显示 (打勾上架，不打勾隐藏下架)
  category?: string;        // 分类，如：精選葉菜、爽脆瓜果、滋補煲湯
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
  itemsAmountHkd?: number;  // 菜品小计
  deliveryFeeHkd?: number;  // 运力配送费 (小额订单加收，满额为0)
  totalAmountHkd: number;   // 实付总额
  status: "PENDING_CONFIRMATION" | "DELIVERED" | "CANCELLED";
  directLeaderId?: string | null;
  directLeaderCommission?: number;
  mentorLeaderId?: string | null;
  mentorAllowance?: number;
  runnerDeliveryFee?: number;
  promoterCode?: string;    // 归属拓展代码 (SOUK_LEAFLET, NISON, YUN, NGAI, HUA888)
  referrerPhone?: string | null;
  referrerBonusPoints?: number;
  createdAt: string;
}

export interface AppConfig {
  brandName: string;
  brandSubtitle: string;
  slogan: string;
  originBadge: string;           // 顶部溯源与背书标语，如：廣東東莞石碣潤豐基地直發 · 文錦渡檢驗檢疫放行
  deliveryTimeWindow: string;    // 清晨配送时间段，如：07:15 - 08:00
  deliveryNotice: string;        // 交付约定公告全文
  defaultWhatsAppGroupUrl: string;
  defaultWechatId: string;       // 官方微信客服号，如：hk_fresh_official
  supportWhatsApp: string;       // 官方 WhatsApp 电话，如：85291234567
  partnerMarketName: string;     // 合作街市名称，如：深水埗保安道街市
  partnerStallName: string;      // 合作档口名称，如：128號 新記優鮮
  freeShippingThreshold: number; // 满额包邮门槛 (默认 18.9 或 19.9)
  underThresholdDeliveryFee: number; // 未满门槛运费 (默认 HK$ 5.0)
  enforceMinOrderThreshold: boolean; // 是否启用硬性起送门槛 (打勾则未满门槛不可下单，不打勾则加收运费)

  // 【全局规则打勾开关】
  enableLeaderCommission: boolean; // 是否启用楼长服务津贴 (打勾启用)
  leaderCommissionRate: number;    // 楼长服务津贴 (默认 2.00)
  
  enableMentorAllowance: boolean;  // 是否启用业务导师带教津贴 (打勾启用)
  mentorAllowanceRate: number;     // 导师带教津贴 (默认 0.50)

  enableRunnerDelivery: boolean;   // 是否启用步兵晨早挂闸运力费 (打勾启用)
  runnerDeliveryFee: number;       // 牙仔挂闸运力费 (默认 2.00)

  enableReferralPoints: boolean;   // 是否启用街坊转介绍买菜积分 (打勾启用)
  referralPointsPerOrder: number;  // 推荐人每单赠送买菜积分 (默认 100)

  // 【全局展示打勾开关】
  showMarketPriceComparison: boolean; // 是否全局显示旺角街市参考价对比 (打勾显示对比，不打勾则全站隐藏)
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
