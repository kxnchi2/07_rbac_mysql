import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requirePermission } from "@/lib/auth";

export async function GET() {
  try {
    const [rows] = await pool.query("SELECT * FROM cars ORDER BY id DESC");
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const { error } = await requirePermission(request, "car:create");
  if (error) return error;

  const { brand, model, description, price, image } = await request.json();

  if (!brand || !model || !price) {
    return NextResponse.json(
      { status: "error", message: "brand, model, and price are required" },
      { status: 400 }
    );
  }

  const carImage = image || "";

  const [result] = await pool.query(
    "INSERT INTO cars (brand, model, description, price, image) VALUES (?, ?, ?, ?, ?)",
    [brand, model, description, price, carImage]
  );

  return NextResponse.json({ status: "ok", id: result.insertId }, { status: 201 });
}