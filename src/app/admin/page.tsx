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
  CheckSquare,
  Square,
  Truck,
  UserCheck,
  RefreshCw,
  ExternalLink,
  Menu,
  X,
  Store,
  Smartphone,
} from "lucide-react";
import { AppConfig, Product, Leader, Customer, Order } from "@/types";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"grid" | "products" | "export" | "rules" | "brand">("grid");
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      alert("✅ 全局計酬與規則配置更新成功！");
      setConfig(data.config);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSavingConfig(false);
    }
  };

  const handleToggleLeaderDelivery = async (leaderId: string, currentVal: boolean) => {
    try {
      const res = await fetch("/api/admin/leaders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: leaderId, isSelfDelivery: !currentVal }),
      });
      if (res.ok) {
        setLeaders((prev) =>
          prev.map((l) => (l.id === leaderId ? { ...l, isSelfDelivery: !currentVal } : l))
        );
      }
    } catch (err) {
      console.error(err);
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

  const navItems = [
    { id: "grid", label: "網格大廈與 KOC 雷達", icon: MapPin, badge: stats.blankBuildingsCount ? `${stats.blankBuildingsCount}待孵化` : undefined },
    { id: "products", label: "商品貨架動態管理", icon: ShoppingBag, badge: `${products.length}款` },
    { id: "export", label: "清晨鐵閘配送單導出", icon: Download, badge: "雙模式" },
    { id: "rules", label: "計酬規則與打勾開關", icon: Coins, badge: "雙層打勾" },
    { id: "brand", label: "品牌與交付約定配置", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col md:flex-row font-sans">
      {/* ===================== PC 宽屏固定侧边栏 (Desktop Sidebar) ===================== */}
      <aside className="hidden md:flex md:w-64 xl:w-72 bg-slate-900 text-white flex-col flex-shrink-0 min-h-screen sticky top-0 shadow-2xl z-40 border-r border-slate-800">
        {/* 顶部品牌身份 */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center font-black text-slate-950 text-base shadow-md">
              優
            </div>
            <div>
              <div className="font-black text-base tracking-tight text-white flex items-center gap-1.5">
                <span>供港優鮮</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded font-bold">
                  SaaS
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-medium">M 操盤總控後台 (寬屏版)</div>
            </div>
          </div>

          <div className="mt-3.5 bg-slate-800/80 rounded-xl p-2.5 text-[11px] text-slate-300 flex items-center gap-2 border border-slate-700/60">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
            <span className="truncate">深水埗蘇屋邨 0 號樣板間</span>
          </div>
        </div>

        {/* 导航菜单列表 */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">
            核心運營模塊
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all text-left group ${
                  active
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${active ? "text-white" : "text-slate-400 group-hover:text-emerald-400"}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      active ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* 底部快速通道 */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 space-y-2">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2">
            跨端快速直達
          </div>
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition"
          >
            <div className="flex items-center gap-2">
              <Store className="w-3.5 h-3.5 text-emerald-400" />
              <span>街坊自選訂菜商城</span>
            </div>
            <ExternalLink className="w-3 h-3 text-slate-500" />
          </Link>

          <Link
            href="/leader"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition"
          >
            <div className="flex items-center gap-2">
              <Smartphone className="w-3.5 h-3.5 text-blue-400" />
              <span>樓長移動駕駛艙</span>
            </div>
            <ExternalLink className="w-3 h-3 text-slate-500" />
          </Link>

          <div className="pt-2 text-[10px] text-slate-500 text-center font-mono">
            V1.2 · 橫豎屏全自適應架構
          </div>
        </div>
      </aside>

      {/* ===================== 移动端顶部导航 (Mobile Header & Drawer) ===================== */}
      <header className="md:hidden bg-slate-900 text-white sticky top-0 z-40 shadow-md">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center font-black text-slate-950 text-xs">
              優
            </div>
            <span className="font-black text-sm text-white">供港優鮮總控台</span>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* 移动端横向滑动标签栏 */}
        <div className="flex px-3 space-x-1.5 overflow-x-auto border-t border-slate-800 py-2">
          {navItems.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setMobileMenuOpen(false);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                  active ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* 移动端展开菜单抽屉 */}
        {mobileMenuOpen && (
          <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-2">
            <Link
              href="/"
              className="block p-2.5 bg-slate-900 rounded-xl text-xs font-bold text-emerald-400"
            >
              🛒 前往街坊訂菜首頁
            </Link>
            <Link
              href="/leader"
              className="block p-2.5 bg-slate-900 rounded-xl text-xs font-bold text-blue-400"
            >
              📱 前往樓長移動駕駛艙
            </Link>
          </div>
        )}
      </header>

      {/* ===================== 主体宽屏工作区 (Right Main Content Area) ===================== */}
      <main className="flex-1 min-w-0 p-4 md:p-8 xl:p-10 max-w-7xl mx-auto w-full">
        {/* 顶部标题与操作栏 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-slate-200 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                {navItems.find((n) => n.id === activeTab)?.label}
              </h1>
              <span className="hidden sm:inline-block text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                蘇屋邨 14 座大廈實時對接中
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              數據實時同步 · 嚴守香港 Cap 617 傳銷與房屋署 C9 規範 · 人工對賬安全閉環
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchAdminData}
              disabled={loading}
              className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? "animate-spin" : ""}`} />
              <span>刷新實時數據</span>
            </button>
          </div>
        </div>

        {/* 宽屏五大多维核心指标看板 (PC 5列展开，移动端2列) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 md:gap-4 mb-8">
          <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-300 transition">
            <span className="text-xs text-slate-400 font-bold block">歷史累計 GMV</span>
            <div className="text-xl md:text-2xl font-black text-slate-900 mt-1.5">
              HK$ {stats.totalGmv || "0.00"}
            </div>
            <span className="text-[10px] text-emerald-600 font-bold block mt-1">
              100% 蔬菜真實訂單
            </span>
          </div>

          <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-300 transition">
            <span className="text-xs text-slate-400 font-bold block">累計下單筆數</span>
            <div className="text-xl md:text-2xl font-black text-slate-900 mt-1.5">
              {stats.totalOrders || 0} 筆
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">客單價約 HK$ 19.9</span>
          </div>

          <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-300 transition">
            <span className="text-xs text-slate-400 font-bold block">在冊買菜戶數</span>
            <div className="text-xl md:text-2xl font-black text-slate-900 mt-1.5">
              {stats.totalCustomers || 0} 戶
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">蘇屋邨在冊房號</span>
          </div>

          <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-300 transition">
            <span className="text-xs text-slate-400 font-bold block">在席活躍樓長</span>
            <div className="text-xl md:text-2xl font-black text-emerald-600 mt-1.5">
              {stats.totalLeaders || 0} 位
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">華姐 (牡丹樓) 等</span>
          </div>

          <div className="bg-white p-4 md:p-5 rounded-2xl border border-amber-200 bg-amber-50/50 shadow-sm col-span-2 md:col-span-1">
            <span className="text-xs text-amber-800 font-bold block">空白網點 (待孵化)</span>
            <div className="text-xl md:text-2xl font-black text-amber-600 mt-1.5">
              {stats.blankBuildingsCount || 0} 座
            </div>
            <span className="text-[10px] text-amber-700 font-bold block mt-1">
              有訂單但暫無樓長
            </span>
          </div>
        </div>

        {/* ===================== 模块 1: 网格大厦穿透与 KOC 裂变雷达 ===================== */}
        {activeTab === "grid" && (
          <div className="space-y-8">
            {/* 表 1：全邨 14 座大厦网格穿透看板 */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                <div>
                  <h3 className="font-black text-base md:text-lg text-slate-900 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-emerald-600" />
                    <span>深水埗蘇屋邨 14 座大廈網格滲透穿透看板</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    實時穿透每座大廈訂單與買菜戶；自動捕獲空白大廈 TOP 買家，由管理人員人工定向邀約，絕無冷冰冰系統自動升級
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">大廈座號</th>
                      <th className="py-3 px-4">大廈名稱</th>
                      <th className="py-3 px-4">樓長覆蓋狀態</th>
                      <th className="py-3 px-4">在冊買菜戶</th>
                      <th className="py-3 px-4">累計訂單</th>
                      <th className="py-3 px-4">⭐ 核心高潛種子街坊 (發掘目標)</th>
                      <th className="py-3 px-4 text-right">人工邀約操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {buildingStats.map((bldg) => (
                      <tr key={bldg.buildingId} className="hover:bg-slate-50 transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                          {bldg.blockCode}
                        </td>
                        <td className="py-3.5 px-4 font-black text-slate-900 text-sm">
                          {bldg.buildingName}
                        </td>
                        <td className="py-3.5 px-4">
                          {bldg.leader ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full font-bold text-[11px]">
                              🟢 {bldg.leader.realName} ({bldg.leader.inviteCode})
                            </span>
                          ) : bldg.customerCount > 0 ? (
                            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full font-bold text-[11px]">
                              🟡 空白網點 (牙仔代跑)
                            </span>
                          ) : (
                            <span className="text-slate-300 font-medium">⚪ 未破冰 (0戶)</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-800">{bldg.customerCount} 戶</td>
                        <td className="py-3.5 px-4 font-bold text-slate-800">{bldg.orderCount} 筆</td>
                        <td className="py-3.5 px-4">
                          {bldg.starProspect ? (
                            <div className="flex items-center gap-2">
                              <span className="bg-amber-100 text-amber-900 font-black px-2 py-0.5 rounded text-[10px]">
                                ⭐ TOP1 買家
                              </span>
                              <span className="font-bold text-slate-800">
                                {bldg.starProspect.realName} ({bldg.starProspect.flatNo})
                              </span>
                              <span className="text-slate-400 text-[11px]">
                                已訂 {bldg.starProspect.ordersCount} 次
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-300">--</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          {bldg.starProspect && (
                            <>
                              <button
                                onClick={() => {
                                  const text = generateInviteMessage(bldg.starProspect, bldg.buildingName);
                                  handleCopyText(text);
                                }}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-xl text-xs transition inline-flex items-center gap-1 shadow-sm"
                              >
                                {copiedText.includes(bldg.starProspect.realName) ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                                <span>複製邀約</span>
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
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition shadow-sm"
                              >
                                手動升為樓長
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
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                <div>
                  <h3 className="font-black text-base md:text-lg text-slate-900 flex items-center gap-2">
                    <Gift className="w-5 h-5 text-orange-500" />
                    <span>街坊轉介紹 KOC 裂變達人雷達（成功推薦戶數 $\ge 1$）</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    前台只以“純送積分換青菜”吸引街坊拉鄰里；後台雷達抓取拉滿 3~5 人的達人，管理員面談後手動邀約入庫
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">街坊稱呼</th>
                      <th className="py-3 px-4">大廈門牌</th>
                      <th className="py-3 px-4">香港電話</th>
                      <th className="py-3 px-4">成功推薦戶數</th>
                      <th className="py-3 px-4">帶動總單量</th>
                      <th className="py-3 px-4">買菜積分餘額</th>
                      <th className="py-3 px-4">系統高潛評級</th>
                      <th className="py-3 px-4 text-right">人工邀約操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {kocLeaderboard.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-10 text-center text-slate-400 text-xs">
                          暫無轉介紹數據，街坊在前端點擊“推薦街坊得青菜”即可累積
                        </td>
                      </tr>
                    ) : (
                      kocLeaderboard.map((koc, idx) => (
                        <tr key={koc.phone} className="hover:bg-slate-50 transition">
                          <td className="py-3.5 px-4 font-black text-slate-900 text-sm">
                            {idx === 0 && "🥇 "}
                            {idx === 1 && "🥈 "}
                            {idx === 2 && "🥉 "}
                            {koc.realName}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 font-medium">
                            {koc.buildingName} {koc.flatNo}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                            {koc.phone}
                          </td>
                          <td className="py-3.5 px-4 font-black text-orange-600 text-sm">
                            {koc.refereeCount} 戶
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-800">{koc.totalRefereeOrders} 單</td>
                          <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">
                            {koc.pointsBalance} 分
                          </td>
                          <td className="py-3.5 px-4 font-bold text-amber-700">
                            {koc.rating}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {koc.isAlreadyLeader ? (
                              <span className="text-emerald-600 font-bold">已是在席樓長</span>
                            ) : (
                              <button
                                onClick={() => {
                                  const text = generateInviteMessage(koc, koc.buildingName);
                                  handleCopyText(text);
                                }}
                                className="bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 font-bold px-3 py-1.5 rounded-xl text-xs transition inline-flex items-center gap-1 shadow-sm"
                              >
                                <Copy className="w-3.5 h-3.5" />
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

        {/* ===================== 模块 2: 商品与货架管理 (宽屏多列网格) ===================== */}
        {activeTab === "products" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div>
              <h3 className="font-black text-base md:text-lg text-slate-900 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-emerald-600" />
                <span>今日 8 大主力自選蔬菜貨架管理 (PC 寬屏多列陳列)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                單品均為足 500g 精選保鮮裝，對標旺角街市打 7 折，毛利率堅守在 40% - 58%
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col justify-between hover:border-emerald-300 transition"
                >
                  <div className="flex items-center gap-3.5 mb-3">
                    <img
                      src={p.imageUrl}
                      alt={p.nameZh}
                      className="w-16 h-16 rounded-xl object-cover bg-white shadow-sm flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 text-sm truncate">{p.nameZh}</h4>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{p.subTitle}</p>
                      <span className="inline-block mt-1 text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                        {p.netWeight} 足斤裝
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400 block">零售特惠價</span>
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-slate-700 text-xs">HK$</span>
                        <input
                          type="number"
                          step="0.1"
                          value={p.priceHkd}
                          onChange={(e) =>
                            handleUpdateProductPrice(p.id, parseFloat(e.target.value) || 0)
                          }
                          className="w-18 px-2 py-1 bg-white border border-slate-300 rounded-lg font-black text-rose-600 text-sm focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">旺角街市參考</span>
                      <span className="text-xs text-slate-400 line-through">
                        HK$ {p.marketPriceHkd}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================== 模块 3: 清晨铁闸配送单导出 (双模式) ===================== */}
        {activeTab === "export" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 space-y-6">
            <div>
              <h3 className="font-black text-base md:text-lg text-slate-900 flex items-center gap-2">
                <Download className="w-5 h-5 text-emerald-600" />
                <span>清晨 21:30 截單配貨與導出中樞 (PC 寬屏工作台)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                支持兩種對接導出方式：按大廈座號房號掃樓掛閘，或按樓長匯總大宗自提交接
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl border border-emerald-200 bg-emerald-50/50 space-y-4">
                <div className="text-base font-black text-emerald-950 flex items-center gap-2">
                  <span>📥 模式一：晨早防盜鐵閘掛袋掃樓清冊</span>
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  專門提供給一線步兵（牙仔）清晨 07:15 - 08:00 掃樓送貨使用。按大廈座號、房號由低至高精準排序，含街坊稱呼、脫敏電話、訂購足斤菜品及防偽封條號。
                </p>
                <a
                  href="/api/admin/export?mode=gate"
                  target="_blank"
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-3 rounded-xl text-xs shadow-md transition active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>下載【晨早鐵閘掛袋掃樓配送單 (CSV)】</span>
                </a>
              </div>

              <div className="p-6 rounded-2xl border border-blue-200 bg-blue-50/50 space-y-4">
                <div className="text-base font-black text-blue-950 flex items-center gap-2">
                  <span>📥 模式二：按樓長大宗自提/交接清冊</span>
                </div>
                <p className="text-xs text-blue-800 leading-relaxed">
                  適用於樓長主動下樓自提、或平台向樓長統一批發交接。匯總每位樓長名下的總訂單數、總金額、直屬服務津貼及導師帶教津貼，確保一鍵對賬零差錯。
                </p>
                <a
                  href="/api/admin/export?mode=leader"
                  target="_blank"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-3 rounded-xl text-xs shadow-md transition active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>下載【樓長自提交接與津貼對賬單 (CSV)】</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* ===================== 模块 4: 规则引擎与计价打勾控制 ===================== */}
        {activeTab === "rules" && (
          <div className="space-y-8">
            {/* 卡片 1：全局计算方式打勾开关 */}
            <form
              onSubmit={handleSaveConfig}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                <div>
                  <h3 className="font-black text-base md:text-lg text-slate-900 flex items-center gap-2">
                    <CheckSquare className="w-5 h-5 text-emerald-600" />
                    <span>【全局計算方式打勾開關】（打勾了系統才有，不打勾就沒有）</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    控制整套系統是否啟用某個計酬維度。打勾即計算入賬，未打勾則完全不扣取、不發放
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={savingConfig}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md active:scale-95 transition"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingConfig ? "保存中..." : "保存全局打勾開關"}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
                {/* 规则 1: 楼长服务津贴 */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="chk-leader"
                      checked={configForm.enableLeaderCommission ?? true}
                      onChange={(e) =>
                        setConfigForm({ ...configForm, enableLeaderCommission: e.target.checked })
                      }
                      className="w-5 h-5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                    />
                    <label htmlFor="chk-leader" className="cursor-pointer">
                      <div className="font-bold text-slate-900 text-sm">
                        1. 愛心樓長直屬服務津貼
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {configForm.enableLeaderCommission ? "✅ 已打勾啟用：每筆訂單發放" : "❌ 未打勾：全域停用樓長津貼"}
                      </div>
                    </label>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold">
                    <span>HK$</span>
                    <input
                      type="number"
                      step="0.1"
                      value={configForm.leaderCommissionRate ?? 2.0}
                      onChange={(e) =>
                        setConfigForm({
                          ...configForm,
                          leaderCommissionRate: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-16 px-2 py-1.5 bg-white border border-slate-200 rounded-lg font-black text-emerald-700 text-xs"
                    />
                    <span className="text-slate-400">/ 單</span>
                  </div>
                </div>

                {/* 规则 2: 导师带教津贴 */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="chk-mentor"
                      checked={configForm.enableMentorAllowance ?? true}
                      onChange={(e) =>
                        setConfigForm({ ...configForm, enableMentorAllowance: e.target.checked })
                      }
                      className="w-5 h-5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                    />
                    <label htmlFor="chk-mentor" className="cursor-pointer">
                      <div className="font-bold text-slate-900 text-sm">
                        2. 業務導師帶教津貼 (Cap 617 二級)
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {configForm.enableMentorAllowance ? "✅ 已打勾啟用：老樓長享受二級帶教津貼" : "❌ 未打勾：全域停用導師津貼"}
                      </div>
                    </label>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold">
                    <span>HK$</span>
                    <input
                      type="number"
                      step="0.1"
                      value={configForm.mentorAllowanceRate ?? 0.5}
                      onChange={(e) =>
                        setConfigForm({
                          ...configForm,
                          mentorAllowanceRate: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-16 px-2 py-1.5 bg-white border border-slate-200 rounded-lg font-black text-emerald-700 text-xs"
                    />
                    <span className="text-slate-400">/ 單</span>
                  </div>
                </div>

                {/* 规则 3: 步兵挂闸运力费 */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="chk-runner"
                      checked={configForm.enableRunnerDelivery ?? true}
                      onChange={(e) =>
                        setConfigForm({ ...configForm, enableRunnerDelivery: e.target.checked })
                      }
                      className="w-5 h-5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                    />
                    <label htmlFor="chk-runner" className="cursor-pointer">
                      <div className="font-bold text-slate-900 text-sm">
                        3. 步兵晨早掛閘運力費
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {configForm.enableRunnerDelivery ? "✅ 已打勾啟用：每單支付運力津貼" : "❌ 未打勾：全域停用運力支出"}
                      </div>
                    </label>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold">
                    <span>HK$</span>
                    <input
                      type="number"
                      step="0.1"
                      value={configForm.runnerDeliveryFee ?? 2.0}
                      onChange={(e) =>
                        setConfigForm({
                          ...configForm,
                          runnerDeliveryFee: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-16 px-2 py-1.5 bg-white border border-slate-200 rounded-lg font-black text-emerald-700 text-xs"
                    />
                    <span className="text-slate-400">/ 單</span>
                  </div>
                </div>

                {/* 规则 4: 街坊转介绍积分 */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="chk-points"
                      checked={configForm.enableReferralPoints ?? true}
                      onChange={(e) =>
                        setConfigForm({ ...configForm, enableReferralPoints: e.target.checked })
                      }
                      className="w-5 h-5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                    />
                    <label htmlFor="chk-points" className="cursor-pointer">
                      <div className="font-bold text-slate-900 text-sm">
                        4. 街坊轉介紹買菜積分
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {configForm.enableReferralPoints ? "✅ 已打勾啟用：推薦鄰里送積分換菜" : "❌ 未打勾：全域停用轉介紹積分"}
                      </div>
                    </label>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold">
                    <input
                      type="number"
                      value={configForm.referralPointsPerOrder ?? 100}
                      onChange={(e) =>
                        setConfigForm({
                          ...configForm,
                          referralPointsPerOrder: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-16 px-2 py-1.5 bg-white border border-slate-200 rounded-lg font-black text-orange-600 text-xs"
                    />
                    <span className="text-slate-400">積分 (100分換1包菜)</span>
                  </div>
                </div>

                {/* 规则 5: 免运费门槛 */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between lg:col-span-2">
                  <div>
                    <div className="font-bold text-slate-900 text-sm">
                      5. 自選免運費包郵門檻 (Free Shipping Threshold)
                    </div>
                    <div className="text-[11px] text-slate-400">
                      純蔬菜階段實收滿額即免運費晨早掛閘
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold">
                    <span>HK$</span>
                    <input
                      type="number"
                      step="0.1"
                      value={configForm.freeShippingThreshold ?? 18.9}
                      onChange={(e) =>
                        setConfigForm({
                          ...configForm,
                          freeShippingThreshold: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-20 px-2 py-1.5 bg-white border border-slate-200 rounded-lg font-black text-slate-900 text-sm"
                    />
                    <span className="text-slate-400 font-bold">包郵</span>
                  </div>
                </div>
              </div>
            </form>

            {/* 卡片 2：单人个性化打勾列表（楼长自送 vs 平台统配） */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 space-y-4">
              <div>
                <h3 className="font-black text-base md:text-lg text-slate-900 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-emerald-600" />
                  <span>【單人個性化打勾列表】（個別樓長自行配送 vs 平台統配找人送）</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  如您所設想：某位樓長自己每天下來拿菜送上樓，就在她那裡【打勾】，運力費歸她；如果是平台找人統配，就【不打勾】，運力費扣給送貨員牙仔
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">樓長姓名</th>
                      <th className="py-3 px-4">邀請碼</th>
                      <th className="py-3 px-4">負責大廈</th>
                      <th className="py-3 px-4">香港電話</th>
                      <th className="py-3 px-4">【單人打勾】履約與配送方式</th>
                      <th className="py-3 px-4 text-right">每單應得津貼合計</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {leaders.map((leader) => {
                      const isSelf = leader.isSelfDelivery ?? false;
                      const baseRate = configForm.leaderCommissionRate ?? 2.0;
                      const runnerRate = configForm.runnerDeliveryFee ?? 2.0;
                      const totalPerOrder = isSelf ? baseRate + runnerRate : baseRate;

                      return (
                        <tr key={leader.id} className="hover:bg-slate-50 transition">
                          <td className="py-3.5 px-4 font-black text-slate-900 text-sm">
                            {leader.realName}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">
                            {leader.inviteCode}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-700">
                            {leader.buildingName}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-500">
                            {leader.hkPhone}
                          </td>
                          <td className="py-3.5 px-4">
                            <label className="inline-flex items-center gap-2 cursor-pointer bg-slate-100 hover:bg-slate-200/80 px-3 py-1.5 rounded-xl border border-slate-200 transition">
                              <input
                                type="checkbox"
                                checked={isSelf}
                                onChange={() => handleToggleLeaderDelivery(leader.id, isSelf)}
                                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                              />
                              <span className="font-bold text-[11px] text-slate-800">
                                {isSelf ? (
                                  <span className="text-emerald-700">
                                    ☑️ 樓長自提並自行配送掛鐵閘 (獨享運力費)
                                  </span>
                                ) : (
                                  <span className="text-slate-500">
                                    ☐ 平台統一找人配送 (運力歸牙仔/步兵)
                                  </span>
                                )}
                              </span>
                            </label>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <span className="font-black text-sm text-emerald-700">
                              HK$ {totalPerOrder.toFixed(1)}
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              {isSelf ? `(服務$${baseRate} + 運力$${runnerRate})` : `(僅服務津貼$${baseRate})`}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===================== 模块 5: 品牌与交付约定配置 ===================== */}
        {activeTab === "brand" && (
          <form
            onSubmit={handleSaveConfig}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 space-y-6"
          >
            <div>
              <h3 className="font-black text-base md:text-lg text-slate-900 flex items-center gap-2">
                <Settings className="w-5 h-5 text-emerald-600" />
                <span>品牌、溯源與交付約定配置 (PC 寬屏配置)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                前端即時解耦生效，支持靈活更換品牌名稱、Slogan與官方聯絡方式
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={savingConfig}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md active:scale-95 transition"
              >
                <Save className="w-4 h-4" />
                <span>{savingConfig ? "保存中..." : "保存文案配置"}</span>
              </button>
            </div>
          </form>
        )}
      </main>

      {/* 晋升楼长弹窗 */}
      {promoteModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 space-y-4">
            <h3 className="font-black text-base text-slate-900">
              手動將街坊升格為愛心樓長 (M2L 人工邀約後入庫)
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
