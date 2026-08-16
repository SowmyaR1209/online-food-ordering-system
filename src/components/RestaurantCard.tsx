import React from 'react';
import { Star, Clock, MapPin, Sparkles } from 'lucide-react';
import { Restaurant } from '../types';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onClick: () => void;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant, onClick }) => {
  return (
    <div
      id={`restaurant-card-${restaurant.id}`}
      onClick={onClick}
      className="group bg-white rounded-2xl overflow-hidden border border-slate-200/80 hover:border-orange-300 hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer"
    >
      {/* Image container with badges */}
      <div className="relative aspect-16/10 overflow-hidden bg-slate-100">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />

        {/* Featured badge */}
        {restaurant.featured && (
          <div className="absolute top-3 left-3 bg-orange-500 text-white text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md shadow-md flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Featured
          </div>
        )}

        {/* Price range */}
        {restaurant.priceRange && (
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-xs text-white text-xs font-bold px-2 py-0.5 rounded-md">
            {restaurant.priceRange}
          </div>
        )}

        {/* Delivery Time Pill in bottom banner */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
          <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-xs px-2.5 py-1 rounded-lg font-semibold">
            <Clock className="w-3.5 h-3.5 text-orange-400" />
            <span>{restaurant.deliveryTime}</span>
          </div>

          <div className="flex items-center gap-1 bg-emerald-600 px-2.5 py-1 rounded-lg font-bold shadow-xs">
            <Star className="w-3.5 h-3.5 fill-white" />
            <span>{restaurant.rating.toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-extrabold text-base text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-1 font-['Outfit',sans-serif]">
            {restaurant.name}
          </h3>
          <p className="text-slate-500 text-xs mt-1 line-clamp-2 leading-relaxed">
            {restaurant.description}
          </p>
        </div>

        <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          {/* Cuisine Tags */}
          <div className="flex flex-wrap gap-1.5 overflow-hidden max-h-6">
            {restaurant.cuisineTags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
              >
                {tag}
              </span>
            ))}
          </div>

          {restaurant.address && (
            <span className="text-[11px] text-slate-400 truncate max-w-[120px] hidden sm:inline">
              {restaurant.address.split(',')[0]}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
