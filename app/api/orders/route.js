import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET(request) {
  try {
    // 1. ตรวจสอบว่าล็อกอินหรือยัง
    const token = request.cookies.get("token")?.value;
    const user = await verifyToken(token);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. อนุญาตเฉพาะ superadmin, admin และ sales เท่านั้น
    if (!["superadmin", "admin", "sales"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 3. ดึงรายการลูกค้าที่จองรถทั้งหมด
    const [rows] = await pool.query(`
      SELECT 
        orders.id,
        users.fullname AS customerName,
        users.email AS customerEmail,
        users.phone AS customerPhone,
        cars.brand AS carBrand,
        cars.model AS carModel,
        cars.price AS carPrice
      FROM orders
      JOIN users ON orders.user_id = users.id
      JOIN cars ON orders.car_id = cars.id
      ORDER BY orders.created_at DESC
    `);
    
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}