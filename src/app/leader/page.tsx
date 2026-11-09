"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import {
  Users,
  QrCode,
  Copy,
  Check,
  Phone,
  MessageCircle,
  Building,
  ChevronRight,
  ShieldCheck,
  Search,
  ExternalLink,
  Coins,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { Customer, Leader } from "@/types";
import { formatHkDate } from "@/lib/utils";

export default function LeaderDashboardPage() {
  const [activeCode, setActiveCode] = useState("HUA888");
  const [loading, setLoading] = useState(true);
  const [leader, setLeader] = useState<Leader | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState({ totalCustomers: 0, totalCommission: 0 });
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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
    return (
      c.realName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.hkPhone.includes(searchQuery) ||
      c.flatNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.buildingName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="flex-1 flex flex-col pb-16 bg-slate-50 min-h-screen">
      {/* 顶部身份栏 */}
      <div className="bg-slate-900 text-white px-5 pt-6 pb-6 rounded-b-3xl shadow-md">
        <div className="flex items-center justify-between mb-4">
          <Link
            href="/"
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>返回商城</span>
          </Link>

          {/* 切换测试楼长 */}
          <div className="flex items-center space-x-1.5 bg-slate-800 p-1 rounded-xl text-xs">
            <button
              onClick={() => setActiveCode("HUA888")}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                activeCode === "HUA888" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              華姐 (牡丹樓)
            </button>
            <button
              onClick={() => setActiveCode("CHAN888")}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                activeCode === "CHAN888" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              陳太 (金菊樓)
            </button>
          </div>
        </div>

        {/* 楼长核心信息卡 */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-black tracking-tight">
                {leader ? `${leader.realName} の 樓長駕駛艙` : "加載中..."}
              </h1>
              <span className="text-[10px] font-black bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full">
                在席
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center space-x-2">
              <Building className="w-3.5 h-3.5" />
              <span>{leader ? `${leader.estateName} · ${leader.buildingName}` : "..."}</span>
              <span>·</span>
              <span className="font-mono text-emerald-400 font-bold">碼: {activeCode}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4 max-w-md mx-auto w-full">
        {/* 数据统计双卡片 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
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
            <p className="text-[11px] text-emerald-600 font-medium mt-1">終身歸屬 · 每單享津貼</p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-500">累計獲得津貼</span>
              <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
                <Coins className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-xl font-black text-amber-600">
                HK$ {stats.totalCommission?.toFixed(1) || "0.0"}
              </span>
            </div>
            <p className="text-[11px] text-amber-700 font-medium mt-1">直屬津貼 + 導師帶教</p>
          </div>
        </div>

        {/* 专属海报与推广二维码卡片 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-emerald-600" />
                <span>您的專屬大廈鎖粉二維碼</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                鄰居掃此碼登記即永久鎖定在您名下
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center py-2">
            <div className="p-3 bg-white border-2 border-dashed border-emerald-500/40 rounded-2xl shadow-inner mb-3">
              <QRCodeSVG
                value={joinUrl}
                size={160}
                level="M"
                includeMargin={false}
              />
            </div>
            <span className="text-xs font-bold text-slate-700 font-mono mb-3">
              邀請碼：<span className="text-emerald-600 font-black">{activeCode}</span>
            </span>

            <button
              onClick={handleCopyLink}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow active:scale-95 transition"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "已複製專屬登記鏈接！" : "複製專屬邀請鏈接至 WhatsApp"}</span>
            </button>
          </div>
        </div>

        {/* 锁定的街坊通讯录 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-slate-700" />
              <h2 className="font-bold text-slate-900 text-sm">我已鎖定的街坊通訊錄</h2>
            </div>
            <span className="text-xs text-slate-400 font-bold">共 {filteredCustomers.length} 戶</span>
          </div>

          {/* 搜索框 */}
          <div className="relative mb-3">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜尋姓名、房號或電話..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {filteredCustomers.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">
              暫無匹配的街坊名單
            </div>
          ) : (
            <div className="space-y-2">
              {filteredCustomers.map((cust) => (
                <div
                  key={cust.id}
                  className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-black text-slate-900 text-sm">{cust.realName}</span>
                      <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                        {cust.buildingName} {cust.flatNo}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                      <span className="font-mono">{cust.hkPhone}</span>
                      <span>·</span>
                      <span>已下單 {cust.ordersCount || 0} 次</span>
                    </div>
                  </div>

                  <a
                    href={`https://wa.me/852${cust.hkPhone}?text=${encodeURIComponent(
                      `陳太早晨！我是${leader?.buildingName}樓長${leader?.realName}，明日清晨東莞新鮮菜直發到港，有任何需要隨時話我知！`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-[#25D366] text-white rounded-xl shadow-sm hover:opacity-90 active:scale-95 transition"
                  >
                    <MessageCircle className="w-4 h-4" />
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
