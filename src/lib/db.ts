import fs from "fs";
import path from "path";
import {
  Estate,
  Building,
  Leader,
  Customer,
  Product,
  Order,
  AppConfig,
  RegisterPayload,
} from "@/types";

interface DbSchema {
  config: AppConfig;
  estates: Estate[];
  buildings: Building[];
  leaders: Leader[];
  customers: Customer[];
  products: Product[];
  orders: Order[];
}

const DB_FILE_PATH = path.join(process.cwd(), "data", "store.json");

const INITIAL_CONFIG: AppConfig = {
  brandName: "供港優鮮",
  brandSubtitle: "屋邨直通車",
  slogan: "東莞潤豐源頭直供 · 晨採午達 · 街坊特惠比街市平3成",
  deliveryNotice: "📢【蘇屋街坊】每日清晨 07:15 - 08:00 晨早防盜鐵閘掛袋便民配送，請於上午 08:30 前取入屋內。次日免費補送新鮮蔬菜，守護街坊一日三餐！",
  defaultWhatsAppGroupUrl: "https://chat.whatsapp.com/demo-so-uk-official",
  defaultWechatId: "hk_fresh_official",
  supportWhatsApp: "85291234567",
  freeShippingThreshold: 18.9,

  // 全局计算方式开关（打勾启用，不打勾则不计算）
  enableLeaderCommission: true,
  leaderCommissionRate: 2.0,
  enableMentorAllowance: true,
  mentorAllowanceRate: 0.5,
  enableRunnerDelivery: true,
  runnerDeliveryFee: 2.0,
  enableReferralPoints: true,
  referralPointsPerOrder: 100,

  // 全局展示打勾开关（打勾展示对比，不打勾则全站隐藏）
  showMarketPriceComparison: true,
};

const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    nameZh: "寧夏菜心苗 (精選足斤)",
    subTitle: "足500g保鮮裝 · 爽脆鮮甜嫩無渣 · 供港爆款",
    priceHkd: 9.1,
    marketPriceHkd: 14.0,
    netWeight: "500g",
    imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=60",
    tag: "必搶爆款",
    inStock: true,
    isActive: true,
    showMarketPrice: true,
  },
  {
    id: "prod-2",
    nameZh: "東莞甜脆生菜 (綠色無公害)",
    subTitle: "足500g保鮮裝 · 晨早露水摘採 · 炒灼皆宜",
    priceHkd: 7.0,
    marketPriceHkd: 11.0,
    netWeight: "500g",
    imageUrl: "https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=500&auto=format&fit=crop&q=60",
    tag: "街坊最愛",
    inStock: true,
    isActive: true,
    showMarketPrice: true,
  },
  {
    id: "prod-3",
    nameZh: "鮮嫩小芥蘭 (清甜爽口)",
    subTitle: "足500g保鮮裝 · 潤豐出廠預冷 · 薑汁炒極正",
    priceHkd: 7.9,
    marketPriceHkd: 12.0,
    netWeight: "500g",
    imageUrl: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&auto=format&fit=crop&q=60",
    tag: "清甜嫩口",
    inStock: true,
    isActive: true,
    showMarketPrice: true,
  },
  {
    id: "prod-4",
    nameZh: "爽脆無渣青瓜 (本地農場直運)",
    subTitle: "足500g (約2條裝) · 翠綠多汁 · 拍青瓜開胃必備",
    priceHkd: 6.9,
    marketPriceHkd: 10.0,
    netWeight: "500g",
    imageUrl: "https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=500&auto=format&fit=crop&q=60",
    tag: "消暑必選",
    inStock: true,
    isActive: true,
    showMarketPrice: true,
  },
  {
    id: "prod-5",
    nameZh: "高山甜嫩白菜仔 (鮮嫩幼滑)",
    subTitle: "足500g保鮮裝 · 葉嫩梗甜 · 滾湯快炒極佳",
    priceHkd: 6.8,
    marketPriceHkd: 10.0,
    netWeight: "500g",
    imageUrl: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=500&auto=format&fit=crop&q=60",
    tag: "特惠日常",
    inStock: true,
    isActive: true,
    showMarketPrice: true,
  },
  {
    id: "prod-6",
    nameZh: "潤豐甜砂番茄 (自然熟甜)",
    subTitle: "足500g (約3-4個) · 果香濃郁沙瓤 · 番茄炒蛋首選",
    priceHkd: 7.8,
    marketPriceHkd: 12.0,
    netWeight: "500g",
    imageUrl: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=60",
    tag: "沙瓤濃香",
    inStock: true,
    isActive: true,
    showMarketPrice: true,
  },
  {
    id: "prod-7",
    nameZh: "綠野水瓜/絲瓜 (鮮嫩清甜)",
    subTitle: "足500g (1條裝) · 刮皮清甜嫩滑 · 魚湯滾絲瓜絕配",
    priceHkd: 8.5,
    marketPriceHkd: 13.0,
    netWeight: "500g",
    imageUrl: "https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=500&auto=format&fit=crop&q=60",
    tag: "清甜滾湯",
    inStock: true,
    isActive: true,
    showMarketPrice: true,
  },
  {
    id: "prod-8",
    nameZh: "鮮甜有機西蘭花 (緊實脆嫩)",
    subTitle: "足500g (1個大顆裝) · 蕾粒細密嫩翠 · 營養滿分",
    priceHkd: 8.9,
    marketPriceHkd: 14.0,
    netWeight: "500g",
    imageUrl: "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=500&auto=format&fit=crop&q=60",
    tag: "健康輕食",
    inStock: true,
    isActive: true,
    showMarketPrice: true,
  },
];

// 苏屋邨全部 14 座大厦完整法定名册
const SO_UK_BUILDINGS: Building[] = [
  { id: "bldg-peony", estateId: "estate-so-uk", nameZh: "牡丹樓", blockCode: "PEONY", assignedLeaderId: "leader-hua" },
  { id: "bldg-camellia", estateId: "estate-so-uk", nameZh: "茶花樓", blockCode: "CAMELLIA", assignedLeaderId: null },
  { id: "bldg-jinju", estateId: "estate-so-uk", nameZh: "金菊樓", blockCode: "JINJU", assignedLeaderId: null },
  { id: "bldg-azalea", estateId: "estate-so-uk", nameZh: "杜鵑樓", blockCode: "AZALEA", assignedLeaderId: null },
  { id: "bldg-greenwillow", estateId: "estate-so-uk", nameZh: "綠柳樓", blockCode: "GREENWILLOW", assignedLeaderId: null },
  { id: "bldg-cherry", estateId: "estate-so-uk", nameZh: "櫻桃樓", blockCode: "CHERRY", assignedLeaderId: null },
  { id: "bldg-lotus", estateId: "estate-so-uk", nameZh: "荷花樓", blockCode: "LOTUS", assignedLeaderId: null },
  { id: "bldg-orchid", estateId: "estate-so-uk", nameZh: "蘭花樓", blockCode: "ORCHID", assignedLeaderId: null },
  { id: "bldg-marigold", estateId: "estate-so-uk", nameZh: "壽菊樓", blockCode: "MARIGOLD", assignedLeaderId: null },
  { id: "bldg-lily", estateId: "estate-so-uk", nameZh: "百合樓", blockCode: "LILY", assignedLeaderId: null },
  { id: "bldg-maple", estateId: "estate-so-uk", nameZh: "楓林樓", blockCode: "MAPLE", assignedLeaderId: null },
  { id: "bldg-lilac", estateId: "estate-so-uk", nameZh: "丁香樓", blockCode: "LILAC", assignedLeaderId: null },
  { id: "bldg-gladiolus", estateId: "estate-so-uk", nameZh: "劍蘭樓", blockCode: "GLADIOLUS", assignedLeaderId: null },
  { id: "bldg-begonia", estateId: "estate-so-uk", nameZh: "海棠樓", blockCode: "BEGONIA", assignedLeaderId: null },
];

const INITIAL_DATA: DbSchema = {
  config: INITIAL_CONFIG,
  estates: [
    { id: "estate-so-uk", code: "SO_UK", nameZh: "深水埗蘇屋邨", district: "深水埗區" },
    { id: "estate-yau-oi", code: "YAU_OI", nameZh: "屯門友愛邨", district: "屯門區" },
  ],
  buildings: SO_UK_BUILDINGS,
  leaders: [
    {
      id: "leader-hua",
      inviteCode: "HUA888",
      realName: "華姐",
      hkPhone: "91234567",
      wechatId: "hua_jie_so_uk",
      estateId: "estate-so-uk",
      estateName: "深水埗蘇屋邨",
      buildingId: "bldg-peony",
      buildingName: "牡丹樓",
      whatsAppGroupUrl: "https://chat.whatsapp.com/demo-so-uk-peony",
      parentLeaderId: null,
      status: "ACTIVE",
      totalCommissionEarned: 16.0,
      createdAt: "2026-10-25T10:00:00Z",
    },
  ],
  customers: [
    {
      id: "cust-1",
      hkPhone: "91112233",
      realName: "陳太",
      estateId: "estate-so-uk",
      estateName: "深水埗蘇屋邨",
      buildingId: "bldg-peony",
      buildingName: "牡丹樓",
      flatNo: "1204室",
      boundLeaderId: "leader-hua",
      boundInviteCode: "HUA888",
      referrerPhone: null,
      pointsBalance: 500, // 积累了 500 积分
      ordersCount: 8,     // 高频下单 8 次
      totalSpent: 162.8,
      boundAt: "2026-10-28T09:15:00Z",
    },
    {
      id: "cust-2",
      hkPhone: "92223344",
      realName: "李生",
      estateId: "estate-so-uk",
      estateName: "深水埗蘇屋邨",
      buildingId: "bldg-peony",
      buildingName: "牡丹樓",
      flatNo: "0802室",
      boundLeaderId: "leader-hua",
      boundInviteCode: "HUA888",
      referrerPhone: "91112233", // 由陈太推荐
      pointsBalance: 100,
      ordersCount: 4,
      totalSpent: 83.6,
      boundAt: "2026-10-29T10:20:00Z",
    },
    {
      id: "cust-3",
      hkPhone: "93334455",
      realName: "張太",
      estateId: "estate-so-uk",
      estateName: "深水埗蘇屋邨",
      buildingId: "bldg-jinju", // 金菊楼
      buildingName: "金菊樓",
      flatNo: "1503室",
      boundLeaderId: "leader-hua",
      boundInviteCode: "HUA888",
      referrerPhone: "91112233", // 由陈太推荐
      pointsBalance: 200,
      ordersCount: 5,
      totalSpent: 104.5,
      boundAt: "2026-10-30T14:10:00Z",
    },
    {
      id: "cust-4",
      hkPhone: "94445566",
      realName: "梁伯",
      estateId: "estate-so-uk",
      estateName: "深水埗蘇屋邨",
      buildingId: "bldg-jinju", // 金菊楼
      buildingName: "金菊樓",
      flatNo: "0401室",
      boundLeaderId: "leader-hua",
      boundInviteCode: "HUA888",
      referrerPhone: "91112233", // 由陈太推荐
      pointsBalance: 0,
      ordersCount: 3,
      totalSpent: 62.7,
      boundAt: "2026-11-01T08:30:00Z",
    },
    {
      id: "cust-5",
      hkPhone: "95556677",
      realName: "關姐",
      estateId: "estate-so-uk",
      estateName: "深水埗蘇屋邨",
      buildingId: "bldg-jinju", // 金菊楼空白大厦散客
      buildingName: "金菊樓",
      flatNo: "0905室",
      boundLeaderId: "SYSTEM_RUNNER",
      boundInviteCode: "PUBLIC",
      referrerPhone: null,
      pointsBalance: 0,
      ordersCount: 2,
      totalSpent: 39.8,
      boundAt: "2026-11-03T11:45:00Z",
    },
  ],
  products: INITIAL_PRODUCTS,
  orders: [
    {
      id: "ord-1",
      orderNo: "#SU-1001",
      customerPhone: "91112233",
      customerName: "陳太",
      estateName: "深水埗蘇屋邨",
      buildingName: "牡丹樓",
      flatNo: "1204室",
      items: [
        { productId: "prod-1", nameZh: "寧夏菜心苗 (精選足斤)", qty: 1, priceHkd: 9.1, netWeight: "500g" },
        { productId: "prod-2", nameZh: "東莞甜脆生菜 (綠色無公害)", qty: 1, priceHkd: 7.0, netWeight: "500g" },
        { productId: "prod-4", nameZh: "爽脆無渣青瓜 (本地農場直運)", qty: 1, priceHkd: 6.9, netWeight: "500g" },
      ],
      totalAmountHkd: 23.0,
      status: "DELIVERED",
      directLeaderId: "leader-hua",
      directLeaderCommission: 2.0,
      runnerDeliveryFee: 2.0,
      createdAt: "2026-11-08T18:30:00Z",
    },
    {
      id: "ord-2",
      orderNo: "#SU-1002",
      customerPhone: "93334455",
      customerName: "張太",
      estateName: "深水埗蘇屋邨",
      buildingName: "金菊樓",
      flatNo: "1503室",
      items: [
        { productId: "prod-1", nameZh: "寧夏菜心苗 (精選足斤)", qty: 1, priceHkd: 9.1, netWeight: "500g" },
        { productId: "prod-3", nameZh: "鮮嫩小芥蘭 (清甜爽口)", qty: 1, priceHkd: 7.9, netWeight: "500g" },
        { productId: "prod-5", nameZh: "高山甜嫩白菜仔 (鮮嫩幼滑)", qty: 1, priceHkd: 6.8, netWeight: "500g" },
      ],
      totalAmountHkd: 23.8,
      status: "PENDING_CONFIRMATION",
      directLeaderId: "leader-hua",
      directLeaderCommission: 2.0,
      runnerDeliveryFee: 2.0,
      referrerPhone: "91112233",
      referrerBonusPoints: 100,
      createdAt: "2026-11-09T08:15:00Z",
    },
  ],
};

function ensureDb(): DbSchema {
  try {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE_PATH)) {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(INITIAL_DATA, null, 2), "utf-8");
      return INITIAL_DATA;
    }
    const raw = fs.readFileSync(DB_FILE_PATH, "utf-8");
    const data = JSON.parse(raw);
    
    // 平滑升级字段
    if (!data.config) data.config = INITIAL_CONFIG;
    if (data.config.showMarketPriceComparison === undefined) data.config.showMarketPriceComparison = true;
    if (!data.products || data.products.length === 0) {
      data.products = INITIAL_PRODUCTS;
    } else {
      data.products = data.products.map((p: any) => ({
        ...p,
        isActive: p.isActive !== undefined ? p.isActive : true,
        showMarketPrice: p.showMarketPrice !== undefined ? p.showMarketPrice : true,
      }));
    }
    if (!data.orders) data.orders = [];
    if (!data.buildings || data.buildings.length < 14) data.buildings = SO_UK_BUILDINGS;
    
    return data;
  } catch (err) {
    console.error("Failed to read DB file, fallback to initial data", err);
    return INITIAL_DATA;
  }
}

function writeDb(data: DbSchema) {
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write to DB file", err);
  }
}

export const db = {
  // 1. 配置相关
  getConfig(): AppConfig {
    return ensureDb().config || INITIAL_CONFIG;
  },

  updateConfig(updates: Partial<AppConfig>): AppConfig {
    const store = ensureDb();
    store.config = { ...store.config, ...updates };
    writeDb(store);
    return store.config;
  },

  // 2. 基础物理网格
  getEstates(): Estate[] {
    return ensureDb().estates;
  },

  getBuildings(): Building[] {
    return ensureDb().buildings;
  },

  getBuildingsByEstate(estateId: string): Building[] {
    return ensureDb().buildings.filter((b) => b.estateId === estateId);
  },

  // 3. 楼长管理
  getAllLeaders(): Leader[] {
    return ensureDb().leaders;
  },

  getLeaderByInviteCode(code: string): Leader | null {
    if (!code) return null;
    const leaders = ensureDb().leaders;
    return leaders.find((l) => l.inviteCode.toUpperCase() === code.trim().toUpperCase()) || null;
  },

  getLeaderByPhone(phone: string): Leader | null {
    const leaders = ensureDb().leaders;
    const clean = phone.trim().replace(/\D/g, "");
    return leaders.find((l) => l.hkPhone === clean) || null;
  },

  updateLeader(id: string, updates: Partial<Leader>): Leader | null {
    const store = ensureDb();
    const idx = store.leaders.findIndex((l) => l.id === id);
    if (idx < 0) return null;
    store.leaders[idx] = { ...store.leaders[idx], ...updates };
    writeDb(store);
    return store.leaders[idx];
  },

  // 4. 客户与转介绍
  getAllCustomers(): Customer[] {
    return ensureDb().customers;
  },

  getCustomerByPhone(phone: string): Customer | null {
    const clean = phone.trim().replace(/\D/g, "");
    return ensureDb().customers.find((c) => c.hkPhone === clean) || null;
  },

  getCustomersByLeaderId(leaderId: string): Customer[] {
    return ensureDb().customers.filter((c) => c.boundLeaderId === leaderId);
  },

  registerCustomer(payload: RegisterPayload): { customer: Customer; isNew: boolean } {
    const store = ensureDb();
    const cleanPhone = payload.hkPhone.trim().replace(/\D/g, "");

    // 查找目标楼长
    let leader: Leader | null = null;
    if (payload.inviteCode) {
      leader = store.leaders.find(
        (l) => l.inviteCode.toUpperCase() === payload.inviteCode?.trim().toUpperCase()
      ) || null;
    }

    const estate = store.estates.find((e) => e.id === payload.estateId);
    const building = store.buildings.find((b) => b.id === payload.buildingId);

    const estateName = estate ? estate.nameZh : "深水埗蘇屋邨";
    const buildingName = building ? building.nameZh : "未知大廈";

    const existingIndex = store.customers.findIndex((c) => c.hkPhone === cleanPhone);

    if (existingIndex >= 0) {
      // 已注册过：保留原始绑定的楼长（永久锁定，防撬客），更新房号称呼
      const existing = store.customers[existingIndex];
      const updated: Customer = {
        ...existing,
        realName: payload.realName ? payload.realName.trim() : existing.realName,
        flatNo: payload.flatNo ? payload.flatNo.trim() : existing.flatNo,
        estateName,
        buildingName,
      };
      store.customers[existingIndex] = updated;
      writeDb(store);
      return { customer: updated, isNew: false };
    }

    // 全新注册
    const newCustomer: Customer = {
      id: `cust-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      hkPhone: cleanPhone,
      realName: payload.realName.trim(),
      estateId: payload.estateId,
      estateName,
      buildingId: payload.buildingId,
      buildingName,
      flatNo: payload.flatNo.trim(),
      boundLeaderId: leader ? leader.id : "SYSTEM_RUNNER",
      boundInviteCode: leader ? leader.inviteCode : "PUBLIC",
      referrerPhone: payload.referrerPhone ? payload.referrerPhone.trim().replace(/\D/g, "") : null,
      pointsBalance: 0,
      ordersCount: 0,
      totalSpent: 0,
      boundAt: new Date().toISOString(),
    };

    store.customers.unshift(newCustomer);
    writeDb(store);
    return { customer: newCustomer, isNew: true };
  },

  // 5. 商品货架
  getAllProducts(): Product[] {
    return ensureDb().products;
  },

  updateProduct(id: string, updates: Partial<Product>): Product | null {
    const store = ensureDb();
    const idx = store.products.findIndex((p) => p.id === id);
    if (idx < 0) return null;
    store.products[idx] = { ...store.products[idx], ...updates };
    writeDb(store);
    return store.products[idx];
  },

  addProduct(prod: Omit<Product, "id">): Product {
    const store = ensureDb();
    const newProd: Product = {
      ...prod,
      id: `prod-${Date.now()}`,
      isActive: prod.isActive !== undefined ? prod.isActive : true,
      showMarketPrice: prod.showMarketPrice !== undefined ? prod.showMarketPrice : true,
      inStock: prod.inStock !== undefined ? prod.inStock : true,
    };
    store.products.push(newProd);
    writeDb(store);
    return newProd;
  },

  deleteProduct(id: string): boolean {
    const store = ensureDb();
    const idx = store.products.findIndex((p) => p.id === id);
    if (idx < 0) return false;
    store.products.splice(idx, 1);
    writeDb(store);
    return true;
  },

  // 6. 订单流转与佣金分账
  getAllOrders(): Order[] {
    return ensureDb().orders;
  },

  getCustomerPoints(phone: string): { customer: Customer | null; availablePoints: number; canRedeemVeggies: number } {
    const store = ensureDb();
    const clean = phone.trim().replace(/\D/g, "");
    const cust = store.customers.find((c) => c.hkPhone === clean) || null;
    const availablePoints = cust?.pointsBalance || 0;
    return {
      customer: cust,
      availablePoints,
      canRedeemVeggies: Math.floor(availablePoints / (store.config.referralPointsPerOrder || 100)),
    };
  },

  redeemCustomerPoints(phone: string, pointsToRedeem: number = 100): boolean {
    const store = ensureDb();
    const clean = phone.trim().replace(/\D/g, "");
    const cust = store.customers.find((c) => c.hkPhone === clean);
    if (!cust || (cust.pointsBalance || 0) < pointsToRedeem) return false;
    cust.pointsBalance = (cust.pointsBalance || 0) - pointsToRedeem;
    writeDb(store);
    return true;
  },

  createOrder(payload: {
    customerPhone: string;
    customerName: string;
    estateName: string;
    buildingName: string;
    flatNo: string;
    items: { productId: string; nameZh: string; qty: number; priceHkd: number; netWeight: string }[];
    totalAmountHkd: number;
    inviteCode?: string;
    referrerPhone?: string;
  }): Order {
    const store = ensureDb();
    const config = store.config;
    const cleanPhone = payload.customerPhone.trim().replace(/\D/g, "");
    const cleanRefPhone = payload.referrerPhone ? payload.referrerPhone.trim().replace(/\D/g, "") : null;

    // 查找或自动注册客户
    let cust = store.customers.find((c) => c.hkPhone === cleanPhone);
    const building = store.buildings.find((b) => b.nameZh === payload.buildingName);
    const assignedLeader = building?.assignedLeaderId
      ? store.leaders.find((l) => l.id === building.assignedLeaderId)
      : null;

    if (!cust) {
      // 首次下单自动登记入册
      cust = {
        id: `cust-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        hkPhone: cleanPhone,
        realName: payload.customerName.trim(),
        estateId: "estate-so-uk",
        estateName: payload.estateName,
        buildingId: building?.id || "bldg-peony",
        buildingName: payload.buildingName,
        flatNo: payload.flatNo.trim(),
        boundLeaderId: assignedLeader ? assignedLeader.id : "SYSTEM_RUNNER",
        boundInviteCode: assignedLeader ? assignedLeader.inviteCode : "PUBLIC",
        referrerPhone: cleanRefPhone && cleanRefPhone !== cleanPhone ? cleanRefPhone : null,
        pointsBalance: 0,
        ordersCount: 0,
        totalSpent: 0,
        boundAt: new Date().toISOString(),
      };
      store.customers.unshift(cust);
    } else {
      // 若老客户之前无推荐人，且本次由推荐人链接进入，则补充记录推荐人
      if (!cust.referrerPhone && cleanRefPhone && cleanRefPhone !== cleanPhone) {
        cust.referrerPhone = cleanRefPhone;
      }
    }

    let directLeaderId = cust ? cust.boundLeaderId : null;
    let mentorLeaderId: string | null = null;
    let directLeaderCommission = 0;
    let mentorAllowance = 0;
    let runnerDeliveryFee = config.enableRunnerDelivery ? config.runnerDeliveryFee : 0;
    let referrerBonusPoints = 0;

    // 1. 直属楼长分润计算 (受全局打勾开关与单人自送打勾控制)
    if (directLeaderId && directLeaderId !== "SYSTEM_RUNNER") {
      const leader = store.leaders.find((l) => l.id === directLeaderId);
      if (leader && leader.status === "ACTIVE") {
        // 全局打勾：是否计算楼长服务津贴
        if (config.enableLeaderCommission) {
          directLeaderCommission = config.leaderCommissionRate;
        }

        // 单人个性化打勾：若该楼长自行配送挂铁闸 (isSelfDelivery === true)，运力费直接归该楼长！
        if (leader.isSelfDelivery && config.enableRunnerDelivery) {
          directLeaderCommission += config.runnerDeliveryFee;
        }

        leader.totalCommissionEarned = (leader.totalCommissionEarned || 0) + directLeaderCommission;

        // 2. 带教导师津贴 (受全局打勾开关控制)
        if (config.enableMentorAllowance && leader.parentLeaderId) {
          const mentor = store.leaders.find((m) => m.id === leader.parentLeaderId);
          if (mentor && mentor.status === "ACTIVE") {
            mentorLeaderId = mentor.id;
            mentorAllowance = config.mentorAllowanceRate;
            mentor.totalCommissionEarned = (mentor.totalCommissionEarned || 0) + mentorAllowance;
          }
        }
      }
    }

    // 3. 转介绍街坊买菜积分返利 (受全局打勾开关控制)
    const activeRefPhone = cust.referrerPhone || cleanRefPhone;
    if (config.enableReferralPoints && activeRefPhone && activeRefPhone !== cleanPhone) {
      let referrer = store.customers.find((c) => c.hkPhone === activeRefPhone);
      if (!referrer) {
        referrer = {
          id: `cust-ref-${Date.now()}`,
          hkPhone: activeRefPhone,
          realName: "熱心街坊",
          estateId: "estate-so-uk",
          estateName: payload.estateName,
          buildingId: building?.id || "bldg-peony",
          buildingName: payload.buildingName,
          flatNo: "待補充",
          boundLeaderId: assignedLeader ? assignedLeader.id : "SYSTEM_RUNNER",
          boundInviteCode: assignedLeader ? assignedLeader.inviteCode : "PUBLIC",
          pointsBalance: 0,
          ordersCount: 0,
          totalSpent: 0,
          boundAt: new Date().toISOString(),
        };
        store.customers.push(referrer);
      }
      referrerBonusPoints = config.referralPointsPerOrder || 100;
      referrer.pointsBalance = (referrer.pointsBalance || 0) + referrerBonusPoints;
    }

    // 更新买家消费统计
    cust.ordersCount = (cust.ordersCount || 0) + 1;
    cust.totalSpent = +((cust.totalSpent || 0) + payload.totalAmountHkd).toFixed(2);

    const orderNo = `#SU-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNo,
      customerPhone: cleanPhone,
      customerName: payload.customerName,
      estateName: payload.estateName,
      buildingName: payload.buildingName,
      flatNo: payload.flatNo,
      items: payload.items,
      totalAmountHkd: payload.totalAmountHkd,
      status: "PENDING_CONFIRMATION",
      directLeaderId,
      directLeaderCommission,
      mentorLeaderId,
      mentorAllowance,
      runnerDeliveryFee: config.runnerDeliveryFee,
      referrerPhone: cust.referrerPhone || cleanRefPhone || null,
      referrerBonusPoints,
      createdAt: new Date().toISOString(),
    };

    store.orders.unshift(newOrder);
    writeDb(store);
    return newOrder;
  },

  // 7. 高级功能：网格穿透统计与 KOC 雷达
  getBuildingStats(): Array<{
    buildingId: string;
    buildingName: string;
    blockCode: string;
    leader: Leader | null;
    customerCount: number;
    orderCount: number;
    starProspect: { realName: string; flatNo: string; phone: string; ordersCount: number } | null;
    status: "HAS_LEADER" | "VACANT_ACTIVE" | "UNTOUCHED";
  }> {
    const store = ensureDb();
    return store.buildings.map((bldg) => {
      const leader = store.leaders.find((l) => l.buildingId === bldg.id && l.status === "ACTIVE") || null;
      const customers = store.customers.filter((c) => c.buildingId === bldg.id);
      const orders = store.orders.filter((o) => o.buildingName === bldg.nameZh);

      // 寻找该大厦下单最多的种子街坊
      let starProspect: { realName: string; flatNo: string; phone: string; ordersCount: number } | null = null;
      if (!leader && customers.length > 0) {
        const sorted = [...customers].sort((a, b) => (b.ordersCount || 0) - (a.ordersCount || 0));
        if (sorted[0] && (sorted[0].ordersCount || 0) >= 1) {
          starProspect = {
            realName: sorted[0].realName,
            flatNo: sorted[0].flatNo,
            phone: sorted[0].hkPhone,
            ordersCount: sorted[0].ordersCount || 0,
          };
        }
      }

      let status: "HAS_LEADER" | "VACANT_ACTIVE" | "UNTOUCHED" = "UNTOUCHED";
      if (leader) status = "HAS_LEADER";
      else if (customers.length > 0) status = "VACANT_ACTIVE";

      return {
        buildingId: bldg.id,
        buildingName: bldg.nameZh,
        blockCode: bldg.blockCode,
        leader,
        customerCount: customers.length,
        orderCount: orders.length,
        starProspect,
        status,
      };
    });
  },

  // 获取全邨街坊转介绍 KOC 排行榜（推荐人数量 >= 1）
  getKocLeaderboard(): Array<{
    phone: string;
    realName: string;
    buildingName: string;
    flatNo: string;
    refereeCount: number; // 成功推荐户数
    totalRefereeOrders: number; // 带来总单量
    pointsBalance: number;
    isAlreadyLeader: boolean;
    rating: string;
  }> {
    const store = ensureDb();
    const refMap = new Map<string, { count: number; orders: number }>();

    store.customers.forEach((c) => {
      if (c.referrerPhone) {
        const item = refMap.get(c.referrerPhone) || { count: 0, orders: 0 };
        item.count += 1;
        item.orders += c.ordersCount || 0;
        refMap.set(c.referrerPhone, item);
      }
    });

    const result: Array<any> = [];
    refMap.forEach((val, phone) => {
      const cust = store.customers.find((c) => c.hkPhone === phone);
      if (cust) {
        const isLeader = store.leaders.some((l) => l.hkPhone === phone);
        let rating = "⭐ 萌芽觀察";
        if (val.count >= 5) rating = "⭐⭐⭐⭐⭐ 超級高潛·強烈建議邀約";
        else if (val.count >= 3) rating = "⭐⭐⭐ 優秀活躍·可重點觸達";

        result.push({
          phone: cust.hkPhone,
          realName: cust.realName,
          buildingName: cust.buildingName,
          flatNo: cust.flatNo,
          refereeCount: val.count,
          totalRefereeOrders: val.orders,
          pointsBalance: cust.pointsBalance || 0,
          isAlreadyLeader: isLeader,
          rating,
        });
      }
    });

    return result.sort((a, b) => b.refereeCount - a.refereeCount);
  },

  // 8. 用户跳级升格为楼长（M2L 会员转团长）
  promoteCustomerToLeader(params: {
    customerPhone: string;
    newInviteCode: string;
    assignedBuildingId: string;
    mentorLeaderId?: string | null;
  }): { newLeader: Leader; transferredCount: number } {
    const store = ensureDb();
    const cleanPhone = params.customerPhone.trim().replace(/\D/g, "");
    const cust = store.customers.find((c) => c.hkPhone === cleanPhone);
    if (!cust) throw new Error("找不到該客戶");

    const building = store.buildings.find((b) => b.id === params.assignedBuildingId);
    const newLeaderId = `leader-${cleanPhone.slice(-4)}`;

    const newLeader: Leader = {
      id: newLeaderId,
      inviteCode: params.newInviteCode.toUpperCase().trim(),
      realName: cust.realName,
      hkPhone: cleanPhone,
      estateId: cust.estateId,
      estateName: cust.estateName,
      buildingId: params.assignedBuildingId,
      buildingName: building ? building.nameZh : cust.buildingName,
      whatsAppGroupUrl: `https://chat.whatsapp.com/demo-${params.newInviteCode.toLowerCase()}`,
      parentLeaderId: params.mentorLeaderId || null,
      status: "ACTIVE",
      totalCommissionEarned: 0,
      createdAt: new Date().toISOString(),
    };

    store.leaders.push(newLeader);

    // 绑定大厦
    if (building) {
      building.assignedLeaderId = newLeaderId;
    }

    // 客户资产平移（方案 A 裂变原则：陈太转介绍的人 + 金菊楼散客全部归陈太）
    let transferredCount = 0;
    store.customers.forEach((c) => {
      const isReferredByHer = c.referrerPhone === cleanPhone;
      const isUnattendedInHerBuilding = (c.buildingId === params.assignedBuildingId && c.boundLeaderId === "SYSTEM_RUNNER");

      if (isReferredByHer || isUnattendedInHerBuilding) {
        c.boundLeaderId = newLeaderId;
        c.boundInviteCode = newLeader.inviteCode;
        transferredCount++;
      }
    });

    writeDb(store);
    return { newLeader, transferredCount };
  },
};
