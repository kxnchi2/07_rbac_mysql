import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { pool } from "@/lib/db";
import { signToken } from "@/lib/auth";

// POST /api/login — ตรวจรหัสผ่านแล้วตั้ง cookie token
export async function POST(request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json(
      { status: "error", message: "email and password are required" },
      { status: 400 }
    );
  }

  const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
  const user = rows[0];

  // ใช้ข้อความเดียวกันทั้งกรณีไม่พบอีเมลและรหัสผ่านผิด
  // เพื่อไม่ให้ใช้ฟอร์มนี้ตรวจได้ว่าอีเมลใดมีในระบบ
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return NextResponse.json(
      { status: "error", message: "Invalid email or password" },
      { status: 401 }
    );
  }

  const token = await signToken({
    id: user.id,
    email: user.email,
    fullname: user.fullname,
    role: user.role, // <--- เพิ่มข้อมูล role ตรงนี้ครับ
  });

  const response = NextResponse.json({ status: "ok" });

  // httpOnly: JavaScript บนหน้าเว็บอ่าน cookie นี้ไม่ได้
  response.cookies.set("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60, // 1 ชั่วโมง เท่ากับอายุของ token
  });

  return response;
}