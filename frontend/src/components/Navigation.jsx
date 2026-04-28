import { Link, useNavigate } from "react-router-dom";

export default function Navigation({ token, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  return (
    <nav>
      <h1>
        <Link to="/" style={{ color: "white", textDecoration: "none" }}>
          GrinnDorm
        </Link>
      </h1>
      <div>
        <Link to="/">Home</Link>
        {token ? (
          <>
            <span style={{ marginLeft: "1rem", marginRight: "1rem" }}>
              (Logged in)
            </span>
            <button
              onClick={handleLogout}
              style={{
                background: "#dc3545",
                padding: "0.5rem 1rem",
                marginLeft: "1rem",
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/signup">Sign up</Link>
            <Link to="/verify">Log in</Link>
          </>
        )}
      </div>
    </nav>
  );
}
