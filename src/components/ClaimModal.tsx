import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { ItemReport } from '../types.ts';
import {
  ShieldCheck,
  Lock,
  CheckCircle2,
  X,
  AlertCircle,
  Sparkles,
  Link2,
  HelpCircle,
} from 'lucide-react';

interface ClaimModalProps {
  item: ItemReport | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const ClaimModal: React.FC<ClaimModalProps> = ({
  item,
  onClose,
  onSuccess,
}) => {
  const { currentUser, items, submitClaim } = useApp();

  const [answers, setAnswers] = useState('');
  const [selectedLostItemId, setSelectedLostItemId] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!item) return null;

  // Find user's active lost reports to allow one-click linking
  const userLostReports = items.filter(
    i => i.ownerId === currentUser?.uid && i.type === 'lost' && i.status !== 'returned' && i.status !== 'closed'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answers.trim() || answers.length < 5) {
      setError('Please provide specific identifying details (at least 5 characters).');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await submitClaim(item.id, answers.trim(), selectedLostItemId || undefined);
      setSubmitted(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2200);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Could not submit verification claim. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const isFoundItem = item.type === 'found';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
        <button
          id="btn-close-claim-modal"
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Header */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 border border-indigo-100">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {isFoundItem ? 'Verify Ownership Claim' : 'Report Found / Coordinate Return'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Item: <span className="font-semibold text-slate-700">{item.title}</span> ({item.category})
                </p>
              </div>
            </div>

            {/* Privacy Protection Callout */}
            <div className="p-3.5 bg-indigo-50/70 rounded-xl border border-indigo-200 text-xs text-indigo-950 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-indigo-900">
                <Lock className="w-3.5 h-3.5 text-indigo-600" />
                <span>Zero-Guess Verification Policy</span>
              </div>
              <p className="text-[11px] text-indigo-800 leading-relaxed">
                {isFoundItem
                  ? 'To prevent false claims and keep campus safe, describe identifying clues NOT visible in public photos (e.g. initials, lockscreen wallpaper, serial numbers, or inner pocket items). The finder and matching report owners will be updated.'
                  : 'Let the person who lost this item know where it is held or how to safely coordinate return.'}
              </p>
            </div>

            {/* Optional Link to User's Existing Lost Report */}
            {isFoundItem && userLostReports.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Link with your existing Lost Item report (Optional)</span>
                </label>
                <select
                  id="select-linked-lost-report"
                  value={selectedLostItemId}
                  onChange={e => setSelectedLostItemId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Do not link a specific report --</option>
                  {userLostReports.map(lr => (
                    <option key={lr.id} value={lr.id}>
                      {lr.title} ({lr.location} • {lr.date})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  Selecting your report automatically connects your lost record and keeps status in sync.
                </p>
              </div>
            )}

            {/* Questions / Answer Input */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                {isFoundItem
                  ? 'Describe Your Identifying Proof / Private Clues'
                  : 'Message & Handover Location for Owner'}{' '}
                <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="input-claim-answers"
                rows={4}
                value={answers}
                onChange={e => setAnswers(e.target.value)}
                placeholder={
                  isFoundItem
                    ? "e.g. Scratched initials 'AM' on back, lock screen shows a golden retriever, or pouch contains blue student transit pass..."
                    : "e.g. Turned it in to the 2nd floor library front desk, reference ticket #204, or meet me at Campus Center..."
                }
                className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white leading-relaxed"
              ></textarea>
              {error && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {error}
                </p>
              )}
            </div>

            {/* Claimant info summary */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <div>
                <span className="text-slate-400 block text-[10px]">Submitting as</span>
                <span className="font-semibold text-slate-800">
                  {currentUser?.displayName || 'Campus Student'} ({currentUser?.email || 'student@campus.edu'})
                </span>
              </div>
              <div className="px-2 py-0.5 rounded bg-slate-200/80 text-[10px] font-mono text-slate-700 font-semibold">
                Campus Verified
              </div>
            </div>

            {/* Submit buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                id="btn-submit-claim"
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs disabled:opacity-50 flex items-center gap-2 transition-colors cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    <span>Submitting Claim...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Submit Verification Claim</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center py-6 space-y-4 animate-in fade-in">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Claim Submitted Successfully!
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                The reporter ({item.ownerName}) and matching report owners have received live updates.
                Track status in your "My Reports" dashboard.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

