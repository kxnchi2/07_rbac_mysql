import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

// GET /api/me — ดึงข้อมูลผู้ใช้ล่าสุดจากฐานข้อมูล (รวมถึง role และ avatar)
export async function GET(request) {
  try {
    const token = request.cookies.get("token")?.value;
    const decoded = await verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { status: "error", message: "Unauthorized" },
        { status: 401 }
      );
    }

    const [rows] = await pool.query(
      "SELECT id, email, fullname, role, phone, avatar FROM users WHERE id = ?",
      [decoded.id]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { status: "error", message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 }
    );
  }
}