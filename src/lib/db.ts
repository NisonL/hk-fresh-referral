import fs from "fs";
import path from "path";
import { Estate, Building, Leader, Customer, RegisterPayload } from "@/types";

interface DbSchema {
  estates: Estate[];
  buildings: Building[];
  leaders: Leader[];
  customers: Customer[];
}

const DB_FILE_PATH = path.join(process.cwd(), "data", "store.json");

// 初始种子数据
const INITIAL_DATA: DbSchema = {
  estates: [
    {
      id: "estate-so-uk",
      code: "SO_UK",
      nameZh: "深水埗蘇屋邨",
      district: "深水埗區",
    },
    {
      id: "estate-yau-oi",
      code: "YAU_OI",
      nameZh: "屯門友愛邨",
      district: "屯門區",
    },
  ],
  buildings: [
    {
      id: "bldg-peony",
      estateId: "estate-so-uk",
      nameZh: "牡丹樓",
      blockCode: "PEONY",
    },
    {
      id: "bldg-camellia",
      estateId: "estate-so-uk",
      nameZh: "茶花樓",
      blockCode: "CAMELLIA",
    },
    {
      id: "bldg-azalea",
      estateId: "estate-so-uk",
      nameZh: "杜鵑樓",
      blockCode: "AZALEA",
    },
    {
      id: "bldg-greenwillow",
      estateId: "estate-so-uk",
      nameZh: "綠柳樓",
      blockCode: "GREENWILLOW",
    },
    {
      id: "bldg-oi-tak",
      estateId: "estate-yau-oi",
      nameZh: "愛德樓",
      blockCode: "OI_TAK",
    },
    {
      id: "bldg-oi-lai",
      estateId: "estate-yau-oi",
      nameZh: "愛禮樓",
      blockCode: "OI_LAI",
    },
  ],
  leaders: [
    {
      id: "leader-hua",
      inviteCode: "HUA888",
      realName: "華姐",
      hkPhone: "91234567",
      estateId: "estate-so-uk",
      estateName: "深水埗蘇屋邨",
      buildingId: "bldg-peony",
      buildingName: "牡丹樓",
      whatsAppGroupUrl: "https://chat.whatsapp.com/invite-suuk-peony-demo",
      status: "ACTIVE",
      createdAt: "2026-10-25T10:00:00Z",
    },
    {
      id: "leader-ming",
      inviteCode: "MING666",
      realName: "明哥",
      hkPhone: "98765432",
      estateId: "estate-yau-oi",
      estateName: "屯門友愛邨",
      buildingId: "bldg-oi-tak",
      buildingName: "愛德樓",
      whatsAppGroupUrl: "https://chat.whatsapp.com/invite-yauoi-oitak-demo",
      status: "ACTIVE",
      createdAt: "2026-10-26T14:30:00Z",
    },
  ],
  customers: [
    {
      id: "cust-1",
      hkPhone: "92345678",
      realName: "陳太",
      estateId: "estate-so-uk",
      estateName: "深水埗蘇屋邨",
      buildingId: "bldg-peony",
      buildingName: "牡丹樓",
      flatNo: "1204室",
      isSeniorCitizen: false,
      boundLeaderId: "leader-hua",
      boundInviteCode: "HUA888",
      boundAt: "2026-10-28T09:15:00Z",
    },
    {
      id: "cust-2",
      hkPhone: "93456789",
      realName: "李伯 (73歲)",
      estateId: "estate-so-uk",
      estateName: "深水埗蘇屋邨",
      buildingId: "bldg-peony",
      buildingName: "牡丹樓",
      flatNo: "0608室",
      isSeniorCitizen: true,
      boundLeaderId: "leader-hua",
      boundInviteCode: "HUA888",
      boundAt: "2026-10-28T11:40:00Z",
    },
    {
      id: "cust-3",
      hkPhone: "94567890",
      realName: "黃生",
      estateId: "estate-so-uk",
      estateName: "深水埗蘇屋邨",
      buildingId: "bldg-camellia",
      buildingName: "茶花樓",
      flatNo: "1802室",
      isSeniorCitizen: false,
      boundLeaderId: "leader-hua",
      boundInviteCode: "HUA888",
      boundAt: "2026-10-29T16:20:00Z",
    },
  ],
};

// 确保存储目录与文件存在
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
    return JSON.parse(raw);
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
  getEstates(): Estate[] {
    return ensureDb().estates;
  },

  getBuildings(): Building[] {
    return ensureDb().buildings;
  },

  getBuildingsByEstate(estateId: string): Building[] {
    return ensureDb().buildings.filter((b) => b.estateId === estateId);
  },

  getAllLeaders(): Leader[] {
    return ensureDb().leaders;
  },

  getLeaderByInviteCode(code: string): Leader | null {
    const leaders = ensureDb().leaders;
    return leaders.find((l) => l.inviteCode.toUpperCase() === code.trim().toUpperCase()) || null;
  },

  getLeaderByPhone(phone: string): Leader | null {
    const leaders = ensureDb().leaders;
    const clean = phone.trim().replace(/\D/g, "");
    return leaders.find((l) => l.hkPhone === clean) || null;
  },

  getLeaderById(id: string): Leader | null {
    return ensureDb().leaders.find((l) => l.id === id) || null;
  },

  getAllCustomers(): Customer[] {
    return ensureDb().customers;
  },

  getCustomersByLeaderId(leaderId: string): Customer[] {
    return ensureDb().customers.filter((c) => c.boundLeaderId === leaderId);
  },

  registerCustomer(payload: RegisterPayload): { customer: Customer; isNew: boolean } {
    const store = ensureDb();
    const cleanPhone = payload.hkPhone.trim().replace(/\D/g, "");
    
    // 查找目标楼长
    const leader = store.leaders.find(
      (l) => l.inviteCode.toUpperCase() === payload.inviteCode.trim().toUpperCase()
    );
    if (!leader) {
      throw new Error("無效的樓長邀請碼");
    }

    // 查找所属大厦与屋邨名称
    const estate = store.estates.find((e) => e.id === payload.estateId);
    const building = store.buildings.find((b) => b.id === payload.buildingId);

    const estateName = estate ? estate.nameZh : leader.estateName;
    const buildingName = building ? building.nameZh : leader.buildingName;

    // 检查客户是否已存在
    const existingIndex = store.customers.findIndex((c) => c.hkPhone === cleanPhone);

    if (existingIndex >= 0) {
      // 已经注册过：保留原始绑定的楼长（永久归属锁定），但更新房号和称呼
      const existing = store.customers[existingIndex];
      const updated: Customer = {
        ...existing,
        realName: payload.realName || existing.realName,
        flatNo: payload.flatNo || existing.flatNo,
        isSeniorCitizen: payload.isSeniorCitizen,
        estateName,
        buildingName,
      };
      store.customers[existingIndex] = updated;
      writeDb(store);
      return { customer: updated, isNew: false };
    }

    // 全新注册：创建并永久绑定至该楼长
    const newCustomer: Customer = {
      id: `cust-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      hkPhone: cleanPhone,
      realName: payload.realName.trim(),
      estateId: payload.estateId,
      estateName,
      buildingId: payload.buildingId,
      buildingName,
      flatNo: payload.flatNo.trim(),
      isSeniorCitizen: payload.isSeniorCitizen,
      boundLeaderId: leader.id,
      boundInviteCode: leader.inviteCode,
      boundAt: new Date().toISOString(),
    };

    store.customers.unshift(newCustomer);
    writeDb(store);
    return { customer: newCustomer, isNew: true };
  },

  addLeader(leaderData: Omit<Leader, "id" | "createdAt">): Leader {
    const store = ensureDb();
    const newLeader: Leader = {
      ...leaderData,
      id: `leader-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    store.leaders.push(newLeader);
    writeDb(store);
    return newLeader;
  },
};
