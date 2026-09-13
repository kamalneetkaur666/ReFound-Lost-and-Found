import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { ItemReport, PotentialMatch, Claim } from '../types.ts';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  Sparkles,
  ShieldCheck,
  Lock,
  Flag,
  Trash2,
  Edit,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  MessageSquare,
  UserCheck,
  Building,
} from 'lucide-react';

interface ItemDetailsViewProps {
  itemId: string;
  onBack: () => void;
  onNavigateItem: (targetId: string) => void;
  onOpenClaimModal: (item: ItemReport) => void;
}

export const ItemDetailsView: React.FC<ItemDetailsViewProps> = ({
  itemId,
  onBack,
  onNavigateItem,
  onOpenClaimModal,
}) => {
  const {
    items,
    matches,
    claims,
    currentUser,
    deleteItemReport,
    updateItemReport,
    runAiMatchingForItem,
    flagListing,
    isAiMatching,
  } = useApp();

  const item = items.find(i => i.id === itemId);

  const [scanningMatches, setScanningMatches] = useState(false);
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [flagReason, setFlagReason] = useState('');
  const [flagSubmitted, setFlagSubmitted] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!item) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Report Not Found</h2>
        <p className="text-xs text-slate-500">
          The requested report may have been deleted or resolved.
        </p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
        >
          Return to Browse
        </button>
      </div>
    );
  }

  const isOwner = currentUser?.uid === item.ownerId;

  // Potential matches for this item
  const relevantMatches = matches.filter(
    m => m.lostItemId === item.id || m.foundItemId === item.id
  );

  // Claims on this item
  const itemClaims = claims.filter(c => c.itemId === item.id);

  // Handle on-demand AI match scan
  const handleScanMatches = async () => {
    setScanningMatches(true);
    try {
      await runAiMatchingForItem(item);
    } catch (e) {
      console.error(e);
    } finally {
      setScanningMatches(false);
    }
  };

  const handleFlagSubmit = async () => {
    if (!flagReason.trim()) return;
    await flagListing(item.id, flagReason);
    setFlagSubmitted(true);
    setTimeout(() => {
      setShowFlagModal(false);
      setFlagSubmitted(false);
      setFlagReason('');
    }, 1500);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top back button & category navigation */}
      <div className="flex items-center justify-between">
        <button
          id="btn-back-to-browse"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Browse</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Status Pill */}
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              item.status === 'returned'
                ? 'bg-slate-900 text-white'
                : item.status === 'claimed'
                ? 'bg-blue-100 text-blue-800'
                : item.status === 'potential_match'
                ? 'bg-purple-100 text-purple-800'
                : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            {item.status.replace('_', ' ')}
          </span>

          <button
            onClick={() => setShowFlagModal(true)}
            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
            title="Flag inappropriate listing"
          >
            <Flag className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid: Details + Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Visual Image & Full Report */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            {/* High-res Image */}
            <div className="relative aspect-16/10 bg-slate-100">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3">
                <span
                  className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider shadow-sm border ${
                    item.type === 'lost'
                      ? 'bg-amber-500 text-white border-amber-600'
                      : 'bg-emerald-600 text-white border-emerald-700'
                  }`}
                >
                  {item.type} Item Report
                </span>
              </div>
            </div>

            {/* Description & Metadata */}
            <div className="p-6 space-y-5">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 mb-1">
                  <span>{item.category}</span>
                  <span>•</span>
                  <span>Reported by {item.ownerName}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {item.title}
                </h1>
              </div>

              {/* Location, Date, Time pills */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Campus Location
                    </span>
                    <span className="font-semibold text-slate-800">{item.location}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Date {item.type === 'lost' ? 'Lost' : 'Found'}
                    </span>
                    <span className="font-semibold text-slate-800">{item.date}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Approx. Time
                    </span>
                    <span className="font-semibold text-slate-800">
                      {item.time || 'Not specified'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Holding Location for Found items */}
              {item.type === 'found' && item.holdingLocation && (
                <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-950">
                  <Building className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Current Holding / Handover Location:</span>
                    <span className="text-emerald-800">{item.holdingLocation}</span>
                  </div>
                </div>
              )}

              {/* Public Description Body */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Description & Identifying Characteristics
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {item.description}
                </p>
              </div>

              {/* Private Details (Only visible to the creator!) */}
              {isOwner && item.privateDetails && (
                <div className="p-4 bg-amber-50/80 rounded-xl border border-amber-200 space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900">
                    <Lock className="w-4 h-4 text-amber-600" />
                    <span>Your Secret Verification Detail (Hidden from others):</span>
                  </div>
                  <p className="text-amber-800 italic">"{item.privateDetails}"</p>
                  <p className="text-[11px] text-amber-700">
                    Claimants will be prompted to answer this before you release the item.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* AI Potential Matches Panel */}
          <div className="bg-white rounded-2xl border border-purple-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Gemini Smart Match Analysis
                  </h3>
                  <p className="text-xs text-slate-500">
                    Comparing categories, physical traits, campus paths, and timelines
                  </p>
                </div>
              </div>

              <button
                id="btn-scan-matches"
                type="button"
                disabled={scanningMatches || isAiMatching}
                onClick={handleScanMatches}
                className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Sparkles className={`w-3.5 h-3.5 ${scanningMatches ? 'animate-spin' : ''}`} />
                <span>{scanningMatches ? 'Analyzing...' : 'Re-Scan Database'}</span>
              </button>
            </div>

            {relevantMatches.length === 0 ? (
              <div className="p-6 bg-slate-50 rounded-xl text-center space-y-2 border border-slate-100">
                <p className="text-xs text-slate-600 font-medium">
                  No high-confidence potential matches found yet.
                </p>
                <p className="text-[11px] text-slate-400">
                  When a student or faculty member submits a matching report, Gemini will alert you here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {relevantMatches.map(match => {
                  const targetMatchId =
                    match.lostItemId === item.id ? match.foundItemId : match.lostItemId;
                  const matchedItem = items.find(i => i.id === targetMatchId);
                  if (!matchedItem) return null;

                  return (
                    <div
                      key={match.id}
                      className="p-4 bg-purple-50/40 rounded-xl border border-purple-200/70 hover:border-purple-300 transition-all space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={matchedItem.imageUrl}
                            alt={matchedItem.title}
                            className="w-14 h-14 rounded-lg object-cover bg-slate-100 shrink-0 border border-purple-200"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  matchedItem.type === 'lost'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}
                              >
                                {matchedItem.type}
                              </span>
                              <span className="font-bold text-xs text-slate-900 line-clamp-1">
                                {matchedItem.title}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                              {matchedItem.location} • {matchedItem.date}
                            </p>
                          </div>
                        </div>

                        {/* Match Score Badge */}
                        <div className="text-right shrink-0">
                          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-600 text-white font-bold text-xs shadow-2xs">
                            <Sparkles className="w-3 h-3 text-purple-200" />
                            <span>{match.score}% Match</span>
                          </div>
                        </div>
                      </div>

                      {/* Explanation */}
                      <p className="text-xs text-purple-950 bg-white/80 p-2.5 rounded-lg border border-purple-100 leading-relaxed">
                        {match.explanation}
                      </p>

                      {/* Factors */}
                      {match.matchingFactors && match.matchingFactors.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {match.matchingFactors.map((factor, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-medium bg-purple-100/70 text-purple-800 px-2 py-0.5 rounded-md"
                            >
                              ✓ {factor}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="pt-1 flex items-center justify-between">
                        <button
                          onClick={() => onNavigateItem(matchedItem.id)}
                          className="text-xs font-semibold text-purple-700 hover:text-purple-900 inline-flex items-center gap-1"
                        >
                          <span>Compare With This Report</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Actions & Ownership verification */}
        <div className="space-y-6">
          {/* Action Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900">Take Action</h3>

            {!isOwner ? (
              <div className="space-y-3">
                {item.type === 'found' ? (
                  <>
                    <button
                      id="btn-claim-item"
                      type="button"
                      onClick={() => onOpenClaimModal(item)}
                      disabled={item.status === 'claimed' || item.status === 'returned'}
                      className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>This Is Mine (Claim Item)</span>
                    </button>
                    <p className="text-[11px] text-slate-500 leading-relaxed text-center">
                      You will be asked to answer private verification questions to verify ownership.
                    </p>
                  </>
                ) : (
                  <>
                    <button
                      id="btn-found-this-match"
                      type="button"
                      onClick={() => onOpenClaimModal(item)}
                      disabled={item.status === 'claimed' || item.status === 'returned'}
                      className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>I Have Found This Item!</span>
                    </button>
                    <p className="text-[11px] text-slate-500 leading-relaxed text-center">
                      Notify the student who lost this item and coordinate a verified campus return.
                    </p>
                  </>
                )}
              </div>
            ) : (
              /* Owner Controls */
              <div className="space-y-2.5">
                <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl text-xs text-indigo-900">
                  <span className="font-bold block mb-0.5">You are the author of this report</span>
                  <span>Manage updates, review student ownership claims, or close the listing.</span>
                </div>

                {item.status !== 'returned' && (
                  <button
                    onClick={() => updateItemReport(item.id, { status: 'returned' })}
                    className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mark as Successfully Returned</span>
                  </button>
                )}

                {!confirmDelete ? (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="w-full py-2 px-3 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Report</span>
                  </button>
                ) : (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2 text-xs">
                    <p className="font-semibold text-rose-800">
                      Are you sure you want to delete this report?
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={async () => {
                          await deleteItemReport(item.id);
                          onBack();
                        }}
                        className="flex-1 py-1.5 bg-rose-600 text-white font-semibold rounded-lg"
                      >
                        Yes, Delete
                      </button>
                      <button
                        onClick={() => setConfirmDelete(false)}
                        className="flex-1 py-1.5 bg-slate-200 text-slate-700 font-semibold rounded-lg"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Campus Safety Guide */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-3 text-xs text-slate-600">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Campus Safety Guidelines</span>
            </div>
            <ul className="space-y-2 list-disc list-inside text-slate-500 text-[11px] leading-relaxed">
              <li>Always meet in well-lit, public campus locations (Library foyer, Student Union, Dining Commons).</li>
              <li>Inspect item serial numbers and identifying engravings before handoff.</li>
              <li>High-value items can be transferred via the Campus Safety or Library Front Desk.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Flag Modal */}
      {showFlagModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900">Flag This Listing</h3>
            <p className="text-xs text-slate-500">
              Help keep ReFound trustworthy. Let us know if this listing violates campus guidelines or contains incorrect info.
            </p>
            <textarea
              rows={3}
              value={flagReason}
              onChange={e => setFlagReason(e.target.value)}
              placeholder="Explain why this listing is being flagged (e.g. spam, incorrect location, duplicate, offensive)..."
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            ></textarea>

            {flagSubmitted && (
              <div className="p-2 bg-emerald-50 text-emerald-700 text-xs rounded-lg font-medium">
                Thank you. The listing has been flagged for campus moderation.
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowFlagModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={handleFlagSubmit}
                disabled={!flagReason.trim() || flagSubmitted}
                className="px-4 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-semibold disabled:opacity-50"
              >
                Submit Flag
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
