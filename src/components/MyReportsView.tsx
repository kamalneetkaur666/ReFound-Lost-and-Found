import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { ItemReport, PotentialMatch, Claim } from '../types.ts';
import {
  FolderHeart,
  Sparkles,
  ShieldCheck,
  MapPin,
  Calendar,
  Clock,
  Trash2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Lock,
  PlusCircle,
  AlertCircle,
  Send,
} from 'lucide-react';

interface MyReportsViewProps {
  onNavigateItem: (itemId: string) => void;
  onOpenReportModal: (type?: 'lost' | 'found') => void;
}

export const MyReportsView: React.FC<MyReportsViewProps> = ({
  onNavigateItem,
  onOpenReportModal,
}) => {
  const {
    currentUser,
    items,
    matches,
    claims,
    deleteItemReport,
    updateItemReport,
    reviewClaim,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'items' | 'matches' | 'claims_received' | 'claims_sent'>('items');
  const [reviewNote, setReviewNote] = useState<Record<string, string>>({});

  // Filter items owned by current user
  const myItems = items.filter(i => currentUser && i.ownerId === currentUser.uid);

  // Filter matches involving my items
  const myMatches = matches.filter(m => {
    const lostItem = items.find(i => i.id === m.lostItemId);
    const foundItem = items.find(i => i.id === m.foundItemId);
    return (
      currentUser &&
      ((lostItem && lostItem.ownerId === currentUser.uid) ||
        (foundItem && foundItem.ownerId === currentUser.uid))
    );
  });

  // Filter claims received on my items
  const claimsReceived = claims.filter(c => currentUser && c.reporterId === currentUser.uid);

  // Filter claims I made on others' items
  const claimsSent = claims.filter(c => currentUser && c.claimantId === currentUser.uid);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            My Reports & Matches
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your reported items, review AI match recommendations, and handle verification claims.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenReportModal('lost')}
            className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors"
          >
            + Report Lost
          </button>
          <button
            onClick={() => onOpenReportModal('found')}
            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors"
          >
            + Report Found
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-slate-200 overflow-x-auto scrollbar-none gap-2">
        <button
          onClick={() => setActiveTab('items')}
          className={`pb-3 px-3 text-xs font-bold whitespace-nowrap border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'items'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>My Items</span>
          <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700 text-[10px]">
            {myItems.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('matches')}
          className={`pb-3 px-3 text-xs font-bold whitespace-nowrap border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'matches'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Matches</span>
          {myMatches.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-purple-100 text-purple-800 text-[10px]">
              {myMatches.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('claims_received')}
          className={`pb-3 px-3 text-xs font-bold whitespace-nowrap border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'claims_received'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Claims on My Items</span>
          {claimsReceived.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-800 text-[10px]">
              {claimsReceived.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('claims_sent')}
          className={`pb-3 px-3 text-xs font-bold whitespace-nowrap border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'claims_sent'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          <span>Claims I Submitted</span>
          {claimsSent.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700 text-[10px]">
              {claimsSent.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: My Items */}
      {activeTab === 'items' && (
        <div className="space-y-4">
          {myItems.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3">
              <FolderHeart className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800 text-sm">No items reported yet</h3>
              <p className="text-xs text-slate-500">
                You haven't submitted any lost or found reports under your account.
              </p>
              <div className="pt-2 flex justify-center gap-2">
                <button
                  onClick={() => onOpenReportModal('lost')}
                  className="px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-semibold"
                >
                  Report Lost
                </button>
                <button
                  onClick={() => onOpenReportModal('found')}
                  className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
                >
                  Report Found
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {myItems.map(item => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs hover:border-indigo-200 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          item.type === 'lost'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {item.type}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          item.status === 'returned'
                            ? 'bg-slate-900 text-white'
                            : item.status === 'claimed'
                            ? 'bg-blue-100 text-blue-800'
                            : item.status === 'potential_match'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {item.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="flex gap-3 mb-3">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-16 h-16 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-100"
                      />
                      <div className="min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 truncate">
                          {item.title}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-500 space-y-1 py-2 border-t border-slate-100">
                      <div className="flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{item.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{item.date} {item.time ? `(${item.time})` : ''}</span>
                      </div>
                      {item.privateDetails && (
                        <div className="flex items-center gap-1 text-amber-800 pt-1">
                          <Lock className="w-3 h-3 text-amber-600 shrink-0" />
                          <span className="truncate">Private verification clue saved</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => onNavigateItem(item.id)}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      View Report
                    </button>

                    <div className="flex items-center gap-2">
                      {item.status !== 'returned' && (
                        <button
                          onClick={() => updateItemReport(item.id, { status: 'returned' })}
                          className="text-[11px] px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-md font-medium"
                          title="Mark returned"
                        >
                          Mark Returned
                        </button>
                      )}
                      <button
                        onClick={() => deleteItemReport(item.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded"
                        title="Delete report"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Potential AI Matches */}
      {activeTab === 'matches' && (
        <div className="space-y-4">
          {myMatches.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3">
              <Sparkles className="w-10 h-10 text-purple-300 mx-auto" />
              <h3 className="font-bold text-slate-800 text-sm">No matches found right now</h3>
              <p className="text-xs text-slate-500">
                Gemini will scan newly submitted lost and found campus reports continuously.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {myMatches.map(match => {
                const lostItem = items.find(i => i.id === match.lostItemId);
                const foundItem = items.find(i => i.id === match.foundItemId);
                if (!lostItem || !foundItem) return null;

                return (
                  <div
                    key={match.id}
                    className="bg-white rounded-2xl border border-purple-200 p-5 shadow-2xs space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-purple-100 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold">
                          <Sparkles className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-bold text-xs text-purple-900">
                          Potential Campus Match Identified
                        </span>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-purple-600 text-white font-bold text-xs shadow-2xs">
                        {match.score}% Likelihood
                      </span>
                    </div>

                    {/* Side-by-side comparison */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Lost Item Card */}
                      <div className="p-3 bg-amber-50/40 rounded-xl border border-amber-200/80 flex gap-3">
                        <img
                          src={lostItem.imageUrl}
                          alt={lostItem.title}
                          className="w-16 h-16 rounded-lg object-cover bg-slate-100 shrink-0"
                        />
                        <div className="min-w-0 text-xs">
                          <span className="px-1.5 py-0.5 rounded bg-amber-200 text-amber-900 text-[10px] font-bold">
                            LOST ITEM
                          </span>
                          <h4 className="font-bold text-slate-900 mt-1 truncate">
                            {lostItem.title}
                          </h4>
                          <p className="text-slate-500 truncate">{lostItem.location}</p>
                          <p className="text-slate-400 text-[10px]">{lostItem.date}</p>
                        </div>
                      </div>

                      {/* Found Item Card */}
                      <div className="p-3 bg-emerald-50/40 rounded-xl border border-emerald-200/80 flex gap-3">
                        <img
                          src={foundItem.imageUrl}
                          alt={foundItem.title}
                          className="w-16 h-16 rounded-lg object-cover bg-slate-100 shrink-0"
                        />
                        <div className="min-w-0 text-xs">
                          <span className="px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-900 text-[10px] font-bold">
                            FOUND ITEM
                          </span>
                          <h4 className="font-bold text-slate-900 mt-1 truncate">
                            {foundItem.title}
                          </h4>
                          <p className="text-slate-500 truncate">{foundItem.location}</p>
                          <p className="text-slate-400 text-[10px]">{foundItem.date}</p>
                        </div>
                      </div>
                    </div>

                    {/* Explanation */}
                    <div className="p-3 bg-purple-50/70 rounded-xl text-xs text-purple-950 border border-purple-100">
                      <span className="font-bold block mb-1">Gemini AI Analysis:</span>
                      <p className="leading-relaxed">{match.explanation}</p>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-1">
                      <button
                        onClick={() => onNavigateItem(lostItem.id)}
                        className="text-xs text-slate-600 hover:text-slate-900 font-semibold"
                      >
                        View Lost Report
                      </button>
                      <button
                        onClick={() => onNavigateItem(foundItem.id)}
                        className="text-xs px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-2xs"
                      >
                        Review Found Item & Claim
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Claims Received on My Items */}
      {activeTab === 'claims_received' && (
        <div className="space-y-4">
          {claimsReceived.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3">
              <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800 text-sm">No claims received yet</h3>
              <p className="text-xs text-slate-500">
                When another campus member submits an ownership claim with secret answers, it will appear here for your review.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {claimsReceived.map(claim => (
                <div
                  key={claim.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">
                          Claim for: {claim.itemTitle}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            claim.status === 'accepted'
                              ? 'bg-emerald-100 text-emerald-800'
                              : claim.status === 'rejected'
                              ? 'bg-rose-100 text-rose-800'
                              : claim.status === 'returned'
                              ? 'bg-slate-800 text-white'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {claim.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Claimant: <strong className="text-slate-700">{claim.claimantName}</strong> ({claim.claimantEmail})
                      </p>
                    </div>

                    <span className="text-[11px] text-slate-400">
                      {new Date(claim.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Claimant's answers */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                    <span className="font-bold text-slate-800 block">
                      Claimant's Identifying Verification Details:
                    </span>
                    <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                      "{claim.identifyingAnswers}"
                    </p>
                  </div>

                  {/* Review Actions if pending */}
                  {claim.status === 'pending' ? (
                    <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      <input
                        type="text"
                        placeholder="Add review note or pickup location..."
                        value={reviewNote[claim.id] || ''}
                        onChange={e =>
                          setReviewNote(prev => ({ ...prev, [claim.id]: e.target.value }))
                        }
                        className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg flex-1"
                      />
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => reviewClaim(claim.id, 'rejected', reviewNote[claim.id])}
                          className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => reviewClaim(claim.id, 'accepted', reviewNote[claim.id])}
                          className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-2xs transition-colors"
                        >
                          Accept & Release Contact
                        </button>
                      </div>
                    </div>
                  ) : claim.status === 'accepted' ? (
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs text-emerald-900">
                      <span>✓ Claim accepted. Coordinate pickup on campus.</span>
                      <button
                        onClick={() => reviewClaim(claim.id, 'returned')}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold"
                      >
                        Confirm Handover Completed
                      </button>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Claims I Submitted */}
      {activeTab === 'claims_sent' && (
        <div className="space-y-4">
          {claimsSent.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3">
              <Send className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800 text-sm">No submitted claims</h3>
              <p className="text-xs text-slate-500">
                You haven't filed any ownership claims on other items.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {claimsSent.map(claim => (
                <div
                  key={claim.id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900">{claim.itemTitle}</h4>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          claim.status === 'accepted'
                            ? 'bg-emerald-100 text-emerald-800'
                            : claim.status === 'rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {claim.status}
                      </span>
                    </div>
                    <p className="text-slate-500">
                      Your answer: "{claim.identifyingAnswers}"
                    </p>
                    {claim.reviewNote && (
                      <p className="text-indigo-700 font-medium">
                        Reporter note: {claim.reviewNote}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => onNavigateItem(claim.itemId)}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 shrink-0 self-start sm:self-auto"
                  >
                    View Listing
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
