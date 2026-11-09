"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  ShoppingBag,
  Plus,
  Minus,
  CheckCircle2,
  Gift,
  ArrowRight,
  Clock,
  Phone,
  Copy,
  ChevronRight,
  Check,
  Send,
  Coins,
  Search,
  UserCheck,
  Store,
  Smartphone,
  ShieldCheck,
} from "lucide-react";
import { Product, AppConfig } from "@/types";

export default function OrderPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [cart, setCart] = useState<{ [productId: string]: number }>({});
  const [loading, setLoading] = useState(true);

  // 推荐人识别 (从 ?ref=92345678 读取)
  const [referrerPhone, setReferrerPhone] = useState<string | null>(null);

  // 结账弹窗状态
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [realName, setRealName] = useState("");
  const [buildingName, setBuildingName] = useState("牡丹樓");
  const [flatNo, setFlatNo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState<any>(null);

  // 转介绍分享弹窗
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // 积分钱包查询与兑换状态
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [walletPhone, setWalletPhone] = useState("");
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletData, setWalletData] = useState<any>(null);
  const [redeemSuccessMsg, setRedeemSuccessMsg] = useState("");

  useEffect(() => {
    fetchData();
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get("ref");
      if (ref) setReferrerPhone(ref);
    }
  }, []);

  const fetchData = async () => {
    try {
      const [prodRes, cfgRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/admin/config"),
      ]);
      const prodData = await prodRes.json();
      const cfgData = await cfgRes.json();
      if (prodData.products) setProducts(prodData.products);
      if (cfgData.config) setConfig(cfgData.config);
    } catch (err) {
      console.error("Failed to load initial data", err);
    } finally {
      setLoading(false);
    }
  };

  const updateCart = (productId: string, delta: number) => {
    setCart((prev) => {
      const current = prev[productId] || 0;
      const next = current + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      }
      return { ...prev, [productId]: next };
    });
  };

  const totalItemsCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  const totalAmountHkd = products.reduce((sum, p) => {
    const qty = cart[p.id] || 0;
    return sum + qty * p.priceHkd;
  }, 0);

  const freeThreshold = config?.freeShippingThreshold || 18.9;
  const isFreeShipping = totalAmountHkd >= freeThreshold;
  const diffToFree = +(freeThreshold - totalAmountHkd).toFixed(1);

  const handleOpenCheckout = () => {
    if (totalItemsCount === 0) return;
    setCheckoutOpen(true);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || !realName.trim() || !flatNo.trim()) {
      alert("請填寫完整的電話、稱呼和房號");
      return;
    }

    setSubmitting(true);
    try {
      const orderItems = products
        .filter((p) => (cart[p.id] || 0) > 0)
        .map((p) => ({
          productId: p.id,
          nameZh: p.nameZh,
          qty: cart[p.id],
          priceHkd: p.priceHkd,
          netWeight: p.netWeight,
        }));

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerPhone: phone,
          customerName: realName,
          estateName: "深水埗蘇屋邨",
          buildingName,
          flatNo,
          items: orderItems,
          totalAmountHkd: +totalAmountHkd.toFixed(2),
          referrerPhone: referrerPhone || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "下單失敗");

      setSubmittedOrder(data.order);
      setCart({});
    } catch (err: any) {
      alert(err.message || "系統繁忙，請稍後再試");
    } finally {
      setSubmitting(false);
    }
  };

  const queryPointsWallet = async (phoneToQuery: string) => {
    if (!phoneToQuery.trim()) return;
    setWalletLoading(true);
    setRedeemSuccessMsg("");
    try {
      const res = await fetch(`/api/customer/points?phone=${phoneToQuery.trim()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "查詢失敗");
      setWalletData(data);
    } catch (err: any) {
      alert(err.message || "查詢失敗，請檢查電話號碼");
    } finally {
      setWalletLoading(false);
    }
  };

  const handleRedeemPoints = async () => {
    if (!walletPhone.trim()) return;
    try {
      const res = await fetch("/api/customer/points", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: walletPhone, points: 100 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "兌換失敗");
      setRedeemSuccessMsg(data.message);
      queryPointsWallet(walletPhone);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const buildWhatsAppOrderMessage = () => {
    if (!submittedOrder) return "";
    const itemsList = submittedOrder.items
      .map((i: any) => `🥬 ${i.nameZh} x${i.qty}份 (HK$ ${(i.priceHkd * i.qty).toFixed(1)})`)
      .join("%0A");

    return (
      `早晨！我已在【供港優鮮】登記晨早自選蔬菜：%0A%0A` +
      `📌 訂單編號：${submittedOrder.orderNo}%0A` +
      `🏠 送達地址：蘇屋邨 ${submittedOrder.buildingName} ${submittedOrder.flatNo}%0A` +
      `👤 街坊稱呼：${submittedOrder.customerName} (${submittedOrder.customerPhone})%0A%0A` +
      `🛒 訂購清單：%0A${itemsList}%0A%0A` +
      `💰 實付總額：HK$ ${submittedOrder.totalAmountHkd.toFixed(2)} (滿額包郵·晨早掛閘)%0A%0A` +
      `請確認訂單及轉數快(FPS)/現金交收方式，唔該晒！`
    );
  };

  const handleCopyReferral = () => {
    const myPhone = phone || walletPhone || "92345678";
    const inviteUrl = typeof window !== "undefined" ? `${window.location.origin}/?ref=${myPhone}` : "";
    const text = `【蘇屋街坊福利】東莞潤豐基地直供！新鮮蔬菜足500g一斤裝比街市平3成，清晨 07:15-08:00 專人掛防盜鐵閘把手。用我呢個鏈接首次買菜，你有一包特惠菜，我都有一包免費青菜：\n${inviteUrl}`;
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-32">
      {/* 顶部品牌与安全认证 (全自适应响应式横幅) */}
      <header className="bg-emerald-700 text-white pt-6 pb-8 px-4 sm:px-8 rounded-b-[2.5rem] shadow-md">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="inline-flex items-center space-x-1.5 bg-emerald-800/80 text-emerald-200 px-3 py-1 rounded-full text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>廣東東莞石碣潤豐直發 · 文錦渡檢驗檢疫放行</span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/leader"
                className="text-xs text-emerald-200 hover:text-white font-medium flex items-center gap-1"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>樓長駕駛艙</span>
              </Link>
              <span className="text-emerald-500">|</span>
              <Link
                href="/admin"
                className="text-xs text-emerald-200 hover:text-white font-medium flex items-center gap-1"
              >
                <span>管理總台 (PC寬屏)</span>
              </Link>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
                <span>{config?.brandName || "供港優鮮"}</span>
                <span className="text-sm font-bold bg-yellow-400 text-emerald-950 px-2.5 py-0.5 rounded-lg shadow-sm">
                  {config?.brandSubtitle || "屋邨直通車"}
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100 mt-1.5 max-w-xl leading-relaxed">
                {config?.slogan || "源頭直供 · 晨採午達 · 足500g一斤裝 · 街坊特惠比街市平3成"}
              </p>
            </div>

            {/* 顶栏右侧快捷功能入口 */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setShareModalOpen(true)}
                className="bg-gradient-to-r from-amber-400 to-orange-400 text-slate-900 px-3.5 py-2 rounded-xl text-xs font-black shadow-sm flex items-center gap-1.5 hover:shadow transition active:scale-95"
              >
                <Gift className="w-4 h-4 text-orange-800" />
                <span>推薦鄰居得青菜</span>
              </button>

              <button
                onClick={() => {
                  setWalletPhone(phone || "92345678");
                  queryPointsWallet(phone || "92345678");
                  setWalletModalOpen(true);
                }}
                className="bg-emerald-800/90 border border-emerald-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 hover:bg-emerald-800 transition active:scale-95"
              >
                <Coins className="w-4 h-4 text-yellow-300" />
                <span>我的買菜積分</span>
              </button>
            </div>
          </div>

          {/* 邻里转介绍专属提示 */}
          {referrerPhone && (
            <div className="mt-3.5 bg-emerald-900/90 border border-yellow-400/60 rounded-xl p-3 text-xs text-yellow-200 flex items-center gap-2.5 shadow-sm animate-in fade-in">
              <UserCheck className="w-4 h-4 text-yellow-400 flex-shrink-0" />
              <span>
                鄰舍福利：您正通過熱心街坊 <b>(+852 {referrerPhone})</b> 的專屬分享選購！本次下單雙方皆可積累買菜積分免費換蔬菜！
              </span>
            </div>
          )}

          {/* 晨早铁闸挂袋交付约定通知 */}
          <div className="mt-3 bg-emerald-800/60 border border-emerald-600/50 rounded-xl p-3 text-xs leading-relaxed text-emerald-50">
            <div className="flex items-center gap-1.5 font-bold text-yellow-300 mb-1">
              <Clock className="w-3.5 h-3.5" />
              <span>晨早防盜鐵閘掛袋便民約定 (07:15 - 08:00)</span>
            </div>
            <p className="text-[11px] opacity-90">
              配送員清晨將 500g 保鮮蔬菜懸掛於鐵閘外側把手，請於 08:30 前取入屋內。全港首創：次日免費同址補送新鮮蔬菜，守護街坊一日三餐！
            </p>
          </div>
        </div>
      </header>

      {/* ===================== 全自适应主体布局 (PC 双列宽屏，手机单列) ===================== */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* 左侧 2 列：蔬菜商品自选货架 (PC 2列网格，手机单列) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>今日蘇屋邨直供鮮菜</span>
                <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                  足500g精選保鮮裝
                </span>
              </h2>
              <span className="text-xs text-slate-400">自選自由搭配 · 買2-3樣剛好一餐</span>
            </div>

            {loading ? (
              <div className="text-center py-16 text-slate-400 text-xs">正在載入供港新鮮蔬菜...</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {products.map((p) => {
                  const qty = cart[p.id] || 0;
                  return (
                    <div
                      key={p.id}
                      className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5 hover:border-emerald-300 transition"
                    >
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                        <img
                          src={p.imageUrl}
                          alt={p.nameZh}
                          className="w-full h-full object-cover"
                        />
                        {p.tag && (
                          <span className="absolute top-1 left-1 bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm">
                            {p.tag}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-900 text-sm truncate">{p.nameZh}</h3>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">{p.subTitle}</p>

                        <div className="flex items-baseline gap-1.5 mt-2">
                          <span className="text-rose-600 font-black text-base">
                            HK$ {p.priceHkd.toFixed(1)}
                          </span>
                          <span className="text-slate-300 line-through text-xs">
                            HK$ {p.marketPriceHkd.toFixed(1)}
                          </span>
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">
                            {p.netWeight}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {qty > 0 && (
                          <>
                            <button
                              onClick={() => updateCart(p.id, -1)}
                              className="w-7 h-7 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-600 active:scale-95 transition"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-xs font-black w-4 text-center">{qty}</span>
                          </>
                        )}
                        <button
                          onClick={() => updateCart(p.id, 1)}
                          className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-sm active:scale-95 hover:bg-emerald-700 transition"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 右侧 1 列：PC 端桌面常驻结算与积分面板 (PC 专享宽屏视图) */}
          <div className="hidden lg:block lg:col-span-1 space-y-4 sticky top-6">
            {/* 包邮进度条面板 */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between text-xs font-bold mb-2">
                <span className="text-slate-700 flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-emerald-600" />
                  <span>自選包郵進度</span>
                </span>
                <span className={isFreeShipping ? "text-emerald-600" : "text-amber-600"}>
                  {isFreeShipping ? "🎉 已享清晨免費掛閘！" : `差 HK$ ${diffToFree} 包郵`}
                </span>
              </div>

              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    isFreeShipping ? "bg-emerald-500" : "bg-amber-400"
                  }`}
                  style={{
                    width: `${Math.min(100, (totalAmountHkd / freeThreshold) * 100)}%`,
                  }}
                />
              </div>

              <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1.5">
                <span>選購總額: HK$ {totalAmountHkd.toFixed(1)}</span>
                <span>包郵門檻: HK$ {freeThreshold.toFixed(1)}</span>
              </div>

              {/* 实时购物车详情 */}
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2.5">
                <div className="text-xs font-bold text-slate-900 flex justify-between">
                  <span>已選清單 ({totalItemsCount} 份)</span>
                  <span className="text-rose-600 text-sm font-black">
                    實付 HK$ {totalAmountHkd.toFixed(1)}
                  </span>
                </div>

                {totalItemsCount === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs">
                    購物車空空如也，請在左側選購新鮮蔬菜
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto text-xs">
                    {products
                      .filter((p) => (cart[p.id] || 0) > 0)
                      .map((p) => (
                        <div key={p.id} className="flex justify-between text-slate-600">
                          <span>
                            {p.nameZh} x{cart[p.id]}
                          </span>
                          <span>HK$ {(p.priceHkd * cart[p.id]).toFixed(1)}</span>
                        </div>
                      ))}
                  </div>
                )}

                <button
                  onClick={handleOpenCheckout}
                  disabled={totalItemsCount === 0}
                  className={`w-full py-3 rounded-xl text-xs font-black shadow-md flex items-center justify-center gap-2 transition ${
                    totalItemsCount > 0
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer active:scale-95"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  <span>立即登記下單 · 晨早掛鐵閘</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* PC 侧边积分钱包快捷面板 */}
            <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-black text-emerald-950 text-xs">
                  <Coins className="w-4 h-4 text-emerald-600" />
                  <span>買菜積分隨時換青菜</span>
                </div>
                <button
                  onClick={() => {
                    setWalletPhone(phone || "92345678");
                    queryPointsWallet(phone || "92345678");
                    setWalletModalOpen(true);
                  }}
                  className="text-[11px] text-emerald-700 font-bold hover:underline"
                >
                  輸入電話查詢 →
                </button>
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                每成功推薦 1 戶蘇屋街坊買菜，即贈 100 買菜積分！滿 100 分即可免費兌換 1 包 500g 寧夏菜心隨單送達。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ===================== 移动端专用底部悬浮购物车 (< lg 屏幕显示) ===================== */}
      {totalItemsCount > 0 && (
        <div className="lg:hidden fixed bottom-4 left-0 right-0 px-4 z-40 max-w-md mx-auto">
          <div className="bg-slate-900 text-white rounded-2xl p-3.5 shadow-2xl flex items-center justify-between border border-slate-700">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xs text-slate-400">已選 {totalItemsCount} 樣 · 實付</span>
                <span className="text-xl font-black text-yellow-400">
                  HK$ {totalAmountHkd.toFixed(1)}
                </span>
              </div>
              <div className="text-[10px] text-slate-300">
                {isFreeShipping ? "✅ 已達標：清晨免費掛閘送樓" : `還差 HK$ ${diffToFree} 包郵`}
              </div>
            </div>

            <button
              onClick={handleOpenCheckout}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 active:scale-95 transition shadow-lg"
            >
              <span>立即登記下單</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 结账登记弹窗 (全自适应对话框) */}
      {checkoutOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-2xl p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            {!submittedOrder ? (
              <form onSubmit={handleSubmitOrder}>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-base font-black text-slate-900">
                    登記蘇屋邨送菜地址
                  </h3>
                  <button
                    type="button"
                    onClick={() => setCheckoutOpen(false)}
                    className="text-xs text-slate-400 hover:text-slate-600"
                  >
                    取消
                  </button>
                </div>

                <div className="mt-4 space-y-3.5 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      8 位香港手機號碼
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-400 font-bold">+852</span>
                      <input
                        type="tel"
                        maxLength={8}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                        placeholder="例如：91234567"
                        className="w-full pl-14 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none font-bold text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">街坊稱呼</label>
                      <input
                        type="text"
                        value={realName}
                        onChange={(e) => setRealName(e.target.value)}
                        placeholder="例如：陳太"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none font-bold"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">大廈座號</label>
                      <select
                        value={buildingName}
                        onChange={(e) => setBuildingName(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none font-bold"
                      >
                        <option value="牡丹樓">牡丹樓 (有樓長)</option>
                        <option value="金菊樓">金菊樓 (直通車專送)</option>
                        <option value="茶花樓">茶花樓</option>
                        <option value="杜鵑樓">杜鵑樓</option>
                        <option value="綠柳樓">綠柳樓</option>
                        <option value="櫻桃樓">櫻桃樓</option>
                        <option value="荷花樓">荷花樓</option>
                        <option value="蘭花樓">蘭花樓</option>
                        <option value="壽菊樓">壽菊樓</option>
                        <option value="百合樓">百合樓</option>
                        <option value="楓林樓">楓林樓</option>
                        <option value="丁香樓">丁香樓</option>
                        <option value="劍蘭樓">劍蘭樓</option>
                        <option value="海棠樓">海棠樓</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      門牌房號 (掛閘位置)
                    </label>
                    <input
                      type="text"
                      value={flatNo}
                      onChange={(e) => setFlatNo(e.target.value)}
                      placeholder="例如：1204室 (鐵閘外把手)"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none font-bold"
                      required
                    />
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="font-bold text-slate-600 mb-1.5 flex justify-between">
                      <span>訂單摘要</span>
                      <span className="text-emerald-700">共 {totalItemsCount} 樣 (足斤保鮮裝)</span>
                    </div>
                    <div className="space-y-1 text-slate-500">
                      {products
                        .filter((p) => (cart[p.id] || 0) > 0)
                        .map((p) => (
                          <div key={p.id} className="flex justify-between">
                            <span>
                              {p.nameZh} x{cart[p.id]}
                            </span>
                            <span>HK$ {(p.priceHkd * cart[p.id]).toFixed(1)}</span>
                          </div>
                        ))}
                    </div>
                    <div className="border-t border-slate-200 mt-2 pt-2 flex justify-between font-black text-slate-900 text-sm">
                      <span>實付總額</span>
                      <span className="text-rose-600">HK$ {totalAmountHkd.toFixed(1)}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full mt-5 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-xl text-sm shadow-md active:scale-95 transition flex items-center justify-center gap-1.5"
                >
                  {submitting ? "正在登記訂單..." : "確認下單 · 晨早掛鐵閘"}
                </button>
              </form>
            ) : (
              <div className="text-center py-4 space-y-4">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>

                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    登記成功！訂單已鎖定
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    訂單編號：<span className="font-bold text-slate-800">{submittedOrder.orderNo}</span>
                  </p>
                  <p className="text-xs text-emerald-700 font-bold mt-1">
                    明日清晨 07:15 - 08:00 將掛於 {submittedOrder.buildingName} {submittedOrder.flatNo} 鐵閘
                  </p>
                </div>

                {submittedOrder.referrerPhone && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-xs text-amber-900 text-left">
                    🌱 <b>買菜積分已入賬</b>：本次訂單已成功為推薦街坊 (+852 {submittedOrder.referrerPhone}) 贈送 100 買菜積分！您也已成為註冊會員，隨時可推薦鄰里賺積分換免費青菜！
                  </div>
                )}

                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-left space-y-2.5">
                  <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <Send className="w-4 h-4 text-emerald-600" />
                    <span>即時向送貨專員發送訂單對賬：</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    請點擊下方綠色按鈕，將預填好的菜單發送至官方 WhatsApp 或微信，客服將發送轉數快(FPS)或安排現金交收。
                  </p>

                  <a
                    href={`https://wa.me/85291234567?text=${buildWhatsAppOrderMessage()}`}
                    target="_blank"
                    rel="noreferrer"
                    className="block w-full bg-[#25D366] hover:bg-[#20ba59] text-white text-center font-black py-2.5 rounded-xl text-xs shadow transition"
                  >
                    💬 一鍵打開 WhatsApp 發送菜單對賬
                  </a>
                </div>

                <button
                  onClick={() => {
                    setSubmittedOrder(null);
                    setCheckoutOpen(false);
                  }}
                  className="w-full text-xs text-slate-400 hover:text-slate-600 py-1"
                >
                  返回首頁
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 积分钱包与换青菜弹窗 */}
      {walletModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-yellow-500" />
                <span>我的買菜積分錢包</span>
              </h3>
              <button
                onClick={() => setWalletModalOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                關閉
              </button>
            </div>

            <div className="flex gap-2">
              <input
                type="tel"
                maxLength={8}
                value={walletPhone}
                onChange={(e) => setWalletPhone(e.target.value.replace(/\D/g, ""))}
                placeholder="輸入 8 位香港電話查詢"
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              />
              <button
                onClick={() => queryPointsWallet(walletPhone)}
                disabled={walletLoading}
                className="bg-emerald-600 text-white px-3 py-2 rounded-xl text-xs font-bold"
              >
                {walletLoading ? "..." : "查詢"}
              </button>
            </div>

            <div className="flex gap-1.5 text-[10px] text-slate-400 items-center">
              <span>快速測試：</span>
              <button
                onClick={() => {
                  setWalletPhone("92345678");
                  queryPointsWallet("92345678");
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-bold"
              >
                陳太 (92345678)
              </button>
            </div>

            {walletData && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 space-y-2.5">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-black text-slate-900 text-sm">
                      {walletData.customer?.realName || "熱心街坊"}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {walletData.customer?.buildingName || "蘇屋邨"} {walletData.customer?.flatNo || ""}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-emerald-700">
                      {walletData.availablePoints}
                    </span>
                    <span className="text-[10px] text-emerald-600 ml-1 font-bold">積分</span>
                  </div>
                </div>

                <div className="bg-white/80 p-2.5 rounded-lg text-xs space-y-1">
                  <div className="flex justify-between font-bold text-slate-700">
                    <span>可免費換領：</span>
                    <span className="text-orange-600">{walletData.canRedeemVeggies} 包足斤新鮮青菜</span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    * 規則：每 100 積分可隨單免費兌換 1 包 500g 寧夏菜心
                  </div>
                </div>

                {walletData.availablePoints >= 100 ? (
                  <button
                    onClick={handleRedeemPoints}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-2 rounded-xl text-xs shadow transition active:scale-95"
                  >
                    🎉 立即使用 100 積分兌換 1 包青菜！
                  </button>
                ) : (
                  <p className="text-[10px] text-center text-slate-400">
                    再邀請 1 位鄰居買菜，即可積滿 100 分免費換領！
                  </p>
                )}

                {redeemSuccessMsg && (
                  <div className="bg-emerald-100 border border-emerald-300 text-emerald-800 text-[11px] font-bold p-2 rounded-lg text-center animate-in fade-in">
                    {redeemSuccessMsg}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 推荐街坊得青菜弹窗 */}
      {shareModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                <Gift className="w-4 h-4 text-orange-500" />
                <span>推薦街坊 · 免費換青菜</span>
              </h3>
              <button
                onClick={() => setShareModalOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                關閉
              </button>
            </div>

            <div className="bg-amber-50 rounded-xl p-3 text-xs leading-relaxed text-amber-900">
              <p className="font-bold mb-1">🌱 街坊互助福利機制：</p>
              <p className="text-[11px] text-amber-800">
                將您的專屬鏈接分享給蘇屋邨鄰居，鄰居成功下單後，您將自動獲得 <b>100 買菜積分</b>（每 100 分直接兌換 1 包新鮮菜心，零現金、不佔便宜、吃健康菜）！
              </p>
            </div>

            <button
              onClick={handleCopyReferral}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow active:scale-95 transition"
            >
              {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLink ? "已複製專屬分享鏈接與文案！" : "一鍵複製專屬推薦文案與鏈接"}</span>
            </button>
          </div>
        </div>
      )}

      {/* 底部导航 */}
      <footer className="max-w-6xl mx-auto px-4 mt-12 text-center text-xs text-slate-400 space-y-2">
        <div className="flex justify-center items-center gap-4 text-slate-500 font-medium">
          <Link href="/join/HUA888" className="hover:text-emerald-700">
            街坊登記專頁
          </Link>
          <span>·</span>
          <Link href="/leader" className="hover:text-emerald-700">
            樓長專屬工作台
          </Link>
          <span>·</span>
          <Link href="/admin" className="hover:text-emerald-700">
            操盤總台 (PC寬屏)
          </Link>
        </div>
        <p className="text-[10px] text-slate-300">
          © 2026 供港優鮮 · 香港九龍深水埗蘇屋邨示範試點
        </p>
      </footer>
    </div>
  );
}
