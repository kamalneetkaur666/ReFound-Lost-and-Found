import React from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  Sparkles,
  Search,
  PlusCircle,
  ShieldCheck,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle2,
  Lock,
  Layers,
  HelpCircle,
  SlidersHorizontal,
} from 'lucide-react';
import { ItemReport } from '../types.ts';

interface LandingViewProps {
  onNavigate: (view: string, itemId?: string) => void;
  onOpenReportModal: (type: 'lost' | 'found') => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onNavigate,
  onOpenReportModal,
}) => {
  const { items, matches } = useApp();

  // Pick 4 recent items
  const recentItems = items.slice(0, 4);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-14 sm:pb-16 bg-gradient-to-b from-indigo-50/50 via-white to-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Campus badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100/70 border border-indigo-200 text-indigo-800 text-xs font-semibold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Smart AI Matching for Campus Lost & Found</span>
            </div>

            {/* Core Hero Slogan as requested */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
              Lost it. Someone found it.{' '}
              <span className="text-indigo-600 block sm:inline">
                Let’s connect the dots.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              No more searching scattered group chats or paper flyers. ReFound provides a single,
              centralized campus hub where lost and found reports are intelligently matched by AI
              and safely verified before private info is shared.
            </p>

            {/* Three prominent primary action CTA buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                id="hero-btn-report-lost"
                onClick={() => onNavigate('report-lost')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-semibold text-sm shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
              >
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                  L
                </div>
                <span>Report Lost Item</span>
              </button>

              <button
                id="hero-btn-report-found"
                onClick={() => onNavigate('report-found')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
              >
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                  F
                </div>
                <span>Report Found Item</span>
              </button>

              <button
                id="hero-btn-browse-items"
                onClick={() => onNavigate('browse')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm border border-slate-300 shadow-2xs flex items-center justify-center gap-2 transition-colors"
              >
                <Search className="w-4 h-4 text-slate-500" />
                <span>Browse Items</span>
              </button>
            </div>

            {/* Subtle verification trust note */}
            <div className="flex items-center justify-center gap-6 pt-4 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Private details stay hidden</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Gemini multi-factor matching</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-slate-500" />
                <span>Student verification flow</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How ReFound Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-xs uppercase font-bold tracking-widest text-indigo-600">
            How It Works
          </h2>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            Reuniting items safely in 3 steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs relative hover:border-indigo-200 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-sm mb-4 border border-indigo-100">
              01
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Submit in 60 Seconds
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Upload a photo, pick the campus location, and add public notes. Keep secret identifiers
              (serial numbers, stickers, case marks) private for verification.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white p-6 rounded-2xl border border-indigo-200/80 shadow-xs relative bg-gradient-to-b from-white to-indigo-50/20">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-sm mb-4 shadow-xs shadow-indigo-200">
              02
            </div>
            <div className="flex items-center gap-1.5 mb-1 text-xs font-semibold text-indigo-700">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gemini Intelligent Comparison</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Automatic Match Suggestions
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Gemini continuously analyzes item categories, visual descriptors, locations, and
              timeframes to alert both parties of probable matching reports.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs relative hover:border-indigo-200 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center text-sm mb-4 border border-emerald-100">
              03
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Safe Ownership Verification
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Before contact details are exchanged, claimants must answer secret verification
              details. The original reporter approves the claim and coordinates return.
            </p>
          </div>
        </div>
      </section>

      {/* Live AI Match Demo Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-medium backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              <span>Smart Match Transparency</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              AI provides potential clues, you make the final call.
            </h3>
            <p className="text-indigo-100 text-sm sm:text-base leading-relaxed">
              In accordance with our safety policy, AI suggestions are strictly treated as potential
              matches. The system never automatically declares ownership without verified human
              confirmation.
            </p>
            <div className="pt-2">
              <button
                onClick={() => onNavigate('browse')}
                className="px-4 py-2 rounded-lg bg-white text-indigo-900 font-semibold text-xs sm:text-sm hover:bg-indigo-50 transition-colors"
              >
                Explore Active Matches in Browse
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Recently Reported Items Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xs uppercase font-bold tracking-widest text-indigo-600">
              Active Reports
            </h2>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">
              Recently reported on campus
            </p>
          </div>
          <button
            onClick={() => onNavigate('browse')}
            className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            <span>View all {items.length} items</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {recentItems.map(item => (
            <div
              key={item.id}
              onClick={() => onNavigate('item-details', item.id)}
              className="group bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer overflow-hidden flex flex-col"
            >
              {/* Image Container */}
              <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />

                {/* Type Badge */}
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

                {/* Match indicator if potential match */}
                {item.status === 'potential_match' && (
                  <div className="absolute top-2.5 right-2.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-purple-600/90 backdrop-blur-xs text-white shadow-2xs">
                      <Sparkles className="w-3 h-3" />
                      Possible Match
                    </span>
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-indigo-600 block mb-1">
                    {item.category}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-1 group-hover:text-indigo-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2 mt-1.5 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center gap-1 truncate max-w-[150px]">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{item.location}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{item.date}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
