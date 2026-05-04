import React from "react";
import { useState, useRef, useEffect } from "react";
import { Search, Filter, MapPin, Star, MapIcon, Instagram } from "lucide-react";
import { Dorm, Review } from "../App";

interface HomePageProps {
  dorms: Dorm[];
  reviews: Review[];
  onDormClick: (dormId: string) => void;
}

// Mapping of dorm names to their positions on the map as percentages (x, y)
const DORM_POSITIONS: Record<string, { x: number; y: number }> = {
  "Younker Hall": { x: 44, y: 42 },
  "Smith Hall": { x: 40, y: 39 },
  "Langan Hall": { x: 38.5, y: 36.7 },
  "Rawson Hall": { x: 38.5, y: 34 },
  "Gates Hall": { x: 38.5, y: 32 },
  "Clark Hall": { x: 38.5, y: 28 },
  "Cowles Hall": { x: 46, y: 26 },
  "Dibble Hall": { x: 38.5, y: 26 },
  "Norris Hall": { x: 41.5, y: 21 },
  "Loose Hall": { x: 86, y: 53 },
  "Read Hall": { x: 86, y: 59 },
  "Haines Hall": { x: 86, y: 62 },
  "James Hall": { x: 86, y: 66 },
  "Cleveland Hall": { x: 86, y: 69 },
  "Main Hall": { x: 84, y: 74 },
  "Lazier Hall": { x: 86.5, y: 45 },
  "Kershaw Hall": { x: 87.5, y: 39 },
  "Rose Hall": { x: 87.5, y: 33 },
  "Rathje Hall": { x: 87.5, y: 27 },
  "Renfrow Hall": { x: 11, y: 86 },
};

export function HomePage({ dorms, reviews, onDormClick }: HomePageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCampus, setSelectedCampus] = useState<string>("All");
  const [selectedRating, setSelectedRating] = useState<string>("All");
  const [squirrelPosition, setSquirrelPosition] = useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [hoveredDormName, setHoveredDormName] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  const campusOptions = [
    "All",
    "North Campus",
    "South Campus",
    "East Campus",
    "Off-campus",
  ];

  const calculateAverage = (dormId: string) => {
    const dormReviews = reviews.filter((r) => r.dormId === dormId);
    if (dormReviews.length === 0) return 0;
    return (
      dormReviews.reduce((sum, r) => sum + r.rating, 0) / dormReviews.length
    );
  };

  const calculateDistance = (
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  };

  const filteredDorms = dorms.filter((dorm) => {
    const matchesSearch = dorm.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCampus =
      selectedCampus === "All" || dorm.campus === selectedCampus;
    const avgRating = calculateAverage(dorm.id);
    const matchesRating =
      selectedRating === "All" ||
      (selectedRating === "4+" && avgRating >= 4) ||
      (selectedRating === "3+" && avgRating >= 3);
    return matchesSearch && matchesCampus && matchesRating;
  });

  // Determine which dorms to display: if filters are active, use filtered; otherwise use all
  const dormsToDisplay =
    searchQuery || selectedCampus !== "All" || selectedRating !== "All"
      ? filteredDorms
      : dorms;

  const dormsWithDistance = dormsToDisplay
    .map((dorm) => {
      const dormPos = DORM_POSITIONS[dorm.name];
      if (!dormPos) return { dorm, distance: Infinity };
      const distance = calculateDistance(
        squirrelPosition.x,
        squirrelPosition.y,
        dormPos.x,
        dormPos.y
      );
      return { dorm, distance };
    })
    .sort((a, b) => a.distance - b.distance);

  const nearbyDorms = dormsWithDistance.map((d) => d.dorm);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(!isDragging);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && mapRef.current) {
      const rect = mapRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setSquirrelPosition({
        x: Math.max(5, Math.min(95, x)),
        y: Math.max(5, Math.min(95, y)),
      });
    }
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      return () => document.removeEventListener("mousemove", handleMouseMove);
    }
  }, [isDragging]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 via-pink-50 to-rose-100">
      {/* Hero Section */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2 text-center">
            Explore Campus Dorms
          </h1>
          <p className="text-lg text-gray-600 text-center">
            Find your perfect home at Grinnell College
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Search & Filters Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-grinnell-red" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search dorms..."
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-grinnell-red focus:border-grinnell-red bg-white shadow-sm hover:border-grinnell-red transition-all"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 ${
                showFilters
                  ? "bg-grinnell-red text-white shadow-lg"
                  : "bg-white text-gray-700 border-2 border-gray-200 hover:border-grinnell-red shadow-sm"
              }`}
            >
              <Filter className="w-5 h-5" />
              <span>Filters</span>
            </button>
          </div>

          {showFilters && (
            <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">
                  Campus Area
                </label>
                <div className="flex flex-wrap gap-2">
                  {campusOptions.map((campus) => (
                    <button
                      key={campus}
                      onClick={() => setSelectedCampus(campus)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105 ${
                        selectedCampus === campus
                          ? "bg-gradient-to-r from-grinnell-red to-red-600 text-white shadow-md"
                          : "bg-gray-100 text-gray-700 hover:bg-red-50 border border-gray-200"
                      }`}
                    >
                      {campus}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">
                  Minimum Rating
                </label>
                <div className="flex flex-wrap gap-2">
                  {["All", "3+", "4+"].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setSelectedRating(rating)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105 ${
                        selectedRating === rating
                          ? "bg-gradient-to-r from-grinnell-red to-red-600 text-white shadow-md"
                          : "bg-gray-100 text-gray-700 hover:bg-red-50 border border-gray-200"
                      }`}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Links Section */}
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                  Explore More
                </h3>
                <a
                  href="https://www.youvisit.com/tour/grinnell"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg hover:from-red-100 hover:to-pink-100 transition-all border border-red-200 hover:border-grinnell-red group"
                >
                  <MapIcon className="w-5 h-5 text-grinnell-red group-hover:scale-110 transition-transform" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">
                      Virtual Campus Tour
                    </p>
                    <p className="text-xs text-gray-600">Explore the campus</p>
                  </div>
                </a>
                <a
                  href="https://www.instagram.com/grinnelldorms/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg hover:from-pink-100 hover:to-rose-100 transition-all border border-pink-200 hover:border-grinnell-red group"
                >
                  <Instagram className="w-5 h-5 text-grinnell-red group-hover:scale-110 transition-transform" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">
                      Dorms Tour
                    </p>
                    <p className="text-xs text-gray-600">
                      See how each dorm actually looks like
                    </p>
                  </div>
                </a>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div ref={mapRef} className="relative cursor-move select-none">
                <img
                  src="/CampusMap.png"
                  alt="Grinnell College Campus Map"
                  className="w-full h-auto object-contain"
                />
                <div className="absolute top-4 left-4 bg-white bg-opacity-95 text-gray-900 rounded-xl p-3 shadow-lg">
                  <div className="space-y-0.5">
                    <p className="font-bold text-sm">
                      Grinnell College Campus Map
                    </p>
                    <p className="text-gray-600 text-xs">
                      Click onto the squirrel or hover over list of dorms
                    </p>
                  </div>
                </div>

                <div
                  className={`absolute w-12 h-12 -translate-x-1/2 -translate-y-1/2 cursor-grab ${
                    isDragging ? "cursor-grabbing scale-125" : "hover:scale-125"
                  } transition-transform drop-shadow-2xl`}
                  style={{
                    left: `${squirrelPosition.x}%`,
                    top: `${squirrelPosition.y}%`,
                  }}
                  onMouseDown={handleMouseDown}
                >
                  <img
                    src={isDragging ? "/dragged_squirrel.svg" : "/Squirrel.svg"}
                    alt="Squirrel"
                    className="w-full h-full"
                  />
                  {isDragging && (
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white border border-grinnell-red rounded-lg px-2 py-1 shadow-lg animate-bounce whitespace-nowrap">
                      <span className="text-xs font-bold text-grinnell-red">
                        weeeeee
                      </span>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-3 border-r-3 border-t-3 border-l-transparent border-r-transparent border-t-white"></div>
                    </div>
                  )}
                </div>

                {/* Dorm pin - appears on hover */}
                {hoveredDormName && DORM_POSITIONS[hoveredDormName] && (
                  <div
                    className="absolute -translate-x-1/2 -translate-y-full pointer-events-none animate-bounce"
                    style={{
                      left: `${DORM_POSITIONS[hoveredDormName].x}%`,
                      top: `${DORM_POSITIONS[hoveredDormName].y}%`,
                    }}
                  >
                    <MapPin className="w-8 h-8 text-grinnell-red drop-shadow-lg" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Nearby Dorms
              </h2>
              {(searchQuery ||
                selectedCampus !== "All" ||
                selectedRating !== "All") && (
                <p className="text-sm text-grinnell-red font-medium mb-4">
                  📍 Showing closest dorms based on squirrel position
                </p>
              )}
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {nearbyDorms.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No dorms found
                  </p>
                ) : (
                  nearbyDorms.map((dorm) => {
                    const avgRating = calculateAverage(dorm.id);
                    const reviewCount = reviews.filter(
                      (r) => r.dormId === dorm.id
                    ).length;

                    return (
                      <div
                        key={dorm.id}
                        onClick={() => onDormClick(dorm.id)}
                        onMouseEnter={() => setHoveredDormName(dorm.name)}
                        onMouseLeave={() => setHoveredDormName(null)}
                        className="p-4 border-2 border-gray-200 rounded-xl hover:border-grinnell-red hover:shadow-lg hover:bg-red-50 transition-all cursor-pointer"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900 text-lg">
                              {dorm.name}
                            </h3>
                            <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                              <MapPin className="w-3 h-3 text-grinnell-red" />
                              {dorm.campus}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 bg-yellow-100 px-3 py-1 rounded-full">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-bold text-gray-900">
                              {avgRating > 0 ? avgRating.toFixed(1) : "N/A"}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 font-medium">
                          {reviewCount}{" "}
                          {reviewCount === 1 ? "review" : "reviews"}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
