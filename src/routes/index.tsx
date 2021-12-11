import { useStore } from "@nanostores/react";
import React from "react";
import { useNavigate } from "react-router-dom";
import Login from "../lib/components/Auth";
import { user as userStore } from "../lib/stores/user";

const Index: React.FC = () => {
  const user = useStore(userStore);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      navigate("/chat");
    }
  }, [user, navigate]);

  return <>{user ? <h1>Redirecting...</h1> : <Login />}</>;
};

export default Index;
