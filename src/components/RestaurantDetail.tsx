import React, { useState } from 'react';
import { ArrowLeft, Star, Clock, MapPin, Plus, Minus, Search, Sparkles, Flame, Leaf, Check } from 'lucide-react';
import { Restaurant, MenuItem, CartItem } from '../types';

interface RestaurantDetailProps {
  restaurant: Restaurant;
  menuItems: MenuItem[];
  categories: { [key: string]: MenuItem[] };
  cart: CartItem[];
  onAddToCart: (item: MenuItem) => void;
  onRemoveFromCart: (menuItemId: string) => void;
  onBack: () => void;
  onOpenCart: () => void;
}

export const RestaurantDetail: React.FC<RestaurantDetailProps> = ({
  restaurant,
  menuItems,
  categories,
  cart,
  onAddToCart,
  onRemoveFromCart,
  onBack,
  onOpenCart,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [menuSearch, setMenuSearch] = useState('');
  const [activeDietFilter, setActiveDietFilter] = useState<string>('All');

  const categoryNames = Object.keys(categories);

  // Get item quantity in cart
  const getItemQuantity = (itemId: string): number => {
    const found = cart.find((c) => c.menuItem.id === itemId);
    return found ? found.quantity : 0;
  };

  // Filter menu items
  const filteredCategories = Object.entries(categories).reduce<{ [key: string]: MenuItem[] }>((acc, [category, items]) => {
    if (selectedCategory !== 'All' && selectedCategory !== category) {
      return acc;
    }

    const itemsList = items as MenuItem[];
    const filteredItems = itemsList.filter((item) => {
      const matchesSearch =
        !menuSearch ||
        item.name.toLowerCase().includes(menuSearch.toLowerCase()) ||
        item.description.toLowerCase().includes(menuSearch.toLowerCase());

      const matchesDiet =
        activeDietFilter === 'All' ||
        item.dietaryTags.some((d) => d.toLowerCase().includes(activeDietFilter.toLowerCase()));

      return matchesSearch && matchesDiet;
    });

    if (filteredItems.length > 0) {
      acc[category] = filteredItems;
    }
    return acc;
  }, {});

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalCartPrice = cart.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);

  return (
    <div className="space-y-6 pb-24">
      {/* Back button */}
      <button
        id="back-to-explore-btn"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-orange-600 bg-white hover:bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 shadow-xs transition cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to all restaurants
      </button>

      {/* Restaurant Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white shadow-xl">
        <div className="absolute inset-0">
          <img
            src={restaurant.image}
            alt={restaurant.name}
            className="w-full h-full object-cover opacity-40 filter brightness-75 scale-105"
          />
          <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-900/70 to-transparent" />
        </div>

        <div className="relative p-6 sm:p-8 lg:p-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {restaurant.cuisineTags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 text-xs font-semibold bg-white/20 backdrop-blur-md rounded-full"
              >
                {tag}
              </span>
            ))}
            {restaurant.priceRange && (
              <span className="px-2.5 py-1 text-xs font-bold bg-amber-500/80 text-amber-950 backdrop-blur-md rounded-full">
                {restaurant.priceRange} Price
              </span>
            )}
          </div>

          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-['Outfit',sans-serif]">
              {restaurant.name}
            </h1>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl mt-2 leading-relaxed">
              {restaurant.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2 text-xs sm:text-sm font-medium text-slate-200">
            <div className="flex items-center gap-1.5 bg-emerald-500/90 text-white px-3 py-1.5 rounded-xl font-bold shadow-md">
              <Star className="w-4 h-4 fill-white" />
              <span>{restaurant.rating.toFixed(1)} rating</span>
            </div>

            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl">
              <Clock className="w-4 h-4 text-orange-400" />
              <span>{restaurant.deliveryTime} delivery time</span>
            </div>

            {restaurant.address && (
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl">
                <MapPin className="w-4 h-4 text-orange-400" />
                <span className="truncate max-w-xs">{restaurant.address}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Menu Filter and Category Navigation */}
      <div className="sticky top-18 z-30 bg-white/95 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-slate-200/90 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === 'All'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Items ({menuItems.length})
            </button>
            {categoryNames.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat} ({categories[cat]?.length || 0})
              </button>
            ))}
          </div>

          {/* Search inside menu */}
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search in menu..."
              value={menuSearch}
              onChange={(e) => setMenuSearch(e.target.value)}
              className="w-full pl-8.5 pr-3 py-1.5 text-xs bg-slate-100 rounded-xl border border-slate-200 focus:border-orange-500 focus:bg-white outline-hidden"
            />
          </div>
        </div>

        {/* Quick Dietary Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 border-t border-slate-100 text-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Diet:</span>
          {['All', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Spicy'].map((diet) => (
            <button
              key={diet}
              onClick={() => setActiveDietFilter(diet)}
              className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeDietFilter === diet
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {diet}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Categories and Item Cards */}
      <div className="space-y-8">
        {Object.keys(filteredCategories).length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 p-8">
            <p className="text-base font-bold text-slate-700">No dishes match your filters</p>
            <p className="text-xs text-slate-400 mt-1">Try selecting 'All' or clearing your search term.</p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setActiveDietFilter('All');
                setMenuSearch('');
              }}
              className="mt-3 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          Object.entries(filteredCategories).map(([category, items]) => (
            <div key={category} className="space-y-4">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-extrabold text-slate-900 font-['Outfit',sans-serif]">{category}</h2>
                <span className="text-xs font-semibold text-slate-400">({items.length} items)</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((item) => {
                  const qty = getItemQuantity(item.id);
                  const isVeg = item.dietaryTags.includes('Vegetarian') || item.dietaryTags.includes('Vegan');
                  const isSpicy = item.dietaryTags.includes('Spicy');
                  const isSpecial = item.dietaryTags.includes("Chef's Special");

                  return (
                    <div
                      key={item.id}
                      id={`menu-item-${item.id}`}
                      className="bg-white rounded-2xl p-4 border border-slate-200/80 hover:border-slate-300 hover:shadow-md transition-all flex flex-col sm:flex-row gap-4 justify-between"
                    >
                      {/* Left: Info */}
                      <div className="flex-1 flex flex-col justify-between space-y-2">
                        <div>
                          {/* Dietary Badges */}
                          <div className="flex items-center gap-2 mb-1.5">
                            {/* Veg / Non-veg dot symbol */}
                            <span
                              className={`w-4 h-4 rounded-xs border flex items-center justify-center ${
                                isVeg ? 'border-emerald-600' : 'border-rose-600'
                              }`}
                              title={isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
                            >
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                                }`}
                              />
                            </span>

                            {isSpecial && (
                              <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded flex items-center gap-1">
                                <Sparkles className="w-2.5 h-2.5" /> Chef's Special
                              </span>
                            )}

                            {isSpicy && (
                              <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                <Flame className="w-2.5 h-2.5 text-rose-600" /> Spicy
                              </span>
                            )}

                            {item.calories && (
                              <span className="text-[10px] font-medium text-slate-400">
                                {item.calories} kcal
                              </span>
                            )}
                          </div>

                          <h3 className="font-bold text-slate-900 text-base">{item.name}</h3>
                          <p className="text-slate-500 text-xs mt-1 leading-relaxed line-clamp-2">
                            {item.description}
                          </p>
                        </div>

                        <div className="pt-2">
                          <span className="text-slate-900 font-extrabold text-base">
                            ₹{item.price.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Right: Image & Add button */}
                      <div className="relative flex sm:flex-col items-center justify-between sm:justify-end shrink-0 gap-3">
                        {item.image && (
                          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                        )}

                        {/* Add / Quantity Button */}
                        <div className="relative">
                          {qty === 0 ? (
                            <button
                              id={`add-btn-${item.id}`}
                              onClick={() => onAddToCart(item)}
                              className="px-5 py-2 bg-white text-orange-600 hover:bg-orange-50 font-extrabold text-xs rounded-xl border border-orange-300 hover:border-orange-500 shadow-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5 stroke-[3]" />
                              ADD
                            </button>
                          ) : (
                            <div className="flex items-center bg-orange-500 text-white rounded-xl shadow-md overflow-hidden text-xs font-extrabold">
                              <button
                                onClick={() => onRemoveFromCart(item.id)}
                                className="px-3 py-2 hover:bg-orange-600 transition active:scale-90 cursor-pointer"
                              >
                                <Minus className="w-3.5 h-3.5 stroke-[3]" />
                              </button>
                              <span className="px-2 min-w-6 text-center">{qty}</span>
                              <button
                                onClick={() => onAddToCart(item)}
                                className="px-3 py-2 hover:bg-orange-600 transition active:scale-90 cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Floating Bottom Cart Bar for quick checkout access */}
      {totalCartCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-2xl mx-auto z-40 animate-in slide-in-from-bottom-5">
          <div className="bg-slate-900 text-white p-3.5 sm:p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4 border border-slate-700/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center font-black text-sm">
                {totalCartCount}
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Your Order from {restaurant.name}</p>
                <p className="text-base font-extrabold text-white">₹{totalCartPrice.toFixed(2)}</p>
              </div>
            </div>

            <button
              id="view-cart-floating-btn"
              onClick={onOpenCart}
              className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <span>View Cart & Checkout</span>
              <span className="text-orange-200">→</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
