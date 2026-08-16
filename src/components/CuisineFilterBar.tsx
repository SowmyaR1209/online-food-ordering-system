import React from 'react';
import { Sparkles, Star, Flame, Leaf, Utensils, HeartHandshake } from 'lucide-react';

interface CuisineFilterBarProps {
  selectedCuisine: string;
  onSelectCuisine: (cuisine: string) => void;
  selectedDietary: string;
  onSelectDietary: (tag: string) => void;
  minRating: number | null;
  onToggleMinRating: () => void;
  totalCount: number;
}

const CUISINES = [
  { name: 'All', icon: '🍽️' },
  { name: 'Pizza', icon: '🍕' },
  { name: 'Burgers', icon: '🍔' },
  { name: 'Sushi', icon: '🍣' },
  { name: 'Indian', icon: '🍛' },
  { name: 'Mexican', icon: '🌮' },
  { name: 'Italian', icon: '🍝' },
  { name: 'Healthy', icon: '🥗' },
  { name: 'Desserts', icon: '🍰' },
  { name: 'Bakery', icon: '🥐' },
  { name: 'Thai', icon: '🍜' },
];

const DIETARY_TAGS = [
  { name: 'All', label: 'All Diets' },
  { name: 'Vegetarian', label: '🌿 Vegetarian' },
  { name: 'Vegan', label: '🌱 100% Vegan' },
  { name: 'Gluten-Free', label: '🌾 Gluten-Free' },
  { name: 'Spicy', label: '🌶️ Spicy' },
];

export const CuisineFilterBar: React.FC<CuisineFilterBarProps> = ({
  selectedCuisine,
  onSelectCuisine,
  selectedDietary,
  onSelectDietary,
  minRating,
  onToggleMinRating,
  totalCount,
}) => {
  return (
    <div className="space-y-4">
      {/* Cuisine Horizontal scroll / chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CUISINES.map((item) => {
          const isActive = selectedCuisine.toLowerCase() === item.name.toLowerCase();
          return (
            <button
              key={item.name}
              id={`filter-cuisine-${item.name.toLowerCase()}`}
              onClick={() => onSelectCuisine(item.name)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100/80 border border-slate-200/80'
              }`}
            >
              <span className="text-sm">{item.icon}</span>
              <span>{item.name}</span>
            </button>
          );
        })}
      </div>

      {/* Secondary filter strip: Dietary & Rating tags */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-400 mr-1 uppercase tracking-wider text-[10px]">Filter by:</span>
          {DIETARY_TAGS.map((diet) => {
            const isActive = selectedDietary.toLowerCase() === diet.name.toLowerCase();
            return (
              <button
                key={diet.name}
                id={`filter-diet-${diet.name.toLowerCase()}`}
                onClick={() => onSelectDietary(diet.name)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                {diet.label}
              </button>
            );
          })}

          <button
            id="filter-rating-45"
            onClick={onToggleMinRating}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
              minRating === 4.8
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${minRating === 4.8 ? 'fill-white' : 'text-amber-500 fill-amber-500'}`} />
            <span>Top Rated (4.8+)</span>
          </button>
        </div>

        <div className="text-xs font-semibold text-slate-500">
          Showing <span className="text-slate-900 font-bold">{totalCount}</span> restaurants
        </div>
      </div>
    </div>
  );
};
