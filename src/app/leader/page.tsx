"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Users,
  QrCode,
  Copy,
  Check,
  Phone,
  MessageCircle,
  Building,
  Heart,
  ChevronRight,
  ShieldCheck,
  Search,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { Customer, Leader } from "@/types";
import { formatHkDate } from "@/lib/utils";

export default function LeaderDashboardPage() {
  const [activeCode, setActiveCode] = useState("HUA888");
  const [loading, setLoading] = useState(true);
  const [leader, setLeader] = useState<Leader | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState({ totalCustomers: 0, seniorCustomers: 0 });
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [seniorFilter, setSeniorFilter] = useState(false);

  // 获取完整 URL 用于生成真实的二维码链接
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const loadData = async (code: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/leader/stats?code=${code}`);
      const data = await res.json();
      if (res.ok) {
        setLeader(data.leader);
        setCustomers(data.customers);
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to load leader stats", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(activeCode);
  }, [activeCode]);

  const joinUrl = origin ? `${origin}/join/${activeCode}` : `/join/${activeCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.realName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.hkPhone.includes(searchQuery) ||
      c.flatNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.buildingName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSenior = !seniorFilter || c.isSeniorCitizen;
    return matchesSearch && matchesSenior;
  });

  return (
    <div className="flex-1 flex flex-col pb-16 bg-slate-50">
      {/* 顶部身份栏 */}
      <div className="bg-slate-900 text-white px-5 pt-6 pb-6 rounded-b-3xl shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-slate-300 tracking-wider">
              愛心樓長 · 專屬移動工作台
            </span>
          </div>

          {/* 快速切换测试楼长 */}
          <div className="flex items-center space-x-1.5 bg-slate-800 p-1 rounded-xl text-xs">
            <button
              onClick={() => setActiveCode("HUA888")}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                activeCode === "HUA888" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              華姐 (蘇屋)
            </button>
            <button
              onClick={() => setActiveCode("MING666")}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                activeCode === "MING666" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              明哥 (友愛)
            </button>
          </div>
        </div>

        {leader && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3.5">
              <div className="w-13 h-13 bg-emerald-600 text-white font-black text-xl rounded-2xl flex items-center justify-center shadow-lg border border-emerald-400/30">
                {leader.realName.slice(0, 1)}
              </div>
              <div>
                <h1 className="text-xl font-black text-white flex items-center gap-1.5">
                  <span>{leader.realName}</span>
                  <span className="bg-emerald-500/20 text-emerald-400 text-[11px] px-2 py-0.5 rounded-full border border-emerald-500/30 font-medium">
                    先鋒樓長
                  </span>
                </h1>
                <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {leader.estateName} · {leader.buildingName}
                  </span>
                </p>
              </div>
            </div>
            <button
              onClick={() => loadData(activeCode)}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl active:rotate-180 transition"
              title="刷新數據"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="px-5 -mt-3 space-y-4">
        {/* 数据统计三联卡 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-500">已鎖定街坊</span>
              <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-black text-slate-900">{stats.totalCustomers}</span>
              <span className="text-xs text-slate-400 font-medium">戶</span>
            </div>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">終身歸屬 · 每單享提成</p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-500">長者送菜戶</span>
              <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
                <Heart className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-black text-amber-600">{stats.seniorCustomers}</span>
              <span className="text-xs text-slate-400 font-medium">戶</span>
            </div>
            <p className="text-[11px] text-amber-700 font-medium mt-1">70歲長者 · 免費送戶</p>
          </div>
        </div>

        {/* 专属海报与推广二维码卡片 */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <QrCode className="w-5 h-5 text-emerald-600" />
              <div>
                <h2 className="font-bold text-slate-900 text-sm">我的專屬拉新二維碼</h2>
                <p className="text-[11px] text-slate-600">街坊掃此碼自動綁定至您的名下</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              #{activeCode}
            </span>
          </div>

          <div className="flex flex-col items-center">
            {/* 二维码显示区 */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 shadow-inner flex flex-col items-center">
              <QRCodeSVG
                value={joinUrl}
                size={180}
                level="M"
                includeMargin={false}
                imageSettings={{
                  src: "",
                  x: undefined,
                  y: undefined,
                  height: 24,
                  width: 24,
                  excavate: true,
                }}
              />
              <p className="text-[11px] text-slate-600 mt-2 font-mono">
                {leader?.estateName} {leader?.buildingName}
              </p>
            </div>

            {/* 操作按钮区 */}
            <div className="w-full grid grid-cols-2 gap-2.5 mt-4">
              <button
                onClick={handleCopyLink}
                className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition active:scale-95"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700">已複製連結</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>複製登記連結</span>
                  </>
                )}
              </button>

              <a
                href={joinUrl}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition active:scale-95 shadow-sm"
              >
                <ExternalLink className="w-4 h-4" />
                <span>預覽掃碼頁面</span>
              </a>
            </div>
          </div>
        </div>

        {/* 锁定的街坊名单列表 */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-slate-700" />
              <h2 className="font-bold text-slate-900 text-sm">我已鎖定的街坊通訊錄</h2>
            </div>
            <button
              onClick={() => setSeniorFilter(!seniorFilter)}
              className={`text-xs px-2.5 py-1 rounded-lg font-medium transition ${
                seniorFilter
                  ? "bg-amber-100 text-amber-800 font-bold border border-amber-300"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              僅看長者戶 ({stats.seniorCustomers})
            </button>
          </div>

          {/* 搜索框 */}
          <div className="relative mb-3">
            <Search className="w-4 h-4 text-slate-600 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜尋姓名、房號或電話..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* 街坊卡片列表 */}
          {filteredCustomers.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-600">
              <p>暫無匹配的街坊名單</p>
              <p className="mt-1 text-[11px]">快將上方二維碼發到 WhatsApp 群邀請鄰居掃碼吧！</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredCustomers.map((cust) => (
                <div
                  key={cust.id}
                  className="p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200/70 transition flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-black text-slate-900 text-sm">{cust.realName}</span>
                      {cust.isSeniorCitizen && (
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                          <span>👵 長者送戶</span>
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mt-1 flex items-center space-x-2">
                      <span className="font-semibold text-slate-700">
                        {cust.buildingName} {cust.flatNo}
                      </span>
                      <span>·</span>
                      <span className="font-mono text-slate-500">{cust.hkPhone}</span>
                    </div>
                    <div className="text-[10px] text-slate-600 mt-0.5">
                      登記時間：{formatHkDate(cust.boundAt)}
                    </div>
                  </div>

                  {/* 一键 WhatsApp 联系按钮 */}
                  <a
                    href={`https://wa.me/852${cust.hkPhone}?text=${encodeURIComponent(
                      `陳太您好！我是${leader?.buildingName}樓長${leader?.realName}，今日供港鮮菜已經截單，有任何需要隨時話我知！`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] rounded-xl flex items-center space-x-1 font-bold text-xs transition active:scale-95"
                    title="在 WhatsApp 聯繫該街坊"
                  >
                    <MessageCircle className="w-4 h-4 fill-[#25D366]" />
                    <span className="hidden sm:inline">聯絡</span>
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
