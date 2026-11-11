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
  Trash2,
  MessageSquare,
  QrCode,
  AlertTriangle,
  ExternalLink,
  Info,
} from "lucide-react";
import { Product, AppConfig } from "@/types";

const UPCOMING_FRUITS = [
  {
    id: "fruit-1",
    nameZh: "智利特級車厘子 (Jumbo級禮盒)",
    subTitle: "足500g精選裝 · 空運直抵 · 果實飽滿脆甜爆汁",
    origin: "智利空運直供",
    referencePrice: 68.0,
    previewPrice: 45.0,
    netWeight: "500g 禮盒",
    tag: "即將登場 · 敬請期待",
    imageUrl: "https://images.unsplash.com/photo-1528825871115-3581a5387919?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: "fruit-2",
    nameZh: "雲南高山特級藍莓 (雙盒精裝)",
    subTitle: "足125g x 2盒 · 晨摘白霜濃郁 · 果粉飽滿爆漿",
    origin: "雲南基地直供",
    referencePrice: 36.0,
    previewPrice: 24.0,
    netWeight: "250g (2盒)",
    tag: "即將登場 · 敬請期待",
    imageUrl: "https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: "fruit-3",
    nameZh: "廣西特選自然熟砂糖桔/沃柑",
    subTitle: "足500g網袋裝 · 樹上自然熟採摘 · 清甜無渣多汁",
    origin: "廣西果園直供",
    referencePrice: 16.0,
    previewPrice: 9.8,
    netWeight: "500g 網袋",
    tag: "即將登場 · 敬請期待",
    imageUrl: "https://images.unsplash.com/photo-1557800636-894a64c1696f?w=500&auto=format&fit=crop&q=60",
  },
];

export default function OrderPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [cart, setCart] = useState<{ [productId: string]: number }>({});
  const [loading, setLoading] = useState(true);

  // 长者关爱大字版设置
  const [isLargeFont, setIsLargeFont] = useState(false);

  // 品类切换：时令蔬菜 (在售) / 产地鲜果 (Coming soon 预告)
  const [activeCategory, setActiveCategory] = useState<"VEG" | "FRUIT">("VEG");

  // 微信客服对账弹窗
  const [wechatModalOpen, setWechatModalOpen] = useState(false);
  const [copiedWechatOrder, setCopiedWechatOrder] = useState(false);
  const [copiedWechatId, setCopiedWechatId] = useState(false);

  // 推荐人识别 (从 ?ref=... 读取，如 ref=NISON, ref=YUN, ref=SOUK_LEAFLET, ref=HUA888, 或手机号)
  const [referrerPhone, setReferrerPhone] = useState<string | null>(null);

  // 结账弹窗状态
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [realName, setRealName] = useState("");
  const [buildingName, setBuildingName] = useState("牡丹樓");
  const [flatNo, setFlatNo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState<any>(null);

  // 推荐分享与积分弹窗状态
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // 积分钱包查询与兑换状态
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [walletPhone, setWalletPhone] = useState("");
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletData, setWalletData] = useState<any>(null);
  const [redeemSuccessMsg, setRedeemSuccessMsg] = useState("");

  // 鲜果到货提醒弹窗
  const [fruitNotifyModalOpen, setFruitNotifyModalOpen] = useState(false);
  const [selectedFruit, setSelectedFruit] = useState<any>(null);
  const [fruitNotifyPhone, setFruitNotifyPhone] = useState("");
  const [fruitNotified, setFruitNotified] = useState(false);

  useEffect(() => {
    fetchData();
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get("ref");
      if (ref) setReferrerPhone(ref);

      const savedLarge = localStorage.getItem("hk_fresh_large_font");
      if (savedLarge === "true") setIsLargeFont(true);
    }
  }, []);

  const toggleLargeFont = () => {
    const next = !isLargeFont;
    setIsLargeFont(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("hk_fresh_large_font", String(next));
    }
  };

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

  const removeFromCart = (productId: string) => {
    setCart((prev) => {
      const copy = { ...prev };
      delete copy[productId];
      return copy;
    });
  };

  const totalItemsCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  const itemsSubtotal = products.reduce((sum, p) => {
    const qty = cart[p.id] || 0;
    return sum + qty * p.priceHkd;
  }, 0);

  const freeThreshold = config?.freeShippingThreshold ?? 18.9;
  const underThresholdFee = config?.underThresholdDeliveryFee ?? 5.0;
  const isFreeShipping = itemsSubtotal >= freeThreshold;
  const deliveryFee = isFreeShipping ? 0 : underThresholdFee;
  const finalTotalHkd = +(itemsSubtotal + deliveryFee).toFixed(2);
  const diffToFree = +(freeThreshold - itemsSubtotal).toFixed(1);

  const isMinOrderBlocked = (config?.enforceMinOrderThreshold ?? false) && itemsSubtotal < freeThreshold;

  const handleOpenCheckout = () => {
    if (totalItemsCount === 0) return;
    if (isMinOrderBlocked) {
      alert(`未滿最低起送門檻 (HK$ ${freeThreshold.toFixed(1)})，請再選購 1 份蔬菜即可下單！`);
      return;
    }
    setCheckoutOpen(true);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || !realName.trim() || !flatNo.trim()) {
      alert("請填寫完整的電話、稱呼和房號");
      return;
    }

    if (isMinOrderBlocked) {
      alert(`未滿最低起送門檻 (HK$ ${freeThreshold.toFixed(1)})，請再選購 1 份蔬菜！`);
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
          totalAmountHkd: finalTotalHkd,
          inviteCode: referrerPhone || undefined,
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

    const deliveryTime = config?.deliveryTimeWindow || "07:15 - 08:00";
    const shippingText = submittedOrder.deliveryFeeHkd > 0
      ? `(含基礎運力配送費 HK$ ${submittedOrder.deliveryFeeHkd.toFixed(1)})`
      : `(滿額包郵·晨早免費掛閘)`;

    return (
      `早晨！我已在【${config?.brandName || "供港優鮮"}】登記晨早自選蔬菜：%0A%0A` +
      `📌 訂單編號：${submittedOrder.orderNo}%0A` +
      `🏠 送達地址：蘇屋邨 ${submittedOrder.buildingName} ${submittedOrder.flatNo}%0A` +
      `👤 街坊稱呼：${submittedOrder.customerName} (+852 ${submittedOrder.customerPhone})%0A` +
      `⏰ 交付約定：明日清晨 ${deliveryTime} 防盜鐵閘外側掛袋%0A%0A` +
      `🛒 訂購清單：%0A${itemsList}%0A%0A` +
      `💰 實付總額：HK$ ${submittedOrder.totalAmountHkd.toFixed(2)} ${shippingText}%0A%0A` +
      `請確認訂單及轉數快(FPS)/現金交收方式，唔該晒！`
    );
  };

  const buildWechatOrderText = () => {
    if (!submittedOrder) return "";
    const itemsList = submittedOrder.items
      .map((i: any) => `• ${i.nameZh} x${i.qty}份 (HK$ ${(i.priceHkd * i.qty).toFixed(1)})`)
      .join("\n");
    const deliveryTime = config?.deliveryTimeWindow || "07:15 - 08:00";

    return (
      `【${config?.brandName || "供港優鮮"} · 蘇屋邨訂單明細】\n` +
      `訂單編號：${submittedOrder.orderNo}\n` +
      `送達地址：深水埗蘇屋邨 ${submittedOrder.buildingName} ${submittedOrder.flatNo}\n` +
      `街坊稱呼：${submittedOrder.customerName} (+852 ${submittedOrder.customerPhone})\n` +
      `掛閘時段：明日清晨 ${deliveryTime}\n\n` +
      `訂購蔬菜清單：\n${itemsList}\n\n` +
      `實付總額：HK$ ${submittedOrder.totalAmountHkd.toFixed(2)}\n` +
      `官方微信客服：${config?.defaultWechatId || "hk_fresh_official"}\n` +
      `（請發送本信息至客服進行對賬及轉數快/現金核對）`
    );
  };

  const handleCopyWechatOrder = () => {
    const text = buildWechatOrderText();
    navigator.clipboard.writeText(text);
    setCopiedWechatOrder(true);
    setWechatModalOpen(true);
    setTimeout(() => setCopiedWechatOrder(false), 3000);
  };

  const handleCopyWechatId = () => {
    const id = config?.defaultWechatId || "hk_fresh_official";
    navigator.clipboard.writeText(id);
    setCopiedWechatId(true);
    setTimeout(() => setCopiedWechatId(false), 2500);
  };

  const handleCopyReferral = () => {
    const myRef = phone || walletPhone || "NISON";
    const inviteUrl = typeof window !== "undefined" ? `${window.location.origin}/?ref=${myRef}` : "";
    const text = `【蘇屋街坊福利】東莞潤豐基地直供！新鮮蔬菜足500g一斤裝比街市平3成，清晨 ${config?.deliveryTimeWindow || "07:15-08:00"} 專人掛防盜鐵閘把手。用我呢個鏈接首次買菜，你有一包特惠菜，我都有一包免費青菜：\n${inviteUrl}`;
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className={`min-h-screen bg-slate-50 text-slate-800 pb-36 ${isLargeFont ? "text-[110%]" : ""}`}>
      {/* ===================== 顶部品牌与安全认证 (全自适应横幅) ===================== */}
      <header className="bg-emerald-700 text-white pt-5 pb-7 px-4 sm:px-8 rounded-b-[2.5rem] shadow-md">
        <div className="max-w-6xl mx-auto">
          {/* 顶栏小工具条 */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3">
            <div className="inline-flex items-center space-x-1.5 bg-emerald-800/90 text-emerald-100 px-3 py-1 rounded-full text-xs font-semibold shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300 flex-shrink-0" />
              <span className="truncate">
                {config?.originBadge || "廣東東莞石碣潤豐基地直發 · 文錦渡檢驗檢疫放行"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* 长者关爱大字版一键切换按钮 */}
              <button
                onClick={toggleLargeFont}
                className={`px-3 py-1 rounded-full text-xs font-black transition flex items-center gap-1.5 shadow-sm active:scale-95 ${
                  isLargeFont
                    ? "bg-amber-400 text-slate-950 ring-2 ring-yellow-200"
                    : "bg-emerald-800/80 text-emerald-100 hover:bg-emerald-800"
                }`}
                title="點擊放大字體與菜品卡片，字大圖清不截斷"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{isLargeFont ? "🔍 長者大字版 (已開啟)" : "🔍 長者大字版"}</span>
              </button>

              <span className="text-emerald-500/80">|</span>

              <Link
                href="/leader"
                className="text-xs text-emerald-200 hover:text-white font-medium flex items-center gap-1"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">樓長駕駛艙</span>
              </Link>
              <Link
                href="/admin"
                className="text-xs text-emerald-200 hover:text-white font-medium flex items-center gap-1"
              >
                <span className="hidden sm:inline">管理總台</span>
              </Link>
            </div>
          </div>

          {/* 品牌主标题与Slogan */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
                <span>{config?.brandName || "供港優鮮"}</span>
                <span className="text-sm font-bold bg-yellow-400 text-emerald-950 px-2.5 py-0.5 rounded-lg shadow-sm">
                  {config?.brandSubtitle || "屋邨直通車"}
                </span>
                {config?.partnerMarketName && (
                  <span className="hidden md:inline-flex items-center gap-1 text-[11px] bg-emerald-800/80 text-emerald-200 px-2 py-0.5 rounded border border-emerald-600/50">
                    <Store className="w-3 h-3 text-yellow-300" />
                    <span>實體合作：{config.partnerMarketName} {config.partnerStallName}</span>
                  </span>
                )}
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
                鄰舍福利：您正通過專屬推薦渠道 <b>[{referrerPhone}]</b> 選購！本次下單雙方皆可積累買菜積分免費換蔬菜！
              </span>
            </div>
          )}

          {/* 晨早铁闸挂袋交付约定通知 */}
          <div className="mt-3 bg-emerald-800/60 border border-emerald-600/50 rounded-xl p-3 text-xs leading-relaxed text-emerald-50">
            <div className="flex items-center gap-1.5 font-bold text-yellow-300 mb-1">
              <Clock className="w-3.5 h-3.5" />
              <span>晨早防盜鐵閘掛袋便民約定 ({config?.deliveryTimeWindow || "07:15 - 08:00"})</span>
            </div>
            <p className="text-[11px] opacity-95">
              {config?.deliveryNotice ||
                `配送員清晨將 500g 保鮮蔬菜懸掛於鐵閘外側把手，請於 08:30 前取入屋內。全港首創：次日免費同址補送新鮮蔬菜，守護街坊一日三餐！`}
            </p>
          </div>
        </div>
      </header>

      {/* ===================== 全自适应主体布局 (PC 双列宽屏，手机单列) ===================== */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-6">
        {/* 品类切换标签栏 (时令蔬菜 vs 产地鲜果) */}
        <div className="flex items-center gap-2 mb-4 bg-slate-200/80 p-1.5 rounded-2xl w-full sm:w-auto inline-flex">
          <button
            onClick={() => setActiveCategory("VEG")}
            className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition flex items-center justify-center gap-2 ${
              activeCategory === "VEG"
                ? "bg-white text-emerald-800 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>🥬 時令蔬菜</span>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
              8款當造
            </span>
          </button>

          <button
            onClick={() => setActiveCategory("FRUIT")}
            className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition flex items-center justify-center gap-2 ${
              activeCategory === "FRUIT"
                ? "bg-white text-amber-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>🍎 產地鮮果</span>
            <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse">
              即將登場 · 敬請期待
            </span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* 左侧 2 列：商品自选货架 */}
          <div className="lg:col-span-2 space-y-4">
            {activeCategory === "VEG" ? (
              <>
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
                    {products
                      .filter((p) => p.isActive !== false)
                      .map((p) => {
                        const qty = cart[p.id] || 0;
                        return (
                          <div
                            key={p.id}
                            className={`bg-white rounded-2xl border border-slate-200 shadow-sm transition hover:border-emerald-300 flex ${
                              isLargeFont
                                ? "p-4 sm:p-5 flex-col sm:flex-row items-start sm:items-center gap-4"
                                : "p-3.5 sm:p-4 items-center gap-3.5"
                            }`}
                          >
                            {/* 商品图片 */}
                            <div
                              className={`relative rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 ${
                                isLargeFont ? "w-24 h-24 sm:w-28 sm:h-28" : "w-20 h-20 sm:w-22 sm:h-22"
                              }`}
                            >
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

                            {/* 商品核心信息 (A信息 品名、B信息 规格与晨采卖点、C信息 价格与对比) - 绝不使用裁剪truncate */}
                            <div className="flex-1 min-w-0 w-full">
                              {/* A 信息：品名 */}
                              <h3
                                className={`font-black text-slate-900 leading-snug break-words ${
                                  isLargeFont ? "text-base sm:text-lg" : "text-sm sm:text-base"
                                }`}
                              >
                                {p.nameZh}
                              </h3>

                              {/* B 信息：规格描述与卖点 (换行完整呈现，绝不丢失) */}
                              <p
                                className={`text-slate-500 leading-relaxed break-words mt-1 ${
                                  isLargeFont ? "text-xs sm:text-sm font-medium text-slate-600" : "text-[11px] sm:text-xs"
                                }`}
                              >
                                {p.subTitle}
                              </p>

                              {/* C 信息：特惠价格、街市对比划线价、净重标牌 */}
                              <div className="flex flex-wrap items-baseline gap-2 mt-2">
                                <span
                                  className={`font-black text-rose-600 ${
                                    isLargeFont ? "text-lg sm:text-xl" : "text-base"
                                  }`}
                                >
                                  HK$ {p.priceHkd.toFixed(1)}
                                </span>

                                {(config?.showMarketPriceComparison ?? true) &&
                                (p.showMarketPrice ?? true) &&
                                p.marketPriceHkd ? (
                                  <span
                                    className={`text-slate-400 line-through ${
                                      isLargeFont ? "text-xs sm:text-sm" : "text-xs"
                                    }`}
                                  >
                                    HK$ {p.marketPriceHkd.toFixed(1)}
                                  </span>
                                ) : null}

                                <span
                                  className={`font-bold rounded ${
                                    isLargeFont
                                      ? "text-xs px-2 py-0.5 bg-emerald-100 text-emerald-800"
                                      : "text-[10px] px-1.5 py-0.5 bg-emerald-50 text-emerald-700"
                                  }`}
                                >
                                  {p.netWeight}
                                </span>
                              </div>
                            </div>

                            {/* 加减购物车按钮 (放大长者点击区域) */}
                            <div
                              className={`flex items-center gap-1.5 flex-shrink-0 self-end sm:self-center ${
                                isLargeFont ? "mt-2 sm:mt-0" : ""
                              }`}
                            >
                              {qty > 0 && (
                                <>
                                  <button
                                    onClick={() => updateCart(p.id, -1)}
                                    className={`rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-700 active:scale-95 transition hover:bg-slate-100 ${
                                      isLargeFont ? "w-9 h-9 sm:w-10 sm:h-10" : "w-7 h-7 sm:w-8 sm:h-8"
                                    }`}
                                    aria-label="減少一份"
                                  >
                                    <Minus className={isLargeFont ? "w-4 h-4" : "w-3.5 h-3.5"} />
                                  </button>
                                  <span
                                    className={`font-black text-center ${
                                      isLargeFont ? "w-6 text-sm sm:text-base" : "w-4 text-xs"
                                    }`}
                                  >
                                    {qty}
                                  </span>
                                </>
                              )}
                              <button
                                onClick={() => updateCart(p.id, 1)}
                                className={`rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-sm active:scale-95 hover:bg-emerald-700 transition ${
                                  isLargeFont ? "w-10 h-10 sm:w-11 sm:h-11" : "w-8 h-8 sm:w-9 sm:h-9"
                                }`}
                                aria-label="增加一份"
                              >
                                <Plus className={isLargeFont ? "w-5 h-5" : "w-4 h-4"} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </>
            ) : (
              /* ================= 产地鲜果 (Coming soon 预告专区) ================= */
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <span>🍎 產地鮮果直供 (即將登場)</span>
                    <span className="text-[11px] font-bold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full">
                      產地直採對接中
                    </span>
                  </h2>
                  <span className="text-xs text-slate-400">基地空運直達 · 敬請期待</span>
                </div>

                <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 text-xs leading-relaxed text-amber-900 flex items-start gap-3">
                  <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-black text-amber-950 mb-0.5">
                      📣 蘇屋街坊鮮果直通車籌備中！
                    </div>
                    <div>
                      我們正與智利車厘子果園、雲南藍莓基地及廣西砂糖桔產區直接對接，省去三道批發加價，預計下周啟動第一批街坊特惠預售！點擊卡片可預約「首批到貨到樓提醒」！
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {UPCOMING_FRUITS.map((fruit) => (
                    <div
                      key={fruit.id}
                      className="bg-white rounded-2xl border border-amber-200/80 p-4 shadow-sm flex flex-col justify-between hover:border-amber-400 transition"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                          <img
                            src={fruit.imageUrl}
                            alt={fruit.nameZh}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute top-1 left-1 bg-amber-500 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm">
                            籌備中
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-black text-slate-900 text-sm leading-snug">
                            {fruit.nameZh}
                          </h3>
                          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                            {fruit.subTitle}
                          </p>
                          <div className="flex items-baseline gap-2 mt-2">
                            <span className="text-amber-700 font-black text-base">
                              預估 HK$ {fruit.previewPrice.toFixed(1)}
                            </span>
                            <span className="text-slate-400 line-through text-xs">
                              街市 HK$ {fruit.referencePrice.toFixed(1)}
                            </span>
                            <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded">
                              {fruit.netWeight}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedFruit(fruit);
                          setFruitNotifyModalOpen(true);
                          setFruitNotified(false);
                        }}
                        className="mt-3.5 w-full py-2 bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 rounded-xl text-xs font-black shadow-sm flex items-center justify-center gap-1.5 hover:shadow active:scale-95 transition"
                      >
                        <span>🔔 預約首發到貨提醒</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 右侧 1 列：PC 端桌面常驻结算与积分面板 (PC 专享宽屏视图) */}
          <div className="hidden lg:block lg:col-span-1 space-y-4 sticky top-6">
            {/* 包邮进度条与清单面板 */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between text-xs font-bold mb-2">
                <span className="text-slate-700 flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-emerald-600" />
                  <span>自選包郵進度</span>
                </span>
                <span className={isFreeShipping ? "text-emerald-600 font-black" : "text-amber-600 font-bold"}>
                  {isFreeShipping ? "🎉 已享清晨免費掛閘！" : `差 HK$ ${diffToFree} 包郵`}
                </span>
              </div>

              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    isFreeShipping ? "bg-emerald-500" : "bg-amber-400"
                  }`}
                  style={{
                    width: `${Math.min(100, (itemsSubtotal / freeThreshold) * 100)}%`,
                  }}
                />
              </div>

              <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1.5">
                <span>菜品小計: HK$ {itemsSubtotal.toFixed(1)}</span>
                <span>包郵門檻: HK$ {freeThreshold.toFixed(1)}</span>
              </div>

              {/* 实时购物车详情 (支持增减与一键删除) */}
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                <div className="text-xs font-bold text-slate-900 flex justify-between">
                  <span>已選菜單 ({totalItemsCount} 份)</span>
                  <span className="text-rose-600 text-sm font-black">
                    實付 HK$ {finalTotalHkd.toFixed(1)}
                  </span>
                </div>

                {totalItemsCount === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs">
                    購物車空空如也，請在左側選購新鮮蔬菜
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto text-xs pr-1">
                    {products
                      .filter((p) => (cart[p.id] || 0) > 0)
                      .map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-700"
                        >
                          <div className="flex-1 min-w-0 pr-2">
                            <div className="font-bold text-slate-900 truncate">{p.nameZh}</div>
                            <div className="text-[10px] text-slate-400">
                              HK$ {p.priceHkd.toFixed(1)} / {p.netWeight}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5">
                              <button
                                onClick={() => updateCart(p.id, -1)}
                                className="w-5 h-5 flex items-center justify-center text-slate-600 hover:text-slate-900"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-5 text-center font-black text-xs">
                                {cart[p.id]}
                              </span>
                              <button
                                onClick={() => updateCart(p.id, 1)}
                                className="w-5 h-5 flex items-center justify-center text-slate-600 hover:text-slate-900"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <button
                              onClick={() => removeFromCart(p.id)}
                              className="text-slate-400 hover:text-rose-600 p-1 transition"
                              title="刪除此項"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}

                {/* 费用明细展示 */}
                {totalItemsCount > 0 && (
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-[11px] space-y-1">
                    <div className="flex justify-between text-slate-600">
                      <span>蔬菜小計：</span>
                      <span>HK$ {itemsSubtotal.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>晨早專人防盜鐵閘掛袋：</span>
                      <span className={deliveryFee === 0 ? "text-emerald-700 font-bold" : "text-amber-700 font-bold"}>
                        {deliveryFee === 0 ? "免費 (已滿包郵門檻)" : `HK$ ${deliveryFee.toFixed(1)}`}
                      </span>
                    </div>
                    {isMinOrderBlocked && (
                      <div className="text-rose-600 font-bold pt-1 border-t border-slate-200 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                        <span>未滿起送門檻 (HK$ {freeThreshold.toFixed(1)})，請再選1份</span>
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={handleOpenCheckout}
                  disabled={totalItemsCount === 0 || isMinOrderBlocked}
                  className={`w-full py-3 rounded-xl text-xs font-black shadow-md flex items-center justify-center gap-2 transition ${
                    totalItemsCount > 0 && !isMinOrderBlocked
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer active:scale-95"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  <span>
                    {isMinOrderBlocked
                      ? `未滿起送門檻 (差 HK$ ${diffToFree})`
                      : "立即登記下單 · 晨早掛鐵閘"}
                  </span>
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
                  HK$ {finalTotalHkd.toFixed(1)}
                </span>
              </div>
              <div className="text-[10px] text-slate-300">
                {isFreeShipping
                  ? "✅ 已達標：清晨免費掛閘送樓"
                  : isMinOrderBlocked
                  ? `⚠️ 還差 HK$ ${diffToFree} 達起送門檻`
                  : `還差 HK$ ${diffToFree} 包郵 (補 HK$ ${underThresholdFee} 運力費)`}
              </div>
            </div>

            <button
              onClick={handleOpenCheckout}
              disabled={isMinOrderBlocked}
              className={`font-black px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 active:scale-95 transition shadow-lg ${
                isMinOrderBlocked
                  ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                  : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer"
              }`}
            >
              <span>{isMinOrderBlocked ? "再選1份" : "立即登記下單"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ===================== 结账登记与订单确认对话框 ===================== */}
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

                  {/* 订单明细清单 */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="font-bold text-slate-600 mb-1.5 flex justify-between">
                      <span>訂單摘要</span>
                      <span className="text-emerald-700">共 {totalItemsCount} 份蔬菜</span>
                    </div>
                    <div className="space-y-1.5 text-slate-600 max-h-36 overflow-y-auto">
                      {products
                        .filter((p) => (cart[p.id] || 0) > 0)
                        .map((p) => (
                          <div key={p.id} className="flex justify-between items-center text-[11px]">
                            <span>
                              {p.nameZh} x{cart[p.id]}
                            </span>
                            <span className="font-bold">HK$ {(p.priceHkd * cart[p.id]).toFixed(1)}</span>
                          </div>
                        ))}
                    </div>

                    <div className="border-t border-slate-200 mt-2 pt-2 space-y-1 text-slate-600 text-[11px]">
                      <div className="flex justify-between">
                        <span>蔬菜小計</span>
                        <span>HK$ {itemsSubtotal.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>清晨掛閘配送</span>
                        <span className={deliveryFee === 0 ? "text-emerald-700 font-bold" : "text-amber-700 font-bold"}>
                          {deliveryFee === 0 ? "免費 (滿額包郵)" : `+ HK$ ${deliveryFee.toFixed(1)}`}
                        </span>
                      </div>
                      <div className="border-t border-slate-200 pt-1 flex justify-between font-black text-slate-900 text-sm">
                        <span>實付總額</span>
                        <span className="text-rose-600">HK$ {finalTotalHkd.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full mt-5 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-xl text-sm shadow-md active:scale-95 transition flex items-center justify-center gap-1.5"
                >
                  {submitting ? "正在登記訂單..." : "確認下單 · 明日清晨掛鐵閘"}
                </button>
              </form>
            ) : (
              /* ================= 下单成功后双私域渠道对账 (WhatsApp + 微信) ================= */
              <div className="text-center py-4 space-y-4">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
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
                    明日清晨 {config?.deliveryTimeWindow || "07:15 - 08:00"} 將掛於 {submittedOrder.buildingName} {submittedOrder.flatNo} 鐵閘
                  </p>
                </div>

                {submittedOrder.referrerPhone && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-xs text-amber-900 text-left">
                    🌱 <b>買菜積分已入賬</b>：本次訂單已成功為推薦人贈送 100 買菜積分！您也已自動成為會員，下次買菜直接享積分抵扣！
                  </div>
                )}

                {/* 双私域对账渠道按钮区 */}
                <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200 text-left space-y-3">
                  <div className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                    <Send className="w-4 h-4 text-emerald-600" />
                    <span>即時向專員發送菜單對賬 (雙渠道任選)：</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    請選擇您習慣的通訊軟件，點擊直接拉起或一鍵複製菜單，客服將核對轉數快(FPS)或安排現金交收：
                  </p>

                  <div className="space-y-2 pt-1">
                    {/* 渠道 1: WhatsApp 官方群/客服一键直达 */}
                    <a
                      href={`https://wa.me/${config?.supportWhatsApp || "85291234567"}?text=${buildWhatsAppOrderMessage()}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#20ba59] text-white font-black py-2.5 rounded-xl text-xs shadow transition active:scale-95"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>① 打開 WhatsApp 一鍵直發對賬</span>
                    </a>

                    {/* 渠道 2: 微信一键复制订单并在微信对账 */}
                    <button
                      onClick={handleCopyWechatOrder}
                      className="flex items-center justify-center gap-2 w-full bg-emerald-700 hover:bg-emerald-800 text-white font-black py-2.5 rounded-xl text-xs shadow transition active:scale-95"
                    >
                      <Copy className="w-4 h-4 text-yellow-300" />
                      <span>
                        {copiedWechatOrder
                          ? "✅ 已複製訂單！點擊查看微信客服號"
                          : "② 微信一鍵複製菜單 & 客服對賬"}
                      </span>
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSubmittedOrder(null);
                    setCheckoutOpen(false);
                  }}
                  className="w-full text-xs text-slate-400 hover:text-slate-600 py-1"
                >
                  返回首頁選菜
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================== 微信客服号与对账指引弹窗 ===================== */}
      {wechatModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 space-y-4 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-emerald-600" />
                <span>微信客服對賬通道</span>
              </h3>
              <button
                onClick={() => setWechatModalOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                關閉
              </button>
            </div>

            <div className="bg-emerald-50 rounded-xl p-3 text-xs leading-relaxed text-emerald-900 space-y-2">
              <div className="font-black flex items-center gap-1 text-emerald-950">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>菜單明細已成功複製到剪貼板！</span>
              </div>
              <p className="text-[11px] text-emerald-800">
                請打開手機微信，搜索添加下方官方微信客服號，直接粘貼發送訂單文本即可：
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">官方微信客服號</div>
                <div className="text-sm font-black text-slate-900 font-mono">
                  {config?.defaultWechatId || "hk_fresh_official"}
                </div>
              </div>

              <button
                onClick={handleCopyWechatId}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg active:scale-95 transition"
              >
                {copiedWechatId ? "已複製微訊號" : "複製微訊號"}
              </button>
            </div>

            <div className="text-[11px] text-slate-500 leading-relaxed">
              💡 提示：客服確認訂單後將發送 FPS 轉數快收款二維碼，亦可清晨直接在門口交現金，十分便利！
            </div>

            <button
              onClick={() => setWechatModalOpen(false)}
              className="w-full bg-slate-900 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-slate-800 transition"
            >
              我知道了，返回商城
            </button>
          </div>
        </div>
      )}

      {/* ===================== 鲜果到货预约提醒弹窗 ===================== */}
      {fruitNotifyModalOpen && selectedFruit && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                <span>🍎 產地鮮果到貨預約提醒</span>
              </h3>
              <button
                onClick={() => setFruitNotifyModalOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                關閉
              </button>
            </div>

            <div className="flex items-center gap-3 bg-amber-50 p-3 rounded-xl border border-amber-200">
              <img
                src={selectedFruit.imageUrl}
                alt={selectedFruit.nameZh}
                className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
              />
              <div className="text-xs">
                <div className="font-black text-slate-900">{selectedFruit.nameZh}</div>
                <div className="text-amber-800 font-bold mt-0.5">
                  預估特惠價 HK$ {selectedFruit.previewPrice.toFixed(1)} / {selectedFruit.netWeight}
                </div>
              </div>
            </div>

            {!fruitNotified ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-600 leading-relaxed">
                  留下您的 8 位香港手機號碼，第一批智利/雲南/廣西鮮果空運抵港時，我們將第一時間通過 WhatsApp / SMS 發送專屬特惠搶購名額！
                </p>

                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-xs">+852</span>
                  <input
                    type="tel"
                    maxLength={8}
                    value={fruitNotifyPhone}
                    onChange={(e) => setFruitNotifyPhone(e.target.value.replace(/\D/g, ""))}
                    placeholder="輸入手機號，如：91234567"
                    className="w-full pl-14 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <button
                  onClick={() => {
                    if (fruitNotifyPhone.trim().length === 8) {
                      setFruitNotified(true);
                    } else {
                      alert("請輸入完整的 8 位香港電話號碼");
                    }
                  }}
                  className="w-full bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 font-black py-2.5 rounded-xl text-xs shadow active:scale-95 transition"
                >
                  確認預約到貨提醒
                </button>
              </div>
            ) : (
              <div className="text-center py-4 space-y-2">
                <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <div className="font-black text-slate-900 text-sm">已成功登記提醒！</div>
                <p className="text-xs text-slate-500">
                  號碼 +852 {fruitNotifyPhone} 已鎖定首批早鳥名額，到貨時立即通知您！
                </p>
                <button
                  onClick={() => setFruitNotifyModalOpen(false)}
                  className="mt-2 w-full py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
                >
                  返回商城
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================== 积分钱包与换青菜弹窗 ===================== */}
      {walletModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 space-y-4 shadow-2xl">
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
                  setWalletPhone("91112233");
                  queryPointsWallet("91112233");
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-bold"
              >
                陳太 (91112233)
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

      {/* ===================== 推荐街坊得青菜弹窗 ===================== */}
      {shareModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 space-y-4 shadow-2xl">
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

      {/* ===================== 底部导航与版权信息 ===================== */}
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
          © 2026 {config?.brandName || "供港優鮮"} · 香港九龍深水埗蘇屋邨示範試點
        </p>
      </footer>
    </div>
  );
}
