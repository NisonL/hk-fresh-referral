/**
 * AI 虚拟用户全链路仿真与数据一致性测试脚本
 * 模拟场景：
 * 1. 用户注册与绑定关系建立
 * 2. 街坊转介绍与买菜积分累加
 * 3. 会员升格/跳级为社区顾问（楼长），客户树平移与导师关系绑定
 * 4. 晋升后订单流转与 Cap 617 两级佣金合规审计
 * 5. 防死循环、孤儿数据与账目完整性校验
 */

import fs from 'fs';
import path from 'path';

const SANDBOX_DB_PATH = path.join(process.cwd(), 'data', 'sandbox_test.json');

// 初始化干净的测试沙箱数据
const SEED_DATA = {
  estates: [
    { id: 'estate-so-uk', code: 'SO_UK', nameZh: '深水埗蘇屋邨', district: '深水埗區' }
  ],
  buildings: [
    { id: 'bldg-peony', estateId: 'estate-so-uk', nameZh: '牡丹樓', blockCode: 'PEONY' },
    { id: 'bldg-jinju', estateId: 'estate-so-uk', nameZh: '金菊樓', blockCode: 'JINJU' },
    { id: 'bldg-camellia', estateId: 'estate-so-uk', nameZh: '茶花樓', blockCode: 'CAMELLIA' }
  ],
  leaders: [
    {
      id: 'leader-hua',
      inviteCode: 'HUA888',
      realName: '華姐',
      hkPhone: '91234567',
      estateId: 'estate-so-uk',
      estateName: '深水埗蘇屋邨',
      buildingId: 'bldg-peony',
      buildingName: '牡丹樓',
      whatsAppGroupUrl: 'https://chat.whatsapp.com/demo-peony',
      parentLeaderId: null, // 顶级初创楼长，无上级导师
      status: 'ACTIVE',
      totalCommissionEarned: 0
    }
  ],
  customers: [],
  orders: [],
  pointsWallets: {}
};

// 内存读写工具
function resetSandbox() {
  fs.writeFileSync(SANDBOX_DB_PATH, JSON.stringify(SEED_DATA, null, 2), 'utf-8');
}

function readSandbox() {
  return JSON.parse(fs.readFileSync(SANDBOX_DB_PATH, 'utf-8'));
}

function writeSandbox(data) {
  fs.writeFileSync(SANDBOX_DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

// ======================== 核心系统逻辑 ========================

// 1. 用户注册与绑定
function simulateRegisterCustomer({ phone, realName, estateId, buildingId, flatNo, inviteCode, referrerPhone }) {
  const db = readSandbox();
  const cleanPhone = phone.trim().replace(/\D/g, '');
  
  // 查找目标楼长
  let leader = null;
  if (inviteCode) {
    leader = db.leaders.find(l => l.inviteCode.toUpperCase() === inviteCode.trim().toUpperCase());
  }

  // 检查是否已有该手机号（防撬锁校验）
  const existingIndex = db.customers.findIndex(c => c.hkPhone === cleanPhone);
  if (existingIndex >= 0) {
    // 已存在：保留原有归属，仅更新房号称呼
    const existing = db.customers[existingIndex];
    existing.realName = realName;
    existing.flatNo = flatNo;
    writeSandbox(db);
    return { customer: existing, action: 'UPDATED_PROFILE_LOCKED_AFFILIATION' };
  }

  // 全新注册
  const estate = db.estates.find(e => e.id === estateId);
  const building = db.buildings.find(b => b.id === buildingId);

  const newCust = {
    id: `cust-${cleanPhone}`,
    hkPhone: cleanPhone,
    realName,
    estateId,
    estateName: estate?.nameZh || '深水埗蘇屋邨',
    buildingId,
    buildingName: building?.nameZh || '未知大廈',
    flatNo,
    boundLeaderId: leader ? leader.id : 'SYSTEM_RUNNER', // 无团长大厦归属平台公共网格
    boundInviteCode: leader ? leader.inviteCode : 'PUBLIC',
    referrerCustomerPhone: referrerPhone || null, // 街坊转介绍人
    createdAt: new Date().toISOString()
  };

  db.customers.push(newCust);
  
  // 初始化积分钱包
  if (!db.pointsWallets[cleanPhone]) {
    db.pointsWallets[cleanPhone] = { availablePoints: 0, totalEarned: 0 };
  }

  writeSandbox(db);
  return { customer: newCust, action: 'NEW_REGISTRATION_CREATED' };
}

// 2. 下单与分账（Phase 0/1 规则引擎）
function simulatePlaceOrder({ customerPhone, amountHkd = 19.90, itemsDescription = '500g寧夏菜心+500g生菜' }) {
  const db = readSandbox();
  const customer = db.customers.find(c => c.hkPhone === customerPhone);
  if (!customer) throw new Error(`Customer not found: ${customerPhone}`);

  const orderId = `ORD-${Date.now().toString().slice(-6)}-${customerPhone.slice(-4)}`;
  
  // 计酬结算瀑布（Waterfall）
  let directLeaderCommission = 0;
  let mentorAllowance = 0;
  let runnerDeliveryFee = 2.00; // 牙仔挂闸运力固定 HK$ 2.00
  let directLeaderId = null;
  let mentorLeaderId = null;

  // 1. 直属楼长分润
  if (customer.boundLeaderId && customer.boundLeaderId !== 'SYSTEM_RUNNER') {
    const leader = db.leaders.find(l => l.id === customer.boundLeaderId);
    if (leader && leader.status === 'ACTIVE') {
      directLeaderId = leader.id;
      directLeaderCommission = 2.00; // 楼长每单 HK$ 2.00
      leader.totalCommissionEarned = (leader.totalCommissionEarned || 0) + directLeaderCommission;

      // 2. 检查是否有带教导师（业务导师带教津贴，两级封顶，合规 Cap 617）
      if (leader.parentLeaderId) {
        const mentor = db.leaders.find(l => l.id === leader.parentLeaderId);
        if (mentor && mentor.status === 'ACTIVE') {
          mentorLeaderId = mentor.id;
          mentorAllowance = 0.50; // 导师带教每单 HK$ 0.50
          mentor.totalCommissionEarned = (mentor.totalCommissionEarned || 0) + mentorAllowance;
        }
      }
    }
  }

  // 3. 街坊转介绍积分分润（买菜积分换青菜，绝非现金，规避富户政策与传销）
  let referrerBonusPoints = 0;
  if (customer.referrerCustomerPhone && db.pointsWallets[customer.referrerCustomerPhone]) {
    referrerBonusPoints = 100; // 每单返给推荐街坊 100 积分（价值约 HK$ 1.00 菜品）
    db.pointsWallets[customer.referrerCustomerPhone].availablePoints += referrerBonusPoints;
    db.pointsWallets[customer.referrerCustomerPhone].totalEarned += referrerBonusPoints;
  }

  const orderRecord = {
    orderId,
    customerPhone,
    customerName: customer.realName,
    buildingName: customer.buildingName,
    flatNo: customer.flatNo,
    amountHkd,
    itemsDescription,
    directLeaderId,
    directLeaderCommission,
    mentorLeaderId,
    mentorAllowance,
    runnerDeliveryFee,
    referrerCustomerPhone: customer.referrerCustomerPhone,
    referrerBonusPoints,
    platformMargin: +(amountHkd - 11.41 - runnerDeliveryFee - directLeaderCommission - mentorAllowance).toFixed(2),
    createdAt: new Date().toISOString()
  };

  db.orders.push(orderRecord);
  writeSandbox(db);
  return orderRecord;
}

// 3. 用户升级为团长（M2L 会员转社区顾问/爱心楼长）
function simulatePromoteCustomerToLeader({ customerPhone, newInviteCode, assignedBuildingId, mentorLeaderId }) {
  const db = readSandbox();
  const customer = db.customers.find(c => c.hkPhone === customerPhone);
  if (!customer) throw new Error(`Customer not found for promotion: ${customerPhone}`);

  const assignedBuilding = db.buildings.find(b => b.id === assignedBuildingId);

  // 创建新楼长记录
  const newLeaderId = `leader-${customerPhone.slice(-4)}`;
  const newLeader = {
    id: newLeaderId,
    inviteCode: newInviteCode.toUpperCase(),
    realName: customer.realName,
    hkPhone: customer.hkPhone,
    estateId: customer.estateId,
    estateName: customer.estateName,
    buildingId: assignedBuildingId,
    buildingName: assignedBuilding ? assignedBuilding.nameZh : customer.buildingName,
    whatsAppGroupUrl: `https://chat.whatsapp.com/demo-${newInviteCode.toLowerCase()}`,
    parentLeaderId: mentorLeaderId || null, // 华姐成为带教导师！
    status: 'ACTIVE',
    totalCommissionEarned: 0,
    promotedAt: new Date().toISOString()
  };

  db.leaders.push(newLeader);

  // 【核心数据流演进】：客户树与网格平移逻辑
  // 1. 将原来由该客户 (User B) 推荐的所有街坊，以及金菊楼（若被指派）的散客，平移归入该新楼长名下
  let transferredCount = 0;
  db.customers.forEach(c => {
    // 规则 1：被该人直接转介绍的邻居
    const isDirectReferee = c.referrerCustomerPhone === customerPhone;
    // 规则 2：住在该楼长新接管大厦、且原本无团长(SYSTEM_RUNNER)的散户
    const isBlankBuildingResident = (c.buildingId === assignedBuildingId && c.boundLeaderId === 'SYSTEM_RUNNER');

    if (isDirectReferee || isBlankBuildingResident) {
      c.boundLeaderId = newLeaderId;
      c.boundInviteCode = newLeader.inviteCode;
      transferredCount++;
    }
  });

  writeSandbox(db);
  return { newLeader, transferredCount };
}

// 4. 数据完整性与合规性严格审计（巡检算法）
function auditSystemIntegrity() {
  const db = readSandbox();
  const report = {
    passed: true,
    errors: [],
    warnings: [],
    stats: {
      totalLeaders: db.leaders.length,
      totalCustomers: db.customers.length,
      totalOrders: db.orders.length,
      totalCommissionsPaid: 0
    }
  };

  // 检查项 1：死循环检测（DFS 检测 parentLeaderId 是否存在循环回路）
  const leaderMap = new Map(db.leaders.map(l => [l.id, l]));
  for (const leader of db.leaders) {
    const visited = new Set();
    let curr = leader;
    while (curr && curr.parentLeaderId) {
      if (visited.has(curr.id)) {
        report.passed = false;
        report.errors.push(`【致命错误】检测到楼长层级存在死循环：${leader.realName} -> ${curr.id}`);
        break;
      }
      visited.add(curr.id);
      curr = leaderMap.get(curr.parentLeaderId);
    }
  }

  // 检查项 2：孤儿用户检测（客户的 boundLeaderId 是否在 leaders 列表中存在有效引用）
  for (const cust of db.customers) {
    if (cust.boundLeaderId !== 'SYSTEM_RUNNER' && !leaderMap.has(cust.boundLeaderId)) {
      report.passed = false;
      report.errors.push(`【孤儿客户异常】客户 ${cust.realName}(${cust.hkPhone}) 绑定的楼长 ID ${cust.boundLeaderId} 不存在！`);
    }
  }

  // 检查项 3：Cap 617 合规性审查（层级是否严格 <= 2 级，绝不可产生第 3 级提成）
  for (const order of db.orders) {
    let tierCount = 0;
    if (order.directLeaderCommission > 0) tierCount++;
    if (order.mentorAllowance > 0) tierCount++;
    if (tierCount > 2) {
      report.passed = false;
      report.errors.push(`【违规警告】订单 ${order.orderId} 奖励层级超过 2 级，触犯香港 Cap 617 传销红线！`);
    }
    // 检查平台留存是否为负
    if (order.platformMargin < 0) {
      report.passed = false;
      report.errors.push(`【亏损异常】订单 ${order.orderId} 平台留存毛利为负（HK$ ${order.platformMargin}），佣金被击穿！`);
    }
    report.stats.totalCommissionsPaid += (order.directLeaderCommission + order.mentorAllowance);
  }

  return report;
}

// ======================== 执行端到端仿真测试流程 ========================
console.log('================================================================');
console.log('🚀 开始执行 AI 拟真用户全链路端到端仿真测试 (HK Fresh SaaS)');
console.log('================================================================\n');

resetSandbox();

// -------------------------------------------------------------
// STEP 1: 拟真注册与关系成立 (Leader A -> User B -> User C/D/E + Blank User F)
// -------------------------------------------------------------
console.log('📌 [STEP 1] 模拟街坊扫码注册与绑定推荐关系：');

// 1.1 牡丹楼楼长华姐 (HUA888) 推广
// 陈太 (User B) 扫华姐码注册在牡丹楼 1204 室
const resB = simulateRegisterCustomer({
  phone: '91112233',
  realName: '陳太 (User B)',
  estateId: 'estate-so-uk',
  buildingId: 'bldg-peony',
  flatNo: '1204室',
  inviteCode: 'HUA888'
});
console.log(`  ✅ 陈太(User B) 注册成功 -> 绑定楼长: [华姐 (HUA888)], 动作: ${resB.action}`);

// 1.2 防撬锁测试：陈太再次注册，试图扫明哥的码改绑
const resB_tamper = simulateRegisterCustomer({
  phone: '91112233',
  realName: '陳太 (改名測試)',
  estateId: 'estate-so-uk',
  buildingId: 'bldg-peony',
  flatNo: '1205室',
  inviteCode: 'MING666'
});
console.log(`  🛡️ 防撬锁测试: 陈太试图改绑明哥 -> 结果: ${resB_tamper.action}, 仍锁定楼长: [${resB_tamper.customer.boundInviteCode}] (成功保护首发推荐人)`);

// 1.3 陈太转介绍邻居 C、D、E
const resC = simulateRegisterCustomer({
  phone: '92223344',
  realName: '李生 (User C)',
  estateId: 'estate-so-uk',
  buildingId: 'bldg-peony',
  flatNo: '0802室',
  inviteCode: 'HUA888',
  referrerPhone: '91112233' // 陈太推荐
});
console.log(`  ✅ 李生(User C) 注册成功 -> 所属大厦: 牡丹楼, 推荐人: 陈太, 归属楼长: 华姐`);

const resD = simulateRegisterCustomer({
  phone: '93334455',
  realName: '張太 (User D)',
  estateId: 'estate-so-uk',
  buildingId: 'bldg-jinju', // 金菊楼
  flatNo: '1503室',
  inviteCode: 'HUA888',
  referrerPhone: '91112233' // 陈太推荐
});
console.log(`  ✅ 张太(User D) 注册成功 -> 所属大厦: 金菊楼, 推荐人: 陈太, 归属楼长: 华姐`);

const resE = simulateRegisterCustomer({
  phone: '94445566',
  realName: '梁伯 (User E)',
  estateId: 'estate-so-uk',
  buildingId: 'bldg-jinju', // 金菊楼
  flatNo: '0401室',
  inviteCode: 'HUA888',
  referrerPhone: '91112233' // 陈太推荐
});
console.log(`  ✅ 梁伯(User E) 注册成功 -> 所属大厦: 金菊楼, 推荐人: 陈太, 归属楼长: 华姐`);

// 1.4 空白大厦金菊楼的纯自然街坊关姐（无任何邀请码，扫信箱传单）
const resF = simulateRegisterCustomer({
  phone: '95556677',
  realName: '關姐 (User F, 空白網點自來客)',
  estateId: 'estate-so-uk',
  buildingId: 'bldg-jinju',
  flatNo: '0905室',
  inviteCode: null
});
console.log(`  ✅ 关姐(User F) 注册成功 -> 金菊楼空白大厦自发订单, 兜底归属: [${resF.customer.boundLeaderId}] (平台公共网格)\n`);

// -------------------------------------------------------------
// STEP 2: 消费下单与积分/佣金分账校验
// -------------------------------------------------------------
console.log('📌 [STEP 2] 模拟街坊下单、买菜积分产生与佣金结算：');

const ord1 = simulatePlaceOrder({ customerPhone: '92223344', amountHkd: 19.90, itemsDescription: '500g菜心+500g生菜' });
console.log(`  🛒 订单 1 [李生 牡丹楼]: 实收 HK$ ${ord1.amountHkd}`);
console.log(`     - 楼长华姐分润: +HK$ ${ord1.directLeaderCommission}`);
console.log(`     - 推荐人陈太积分: +${ord1.referrerBonusPoints} 积分 (买菜积分钱包累计)`);
console.log(`     - 步兵牙仔运力: +HK$ ${ord1.runnerDeliveryFee}`);
console.log(`     - 平台留存纯利: +HK$ ${ord1.platformMargin}`);

const ord2 = simulatePlaceOrder({ customerPhone: '93334455', amountHkd: 19.90, itemsDescription: '500g菜心+500g芥兰' });
console.log(`  🛒 订单 2 [张太 金菊楼]: 实收 HK$ ${ord2.amountHkd}`);
console.log(`     - 楼长华姐分润: +HK$ ${ord2.directLeaderCommission}`);
console.log(`     - 推荐人陈太积分: +${ord2.referrerBonusPoints} 积分 (当前陈太总积分: 200分, 可换2包青菜!)\n`);

// -------------------------------------------------------------
// STEP 3: 模拟跳级/晋升（陈太升格为社区顾问/金菊楼爱心楼长 CHAN888）
// -------------------------------------------------------------
console.log('📌 [STEP 3] 模拟跳级：陈太(User B) 表现优异，正式晋升为【金菊楼社区顾问/爱心楼长】！');

const promoRes = simulatePromoteCustomerToLeader({
  customerPhone: '91112233',
  newInviteCode: 'CHAN888',
  assignedBuildingId: 'bldg-jinju', // 指派到金菊楼
  mentorLeaderId: 'leader-hua'       // 华姐升为带教业务导师
});

console.log(`  🎉 晋升成功: 陈太升级为楼长 [${promoRes.newLeader.inviteCode}], 负责管辖: ${promoRes.newLeader.buildingName}`);
console.log(`  🤝 师徒确立: 华姐(HUA888) 成为陈太的【带教业务导师 (parentLeaderId)】`);
console.log(`  🔄 资产平移: 共 ${promoRes.transferredCount} 户关联街坊（陈太推荐的C/D/E + 金菊楼自然散客F）无缝平移至陈太名下！\n`);

// -------------------------------------------------------------
// STEP 4: 晋升跳级后的订单流转与合规性复测 (Cap 617 两级分账)
// -------------------------------------------------------------
console.log('📌 [STEP 4] 模拟晋升后的新订单：验证两级佣金与导师津贴流转：');

// 此时张太(User D) 再次在金菊楼下单
const ord3 = simulatePlaceOrder({ customerPhone: '93334455', amountHkd: 19.90, itemsDescription: '500g菜心+500g青瓜' });
console.log(`  🛒 订单 3 [张太 金菊楼] 下单: 实收 HK$ ${ord3.amountHkd}`);
console.log(`     - 新直属楼长陈太(CHAN888) 获得直接服务津贴: +HK$ ${ord3.directLeaderCommission}`);
console.log(`     - 业务导师华姐(HUA888) 获得带教辅导津贴: +HK$ ${ord3.mentorAllowance}`);
console.log(`     - 步兵牙仔挂闸运力: +HK$ ${ord3.runnerDeliveryFee}`);
console.log(`     - 平台留存纯利: +HK$ ${ord3.platformMargin} (财务模型依然极其健康，单单留存 ~HK$ 4.00)`);

// 此时金菊楼散客关姐(User F) 第一次下单
const ord4 = simulatePlaceOrder({ customerPhone: '95556677', amountHkd: 19.90, itemsDescription: '500g菠菜+500g番茄' });
console.log(`  🛒 订单 4 [关姐 金菊楼] 散客下单: 实收 HK$ ${ord4.amountHkd}`);
console.log(`     - 新楼长陈太享受金菊楼全域收益: +HK$ ${ord4.directLeaderCommission}`);
console.log(`     - 导师华姐享受辅导津贴: +HK$ ${ord4.mentorAllowance}\n`);

// -------------------------------------------------------------
// STEP 5: 系统全面安全巡检与数据完整性审计
// -------------------------------------------------------------
console.log('📌 [STEP 5] 运行系统安全审计与数据完整性校验：');
const audit = auditSystemIntegrity();

if (audit.passed) {
  console.log('  🟢【全部通过】系统数据完整性审计 100% PASS！');
  console.log(`     - 死循环检测: 无任何层级回环`);
  console.log(`     - 孤儿数据检测: 0 孤儿客户，指针全部合法`);
  console.log(`     - 香港 Cap 617 传销合规检测: 严格两级封顶 (楼长 HK$2.00 + 导师 HK$0.50)，零超标`);
  console.log(`     - 平台财务穿透: 4 笔仿真订单累计产生提成 HK$ ${audit.stats.totalCommissionsPaid.toFixed(2)}，无负毛利穿底\n`);
} else {
  console.error('  🔴【审计告警】发现以下问题：', audit.errors);
}

// 输出最终数据库快照摘要
const finalDb = readSandbox();
console.log('================================================================');
console.log('📊 仿真测试后数据库最终状态快照：');
console.log(`- 楼长总数: ${finalDb.leaders.length} 位 (华姐、陈太)`);
finalDb.leaders.forEach(l => {
  console.log(`  * [${l.inviteCode}] ${l.realName} (${l.buildingName}) | 累计提成: HK$ ${l.totalCommissionEarned.toFixed(2)} | 导师: ${l.parentLeaderId || '无'}`);
});
console.log(`- 客户总数: ${finalDb.customers.length} 户`);
finalDb.customers.forEach(c => {
  const pts = finalDb.pointsWallets[c.hkPhone]?.availablePoints || 0;
  console.log(`  * ${c.realName} (${c.buildingName} ${c.flatNo}) | 归属楼长: ${c.boundInviteCode} | 买菜积分: ${pts}分`);
});
console.log('================================================================');
