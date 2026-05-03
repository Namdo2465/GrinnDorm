import React from "react";
import { useState, useRef, useEffect } from "react";
import { Search, Filter, MapPin, Star } from "lucide-react";
import { Dorm, Review } from "../App";
import { SquirrelIcon } from "./SquirrelIcon";

interface HomePageProps {
  dorms: Dorm[];
  reviews: Review[];
  onDormClick: (dormId: string) => void;
}

// Mapping of dorm names to their positions on the map (in percentages)
// Adjust these coordinates once you know the exact positions
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

  const calculateDistance = (x1: number, y1: number, x2: number, y2: number) => {
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
  const dormsToDisplay = (searchQuery || selectedCampus !== 'All' || selectedRating !== 'All') 
    ? filteredDorms 
    : dorms;

  const dormsWithDistance = dormsToDisplay
    .map(dorm => {
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

  const nearbyDorms = dormsWithDistance.map(d => d.dorm);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (mapRef.current) {
      setIsDragging(true);
    }
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

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mouseup", handleMouseUp);
      return () => document.removeEventListener("mouseup", handleMouseUp);
    }
  }, [isDragging]);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dorms..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-grinnell-red focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-5 h-5" />
            <span>Filters</span>
          </button>
        </div>

        {showFilters && (
          <div className="bg-white rounded-lg shadow-md p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campus Area
              </label>
              <div className="flex flex-wrap gap-2">
                {campusOptions.map((campus) => (
                  <button
                    key={campus}
                    onClick={() => setSelectedCampus(campus)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      selectedCampus === campus
                        ? "bg-grinnell-red text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {campus}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Rating
              </label>
              <div className="flex flex-wrap gap-2">
                {["All", "3+", "4+"].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setSelectedRating(rating)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      selectedRating === rating
                        ? "bg-grinnell-red text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {rating}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div
              ref={mapRef}
              className="relative cursor-move select-none"
              onMouseMove={handleMouseMove}
            >
              <img
                src="/CampusMap.png"
                alt="Grinnell College Campus Map"
                className="w-full h-auto object-contain"
              />
              <div className="absolute top-4 left-4 bg-white bg-opacity-90 rounded-lg p-4 shadow-md">
                <div className="space-y-1">
                  <p className="text-gray-900 font-semibold text-sm">
                    Grinnell College Campus
                  </p>
                  <p className="text-gray-600 text-xs">
                    Drag the squirrel or hover over dorms
                  </p>
                </div>
              </div>

              <div
                className={`absolute w-12 h-12 -translate-x-1/2 -translate-y-1/2 cursor-grab ${
                  isDragging ? "cursor-grabbing scale-110" : "hover:scale-105"
                } transition-transform`}
                style={{
                  left: `${squirrelPosition.x}%`,
                  top: `${squirrelPosition.y}%`,
                }}
                onMouseDown={handleMouseDown}
              >
                <SquirrelIcon className="w-full h-full text-grinnell-red drop-shadow-lg" />
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
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Nearby Dorms
            </h2>
            {(searchQuery || selectedCampus !== 'All' || selectedRating !== 'All') && (
              <p className="text-sm text-gray-600 mb-4">Showing closest matches to squirrel position</p>
            )}
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {nearbyDorms.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No dorms found</p>
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
                      className="p-4 border border-gray-200 rounded-lg hover:border-grinnell-red hover:shadow-md transition-all cursor-pointer"
                    >
                      <h3 className="font-semibold text-gray-900">
                        {dorm.name}
                      </h3>
                      <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {dorm.campus}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">
                            {avgRating > 0 ? avgRating.toFixed(1) : "N/A"}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          ({reviewCount} reviews)
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
