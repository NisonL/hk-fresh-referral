/**
 * 品牌与文案配置中枢
 * 后期任何品牌名、Logo、Slogan、角色称谓修改，直接修改本文件即可，无需改动业务代码！
 */
export const BRANDING_CONFIG = {
  // 品牌核心名称
  brandName: "供港優鮮",
  brandSubtitle: "屋邨直通車",
  
  // 标语 / Slogan
  slogan: "源頭直供 · 晨採午達 · 街坊特惠比街市平3成",

  // 角色称谓配置（后期随时替换）
  leaderTitle: "愛心樓長", // 如：愛心樓長 / 社區團長 / 街坊大使
  leaderPrefix: "您的專屬", // 组合为："您的專屬愛心樓長"

  // 溯源与背书文案
  originBadge: "廣東東莞石碣潤豐基地直發 · 文錦渡檢驗檢疫放行",

  // 默认 WhatsApp 官方群组链接（如果楼长未配置独立群链接，则使用此备用链接）
  defaultWhatsAppGroupUrl: "https://chat.whatsapp.com/sample-group-invite",

  // 默认官方客服微信号 / 备用微信号
  defaultWechatId: "hk_fresh_official",

  // 客服 WhatsApp（用户遇到问题可一键咨询）
  supportWhatsApp: "85291234567",

  // UI 主题视觉配置
  theme: {
    primaryColor: "#16a34a", // 鲜绿色
    accentColor: "#25D366",  // WhatsApp 绿
    wechatColor: "#07C160",  // 微信绿
  }
};
