import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Home({ token }) {
  const navigate = useNavigate();
  const [dorms, setDorms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [selectedCampus, setSelectedCampus] = useState("All");

  useEffect(() => {
    fetchDorms();
  }, []);

  const fetchDorms = async () => {
    try {
      const response = await fetch(`${API_URL}/api/dorms`);
      if (!response.ok) throw new Error("Failed to fetch dorms");
      const data = await response.json();
      setDorms(data);
    } catch (err) {
      setError("Failed to load dorms");
      console.error("Fetch dorms error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDormClick = (dormId) => {
    navigate(`/dorms/${dormId}`);
  };

  const filterDorms = (dormsToFilter) => {
    return dormsToFilter.filter((dorm) => {
      const matchesSearch = dorm.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesRating =
        (dorm.average_rating || 0) >= minRating;
      const matchesCampus =
        selectedCampus === "All" || dorm.campus === selectedCampus;

      return matchesSearch && matchesRating && matchesCampus;
    });
  };

  if (loading) return <div className="container">Loading dorms...</div>;
  if (error) return <div className="container error">{error}</div>;

  const northDorms = filterDorms(
    dorms.filter((d) => d.campus === "North")
  );
  const southDorms = filterDorms(
    dorms.filter((d) => d.campus === "South")
  );
  const eastDorms = filterDorms(
    dorms.filter((d) => d.campus === "East")
  );
  const offCampusDorms = filterDorms(
    dorms.filter((d) => d.campus === "Off-campus")
  );

  const campuses = ["All", "North", "South", "East", "Off-campus"];

  return (
    <div className="container">
      <h2>GrinnDorm - Dorm Ratings</h2>
      {!token && (
        <div
          style={{
            backgroundColor: "#fff3cd",
            padding: "1rem",
            borderRadius: "4px",
            marginBottom: "2rem",
          }}
        >
          <p>Please sign up or log in with your email to submit reviews.</p>
        </div>
      )}

      <div
        style={{
          backgroundColor: "#f8f9fa",
          padding: "1.5rem",
          borderRadius: "8px",
          marginBottom: "2rem",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Filter & Search</h3>

        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>
            Search Dorms:
          </label>
          <input
            type="text"
            placeholder="Search by dorm name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "0.75rem",
              fontSize: "1rem",
              borderRadius: "4px",
              border: "1px solid #ddd",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>
            Minimum Rating:
          </label>
          <select
            value={minRating}
            onChange={(e) => setMinRating(Number(e.target.value))}
            style={{
              padding: "0.75rem",
              fontSize: "1rem",
              borderRadius: "4px",
              border: "1px solid #ddd",
              cursor: "pointer",
            }}
          >
            <option value={0}>Any rating</option>
            <option value={1}>1+ stars</option>
            <option value={2}>2+ stars</option>
            <option value={3}>3+ stars</option>
            <option value={4}>4+ stars</option>
            <option value={5}>5 stars</option>
          </select>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "0.75rem" }}>
            Campus:
          </label>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {campuses.map((campus) => (
              <button
                key={campus}
                onClick={() => setSelectedCampus(campus)}
                style={{
                  padding: "0.5rem 1rem",
                  fontSize: "0.95rem",
                  borderRadius: "4px",
                  border:
                    selectedCampus === campus
                      ? "2px solid #007bff"
                      : "1px solid #ddd",
                  backgroundColor:
                    selectedCampus === campus ? "#e7f3ff" : "white",
                  color: selectedCampus === campus ? "#007bff" : "#333",
                  cursor: "pointer",
                  fontWeight:
                    selectedCampus === campus ? "bold" : "normal",
                }}
              >
                {campus}
              </button>
            ))}
          </div>
        </div>
      </div>

      <h3>North Campus</h3>
      <div>
        {northDorms.map((dorm) => (
          <div
            key={dorm.id}
            className="dorm-card"
            onClick={() => handleDormClick(dorm.id)}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "start",
              }}
            >
              <div>
                <h3>{dorm.name}</h3>
                <p>{dorm.review_count} reviews</p>
              </div>
              {dorm.average_rating ? (
                <div className="rating">{dorm.average_rating} / 5</div>
              ) : (
                <div style={{ color: "#999" }}>No rating yet</div>
              )}
            </div>
          </div>
        ))}
      </div>

      <h3>South Campus</h3>
      <div>
        {southDorms.map((dorm) => (
          <div
            key={dorm.id}
            className="dorm-card"
            onClick={() => handleDormClick(dorm.id)}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "start",
              }}
            >
              <div>
                <h3>{dorm.name}</h3>
                <p>{dorm.review_count} reviews</p>
              </div>
              {dorm.average_rating ? (
                <div className="rating">{dorm.average_rating} / 5</div>
              ) : (
                <div style={{ color: "#999" }}>No rating yet</div>
              )}
            </div>
          </div>
        ))}
      </div>

      <h3>East Campus</h3>
      <div>
        {eastDorms.map((dorm) => (
          <div
            key={dorm.id}
            className="dorm-card"
            onClick={() => handleDormClick(dorm.id)}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "start",
              }}
            >
              <div>
                <h3>{dorm.name}</h3>
                <p>{dorm.review_count} reviews</p>
              </div>
              {dorm.average_rating ? (
                <div className="rating">{dorm.average_rating} / 5</div>
              ) : (
                <div style={{ color: "#999" }}>No rating yet</div>
              )}
            </div>
          </div>
        ))}
      </div>

      <h3>Off-Campus</h3>
      <div>
        {offCampusDorms.map((dorm) => (
          <div
            key={dorm.id}
            className="dorm-card"
            onClick={() => handleDormClick(dorm.id)}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "start",
              }}
            >
              <div>
                <h3>{dorm.name}</h3>
                <p>{dorm.review_count} reviews</p>
              </div>
              {dorm.average_rating ? (
                <div className="rating">{dorm.average_rating} / 5</div>
              ) : (
                <div style={{ color: "#999" }}>No rating yet</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
