import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requirePermission } from "@/lib/auth";

// GET /api/cars/{id} — ต้องมีสิทธิ์ car:read
export async function GET(request, { params }) {
  const { error } = await requirePermission(request, "car:read");
  if (error) return error;

  const { id } = await params;
  const [rows] = await pool.query("SELECT * FROM cars WHERE id = ?", [id]);

  if (rows.length === 0) {
    return NextResponse.json(
      { status: "error", message: "Car not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(rows[0]);
}

// PUT /api/cars/{id} — ต้องมีสิทธิ์ car:update
export async function PUT(request, { params }) {
  const { error } = await requirePermission(request, "car:update");
  if (error) return error;

  const { id } = await params;
  const { brand, model, price, description } = await request.json();

  await pool.query(
    "UPDATE cars SET brand = ?, model = ?, price = ?, description = ? WHERE id = ?",
    [brand, model, price, description, id]
  );

  return NextResponse.json({ status: "ok" });
}

// DELETE /api/cars/{id} — ต้องมีสิทธิ์ car:delete
export async function DELETE(request, { params }) {
  const { error } = await requirePermission(request, "car:delete");
  if (error) return error;

  const { id } = await params;
  await pool.query("DELETE FROM cars WHERE id = ?", [id]);
  return NextResponse.json({ status: "ok" });
}