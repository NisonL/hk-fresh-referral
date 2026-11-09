"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  ShoppingBag,
  Download,
  Settings,
  Sparkles,
  TrendingUp,
  MapPin,
  CheckCircle2,
  Copy,
  Check,
  Edit2,
  ChevronRight,
  ShieldAlert,
  Save,
  Gift,
  Building2,
  Coins,
  ArrowRight,
} from "lucide-react";
import { AppConfig, Product, Leader, Customer, Order } from "@/types";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"grid" | "products" | "export" | "rules" | "brand">("grid");
  const [loading, setLoading] = useState(true);

  // 全局数据状态
  const [stats, setStats] = useState<any>({});
  const [buildingStats, setBuildingStats] = useState<any[]>([]);
  const [kocLeaderboard, setKocLeaderboard] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [config, setConfig] = useState<AppConfig | null>(null);

  // 邀请弹窗与文案复制状态
  const [copiedText, setCopiedText] = useState("");
  const [selectedProspect, setSelectedProspect] = useState<any>(null);
  const [promoteModalOpen, setPromoteModalOpen] = useState(false);
  const [promoteForm, setPromoteForm] = useState({
    customerPhone: "",
    newInviteCode: "",
    assignedBuildingId: "",
    mentorLeaderId: "leader-hua",
  });

  // 编辑配置状态
  const [configForm, setConfigForm] = useState<Partial<AppConfig>>({});
  const [savingConfig, setSavingConfig] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/overview");
      const data = await res.json();
      setStats(data.stats || {});
      setBuildingStats(data.buildingStats || []);
      setKocLeaderboard(data.kocLeaderboard || []);
      setProducts(data.products || []);
      setLeaders(data.leaders || []);
      setCustomers(data.customers || []);
      setOrders(data.orders || []);
      setConfig(data.config || null);
      if (data.config) setConfigForm(data.config);
    } catch (err) {
      console.error("Failed to load admin data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(""), 2500);
  };

  const generateInviteMessage = (prospect: any, buildingName: string) => {
    return (
      `【供港優鮮 · 誠邀愛心樓長】\n` +
      `${prospect.realName} 早晨！留意到您最近在${buildingName}多次訂購我哋嘅東莞潤豐鮮菜，感謝您的信任與支持！😊\n\n` +
      `我哋正喺${buildingName}物色一位「愛心樓長」，平時只需順手在街坊群解答鄰里疑問、分享菜單，每單可享 HK$ 2.00 現金服務津貼＋專屬買菜折上折，每個月順手賺取 HK$ 2,000~4,000 零用錢！\n\n` +
      `目前${buildingName}已有街坊在天天訂菜，您一加入這批街坊全歸您帶！唔知${prospect.realName}有冇興趣一齊試試？`
    );
  };

  const handlePromoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/promote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(promoteForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "晉升失敗");
      alert(data.message);
      setPromoteModalOpen(false);
      fetchAdminData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(configForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "保存失敗");
      alert("配置更新成功！");
      setConfig(data.config);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSavingConfig(false);
    }
  };

  const handleUpdateProductPrice = async (id: string, newPrice: number) => {
    try {
      const res = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, priceHkd: newPrice }),
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, priceHkd: newPrice } : p))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 pb-20">
      {/* 顶部导航 */}
      <header className="bg-slate-900 text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              href="/"
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
            >
              ← 返回前台訂菜
            </Link>
            <span className="text-slate-600">|</span>
            <div className="font-black text-base tracking-tight flex items-center gap-2">
              <span className="text-emerald-400">供港優鮮</span>
              <span className="text-xs bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-slate-300">
                M 操盤總控台
              </span>
            </div>
          </div>

          <div className="text-xs text-slate-400 font-mono">
            環境: 蘇屋邨 0 號樣板間
          </div>
        </div>

        {/* 五大模块 Tab 切换栏 */}
        <div className="max-w-6xl mx-auto px-4 flex space-x-1 border-t border-slate-800 overflow-x-auto">
          {[
            { id: "grid", label: "網格大廈與 KOC 裂變雷達", icon: MapPin },
            { id: "products", label: "商品貨架動態管理", icon: ShoppingBag },
            { id: "export", label: "清晨鐵閘配送單導出", icon: Download },
            { id: "rules", label: "計酬規則與包郵引擎", icon: Coins },
            { id: "brand", label: "品牌與交付約定配置", icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-4 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition ${
                  active
                    ? "border-emerald-400 text-emerald-400 bg-slate-800/50"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* 主体工作区 */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* 全盘核心指标看板 */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 mb-6">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-400 font-bold">歷史累計 GMV</span>
            <div className="text-xl font-black text-slate-900 mt-1">
              HK$ {stats.totalGmv || "0.00"}
            </div>
            <span className="text-[10px] text-emerald-600 font-bold">100% 蔬菜真實訂單</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-400 font-bold">累計下單筆數</span>
            <div className="text-xl font-black text-slate-900 mt-1">
              {stats.totalOrders || 0} 筆
            </div>
            <span className="text-[10px] text-slate-400">平均客單價 HK$ 19.9</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-400 font-bold">在冊買菜戶數</span>
            <div className="text-xl font-black text-slate-900 mt-1">
              {stats.totalCustomers || 0} 戶
            </div>
            <span className="text-[10px] text-slate-400">蘇屋邨在冊房號</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-400 font-bold">在席活躍樓長</span>
            <div className="text-xl font-black text-emerald-600 mt-1">
              {stats.totalLeaders || 0} 位
            </div>
            <span className="text-[10px] text-slate-400">華姐(牡丹樓)等</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/40 shadow-sm col-span-2 md:col-span-1">
            <span className="text-xs text-amber-800 font-bold">空白網點大廈 (待孵化)</span>
            <div className="text-xl font-black text-amber-600 mt-1">
              {stats.blankBuildingsCount || 0} 座
            </div>
            <span className="text-[10px] text-amber-700 font-bold">有訂單但無樓長</span>
          </div>
        </div>

        {/* 模块 1: 网格大厦穿透与 KOC 裂变雷达 */}
        {activeTab === "grid" && (
          <div className="space-y-6">
            {/* 表 1：全邨 14 座大厦网格渗透看板 */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-emerald-600" />
                    <span>深水埗蘇屋邨 14 座大廈網格滲透穿透看板</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    實時監控各座大廈覆蓋狀態，挖掘空白大廈中的高頻買菜街坊轉化為愛心樓長
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">大廈座號</th>
                      <th className="py-2.5 px-3">大廈名稱</th>
                      <th className="py-2.5 px-3">樓長覆蓋狀態</th>
                      <th className="py-2.5 px-3">在冊買菜戶</th>
                      <th className="py-2.5 px-3">累計訂單</th>
                      <th className="py-2.5 px-3">⭐ 核心高潛種子街坊 (發掘目標)</th>
                      <th className="py-2.5 px-3 text-right">拓荒運營操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {buildingStats.map((bldg) => (
                      <tr key={bldg.buildingId} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-3 font-mono font-bold text-slate-700">
                          {bldg.blockCode}
                        </td>
                        <td className="py-3 px-3 font-black text-slate-900">
                          {bldg.buildingName}
                        </td>
                        <td className="py-3 px-3">
                          {bldg.leader ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold text-[11px]">
                              🟢 {bldg.leader.realName} ({bldg.leader.inviteCode})
                            </span>
                          ) : bldg.customerCount > 0 ? (
                            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-bold text-[11px]">
                              🟡 空白網點 (牙仔代跑)
                            </span>
                          ) : (
                            <span className="text-slate-300 font-medium">⚪ 未破冰 (0戶)</span>
                          )}
                        </td>
                        <td className="py-3 px-3 font-bold">{bldg.customerCount} 戶</td>
                        <td className="py-3 px-3 font-bold">{bldg.orderCount} 筆</td>
                        <td className="py-3 px-3">
                          {bldg.starProspect ? (
                            <div className="flex items-center gap-1.5">
                              <span className="bg-amber-100 text-amber-900 font-black px-1.5 py-0.5 rounded text-[10px]">
                                ⭐ TOP1 買家
                              </span>
                              <span className="font-bold text-slate-800">
                                {bldg.starProspect.realName} ({bldg.starProspect.flatNo})
                              </span>
                              <span className="text-slate-400 text-[10px]">
                                已訂 {bldg.starProspect.ordersCount} 次
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-300">--</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right space-x-1.5">
                          {bldg.starProspect && (
                            <>
                              <button
                                onClick={() => {
                                  const text = generateInviteMessage(bldg.starProspect, bldg.buildingName);
                                  handleCopyText(text);
                                }}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-2.5 py-1 rounded-lg text-[11px] transition inline-flex items-center gap-1"
                              >
                                {copiedText.includes(bldg.starProspect.realName) ? (
                                  <Check className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                                <span>複製邀約文案</span>
                              </button>

                              <button
                                onClick={() => {
                                  setPromoteForm({
                                    customerPhone: bldg.starProspect.phone,
                                    newInviteCode: `LEADER_${bldg.blockCode}`,
                                    assignedBuildingId: bldg.buildingId,
                                    mentorLeaderId: "leader-hua",
                                  });
                                  setPromoteModalOpen(true);
                                }}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 rounded-lg text-[11px] transition"
                              >
                                升格為樓長
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 表 2：全邨街坊 KOC 裂变达人雷达排行榜 */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                    <Gift className="w-5 h-5 text-orange-500" />
                    <span>街坊轉介紹 KOC 裂變達人雷達（成功推薦戶數 $\ge 1$）</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    先以“純送積分換青菜”吸引街坊拉鄰里，雷達自動捕獲高潛發掘目標，直接面談轉化為樓長
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">街坊稱呼</th>
                      <th className="py-2.5 px-3">大廈門牌</th>
                      <th className="py-2.5 px-3">香港電話</th>
                      <th className="py-2.5 px-3">成功推薦戶數</th>
                      <th className="py-2.5 px-3">帶動總單量</th>
                      <th className="py-2.5 px-3">買菜積分餘額</th>
                      <th className="py-2.5 px-3">系統高潛評級</th>
                      <th className="py-2.5 px-3 text-right">樓長轉化操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {kocLeaderboard.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                          暫無轉介紹數據，請街坊在前端點擊“推薦街坊得青菜”開始裂變
                        </td>
                      </tr>
                    ) : (
                      kocLeaderboard.map((koc, idx) => (
                        <tr key={koc.phone} className="hover:bg-slate-50 transition">
                          <td className="py-3 px-3 font-black text-slate-900">
                            {idx === 0 && "🥇 "}
                            {idx === 1 && "🥈 "}
                            {idx === 2 && "🥉 "}
                            {koc.realName}
                          </td>
                          <td className="py-3 px-3 text-slate-600">
                            {koc.buildingName} {koc.flatNo}
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-slate-700">
                            {koc.phone}
                          </td>
                          <td className="py-3 px-3 font-black text-orange-600">
                            {koc.refereeCount} 戶
                          </td>
                          <td className="py-3 px-3 font-bold">{koc.totalRefereeOrders} 單</td>
                          <td className="py-3 px-3 font-mono font-bold text-emerald-700">
                            {koc.pointsBalance} 分
                          </td>
                          <td className="py-3 px-3 font-bold text-amber-700">
                            {koc.rating}
                          </td>
                          <td className="py-3 px-3 text-right">
                            {koc.isAlreadyLeader ? (
                              <span className="text-emerald-600 font-bold">已是在席樓長</span>
                            ) : (
                              <button
                                onClick={() => {
                                  const text = generateInviteMessage(koc, koc.buildingName);
                                  handleCopyText(text);
                                }}
                                className="bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 font-bold px-2.5 py-1 rounded-lg text-[11px] transition inline-flex items-center gap-1"
                              >
                                <Copy className="w-3 h-3" />
                                <span>複製邀約</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 模块 2: 商品与货架管理 */}
        {activeTab === "products" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div>
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-emerald-600" />
                <span>今日 8 大主力自選蔬菜貨架管理</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                單品均為足 500g 精選保鮮裝，對標旺角街市打 7 折，毛利率堅守在 40% - 58%
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-3.5"
                >
                  <img
                    src={p.imageUrl}
                    alt={p.nameZh}
                    className="w-16 h-16 rounded-xl object-cover bg-white"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 text-sm truncate">{p.nameZh}</h4>
                    <p className="text-xs text-slate-400 truncate">{p.subTitle}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-slate-500 font-bold">售價: HK$</span>
                      <input
                        type="number"
                        step="0.1"
                        value={p.priceHkd}
                        onChange={(e) =>
                          handleUpdateProductPrice(p.id, parseFloat(e.target.value) || 0)
                        }
                        className="w-20 px-2 py-1 bg-white border border-slate-200 rounded font-black text-rose-600 text-xs"
                      />
                      <span className="text-xs text-slate-400">
                        (對標街市 HK$ {p.marketPriceHkd})
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 模块 3: 清晨铁闸配送单导出 (2 种模式) */}
        {activeTab === "export" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div>
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <Download className="w-5 h-5 text-emerald-600" />
                <span>清晨 21:30 截單配貨與導出中樞</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                支持兩種對接導出方式：按大廈座號房號掃樓掛閘，或按樓長匯總大宗自提交接
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* 导出方式 1: 晨早铁闸挂袋扫楼清册 */}
              <div className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/50 space-y-3">
                <div className="text-sm font-black text-emerald-950 flex items-center gap-2">
                  <span>📥 模式一：晨早防盜鐵閘掛袋掃樓清冊</span>
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  專門提供給一線步兵（牙仔）清晨 07:15 - 08:00 掃樓送貨使用。按大廈座號、房號由低至高精準排序，含街坊稱呼、脫敏電話、訂購足斤菜品及防偽封條號。
                </p>
                <a
                  href="/api/admin/export?mode=gate"
                  target="_blank"
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow transition active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>下載【晨早鐵閘掛袋掃樓配送單 (CSV)】</span>
                </a>
              </div>

              {/* 导出方式 2: 按楼长大宗自提/交接清册 */}
              <div className="p-5 rounded-2xl border border-blue-200 bg-blue-50/50 space-y-3">
                <div className="text-sm font-black text-blue-950 flex items-center gap-2">
                  <span>📥 模式二：按樓長大宗自提/交接清冊</span>
                </div>
                <p className="text-xs text-blue-800 leading-relaxed">
                  適用於樓長主動下樓自提、或平台向樓長統一批發交接。匯總每位樓長名下的總訂單數、總金額、直屬服務津貼及導師帶教津貼，確保一鍵對賬零差錯。
                </p>
                <a
                  href="/api/admin/export?mode=leader"
                  target="_blank"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow transition active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>下載【樓長自提交接與津貼對賬單 (CSV)】</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* 模块 4: 规则引擎与计价配置 */}
        {activeTab === "rules" && (
          <form
            onSubmit={handleSaveConfig}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5"
          >
            <div>
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <Coins className="w-5 h-5 text-emerald-600" />
                <span>計酬規則與包郵參數動態引擎</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                嚴格遵守司法級 Cap 617 合規（二級封頂），所有參數隨時在此調整，零代碼硬編碼
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  自選免運費包郵門檻 (HK$)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={configForm.freeShippingThreshold || 18.9}
                  onChange={(e) =>
                    setConfigForm({
                      ...configForm,
                      freeShippingThreshold: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
                <span className="text-[10px] text-slate-400">純蔬菜實測 18.9 或 19.9</span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  步兵晨早掛閘運力費 (HK$/單)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={configForm.runnerDeliveryFee || 2.0}
                  onChange={(e) =>
                    setConfigForm({
                      ...configForm,
                      runnerDeliveryFee: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
                <span className="text-[10px] text-slate-400">牙仔本邨上樓運力津貼</span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  愛心樓長直屬服務津貼 (HK$/單)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={configForm.leaderCommissionRate || 2.0}
                  onChange={(e) =>
                    setConfigForm({
                      ...configForm,
                      leaderCommissionRate: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
                <span className="text-[10px] text-slate-400">樓長專屬現金津貼</span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  業務導師帶教津貼 (HK$/單)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={configForm.mentorAllowanceRate || 0.5}
                  onChange={(e) =>
                    setConfigForm({
                      ...configForm,
                      mentorAllowanceRate: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
                <span className="text-[10px] text-slate-400">培養新樓長的二級帶教津貼</span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  街坊轉介紹贈送買菜積分 (分/單)
                </label>
                <input
                  type="number"
                  value={configForm.referralPointsPerOrder || 100}
                  onChange={(e) =>
                    setConfigForm({
                      ...configForm,
                      referralPointsPerOrder: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
                <span className="text-[10px] text-slate-400">100分換1包500g青菜，零現金</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={savingConfig}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow active:scale-95 transition"
              >
                <Save className="w-4 h-4" />
                <span>{savingConfig ? "保存中..." : "保存規則配置"}</span>
              </button>
            </div>
          </form>
        )}

        {/* 模块 5: 品牌与交付约定配置 */}
        {activeTab === "brand" && (
          <form
            onSubmit={handleSaveConfig}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5"
          >
            <div>
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <Settings className="w-5 h-5 text-emerald-600" />
                <span>品牌、溯源與交付約定配置</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                前端即時解耦生效，支持靈活更換品牌名稱、Slogan與官方聯絡方式
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">品牌主名稱</label>
                  <input
                    type="text"
                    value={configForm.brandName || ""}
                    onChange={(e) => setConfigForm({ ...configForm, brandName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">品牌副標題</label>
                  <input
                    type="text"
                    value={configForm.brandSubtitle || ""}
                    onChange={(e) => setConfigForm({ ...configForm, brandSubtitle: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">宣傳 Slogan</label>
                <input
                  type="text"
                  value={configForm.slogan || ""}
                  onChange={(e) => setConfigForm({ ...configForm, slogan: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  《街坊鐵閘掛袋交付須知》公告文案
                </label>
                <textarea
                  rows={3}
                  value={configForm.deliveryNotice || ""}
                  onChange={(e) => setConfigForm({ ...configForm, deliveryNotice: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">官方客服 WhatsApp</label>
                  <input
                    type="text"
                    value={configForm.supportWhatsApp || ""}
                    onChange={(e) => setConfigForm({ ...configForm, supportWhatsApp: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">官方客服微信號</label>
                  <input
                    type="text"
                    value={configForm.defaultWechatId || ""}
                    onChange={(e) => setConfigForm({ ...configForm, defaultWechatId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={savingConfig}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow active:scale-95 transition"
              >
                <Save className="w-4 h-4" />
                <span>{savingConfig ? "保存中..." : "保存文案配置"}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 晋升楼长弹窗 */}
      {promoteModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 space-y-4">
            <h3 className="font-black text-base text-slate-900">
              將街坊升格為愛心樓長 (M2L 轉化)
            </h3>
            <form onSubmit={handlePromoteSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">街坊手機號</label>
                <input
                  type="text"
                  value={promoteForm.customerPhone}
                  readOnly
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  新專屬邀請碼 (大寫英文+數字)
                </label>
                <input
                  type="text"
                  value={promoteForm.newInviteCode}
                  onChange={(e) =>
                    setPromoteForm({ ...promoteForm, newInviteCode: e.target.value.toUpperCase() })
                  }
                  placeholder="例如：CHAN888"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">指派管轄大廈</label>
                <select
                  value={promoteForm.assignedBuildingId}
                  onChange={(e) =>
                    setPromoteForm({ ...promoteForm, assignedBuildingId: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  required
                >
                  <option value="">-- 請選擇大廈 --</option>
                  {buildingStats.map((b) => (
                    <option key={b.buildingId} value={b.buildingId}>
                      {b.buildingName} ({b.status === "HAS_LEADER" ? "已有樓長" : "空白待孵化"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  業務帶教導師 (合規 Cap 617 二級)
                </label>
                <select
                  value={promoteForm.mentorLeaderId}
                  onChange={(e) =>
                    setPromoteForm({ ...promoteForm, mentorLeaderId: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  <option value="">-- 無導師 (獨立樓長) --</option>
                  {leaders.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.realName} ({l.inviteCode} · {l.buildingName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPromoteModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 text-white rounded-xl font-black"
                >
                  確認晉升並平移客戶
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
