import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { pool } from "@/lib/db";

// POST /api/register — สร้างผู้ใช้ใหม่
export async function POST(request) {
  // 1. รับค่าจากหน้าสมัครสมาชิก
  const { email, password, fullname, phone } = await request.json();

  // 2. ตรวจสอบว่ากรอกข้อมูลครบทุกช่องหรือไม่
  if (!email || !password || !fullname || !phone) {
    return NextResponse.json(
      { status: "error", message: "email, password, fullname and phone are required" },
      { status: 400 }
    );
  }

  // ปฏิเสธอีเมลที่สมัครไว้แล้ว
  const [rows] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
  if (rows.length > 0) {
    return NextResponse.json(
      { status: "error", message: "Email already registered" },
      { status: 409 }
    );
  }

  // ห้ามเก็บรหัสผ่านจริง เก็บเฉพาะ bcrypt hash
  const hash = await bcrypt.hash(password, 10);

  // 3. 🔴 กำหนด role ลงไปในคำสั่ง INSERT ตรงนี้ได้เลยครับ
  const defaultRole = "sale"; // 👈 เปลี่ยนเป็น "sale" หรือ "user" ตามที่ต้องการ

  const [result] = await pool.query(
    "INSERT INTO users (email, password, fullname, phone, role) VALUES (?, ?, ?, ?, ?)",
    [email, hash, fullname, phone, defaultRole]
  );

  return NextResponse.json({ status: "ok", id: result.insertId }, { status: 201 });
}