import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function PUT(request) {
  try {
    const token = request.cookies.get("token")?.value;
    const decoded = await verifyToken(token);

    if (!decoded) {
      return NextResponse.json({ message: "กรุณาเข้าสู่ระบบก่อน" }, { status: 401 });
    }

    const { avatar } = await request.json();

    await pool.query("UPDATE users SET avatar = ? WHERE id = ?", [
      avatar || null,
      decoded.id,
    ]);

    return NextResponse.json({ status: "ok", avatar });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}