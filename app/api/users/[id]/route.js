import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/rbac";

// PUT /api/users/{id} — เปลี่ยน role ของผู้ใช้ ต้องมีสิทธิ์ user:manage
export async function PUT(request, { params }) {
  const { user, error } = await requirePermission(request, "user:manage");
  if (error) return error;

  const { id } = await params;
  const { role } = await request.json();

  // 1. รับเฉพาะ role ที่มีอยู่ใน PERMISSIONS
  if (!Object.keys(PERMISSIONS).includes(role)) {
    return NextResponse.json(
      { status: "error", message: "Invalid role" },
      { status: 400 }
    );
  }

  // 2. กันเปลี่ยนสิทธิ์ตัวเอง
  if (Number(id) === user.id) {
    return NextResponse.json(
      { status: "error", message: "You cannot change your own role" },
      { status: 400 }
    );
  }

  // 3. ดึงข้อมูล role ปัจจุบันของเป้าหมายที่จะถูกแก้
  const [rows] = await pool.query("SELECT role FROM users WHERE id = ?", [id]);
  if (rows.length === 0) {
    return NextResponse.json(
      { status: "error", message: "User not found" },
      { status: 404 }
    );
  }
  const targetCurrentRole = rows[0].role;

  // 4. กฎสำหรับ admin ธรรมดา (ถ้าไม่ใช่ superadmin)
  if (user.role === "admin") {
    // ห้าม admin ยุ่งกับคนที่เป็น admin หรือ superadmin ด้วยกัน
    if (targetCurrentRole === "admin" || targetCurrentRole === "superadmin") {
      return NextResponse.json(
        { status: "error", message: "Admin cannot modify another admin or superadmin" },
        { status: 403 }
      );
    }

    // ห้าม admin ปรับคนอื่นเป็น sales, admin หรือ superadmin
    if (["sales", "admin", "superadmin"].includes(role)) {
      return NextResponse.json(
        { status: "error", message: `Admin cannot assign the ${role} role` },
        { status: 403 }
      );
    }
  }

  // 5. อัปเดตลงฐานข้อมูล (superadmin จะข้ามข้อ 4 มาอัปเดตตรงนี้ได้เลย)
  await pool.query("UPDATE users SET role = ? WHERE id = ?", [role, id]);
  return NextResponse.json({ status: "ok" });
}