import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function POST(request, { params }) {
  try {
    // 1. ถอดรหัส params (รองรับ Next.js 15)
    const { id: carId } = await params;

    // 2. ดึง Token จาก Cookie
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value; // ปรับชื่อคุกกี้ตามระบบ (ส่วนใหญ่ใช้ "token")

    if (!token) {
      return NextResponse.json(
        { status: "error", message: "กรุณาเข้าสู่ระบบก่อนทำการสั่งซื้อ" },
        { status: 401 }
      );
    }

    // 3. แกะข้อมูล User ID ออกมาจาก JWT Secret
    let userId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.id; // ดึง id ของคนที่กำลังล็อกอินอยู่จริง ๆ
    } catch (err) {
      return NextResponse.json(
        { status: "error", message: "Token ไม่ถูกต้องหรือหมดอายุ กรุณาเข้าสู่ระบบใหม่" },
        { status: 401 }
      );
    }

    // 4. ตรวจสอบว่ามีรถคันนี้และยังไม่ถูกขาย
    const [cars] = await pool.query("SELECT * FROM cars WHERE id = ?", [carId]);
    if (cars.length === 0) {
      return NextResponse.json(
        { status: "error", message: "ไม่พบข้อมูลรถยนต์" },
        { status: 404 }
      );
    }

    if (cars[0].status === "sold") {
      return NextResponse.json(
        { status: "error", message: "รถคันนี้ถูกขายไปเรียบร้อยแล้ว" },
        { status: 400 }
      );
    }

    // 5. อัปเดตสถานะรถในตาราง cars เป็น 'sold'
    await pool.query("UPDATE cars SET status = 'sold' WHERE id = ?", [carId]);

    // 6. บันทึกประวัติการสั่งซื้อลงในตาราง orders ด้วย user_id ที่ถูกต้อง
    await pool.query(
      "INSERT INTO orders (user_id, car_id) VALUES (?, ?)",
      [userId, carId]
    );

    return NextResponse.json(
      { status: "ok", message: "สั่งซื้อสำเร็จ" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error ordering car:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "เกิดข้อผิดพลาดในระบบ" },
      { status: 500 }
    );
  }
}