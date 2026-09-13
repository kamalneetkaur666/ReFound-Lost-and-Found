import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { Claim, ItemReport } from '../types.ts';
import {
  ShieldCheck,
  X,
  Mail,
  Phone,
  GraduationCap,
  BadgeCheck,
  Copy,
  Check,
  ExternalLink,
  MessageSquare,
  Building,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Send,
} from 'lucide-react';

interface ClaimDetailsModalProps {
  claim: Claim | null;
  onClose: () => void;
  onNavigateItem?: (itemId: string) => void;
}

export const ClaimDetailsModal: React.FC<ClaimDetailsModalProps> = ({
  claim,
  onClose,
  onNavigateItem,
}) => {
  const { items, currentUser, reviewClaim } = useApp();
  const [copied, setCopied] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState(claim?.reviewNote || '');
  const [submittingReview, setSubmittingReview] = useState(false);

  if (!claim) return null;

  const targetItem = items.find(i => i.id === claim.itemId);
  const isReporter = currentUser && currentUser.uid === claim.reporterId;
  const isClaimant = currentUser && currentUser.uid === claim.claimantId;

  // Determine whose contact details to display:
  // If currentUser is the reporter, show claimant's profile details.
  // If currentUser is the claimant, show reporter's profile details (or claimant's if alone).
  // If neither (e.g. third-party student who lost matching item), show both or claimant's details.
  const displayContact = isReporter
    ? {
        role: 'Claimant / Finder',
        name: claim.claimantName || 'Campus Student',
        email: claim.claimantEmail || 'student@campus.edu',
        phone: claim.claimantPhone || '(555) 234-5678',
        department: claim.claimantDepartment || 'Campus Student Body',
        campusId: claim.claimantCampusId || 'CAMPUS-' + claim.claimantId.substring(0, 6).toUpperCase(),
      }
    : {
        role: claim.itemType === 'found' ? 'Finder / Reporter' : 'Item Owner',
        name: claim.reporterName || targetItem?.ownerName || 'Campus Member',
        email: claim.reporterEmail || targetItem?.ownerEmail || 'campus-lostfound@campus.edu',
        phone: claim.reporterPhone || '(555) 876-5432',
        department: claim.reporterDepartment || 'Campus Student Body',
        campusId: claim.reporterCampusId || 'CAMPUS-' + claim.reporterId.substring(0, 6).toUpperCase(),
      };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleCopyAll = () => {
    const summary = `ReFound Contact Information:
Name: ${displayContact.name}
Role: ${displayContact.role}
Email: ${displayContact.email}
Phone: ${displayContact.phone}
Department: ${displayContact.department}
Student ID: ${displayContact.campusId}
Item: ${claim.itemTitle}`;
    navigator.clipboard.writeText(summary);
    setCopied('all');
    setTimeout(() => setCopied(null), 2000);
  };

  const handleReviewAction = async (status: 'accepted' | 'rejected' | 'returned') => {
    setSubmittingReview(true);
    try {
      await reviewClaim(claim.id, status, reviewNote);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150 my-8">
        {/* Close Button */}
        <button
          id="btn-close-claim-details"
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start gap-3.5 pr-8">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 border border-indigo-100 shadow-2xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-slate-900">
                  {claim.itemType === 'found' ? 'Found Item Claim & Contact' : 'Ownership Claim & Details'}
                </h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    claim.status === 'accepted'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : claim.status === 'returned'
                      ? 'bg-slate-900 text-white'
                      : claim.status === 'rejected'
                      ? 'bg-rose-100 text-rose-800 border border-rose-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}
                >
                  {claim.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Submitted {new Date(claim.createdAt).toLocaleString()}</span>
              </p>
            </div>
          </div>

          {/* Related Item Mini Card */}
          {targetItem && (
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={targetItem.imageUrl}
                  alt={targetItem.title}
                  className="w-12 h-12 rounded-xl object-cover bg-slate-200 shrink-0 border border-slate-200"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase ${
                        targetItem.type === 'lost'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {targetItem.type}
                    </span>
                    <h4 className="font-bold text-xs text-slate-900 truncate">
                      {targetItem.title}
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {targetItem.location} • {targetItem.category}
                  </p>
                </div>
              </div>

              {onNavigateItem && (
                <button
                  onClick={() => {
                    onClose();
                    onNavigateItem(targetItem.id);
                  }}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shrink-0 flex items-center gap-1 transition-colors"
                >
                  <span>View Item</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          {/* SENDER / USER PROFILE CONTACT CARD */}
          <div className="p-5 bg-gradient-to-br from-indigo-50/50 via-white to-slate-50 rounded-2xl border border-indigo-100 space-y-4 shadow-2xs">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-bold text-lg flex items-center justify-center shadow-xs shadow-indigo-200">
                  {displayContact.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-sm text-slate-900">
                      {displayContact.name}
                    </h3>
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
                      <BadgeCheck className="w-3 h-3 text-emerald-600" />
                      <span>Verified Student</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-indigo-600 font-medium mt-0.5">
                    {displayContact.role}
                  </p>
                </div>
              </div>

              <button
                onClick={handleCopyAll}
                className="px-2.5 py-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50/70 hover:bg-indigo-100/70 rounded-lg flex items-center gap-1 transition-colors"
                title="Copy all contact information to clipboard"
              >
                {copied === 'all' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-700">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Info</span>
                  </>
                )}
              </button>
            </div>

            {/* Contact Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
              {/* Email */}
              <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between gap-2 shadow-2xs">
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Campus Email
                  </span>
                  <span className="font-semibold text-slate-800 truncate block">
                    {displayContact.email}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleCopy(displayContact.email, 'email')}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                    title="Copy email"
                  >
                    {copied === 'email' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <a
                    href={`mailto:${displayContact.email}?subject=ReFound - Lost & Found Item Coordination: ${encodeURIComponent(claim.itemTitle)}`}
                    className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-[11px] flex items-center gap-1 transition-colors"
                  >
                    <Mail className="w-3 h-3" />
                    <span>Email</span>
                  </a>
                </div>
              </div>

              {/* Phone */}
              <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between gap-2 shadow-2xs">
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Contact Phone
                  </span>
                  <span className="font-semibold text-slate-800 truncate block">
                    {displayContact.phone}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleCopy(displayContact.phone, 'phone')}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                    title="Copy phone"
                  >
                    {copied === 'phone' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <a
                    href={`tel:${displayContact.phone}`}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-[11px] flex items-center gap-1 transition-colors"
                  >
                    <Phone className="w-3 h-3" />
                    <span>Call</span>
                  </a>
                </div>
              </div>

              {/* Department */}
              <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 flex items-center gap-2 shadow-2xs">
                <GraduationCap className="w-4 h-4 text-indigo-500 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Department / Major
                  </span>
                  <span className="font-semibold text-slate-800 truncate block">
                    {displayContact.department}
                  </span>
                </div>
              </div>

              {/* Student ID */}
              <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 flex items-center gap-2 shadow-2xs">
                <Building className="w-4 h-4 text-indigo-500 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Campus Student ID
                  </span>
                  <span className="font-mono font-semibold text-slate-800 truncate block">
                    {displayContact.campusId}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* VERIFICATION MESSAGE & IDENTIFYING DETAILS */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
              <span>Submitted Verification Message & Answers</span>
            </h4>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
              {claim.identifyingAnswers}
            </div>
          </div>

          {/* REVIEW NOTE (if already submitted or in progress) */}
          {claim.reviewNote && (
            <div className="p-3.5 bg-indigo-50/70 rounded-xl border border-indigo-200 text-xs space-y-1">
              <span className="font-bold text-indigo-900 block">
                Reporter Review & Pickup Instructions:
              </span>
              <p className="text-indigo-800 italic">"{claim.reviewNote}"</p>
            </div>
          )}

          {/* ACTIONS: IF USER IS REPORTER & CLAIM IS PENDING */}
          {isReporter && claim.status === 'pending' && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <label className="block text-xs font-bold text-slate-800">
                Add Pickup Location or Coordination Note:
              </label>
              <input
                type="text"
                placeholder="e.g. Meet at Student Union Front Desk at 3:00 PM, reference ticket #..."
                value={reviewNote}
                onChange={e => setReviewNote(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

              <div className="flex items-center justify-end gap-2.5 pt-1">
                <button
                  type="button"
                  disabled={submittingReview}
                  onClick={() => handleReviewAction('rejected')}
                  className="px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors disabled:opacity-50"
                >
                  Decline Claim
                </button>
                <button
                  type="button"
                  disabled={submittingReview}
                  onClick={() => handleReviewAction('accepted')}
                  className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Accept Claim & Reveal Pickup</span>
                </button>
              </div>
            </div>
          )}

          {/* IF CLAIM ACCEPTED */}
          {claim.status === 'accepted' && (
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-950">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                  <strong>Claim Accepted!</strong> Contact details unlocked for in-person campus handover.
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleReviewAction('returned')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shrink-0 transition-colors shadow-2xs"
              >
                Confirm Item Returned
              </button>
            </div>
          )}

          {/* BOTTOM DISMISS */}
          <div className="flex justify-end pt-1">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
