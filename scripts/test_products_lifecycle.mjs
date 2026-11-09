// scripts/test_products_lifecycle.mjs
// 验证商品全生命周期：新增、全量编辑(含足500T规格)、街市价打勾/不打勾、上下架隐藏、彻底删除

async function runTest() {
  const baseUrl = "http://localhost:3000";
  console.log("=== 启动商品货架动态管理生命周期测试 ===");

  // 1. 获取现有商品
  const initialRes = await fetch(`${baseUrl}/api/products?includeHidden=true`);
  const initialData = await initialRes.json();
  const initialCount = initialData.products.length;
  console.log(`[PASS 1] 现有商品数量: ${initialCount}`);

  // 2. 添加新商品 (包含规格「足500T」与街市参考价)
  const addPayload = {
    nameZh: "特選鮮嫩西洋菜",
    subTitle: "足500T保鮮裝 · 滾生滾湯絕配 · 東莞潤豐",
    netWeight: "足500T",
    priceHkd: 8.8,
    marketPriceHkd: 13.5,
    showMarketPrice: true,
    tag: "當造推薦",
    imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=60",
    isActive: true,
    inStock: true,
    category: "精選蔬菜",
  };
  const addRes = await fetch(`${baseUrl}/api/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(addPayload),
  });
  const addData = await addRes.json();
  if (!addRes.ok || !addData.product) throw new Error("添加商品失败: " + JSON.stringify(addData));
  const createdId = addData.product.id;
  console.log(`[PASS 2] 成功新增商品 ID: ${createdId}, 品名: ${addData.product.nameZh}, 规格: ${addData.product.netWeight}`);

  // 3. 编辑商品所有信息（修改品名、修改规格描述为更长文本、取消街市参考价打勾）
  const editPayload = {
    id: createdId,
    nameZh: "有機高山特選西洋菜 (精選)",
    subTitle: "足500T真空保鮮裝 · 晨早露水摘採",
    netWeight: "足500T (純菜)",
    priceHkd: 9.2,
    marketPriceHkd: 15.0,
    showMarketPrice: false, // 取消打勾：不展示街市划线对比价
    tag: "超級爆款",
  };
  const editRes = await fetch(`${baseUrl}/api/products`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(editPayload),
  });
  const editData = await editRes.json();
  if (!editRes.ok || !editData.product) throw new Error("编辑商品失败: " + JSON.stringify(editData));
  if (editData.product.nameZh !== editPayload.nameZh) throw new Error("品名未成功更新");
  if (editData.product.netWeight !== editPayload.netWeight) throw new Error("规格标牌未成功更新");
  if (editData.product.showMarketPrice !== false) throw new Error("街市价打勾状态未成功更新");
  console.log(`[PASS 3] 成功全量编辑商品！新品名: ${editData.product.nameZh}, 新标牌: ${editData.product.netWeight}, 街市打勾: ${editData.product.showMarketPrice}`);

  // 4. 隐藏商品 (下架)
  const hideRes = await fetch(`${baseUrl}/api/products`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: createdId, isActive: false }),
  });
  const hideData = await hideRes.json();
  if (!hideRes.ok || hideData.product.isActive !== false) throw new Error("隐藏商品失败");
  console.log(`[PASS 4] 成功将商品下架隐藏 (isActive = false)`);

  // 5. 验证买家端不显示隐藏商品，而后台显示
  const publicRes = await fetch(`${baseUrl}/api/products`);
  const publicData = await publicRes.json();
  const foundInPublic = publicData.products.some((p) => p.id === createdId);
  if (foundInPublic) throw new Error("隐藏的商品依然出现在买家端货架中！");
  console.log(`[PASS 5] 街坊商城端已成功屏蔽隐藏商品！`);

  const adminRes = await fetch(`${baseUrl}/api/products?includeHidden=true`);
  const adminData = await adminRes.json();
  const foundInAdmin = adminData.products.some((p) => p.id === createdId);
  if (!foundInAdmin) throw new Error("隐藏的商品在管理后台中丢失！");
  console.log(`[PASS 6] 管理总控台正确保留该隐藏商品以便随时恢复！`);

  // 6. 删除测试商品
  const delRes = await fetch(`${baseUrl}/api/products?id=${createdId}`, { method: "DELETE" });
  const delData = await delRes.json();
  if (!delRes.ok || !delData.success) throw new Error("删除商品失败: " + JSON.stringify(delData));
  console.log(`[PASS 7] 成功调用 DELETE 从货架彻底删除商品`);

  // 7. 再次确认商品已被清理
  const finalRes = await fetch(`${baseUrl}/api/products?includeHidden=true`);
  const finalData = await finalRes.json();
  if (finalData.products.length !== initialCount) throw new Error("商品总数未恢复初始状态");
  console.log(`[PASS 8] 商品总数恢复为: ${finalData.products.length}，全生命周期验证 100% 通过！\n`);
}

runTest().catch((err) => {
  console.error("Test Failed:", err);
  process.exit(1);
});
