import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navigation from "./components/Navigation";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Verify from "./pages/Verify";
import DormDetail from "./pages/DormDetail";

export default function App() {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem("token");
  };

  const handleSetToken = (newToken) => {
    setToken(newToken);
    localStorage.setItem("token", newToken);
  };

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>
    );
  }

  return (
    <BrowserRouter>
      <Navigation token={token} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Home token={token} />} />
        <Route
          path="/signup"
          element={
            token ? (
              <Navigate to="/" />
            ) : (
              <Signup setToken={handleSetToken} />
            )
          }
        />
        <Route
          path="/verify"
          element={
            token ? (
              <Navigate to="/" />
            ) : (
              <Verify setToken={handleSetToken} />
            )
          }
        />
        <Route path="/dorms/:id" element={<DormDetail token={token} />} />
      </Routes>
    </BrowserRouter>
  );
}
