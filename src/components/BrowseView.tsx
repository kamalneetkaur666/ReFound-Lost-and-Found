import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { ItemReport, ItemType, ItemCategory, ItemStatus } from '../types.ts';
import {
  Search,
  Filter,
  MapPin,
  Clock,
  Sparkles,
  Tag,
  CheckCircle,
  XCircle,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react';

interface BrowseViewProps {
  onSelectItem: (itemId: string) => void;
  onOpenReportModal: (type?: 'lost' | 'found') => void;
}

const CATEGORIES: Array<ItemCategory | 'All'> = [
  'All',
  'Electronics',
  'IDs & Cards',
  'Keys',
  'Bags & Backpacks',
  'Clothing & Apparel',
  'Books & Stationery',
  'Personal Accessories',
  'Other',
];

export const BrowseView: React.FC<BrowseViewProps> = ({
  onSelectItem,
  onOpenReportModal,
}) => {
  const { items, matches } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | ItemType>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  // Extract unique locations from active items
  const uniqueLocations = useMemo(() => {
    const locs = new Set<string>();
    items.forEach(i => {
      if (i.location) locs.add(i.location.split('/')[0].trim());
    });
    return Array.from(locs);
  }, [items]);

  // Filter and sort items
  const filteredItems = useMemo(() => {
    return items
      .filter(item => {
        // Type filter
        if (selectedType !== 'all' && item.type !== selectedType) return false;

        // Category filter
        if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;

        // Status filter
        if (selectedStatus !== 'all' && item.status !== selectedStatus) return false;

        // Location filter
        if (
          selectedLocation !== 'all' &&
          !item.location.toLowerCase().includes(selectedLocation.toLowerCase())
        ) {
          return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = item.title.toLowerCase().includes(q);
          const matchDesc = item.description.toLowerCase().includes(q);
          const matchLoc = item.location.toLowerCase().includes(q);
          const matchCat = item.category.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchLoc && !matchCat) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const dateA = new Date(a.date || a.createdAt).getTime();
        const dateB = new Date(b.date || b.createdAt).getTime();
        return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
      });
  }, [items, selectedType, selectedCategory, selectedStatus, selectedLocation, searchQuery, sortBy]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setSelectedCategory('All');
    setSelectedStatus('all');
    setSelectedLocation('all');
    setSortBy('newest');
  };

  const hasActiveFilters =
    searchQuery ||
    selectedType !== 'all' ||
    selectedCategory !== 'All' ||
    selectedStatus !== 'all' ||
    selectedLocation !== 'all';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Browse Campus Items
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Search active lost and found reports submitted by students & campus staff.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onOpenReportModal('lost')}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <span className="font-bold">+</span> Report Lost
          </button>
          <button
            onClick={() => onOpenReportModal('found')}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <span className="font-bold">+</span> Report Found
          </button>
        </div>
      </div>

      {/* Search & Top Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="input-browse-search"
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by title, description, or campus building (e.g. Hydro Flask, Library, AirPods)..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 p-1"
              >
                Clear
              </button>
            )}
          </div>

          {/* Type Segmented Control */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl shrink-0 self-start md:self-auto">
            <button
              id="filter-type-all"
              onClick={() => setSelectedType('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedType === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Items
            </button>
            <button
              id="filter-type-lost"
              onClick={() => setSelectedType('lost')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                selectedType === 'lost'
                  ? 'bg-amber-500 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-amber-700'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-200"></span>
              Lost
            </button>
            <button
              id="filter-type-found"
              onClick={() => setSelectedType('found')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                selectedType === 'found'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-emerald-700'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-200"></span>
              Found
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="shrink-0">
            <select
              id="select-browse-sort"
              value={sortBy}
              onChange={e => setSortBy(e.target.value as 'newest' | 'oldest')}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="newest">Newest reports first</option>
              <option value="oldest">Oldest reports first</option>
            </select>
          </div>
        </div>

        {/* Secondary filters row (Status & Location & Reset) */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs border-t border-slate-100">
          <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filters:
          </span>

          {/* Status Select */}
          <select
            id="select-status-filter"
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="potential_match">Potential Match</option>
            <option value="claimed">Claimed</option>
            <option value="returned">Returned</option>
          </select>

          {/* Location Select */}
          {uniqueLocations.length > 0 && (
            <select
              id="select-location-filter"
              value={selectedLocation}
              onChange={e => setSelectedLocation(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 max-w-[180px] truncate"
            >
              <option value="all">All Locations</option>
              {uniqueLocations.map(loc => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          )}

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold ml-auto flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Filters
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="pt-2 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors shrink-0 ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white font-semibold shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <strong className="text-slate-800">{filteredItems.length}</strong> items
        </span>
        {hasActiveFilters && (
          <span className="text-indigo-600 font-medium">Filtered results</span>
        )}
      </div>

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">No matching reports found</h3>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting your search terms, changing the category, or clearing filters.
            </p>
          </div>
          <button
            onClick={resetFilters}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredItems.map(item => {
            // Check if this item has an AI match in memory
            const itemMatch = matches.find(
              m => m.lostItemId === item.id || m.foundItemId === item.id
            );

            return (
              <div
                key={item.id}
                id={`card-item-${item.id}`}
                onClick={() => onSelectItem(item.id)}
                className="group bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden flex flex-col"
              >
                {/* Visual Image container */}
                <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />

                  {/* Lost / Found badge */}
                  <div className="absolute top-2.5 left-2.5">
                    <span
                      className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider shadow-2xs border ${
                        item.type === 'lost'
                          ? 'bg-amber-500 text-white border-amber-600'
                          : 'bg-emerald-600 text-white border-emerald-700'
                      }`}
                    >
                      {item.type}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-2.5 right-2.5">
                    {item.status === 'potential_match' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-purple-600/95 backdrop-blur-xs text-white shadow-2xs">
                        <Sparkles className="w-3 h-3" />
                        Possible Match
                      </span>
                    ) : item.status === 'returned' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-800 text-white shadow-2xs">
                        <CheckCircle className="w-3 h-3 text-emerald-400" />
                        Returned
                      </span>
                    ) : item.status === 'claimed' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-600 text-white shadow-2xs">
                        Claimed
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">
                        {item.category}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {item.date}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm leading-snug group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {item.title}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Match hint if present */}
                  {itemMatch && (
                    <div className="mt-3 py-1.5 px-2 bg-purple-50 rounded-lg border border-purple-100 flex items-center gap-1.5 text-[11px] text-purple-800">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span className="truncate font-medium">
                        {itemMatch.score}% match detected with{' '}
                        {item.type === 'lost' ? 'found report' : 'lost report'}
                      </span>
                    </div>
                  )}

                  {/* Footer metadata */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <div className="flex items-center gap-1 truncate max-w-[170px]">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </div>
                    <span className="font-medium text-slate-600 truncate max-w-[100px]">
                      {item.ownerName.split(' ')[0]}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
