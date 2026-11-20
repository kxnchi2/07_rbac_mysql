import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET(request) {
  try {
    const token = request.cookies.get("token")?.value;
    const user = await verifyToken(token);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isStaff = ["superadmin", "admin", "sales"].includes(user.role);

    // ทีมงานดึงทั้งหมด ส่วนลูกค้าดึงเฉพาะของตัวเอง
    const whereClause = isStaff ? "" : "WHERE orders.user_id = ?";
    const queryParams = isStaff ? [] : [user.id];

    const [rows] = await pool.query(
      `SELECT 
        orders.id,
        orders.car_id AS carId,
        orders.status AS orderStatus,
        orders.created_at AS orderDate,
        users.fullname AS customerName,
        users.email AS customerEmail,
        users.phone AS customerPhone,
        cars.brand AS carBrand,
        cars.model AS carModel,
        cars.price AS carPrice,
        cars.category AS carCategory
      FROM orders
      JOIN users ON orders.user_id = users.id
      JOIN cars ON orders.car_id = cars.id
      ${whereClause}
      ORDER BY orders.created_at DESC`,
      queryParams
    );

    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}