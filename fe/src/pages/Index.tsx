import Landing from "./Landing";
import { Navigate } from "react-router-dom";
import { useApp } from "@/store/AppStore";

const Index = () => {
  const { currentUser, isReady } = useApp();
  if (!isReady) return null;
  if (currentUser) return <Navigate to="/dashboard" replace />;
  return <Landing />;
};

export default Index;
