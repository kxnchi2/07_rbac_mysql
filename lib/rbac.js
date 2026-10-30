// permission ของแต่ละ role — แก้สิทธิ์ทั้งระบบได้จากไฟล์นี้ที่เดียว
export const PERMISSIONS = {
  customer: ["car:read"], // ลูกค้าทั่วไป: ดูข้อมูลรถได้อย่างเดียว
  sales: ["car:read", "car:create", "car:update"], // พนักงานขาย: เพิ่มและแก้ไขข้อมูลรถได้
  admin: ["car:read", "car:create", "car:update", "car:delete", "user:manage"], // ผู้ดูแลระบบ: ทำได้ทุกอย่าง
};

// ตรวจว่า role นี้มี permission ที่ระบุหรือไม่
export function can(role, permission) {
  return PERMISSIONS[role]?.includes(permission) ?? false;
}