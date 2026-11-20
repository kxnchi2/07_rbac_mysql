import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function POST(request, { params }) {
  try {
    // 1. ถอดรหัส params (รองรับ Next.js 15+)
    const { id: carId } = await params;

    // 2. ดึง Token จาก Cookie
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { status: "error", message: "กรุณาเข้าสู่ระบบก่อนทำการสั่งซื้อ" },
        { status: 401 }
      );
    }

    // 3. แกะข้อมูล User ID ออกมาจาก Token ด้วย verifyToken ของระบบ
    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { status: "error", message: "Token ไม่ถูกต้องหรือหมดอายุ กรุณาเข้าสู่ระบบใหม่" },
        { status: 401 }
      );
    }
    const userId = decoded.id;

    // 4. ตรวจสอบว่ามีรถคันนี้และยังไม่ถูกจองหรือขาย
    const [cars] = await pool.query("SELECT * FROM cars WHERE id = ?", [carId]);
    if (cars.length === 0) {
      return NextResponse.json(
        { status: "error", message: "ไม่พบข้อมูลรถยนต์" },
        { status: 404 }
      );
    }

    if (cars[0].status === "sold" || cars[0].status === "reserved") {
      return NextResponse.json(
        { status: "error", message: "ขออภัย รถคันนี้ถูกจองหรือขายไปเรียบร้อยแล้ว" },
        { status: 400 }
      );
    }

    // 5. อัปเดตสถานะรถในตาราง cars เป็น 'reserved' (ติดจอง)
    await pool.query("UPDATE cars SET status = 'reserved' WHERE id = ?", [carId]);

    // 6. บันทึกประวัติการสั่งซื้อลงในตาราง orders พร้อมสถานะเริ่มต้น 'pending'
    await pool.query(
      "INSERT INTO orders (user_id, car_id, status) VALUES (?, ?, 'pending')",
      [userId, carId]
    );

    return NextResponse.json(
      { status: "ok", message: "สั่งซื้อสำเร็จ! เซลส์จะทำการติดต่อกลับไปครับ" },
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