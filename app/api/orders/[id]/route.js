import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function PUT(request, { params }) {
  try {
    const token = request.cookies.get("token")?.value;
    const user = await verifyToken(token);

    if (!user || !["superadmin", "admin", "sales"].includes(user.role)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const { status } = await request.json();

    const validStatuses = ["pending", "contacted", "sold", "cancelled"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 });
    }

    // ดึง car_id ของรายการจองนี้
    const [orders] = await pool.query("SELECT car_id FROM orders WHERE id = ?", [id]);
    if (orders.length === 0) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }
    const carId = orders[0].car_id;

    // 1. อัปเดตสถานะการจองในตาราง orders
    await pool.query("UPDATE orders SET status = ? WHERE id = ?", [status, id]);

    // 2. อัปเดตสถานะรถในตาราง cars ให้สอดคล้องกัน
    if (status === "sold") {
      await pool.query("UPDATE cars SET status = 'sold' WHERE id = ?", [carId]);
    } else if (status === "cancelled") {
      await pool.query("UPDATE cars SET status = 'available' WHERE id = ?", [carId]);
    } else {
      await pool.query("UPDATE cars SET status = 'reserved' WHERE id = ?", [carId]);
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}