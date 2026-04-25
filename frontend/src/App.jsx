import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navigation from "./components/Navigation";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Verify from "./pages/Verify";
import DormDetail from "./pages/DormDetail";

export default function App() {
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserId(storedUserId);
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    setUserId(null);
    localStorage.removeItem("userId");
  };

  const handleSetUserId = (id) => {
    setUserId(id);
    localStorage.setItem("userId", id);
  };

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>
    );
  }

  return (
    <BrowserRouter>
      <Navigation userId={userId} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Home userId={userId} />} />
        <Route
          path="/signup"
          element={
            userId ? (
              <Navigate to="/" />
            ) : (
              <Signup setUserId={handleSetUserId} />
            )
          }
        />
        <Route
          path="/verify"
          element={
            userId ? (
              <Navigate to="/" />
            ) : (
              <Verify setUserId={handleSetUserId} />
            )
          }
        />
        <Route path="/dorms/:id" element={<DormDetail userId={userId} />} />
      </Routes>
    </BrowserRouter>
  );
}
