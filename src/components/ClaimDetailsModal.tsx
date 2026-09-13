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
  MapPin,
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
  const isReporter = Boolean(
    currentUser &&
      ((claim.reporterId && currentUser.uid === claim.reporterId) ||
        (targetItem && targetItem.ownerId === currentUser.uid))
  );
  const isClaimant = Boolean(
    currentUser && claim.claimantId && currentUser.uid === claim.claimantId
  );

  // Determine whose contact details to display
  // Case A: Target item is LOST and currentUser is the owner (reporter)
  // => The person who submitted the claim is the FINDER who found their lost item!
  // Case B: Target item is FOUND and currentUser is the finder (reporter)
  // => The person who submitted the claim is the CLAIMANT who lost it!
  // Case C: CurrentUser is the claimant => Show the reporter's contact info!
  const isLostItemReport = claim.itemType === 'lost' || (targetItem && targetItem.type === 'lost');

  let displayContact = {
    role: 'Claimant / Finder',
    name: 'Campus Member',
    email: 'student@campus.edu',
    phone: '(555) 234-5678',
    department: 'Campus Student Body',
    campusId: 'CAMPUS-STUDENT',
  };

  if (isReporter) {
    if (isLostItemReport) {
      displayContact = {
        role: 'Finder who Located Your Item',
        name: claim.claimantName || 'Campus Finder',
        email: claim.claimantEmail || 'student@campus.edu',
        phone: claim.claimantPhone || '(555) 234-5678',
        department: claim.claimantDepartment || 'Campus Student Body',
        campusId:
          claim.claimantCampusId ||
          (claim.claimantId
            ? 'CAMPUS-' + String(claim.claimantId).substring(0, 6).toUpperCase()
            : 'CAMPUS-STUDENT'),
      };
    } else {
      displayContact = {
        role: 'Ownership Claimant',
        name: claim.claimantName || 'Campus Claimant',
        email: claim.claimantEmail || 'student@campus.edu',
        phone: claim.claimantPhone || '(555) 234-5678',
        department: claim.claimantDepartment || 'Campus Student Body',
        campusId:
          claim.claimantCampusId ||
          (claim.claimantId
            ? 'CAMPUS-' + String(claim.claimantId).substring(0, 6).toUpperCase()
            : 'CAMPUS-STUDENT'),
      };
    }
  } else if (isClaimant) {
    displayContact = {
      role: isLostItemReport ? 'Item Owner' : 'Finder / Reporter',
      name: claim.reporterName || targetItem?.ownerName || 'Campus Member',
      email: claim.reporterEmail || targetItem?.ownerEmail || 'campus-lostfound@campus.edu',
      phone: claim.reporterPhone || '(555) 876-5432',
      department: claim.reporterDepartment || 'Campus Member',
      campusId:
        claim.reporterCampusId ||
        (claim.reporterId
          ? 'CAMPUS-' + String(claim.reporterId).substring(0, 6).toUpperCase()
          : 'CAMPUS-MEMBER'),
    };
  } else {
    // Default fallback: show claimant details
    displayContact = {
      role: 'Campus Member',
      name: claim.claimantName || claim.reporterName || targetItem?.ownerName || 'Campus Member',
      email: claim.claimantEmail || claim.reporterEmail || targetItem?.ownerEmail || 'student@campus.edu',
      phone: claim.claimantPhone || claim.reporterPhone || '(555) 234-5678',
      department: claim.claimantDepartment || claim.reporterDepartment || 'Campus Student Body',
      campusId:
        claim.claimantCampusId ||
        (claim.claimantId
          ? 'CAMPUS-' + String(claim.claimantId).substring(0, 6).toUpperCase()
          : 'CAMPUS-STUDENT'),
    };
  }

  const handleCopy = (text: string, label: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    } catch (e) {
      console.warn('Could not copy:', e);
    }
  };

  const handleCopyAll = () => {
    try {
      const summary = `ReFound Contact Information:
Name: ${displayContact.name}
Role: ${displayContact.role}
Email: ${displayContact.email}
Phone: ${displayContact.phone}
Department: ${displayContact.department}
Student ID: ${displayContact.campusId}
Item: ${claim.itemTitle || targetItem?.title || 'Campus Item'}`;
      navigator.clipboard.writeText(summary);
      setCopied('all');
      setTimeout(() => setCopied(null), 2000);
    } catch (e) {
      console.warn('Could not copy all:', e);
    }
  };

  const handleReviewAction = async (status: 'accepted' | 'rejected' | 'returned') => {
    setSubmittingReview(true);
    try {
      await reviewClaim(claim.id, status, reviewNote);
    } catch (e) {
      console.error('Error in handleReviewAction:', e);
    } finally {
      setSubmittingReview(false);
    }
  };

  const modalTitle = isLostItemReport
    ? 'Someone Found Your Lost Item'
    : 'Ownership Claim & Contact Details';

  const modalSubtitle = isLostItemReport
    ? 'A fellow student reported locating your lost item. Review their message and contact them below.'
    : 'Review verification answers and student contact details to coordinate campus return.';

  const messageHeading = isLostItemReport
    ? "Finder's Message & Location Note"
    : 'Submitted Verification Message & Identifying Answers';

  const messageBody =
    claim.identifyingAnswers ||
    'The finder has submitted a report that they located this item on campus. Use the contact information above to arrange collection.';

  const formattedDate = claim.createdAt
    ? new Date(claim.createdAt).toLocaleString()
    : 'Recently';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150 my-8">
        {/* Close Button */}
        <button
          id="btn-close-claim-details"
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
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
                <h2 className="text-lg font-bold text-slate-900">{modalTitle}</h2>
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
                <span>Submitted {formattedDate}</span>
              </p>
              <p className="text-xs text-slate-600 mt-1">{modalSubtitle}</p>
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
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shrink-0 flex items-center gap-1 transition-colors cursor-pointer"
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
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-bold text-lg flex items-center justify-center shadow-xs shadow-indigo-200 shrink-0">
                  {displayContact.name ? displayContact.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
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
                className="px-2.5 py-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50/70 hover:bg-indigo-100/70 rounded-lg flex items-center gap-1 transition-colors shrink-0 cursor-pointer"
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
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                    title="Copy email"
                  >
                    {copied === 'email' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <a
                    href={`mailto:${displayContact.email}?subject=ReFound - Lost & Found Item: ${encodeURIComponent(
                      claim.itemTitle || targetItem?.title || 'Campus Item'
                    )}`}
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
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
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
              <span>{messageHeading}</span>
            </h4>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
              {messageBody}
            </div>
          </div>

          {/* REVIEW NOTE (if already submitted or in progress) */}
          {claim.reviewNote && (
            <div className="p-3.5 bg-indigo-50/70 rounded-xl border border-indigo-200 text-xs space-y-1">
              <span className="font-bold text-indigo-900 block flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-700" />
                <span>Pickup Instructions & Review Note:</span>
              </span>
              <p className="text-indigo-800 italic">"{claim.reviewNote}"</p>
            </div>
          )}

          {/* ACTIONS: IF USER IS REPORTER & CLAIM IS PENDING */}
          {isReporter && claim.status === 'pending' && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <label className="block text-xs font-bold text-slate-800">
                {isLostItemReport
                  ? 'Add Meeting Location or Message for Finder:'
                  : 'Add Pickup Location or Coordination Note for Claimant:'}
              </label>
              <input
                type="text"
                placeholder={
                  isLostItemReport
                    ? 'e.g. Thanks so much! Meet me at Student Union Front Desk at 3:00 PM...'
                    : 'e.g. Meet at Campus Library Front Desk at 2:00 PM with your student ID...'
                }
                value={reviewNote}
                onChange={e => setReviewNote(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />

              <div className="flex items-center justify-end gap-2.5 pt-1">
                <button
                  type="button"
                  disabled={submittingReview}
                  onClick={() => handleReviewAction('rejected')}
                  className="px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isLostItemReport ? 'Not My Item / Decline' : 'Decline Claim'}
                </button>
                <button
                  type="button"
                  disabled={submittingReview}
                  onClick={() => handleReviewAction('accepted')}
                  className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    {isLostItemReport
                      ? 'Accept & Coordinate Return'
                      : 'Accept Claim & Unlock Pickup'}
                  </span>
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
                  <strong>Coordination In Progress!</strong> Reach out directly using the phone or email above to complete item handover.
                </span>
              </div>
              {isReporter && (
                <button
                  type="button"
                  disabled={submittingReview}
                  onClick={() => handleReviewAction('returned')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shrink-0 transition-colors shadow-2xs cursor-pointer"
                >
                  Confirm Item Returned / Handover Done
                </button>
              )}
            </div>
          )}

          {/* IF CLAIM RETURNED */}
          {claim.status === 'returned' && (
            <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>
                  <strong>Handover Completed!</strong> This item was successfully returned to its rightful owner.
                </span>
              </div>
            </div>
          )}

          {/* BOTTOM DISMISS */}
          <div className="flex justify-end pt-1">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

