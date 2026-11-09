"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Building2,
  Heart,
  Phone,
  ShieldCheck,
  User,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Copy,
  Check,
} from "lucide-react";
import { isValidHkPhone } from "@/lib/utils";

interface LeaderInfo {
  inviteCode: string;
  realName: string;
  hkPhone?: string;
  wechatId?: string;
  estateId: string;
  estateName: string;
  buildingId: string;
  buildingName: string;
  whatsAppGroupUrl: string;
}

interface Estate {
  id: string;
  nameZh: string;
}

interface Building {
  id: string;
  estateId: string;
  nameZh: string;
}

export default function CustomerJoinPage() {
  const params = useParams();
  const inviteCode = (params?.code as string) || "HUA888";

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [leader, setLeader] = useState<LeaderInfo | null>(null);
  const [estates, setEstates] = useState<Estate[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);

  // 环境检测：是否在微信内置浏览器打开
  const [isWeChat, setIsWeChat] = useState(false);

  // 表单状态
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [realName, setRealName] = useState("");
  const [selectedEstateId, setSelectedEstateId] = useState("");
  const [selectedBuildingId, setSelectedBuildingId] = useState("");
  const [flatNo, setFlatNo] = useState("");
  const [isSenior, setIsSenior] = useState(false);

  // 验证码倒计时
  const [countdown, setCountdown] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // 微信复制状态
  const [wechatCopied, setWechatCopied] = useState(false);
  const [activeChannelTab, setActiveChannelTab] = useState<"WHATSAPP" | "WECHAT">("WHATSAPP");

  // 成功弹窗
  const [successData, setSuccessData] = useState<{
    customerName: string;
    buildingName: string;
    flatNo: string;
    whatsAppGroupUrl: string;
    wechatId: string;
  } | null>(null);

  useEffect(() => {
    if (typeof navigator !== "undefined") {
      const isWx = /micromessenger/i.test(navigator.userAgent);
      setIsWeChat(isWx);
      if (isWx) {
        setActiveChannelTab("WECHAT");
      }
    }
  }, []);

  // 加载楼长及网格基础数据
  useEffect(() => {
    async function fetchLeader() {
      try {
        setLoading(true);
        const res = await fetch(`/api/leaders/${inviteCode}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "未找到該樓長專屬碼");
        }
        setLeader(data.leader);
        setEstates(data.estates);
        setBuildings(data.buildings);

        // 默认预选该楼长的屋邨和大厦
        setSelectedEstateId(data.leader.estateId);
        setSelectedBuildingId(data.leader.buildingId);
      } catch (err: any) {
        setErrorMsg(err.message || "載入失敗");
      } finally {
        setLoading(false);
      }
    }

    if (inviteCode) {
      fetchLeader();
    }
  }, [inviteCode]);

  // 倒计时逻辑
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // 获取验证码
  const handleSendOtp = () => {
    if (!isValidHkPhone(phone)) {
      alert("請先輸入正確的 8 位香港電話號碼（如 91234567）");
      return;
    }
    setCountdown(60);
    // 模拟发送：自动预填测试验证码 1234
    setTimeout(() => {
      setOtp("1234");
      alert("【測試環境】驗證碼已自動填入：1234");
    }, 500);
  };

  // 复制楼长微信号
  const handleCopyWechat = (wxId: string) => {
    navigator.clipboard.writeText(wxId);
    setWechatCopied(true);
    setTimeout(() => setWechatCopied(false), 2500);
  };

  // 提交登记
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidHkPhone(phone)) {
      alert("請輸入有效的 8 位香港手機號碼");
      return;
    }
    if (!otp || otp.length < 4) {
      alert("請輸入 4 位驗證碼");
      return;
    }
    if (!realName.trim()) {
      alert("請填寫您的稱呼（如：陳太）");
      return;
    }
    if (!flatNo.trim()) {
      alert("請填寫您的房號（如：1204室）");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inviteCode,
          hkPhone: phone,
          otp,
          realName,
          estateId: selectedEstateId,
          buildingId: selectedBuildingId,
          flatNo,
          isSeniorCitizen: isSenior,
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "登記失敗，請稍後重試");
      }

      // 登记成功
      const groupUrl = result.whatsAppGroupUrl || leader?.whatsAppGroupUrl || "https://chat.whatsapp.com/";
      const wxId = leader?.wechatId || "hk_fresh_official";

      setSuccessData({
        customerName: realName,
        buildingName: result.customer.buildingName,
        flatNo: result.customer.flatNo,
        whatsAppGroupUrl: groupUrl,
        wechatId: wxId,
      });

      // 如果不是在微信内置浏览器打开，且用户首选 WhatsApp，1.5 秒后自动唤起 WhatsApp
      if (!isWeChat) {
        setTimeout(() => {
          window.location.href = groupUrl;
        }, 1600);
      }
    } catch (err: any) {
      alert(err.message || "網絡錯誤");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-slate-500">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium">正在載入樓長專屬登記頁面...</p>
      </div>
    );
  }

  if (errorMsg || !leader) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle className="w-16 h-16 text-rose-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-800 mb-2">無效的專屬二維碼</h2>
        <p className="text-sm text-slate-600 mb-6">{errorMsg || "未找到對應的樓長資料"}</p>
        <a
          href="/join/HUA888"
          className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold shadow-md active:scale-95 transition"
        >
          返回測試示範頁面 (華姐)
        </a>
      </div>
    );
  }

  const filteredBuildings = buildings.filter((b) => b.estateId === selectedEstateId);

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-white shadow-xl flex flex-col pb-12">
      {/* 顶部品牌横幅 */}
      <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-green-800 text-white px-5 pt-7 pb-6 rounded-b-3xl shadow-lg relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
        <div className="flex items-center space-x-2 mb-2">
          <span className="bg-emerald-500/40 text-emerald-100 text-xs px-2.5 py-0.5 rounded-full font-medium tracking-wide border border-emerald-400/30">
            東莞潤豐源頭直供
          </span>
          <span className="text-xs text-emerald-200">文錦渡綠色通道</span>
        </div>
        <h1 className="text-2xl font-black tracking-tight flex items-center gap-1.5">
          <span>供港優鮮</span>
          <span className="text-emerald-300 font-light">|</span>
          <span className="text-emerald-200 text-xl font-bold">屋邨直通車</span>
        </h1>
        <p className="text-emerald-100/90 text-xs mt-1 font-medium">
          街坊特惠價 · 比街市平3成 · WhatsApp / 微信雙群訂菜
        </p>

        {/* 楼长专属背书卡片 */}
        <div className="mt-4 bg-white/15 backdrop-blur-md rounded-2xl p-3.5 border border-white/20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 bg-white text-emerald-700 rounded-full flex items-center justify-center font-black text-lg shadow-sm">
              {leader.realName.slice(0, 1)}
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xs text-emerald-200 font-medium">您的專屬愛心樓長</span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="font-bold text-base text-white">
                {leader.estateName} {leader.buildingName} · {leader.realName}
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] bg-white/20 px-2 py-1 rounded-md text-emerald-100 font-mono">
              #{leader.inviteCode}
            </span>
          </div>
        </div>
      </div>

      {/* 核心表单区域 */}
      <div className="px-5 -mt-2">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h2 className="font-bold text-slate-800 text-base">新街坊會員極速登記</h2>
            </div>
            <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
              一次登記 · 永久鎖定
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 1. 香港电话 */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-600" />
                <span>香港手機號碼 (8位)</span>
                <span className="text-rose-500">*</span>
              </label>
              <div className="flex rounded-xl shadow-sm border border-slate-300 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 overflow-hidden">
                <span className="inline-flex items-center px-3.5 bg-slate-50 text-slate-600 font-semibold text-sm border-r border-slate-200">
                  +852
                </span>
                <input
                  type="tel"
                  maxLength={8}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  placeholder="如：91234567"
                  className="flex-1 block w-full px-3 py-3 text-base font-medium text-slate-800 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* 2. 验证码 */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>簡訊驗證碼 (OTP)</span>
                <span className="text-[11px] text-emerald-600">測試請輸: 1234</span>
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.trim())}
                  placeholder="輸入 4 位驗證碼"
                  className="flex-1 block px-3 py-3 rounded-xl border border-slate-300 text-base font-medium text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  required
                />
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={countdown > 0}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:text-slate-400 rounded-xl text-xs font-semibold transition shrink-0 active:scale-95"
                >
                  {countdown > 0 ? `${countdown}秒後重發` : "獲取驗證碼"}
                </button>
              </div>
            </div>

            {/* 3. 街坊称呼 */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-600" />
                <span>您的稱呼 (方便樓長聯繫)</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={realName}
                onChange={(e) => setRealName(e.target.value)}
                placeholder="如：陳太 / 李生 / 芳姐"
                className="block w-full px-3.5 py-3 rounded-xl border border-slate-300 text-base font-medium text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                required
              />
            </div>

            {/* 4. 屋邨与大厦选择 */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-600" />
                  <span>所屬屋邨</span>
                </label>
                <select
                  value={selectedEstateId}
                  onChange={(e) => {
                    setSelectedEstateId(e.target.value);
                    const list = buildings.filter((b) => b.estateId === e.target.value);
                    if (list.length > 0) setSelectedBuildingId(list[0].id);
                  }}
                  className="block w-full px-2.5 py-3 rounded-xl border border-slate-300 text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-500 bg-white"
                >
                  {estates.map((est) => (
                    <option key={est.id} value={est.id}>
                      {est.nameZh}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  <span>座號/大廈</span>
                </label>
                <select
                  value={selectedBuildingId}
                  onChange={(e) => setSelectedBuildingId(e.target.value)}
                  className="block w-full px-2.5 py-3 rounded-xl border border-slate-300 text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-500 bg-white"
                >
                  {filteredBuildings.map((bldg) => (
                    <option key={bldg.id} value={bldg.id}>
                      {bldg.nameZh}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 5. 房号 */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>樓層及室號</span>
                <span className="text-[11px] text-slate-600">保證配送無差錯</span>
              </label>
              <input
                type="text"
                value={flatNo}
                onChange={(e) => setFlatNo(e.target.value)}
                placeholder="如：1204 室"
                className="block w-full px-3.5 py-3 rounded-xl border border-slate-300 text-base font-medium text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                required
              />
            </div>

            {/* 6. 长者关爱专属勾选框 */}
            <div
              onClick={() => setIsSenior(!isSenior)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start space-x-3 ${
                isSenior
                  ? "bg-amber-50/80 border-amber-300 shadow-sm"
                  : "bg-slate-50 border-slate-200 hover:bg-slate-100/70"
              }`}
            >
              <input
                type="checkbox"
                checked={isSenior}
                onChange={(e) => setIsSenior(e.target.checked)}
                className="mt-1 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
              />
              <div className="flex-1 text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  <span>👵 登記長者關愛特權</span>
                  <span className="bg-amber-200 text-amber-800 text-[10px] px-1.5 py-0.5 rounded font-bold">
                    免費送戶
                  </span>
                </span>
                <p className="text-slate-500 mt-0.5 leading-snug">
                  若您或同住家人為 70 歲以上長者，樓長每日傍晚將提供【免費送菜上門】愛心服務。
                </p>
              </div>
            </div>

            {/* 提交大按钮 */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-4 px-4 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/30 active:scale-[0.98] transition flex items-center justify-center space-x-2 text-base"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>正在提交並鎖定樓長...</span>
                </>
              ) : (
                <>
                  <span>確認登記 · 進入 WhatsApp / 微信訂菜群</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* 底部信任背书 */}
        <div className="mt-5 text-center text-xs text-slate-600 space-y-1">
          <p className="flex items-center justify-center gap-1 text-slate-600 font-medium">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>社區鄰里互助模式 · 支持提貨滿意後付現金 / 轉數快</span>
          </p>
          <p className="text-[11px] text-slate-500">
            香港特別行政區公屋社區試點 · 每日 21:30 截單次日即達
          </p>
        </div>
      </div>

      {/* 登记成功弹窗 & 双轨入群支持 (WhatsApp + 微信) */}
      {successData && (
        <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm text-center shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2.5 shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <h3 className="text-lg font-black text-slate-800">登記成功！</h3>
            <p className="text-xs text-emerald-700 font-medium mt-0.5">
              已為您綁定【{leader.realName}】的專屬自提點
            </p>

            <div className="bg-slate-50 rounded-xl p-2.5 my-3 text-xs text-left text-slate-600 space-y-1 border border-slate-200/80">
              <div className="flex justify-between">
                <span className="text-slate-500">登記街坊：</span>
                <span className="font-bold text-slate-800">{successData.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">所屬房號：</span>
                <span className="font-bold text-slate-800">
                  {successData.buildingName} {successData.flatNo}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">今日截單：</span>
                <span className="font-bold text-rose-600">今晚 21:30</span>
              </div>
            </div>

            {/* 双轨渠道切换器 (WhatsApp vs 微信) */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center mb-3 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveChannelTab("WHATSAPP")}
                className={`flex-1 py-1.5 rounded-lg transition flex items-center justify-center gap-1.5 ${
                  activeChannelTab === "WHATSAPP"
                    ? "bg-[#25D366] text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <MessageCircle className="w-3.5 h-3.5 fill-current" />
                <span>WhatsApp 群</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveChannelTab("WECHAT")}
                className={`flex-1 py-1.5 rounded-lg transition flex items-center justify-center gap-1.5 ${
                  activeChannelTab === "WECHAT"
                    ? "bg-[#07C160] text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>💬 微信訂菜群</span>
              </button>
            </div>

            {/* 渠道一：WhatsApp 加群 */}
            {activeChannelTab === "WHATSAPP" && (
              <div className="space-y-2">
                {!isWeChat && (
                  <p className="text-[11px] text-slate-500 animate-pulse flex items-center justify-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>正在為您自動打開 WhatsApp 群組...</span>
                  </p>
                )}

                <a
                  href={successData.whatsAppGroupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold rounded-xl shadow-md active:scale-95 transition flex items-center justify-center space-x-2 text-sm"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>進入 WhatsApp 訂菜群</span>
                </a>

                {isWeChat && (
                  <p className="text-[11px] text-amber-600 font-medium">
                    提示：微信內可能無法直接打開外部 WhatsApp，建議切換到【微信訂菜群】！
                  </p>
                )}
              </div>
            )}

            {/* 渠道二：微信加群 / 添加楼长微信 */}
            {activeChannelTab === "WECHAT" && (
              <div className="space-y-2.5 bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-200">
                <div className="text-left space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600 font-medium">樓長微訊號：</span>
                    <span className="font-mono font-black text-slate-900 text-sm bg-white px-2 py-0.5 rounded border border-emerald-300">
                      {successData.wechatId}
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-snug">
                    添加樓長微信，備註【<span className="font-bold text-emerald-700">{successData.buildingName} 買菜</span>】，樓長將在1分鐘內拉您進大廈微信訂菜群！
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopyWechat(successData.wechatId)}
                  className="w-full py-2.5 px-3 bg-[#07C160] hover:bg-[#06ad56] text-white font-bold rounded-xl shadow-sm active:scale-95 transition flex items-center justify-center space-x-1.5 text-xs"
                >
                  {wechatCopied ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>已複製微訊號！請去微信粘貼添加</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>一鍵複製樓長微訊號</span>
                    </>
                  )}
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => setSuccessData(null)}
              className="text-xs text-slate-400 hover:text-slate-600 mt-3 block mx-auto py-1"
            >
              關閉視窗
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
