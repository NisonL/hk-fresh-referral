import Link from "next/link";
import {
  QrCode,
  Users,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Smartphone,
  Layers,
  Settings,
} from "lucide-react";
import { BRANDING_CONFIG } from "@/config/branding";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col p-6 bg-slate-50 text-slate-800">
      {/* 顶部标识 */}
      <div className="text-center pt-4 pb-6">
        <div className="inline-flex items-center space-x-1.5 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold mb-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>獨立推薦與登記中樞 V1.0</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          {BRANDING_CONFIG.brandName} · {BRANDING_CONFIG.brandSubtitle}
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
          {BRANDING_CONFIG.slogan}
        </p>
      </div>

      {/* 三大端口测试入口 */}
      <div className="space-y-3.5">
        {/* 端口 1: 街坊扫码端 */}
        <Link
          href="/join/HUA888"
          className="block bg-white p-5 rounded-2xl border border-emerald-500/30 shadow-sm hover:shadow-md transition active:scale-[0.99] group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2.5">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  C 端街坊入口
                </span>
                <h2 className="font-black text-slate-900 text-base mt-0.5">
                  街坊掃碼登記頁面
                </h2>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition" />
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            模擬街坊掃描【蘇屋邨牡丹樓 · 華姐】的專屬海報，輸入 8 位香港電話、房號並一秒跳轉進 WhatsApp 訂菜群。
          </p>
        </Link>

        {/* 端口 2: 楼长专属工作台 */}
        <Link
          href="/leader"
          className="block bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition active:scale-[0.99] group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2.5">
              <div className="p-2.5 bg-slate-900 text-white rounded-xl">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                  B 端樓長入口
                </span>
                <h2 className="font-black text-slate-900 text-base mt-0.5">
                  愛心樓長個人駕駛艙
                </h2>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-1 transition" />
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            樓長隨時查看自己的專屬推廣二維碼、已鎖定街坊人數、長者送菜標記，並可一鍵在 WhatsApp 與街坊聯繫。
          </p>
        </Link>

        {/* 端口 3: 操盘总控后台 */}
        <Link
          href="/admin"
          className="block bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition active:scale-[0.99] group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2.5">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                  M 總控運營端
                </span>
                <h2 className="font-black text-slate-900 text-base mt-0.5">
                  操盤總控台 & 對賬導出
                </h2>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition" />
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Nison 與阿蘊查看全港所有大廈樓長分佈、街坊總檔案，並支持【一鍵導出 Excel 對賬表】核對 WhatsApp 接龍。
          </p>
        </Link>
      </div>

      {/* 架构解耦说明 */}
      <div className="mt-6 p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200/80 text-xs text-emerald-950 space-y-1.5">
        <div className="font-bold flex items-center gap-1.5 text-emerald-900">
          <Settings className="w-4 h-4 text-emerald-700" />
          <span>解耦與文案配置提示</span>
        </div>
        <p className="text-[11px] text-emerald-800 leading-normal">
          所有品牌名稱（如【供港優鮮】）、Slogan、角色稱謂（如【愛心樓長】）、Logo 與群組鏈接，均已集中抽取至配置文件：
        </p>
        <code className="block bg-white/80 p-2 rounded-lg font-mono text-[10px] text-emerald-900 border border-emerald-200">
          src/config/branding.ts
        </code>
        <p className="text-[11px] text-emerald-800">
          未來等你在另一個對話框設計好品牌素材後，直接修改該文件即可全站生效，零代碼改造成本！
        </p>
      </div>
    </div>
  );
}
