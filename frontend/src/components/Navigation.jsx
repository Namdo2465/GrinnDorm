import { Link, useNavigate } from "react-router-dom";
import squirrel from "../squirrel.svg";

export default function Navigation({ token, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  return (
    <nav>
      <h1>
        <Link
          to="/"
          style={{
            color: "white",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <img
            src={squirrel}
            alt="logo"
            style={{ width: "40px", height: "40px" }}
          />
          GrinnDorm
        </Link>
      </h1>
      <div>
        <Link to="/">Home</Link>
        {token ? (
          <>
            <button
              onClick={handleLogout}
              style={{
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
