import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  try {
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