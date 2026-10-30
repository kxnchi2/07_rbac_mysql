import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

// GET /api/me — คืนข้อมูลผู้ใช้ที่ Login อยู่ หรือ 401
export async function GET(request) {
  const user = await verifyToken(request.cookies.get("token")?.value);

  if (!user) {
    return NextResponse.json(
      { status: "error", message: "Unauthorized" },
      { status: 401 }
    );
  }

  // ส่งข้อมูลกลับไปให้หน้าเว็บ รวมถึง role ด้วย
  return NextResponse.json({ 
    id: user.id, 
    email: user.email, 
    fullname: user.fullname,
    role: user.role // <--- เพิ่มตรงนี้ครับ
  });
}