import { useApp } from "@/store/AppStore";
import AdminDashboard from "./AdminDashboard";
import MemberDashboard from "./MemberDashboard";

export default function Dashboard() {
  const { currentUser } = useApp();
  return currentUser?.role === "admin" ? <AdminDashboard /> : <MemberDashboard />;
}
