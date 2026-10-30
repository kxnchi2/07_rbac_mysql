import { redirect } from "next/navigation";

export default function Home() {
  // เมื่อเปิดเว็บมาหน้าแรก ให้เด้งไปที่หน้าโชว์รูมรถยนต์ทันที
  redirect("/cars");
}