"use client";

import { useEffect, useState } from "react";
import {
  Download,
  Users,
  Building,
  Heart,
  Search,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  PlusCircle,
  CheckCircle2,
} from "lucide-react";
import { Customer, Leader } from "@/types";
import { formatHkDate } from "@/lib/utils";

interface LeaderWithCount extends Leader {
  boundCount: number;
}

export default function AdminOverviewPage() {
  const [loading, setLoading] = useState(true);
  const [leaders, setLeaders] = useState<LeaderWithCount[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState({
    totalLeaders: 0,
    totalCustomers: 0,
    seniorCount: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLeaderFilter, setSelectedLeaderFilter] = useState("ALL");

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/overview");
      const data = await res.json();
      if (res.ok) {
        setLeaders(data.leaders);
        setCustomers(data.customers);
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to load admin data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.realName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.hkPhone.includes(searchQuery) ||
      c.flatNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.buildingName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLeader =
      selectedLeaderFilter === "ALL" || c.boundLeaderId === selectedLeaderFilter;
    return matchesSearch && matchesLeader;
  });

  return (
    <div className="flex-1 flex flex-col pb-16 bg-slate-50 text-slate-800">
      {/* 顶部标题区 */}
      <div className="bg-slate-900 text-white px-5 pt-6 pb-6 rounded-b-3xl shadow-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              香港跨境生鮮 · 操盤管理中樞
            </span>
          </div>
          <button
            onClick={loadData}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition"
            title="刷新數據"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <h1 className="text-xl font-black text-white">全港樓長與街坊推薦綁定總盤</h1>
        <p className="text-xs text-slate-400 mt-1">
          掌握真實街坊沉澱數據 · 每日 21:30 截單前 Excel 對賬
        </p>
      </div>

      <div className="px-5 -mt-3 space-y-4">
        {/* 数据总览卡片 */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 block mb-1">
              合作樓長
            </span>
            <div className="text-xl font-black text-slate-900">{stats.totalLeaders} 位</div>
            <span className="text-[10px] text-emerald-600 font-medium">基層自營網格</span>
          </div>

          <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 block mb-1">
              總鎖定街坊
            </span>
            <div className="text-xl font-black text-emerald-600">{stats.totalCustomers} 戶</div>
            <span className="text-[10px] text-slate-400">已登記手機房號</span>
          </div>

          <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 block mb-1">
              長者愛心戶
            </span>
            <div className="text-xl font-black text-amber-600">{stats.seniorCount} 戶</div>
            <span className="text-[10px] text-amber-600 font-medium">免費送菜上門</span>
          </div>
        </div>

        {/* 核心操作栏：导出 Excel */}
        <div className="bg-gradient-to-r from-emerald-600 to-green-700 rounded-2xl p-4 text-white shadow-md flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm">每日對賬 Excel 導出</h3>
            <p className="text-xs text-emerald-100 mt-0.5">
              一鍵導出全港街坊資料，無縫比對 WhatsApp 接龍
            </p>
          </div>
          <a
            href="/api/admin/export"
            download
            className="px-4 py-2.5 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl font-bold text-xs flex items-center space-x-1.5 shadow-sm transition active:scale-95 shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>導出 CSV</span>
          </a>
        </div>

        {/* 楼长网格分布 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <Building className="w-4 h-4 text-emerald-600" />
              <span>在營樓長網格 ({leaders.length})</span>
            </h3>
            <span className="text-[11px] text-slate-400">點擊可過濾名單</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {leaders.map((ldr) => (
              <div
                key={ldr.id}
                onClick={() =>
                  setSelectedLeaderFilter(
                    selectedLeaderFilter === ldr.id ? "ALL" : ldr.id
                  )
                }
                className={`p-3 rounded-xl border transition cursor-pointer text-left ${
                  selectedLeaderFilter === ldr.id
                    ? "bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500"
                    : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-xs">
                    {ldr.realName}
                  </span>
                  <span className="text-[10px] font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 font-bold text-slate-600">
                    {ldr.inviteCode}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  {ldr.estateName} {ldr.buildingName}
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">已鎖定：</span>
                  <span className="font-bold text-emerald-700">
                    {ldr.boundCount} 戶
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 街坊总档案列表 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-xs">
                街坊數據庫 ({filteredCustomers.length} 條)
              </h3>
              {selectedLeaderFilter !== "ALL" && (
                <span className="text-[10px] text-emerald-600 font-medium">
                  當前已按樓長過濾 ·{" "}
                  <button
                    onClick={() => setSelectedLeaderFilter("ALL")}
                    className="underline text-slate-500"
                  >
                    清除過濾
                  </button>
                </span>
              )}
            </div>
          </div>

          {/* 搜索 */}
          <div className="relative mb-3">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="快速搜尋電話、姓名或房號..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* 表格/卡片 */}
          <div className="space-y-2">
            {filteredCustomers.map((c) => (
              <div
                key={c.id}
                className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-slate-900 text-sm">
                      {c.realName}
                    </span>
                    {c.isSeniorCitizen && (
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                        👵 70歲送戶
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-emerald-700 font-bold">
                    {c.hkPhone}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-500 text-[11px]">
                  <span>
                    {c.estateName} · {c.buildingName} {c.flatNo}
                  </span>
                  <span className="bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600">
                    樓長: {c.boundInviteCode}
                  </span>
                </div>

                <div className="text-[10px] text-slate-400 pt-0.5">
                  登記時間: {formatHkDate(c.boundAt)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
