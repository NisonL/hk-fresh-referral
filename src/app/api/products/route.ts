import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const includeHidden = searchParams.get("includeHidden") === "true";
  const allProducts = db.getAllProducts();
  const products = includeHidden ? allProducts : allProducts.filter((p) => p.isActive !== false);
  return NextResponse.json({ products });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.nameZh || !body.nameZh.trim()) {
      return NextResponse.json({ error: "商品品名不能為空" }, { status: 400 });
    }
    const newProduct = db.addProduct({
      nameZh: body.nameZh.trim(),
      subTitle: body.subTitle?.trim() || "足500g保鮮裝 · 晨早露水採摘",
      priceHkd: parseFloat(body.priceHkd) || 8.0,
      marketPriceHkd: body.marketPriceHkd !== undefined && body.marketPriceHkd !== "" ? parseFloat(body.marketPriceHkd) : undefined,
      showMarketPrice: body.showMarketPrice !== undefined ? Boolean(body.showMarketPrice) : true,
      netWeight: body.netWeight?.trim() || "500g",
      imageUrl: body.imageUrl?.trim() || "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=60",
      tag: body.tag?.trim() || undefined,
      inStock: body.inStock !== undefined ? Boolean(body.inStock) : true,
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
      category: body.category?.trim() || "精選蔬菜",
    });
    return NextResponse.json({ success: true, product: newProduct });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: "缺少商品 ID" }, { status: 400 });

    const updated = db.updateProduct(id, updates);
    return NextResponse.json({ success: true, product: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "缺少商品 ID" }, { status: 400 });

    const success = db.deleteProduct(id);
    return NextResponse.json({ success });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
