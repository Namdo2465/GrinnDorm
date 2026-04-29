import { useState, useRef, useEffect } from 'react';
import { Search, Filter, MapPin, Star } from 'lucide-react';
import { Dorm, Review } from '../App';
import { SquirrelIcon } from './SquirrelIcon';

interface HomePageProps {
  dorms: Dorm[];
  reviews: Review[];
  onDormClick: (dormId: string) => void;
}

export function HomePage({ dorms, reviews, onDormClick }: HomePageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCampus, setSelectedCampus] = useState<string>('All');
  const [selectedRating, setSelectedRating] = useState<string>('All');
  const [squirrelPosition, setSquirrelPosition] = useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  const campusOptions = ['All', 'North Campus', 'South Campus', 'East Campus', 'Off-campus'];

  const calculateAverage = (dormId: string) => {
    const dormReviews = reviews.filter(r => r.dormId === dormId);
    if (dormReviews.length === 0) return 0;
    return dormReviews.reduce((sum, r) => sum + r.rating, 0) / dormReviews.length;
  };

  const filteredDorms = dorms.filter(dorm => {
    const matchesSearch = dorm.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCampus = selectedCampus === 'All' || dorm.campus === selectedCampus;
    const avgRating = calculateAverage(dorm.id);
    const matchesRating = selectedRating === 'All' ||
      (selectedRating === '4+' && avgRating >= 4) ||
      (selectedRating === '3+' && avgRating >= 3);
    return matchesSearch && matchesCampus && matchesRating;
  });

  const nearbyDorms = filteredDorms.slice(0, 6);

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
        y: Math.max(5, Math.min(95, y))
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mouseup', handleMouseUp);
      return () => document.removeEventListener('mouseup', handleMouseUp);
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Campus Area</label>
              <div className="flex flex-wrap gap-2">
                {campusOptions.map(campus => (
                  <button
                    key={campus}
                    onClick={() => setSelectedCampus(campus)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      selectedCampus === campus
                        ? 'bg-grinnell-red text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {campus}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Rating</label>
              <div className="flex flex-wrap gap-2">
                {['All', '3+', '4+'].map(rating => (
                  <button
                    key={rating}
                    onClick={() => setSelectedRating(rating)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      selectedRating === rating
                        ? 'bg-grinnell-red text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
              className="relative aspect-[4/3] bg-gradient-to-br from-green-100 via-green-50 to-blue-50 cursor-move select-none"
              onMouseMove={handleMouseMove}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <MapPin className="w-16 h-16 text-grinnell-red mx-auto opacity-20" />
                  <p className="text-gray-500 text-lg">Grinnell College Campus</p>
                  <p className="text-sm text-gray-400">Drag the squirrel to explore nearby dorms</p>
                </div>
              </div>

              <div
                className={`absolute w-12 h-12 -translate-x-1/2 -translate-y-1/2 cursor-grab ${isDragging ? 'cursor-grabbing scale-110' : 'hover:scale-105'} transition-transform`}
                style={{ left: `${squirrelPosition.x}%`, top: `${squirrelPosition.y}%` }}
                onMouseDown={handleMouseDown}
              >
                <SquirrelIcon className="w-full h-full text-grinnell-red drop-shadow-lg" />
              </div>

              {[
                { x: 25, y: 30, label: 'North', color: 'bg-blue-500' },
                { x: 50, y: 60, label: 'Center', color: 'bg-green-500' },
                { x: 75, y: 35, label: 'East', color: 'bg-purple-500' },
                { x: 45, y: 75, label: 'South', color: 'bg-orange-500' },
              ].map((building, i) => (
                <div
                  key={i}
                  className={`absolute w-8 h-8 ${building.color} rounded opacity-30 hover:opacity-60 transition-opacity`}
                  style={{ left: `${building.x}%`, top: `${building.y}%`, transform: 'translate(-50%, -50%)' }}
                  title={`${building.label} Campus Area`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {searchQuery || selectedCampus !== 'All' || selectedRating !== 'All' ? 'Filtered Dorms' : 'Nearby Dorms'}
            </h2>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {nearbyDorms.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No dorms found</p>
              ) : (
                nearbyDorms.map(dorm => {
                  const avgRating = calculateAverage(dorm.id);
                  const reviewCount = reviews.filter(r => r.dormId === dorm.id).length;

                  return (
                    <div
                      key={dorm.id}
                      onClick={() => onDormClick(dorm.id)}
                      className="p-4 border border-gray-200 rounded-lg hover:border-grinnell-red hover:shadow-md transition-all cursor-pointer"
                    >
                      <h3 className="font-semibold text-gray-900">{dorm.name}</h3>
                      <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {dorm.campus}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">
                            {avgRating > 0 ? avgRating.toFixed(1) : 'N/A'}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">({reviewCount} reviews)</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            {filteredDorms.length > 6 && (
              <p className="text-sm text-gray-500 mt-4 text-center">
                +{filteredDorms.length - 6} more dorms
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
