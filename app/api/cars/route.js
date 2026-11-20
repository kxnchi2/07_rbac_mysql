import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requirePermission } from "@/lib/auth";

// GET /api/cars — ดึงรายการรถทั้งหมด (รวมหมวดหมู่และวันนำเข้า)
export async function GET() {
  try {
    const [rows] = await pool.query(
      "SELECT id, brand, model, price, description, image, status, category, created_at FROM cars ORDER BY created_at DESC"
    );
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/cars — เพิ่มรถใหม่เข้าโชว์รูม
export async function POST(request) {
  const { error } = await requirePermission(request, "car:create");
  if (error) return error;

  const { brand, model, price, description, image, category } = await request.json();

  if (!brand || !model || !price) {
    return NextResponse.json({ message: "กรุณากรอกข้อมูลให้ครบ" }, { status: 400 });
  }

  const carCategory = category === "used" ? "used" : "new";

  await pool.query(
    "INSERT INTO cars (brand, model, price, description, image, category) VALUES (?, ?, ?, ?, ?, ?)",
    [brand, model, price, description || "", image || "", carCategory]
  );

  return NextResponse.json({ status: "ok" });
}