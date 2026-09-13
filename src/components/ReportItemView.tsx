import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { ItemType, ItemCategory, ItemReport } from '../types.ts';
import {
  UploadCloud,
  Image as ImageIcon,
  Sparkles,
  MapPin,
  Calendar,
  Clock,
  Lock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  ShieldAlert,
} from 'lucide-react';

interface ReportItemViewProps {
  initialType?: ItemType;
  onSuccess: (newItem: ItemReport) => void;
  onCancel: () => void;
}

const CATEGORIES: ItemCategory[] = [
  'Electronics',
  'IDs & Cards',
  'Keys',
  'Bags & Backpacks',
  'Clothing & Apparel',
  'Books & Stationery',
  'Personal Accessories',
  'Other',
];

const COMMON_CAMPUS_LOCATIONS = [
  'Main University Library',
  'Science Quad / Labs',
  'Student Union Plaza',
  'Central Dining Hall',
  'Campus Recreation & Gym',
  'Evans Hall / Math Bldg',
  'Dormitory Commons',
  'Engineering Center',
];

export const ReportItemView: React.FC<ReportItemViewProps> = ({
  initialType = 'lost',
  onSuccess,
  onCancel,
}) => {
  const { addItemReport } = useApp();

  const [type, setType] = useState<ItemType>(initialType);
  const [step, setStep] = useState<number>(1);

  // Form Fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ItemCategory>('Electronics');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [holdingLocation, setHoldingLocation] = useState('');
  const [privateDetails, setPrivateDetails] = useState('');

  // States
  const [analyzingPhoto, setAnalyzingPhoto] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Handle Photo Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, image: 'Photo must be under 5MB.' }));
      return;
    }

    const reader = new FileReader();
    reader.onload = event => {
      const base64 = event.target?.result as string;
      setImageUrl(base64);
      setErrors(prev => {
        const { image, ...rest } = prev;
        return rest;
      });

      // Auto-trigger AI assistant to detect details from the photo
      triggerAiPhotoAnalysis(base64, file.type);
    };
    reader.readAsDataURL(file);
  };

  // Sample quick images for testing if user doesn't have a photo ready
  const setSamplePhoto = (sampleUrl: string, sampleTitle: string, sampleCat: ItemCategory) => {
    setImageUrl(sampleUrl);
    if (!title) setTitle(sampleTitle);
    setCategory(sampleCat);
  };

  const triggerAiPhotoAnalysis = async (base64: string, mimeType: string) => {
    setAnalyzingPhoto(true);
    try {
      const response = await fetch('/api/analyze-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mimeType }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.suggestedTitle && !title) setTitle(data.suggestedTitle);
        if (data.suggestedCategory && CATEGORIES.includes(data.suggestedCategory)) {
          setCategory(data.suggestedCategory as ItemCategory);
        }
        if (data.suggestedDescription && !description) {
          setDescription(data.suggestedDescription);
        }
      }
    } catch (err) {
      console.warn('AI photo analysis skipped:', err);
    } finally {
      setAnalyzingPhoto(false);
    }
  };

  const validateStep = (currentStep: number): boolean => {
    const errs: Record<string, string> = {};

    if (currentStep === 1) {
      if (!title.trim()) errs.title = 'Item title is required.';
      if (!category) errs.category = 'Category is required.';
      if (!imageUrl) errs.image = 'Please upload or select a photo of the item.';
    } else if (currentStep === 2) {
      if (!location.trim()) errs.location = 'Campus location is required.';
      if (!date) errs.date = 'Date is required.';
    } else if (currentStep === 3) {
      if (!description.trim() || description.length < 10) {
        errs.description = 'Please provide a clear description (at least 10 characters).';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setSubmitting(true);
    try {
      const newReport = await addItemReport({
        type,
        title: title.trim(),
        category,
        description: description.trim(),
        location: location.trim(),
        date,
        time: time.trim() || 'Approx. daytime',
        imageUrl:
          imageUrl ||
          'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
        status: 'active',
        privateDetails: privateDetails.trim() || undefined,
        holdingLocation: type === 'found' ? holdingLocation.trim() || undefined : undefined,
      });

      onSuccess(newReport);
    } catch (err) {
      console.error('Error submitting item:', err);
      setErrors({ form: 'Could not submit report. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Type Selector (Lost vs Found) */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {type === 'lost' ? 'Report a Lost Item' : 'Report a Found Item'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Step {step} of 4 • Takes about 60 seconds
          </p>
        </div>

        {/* Toggle Lost vs Found */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setType('lost')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              type === 'lost'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Lost
          </button>
          <button
            type="button"
            onClick={() => setType('found')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              type === 'found'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Found
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-6">
        <div
          className={`h-full transition-all duration-300 ${
            type === 'lost' ? 'bg-amber-500' : 'bg-indigo-600'
          }`}
          style={{ width: `${(step / 4) * 100}%` }}
        ></div>
      </div>

      {/* Form Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        {/* STEP 1: Photo & Basic Details */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <h2 className="text-base font-bold text-slate-900">Item Photo & Basics</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload a clear photo. Our AI can automatically extract title and category.
              </p>
            </div>

            {/* Photo Upload Zone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Item Photo <span className="text-rose-500">*</span>
              </label>

              {imageUrl ? (
                <div className="relative rounded-xl overflow-hidden border border-slate-200 aspect-16/9 bg-slate-100 group">
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {analyzingPhoto && (
                    <div className="absolute inset-0 bg-indigo-900/60 backdrop-blur-xs flex items-center justify-center gap-2 text-white text-xs font-semibold">
                      <Sparkles className="w-4 h-4 animate-spin text-indigo-300" />
                      <span>Gemini is analyzing photo traits...</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-xl p-6 text-center transition-colors bg-slate-50/50">
                  <UploadCloud className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-800">
                    Click to upload or drag and drop photo
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    PNG, JPG, WEBP up to 5MB
                  </p>
                  <input
                    id="input-file-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="input-file-upload"
                    className="inline-block mt-3 px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer shadow-2xs"
                  >
                    Choose File
                  </label>

                  {/* Or pick a sample demo photo for quick testing */}
                  <div className="mt-4 pt-3 border-t border-slate-200/60">
                    <p className="text-[11px] text-slate-400 mb-2 font-medium">
                      Or pick a campus sample photo:
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setSamplePhoto(
                            'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80',
                            'Hydro Flask Bottle',
                            'Other'
                          )
                        }
                        className="text-[11px] bg-white border border-slate-200 hover:border-indigo-300 text-slate-600 px-2 py-1 rounded-md"
                      >
                        Water Bottle
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setSamplePhoto(
                            'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80',
                            'AirPods Earbuds',
                            'Electronics'
                          )
                        }
                        className="text-[11px] bg-white border border-slate-200 hover:border-indigo-300 text-slate-600 px-2 py-1 rounded-md"
                      >
                        AirPods
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setSamplePhoto(
                            'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=800&q=80',
                            'Keys with Keychain',
                            'Keys'
                          )
                        }
                        className="text-[11px] bg-white border border-slate-200 hover:border-indigo-300 text-slate-600 px-2 py-1 rounded-md"
                      >
                        Keys
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setSamplePhoto(
                            'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
                            'North Face Backpack',
                            'Bags & Backpacks'
                          )
                        }
                        className="text-[11px] bg-white border border-slate-200 hover:border-indigo-300 text-slate-600 px-2 py-1 rounded-md"
                      >
                        Backpack
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {errors.image && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.image}
                </p>
              )}
            </div>

            {/* Item Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Item Name / Title <span className="text-rose-500">*</span>
              </label>
              <input
                id="input-item-title"
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Midnight Blue Hydro Flask 32oz, AirPods Pro in Green Case"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
              {errors.title && (
                <p className="text-xs text-rose-600 mt-1">{errors.title}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Category <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-medium text-center border transition-all truncate ${
                      category === cat
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-bold shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              {errors.category && (
                <p className="text-xs text-rose-600 mt-1">{errors.category}</p>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: Location & Timing */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <h2 className="text-base font-bold text-slate-900">Campus Location & Date</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {type === 'lost'
                  ? 'Where was this item last seen?'
                  : 'Where was this item discovered?'}
              </p>
            </div>

            {/* Campus Location */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Location <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="input-item-location"
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="e.g. Main Library 2nd floor, Science Quad benches, Dining Hall tray return..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>
              {errors.location && (
                <p className="text-xs text-rose-600 mt-1">{errors.location}</p>
              )}

              {/* Quick location chips */}
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {COMMON_CAMPUS_LOCATIONS.map(loc => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => setLocation(loc)}
                    className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-md transition-colors"
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>

            {/* Date & Time Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Date {type === 'lost' ? 'Lost' : 'Found'} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-item-date"
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>
                {errors.date && (
                  <p className="text-xs text-rose-600 mt-1">{errors.date}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Approximate Time (Optional)
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-item-time"
                    type="text"
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    placeholder="e.g. 2:30 PM, Morning, After class"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Found items: Where is the item being held right now? */}
            {type === 'found' && (
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
                <label className="block text-xs font-bold text-emerald-900">
                  Current Holding Location (Where can it be claimed?)
                </label>
                <input
                  id="input-holding-location"
                  type="text"
                  value={holdingLocation}
                  onChange={e => setHoldingLocation(e.target.value)}
                  placeholder="e.g. Main Library Circulation Desk, Turned in to Gym Attendant, or With finder"
                  className="w-full px-3.5 py-2 bg-white border border-emerald-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[11px] text-emerald-700">
                  Providing a secure campus location (like a department desk or security office)
                  helps ensure safe handoffs.
                </p>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: Description & Secret Verification Clues */}
        {step === 3 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <h2 className="text-base font-bold text-slate-900">Description & Privacy Clues</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Describe the item publicly, and set a private verification clue for ownership claims.
              </p>
            </div>

            {/* Public Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Public Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="textarea-public-description"
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Include color, brand, condition, and obvious visual traits. Do not share secret serial numbers or private identifiers here."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              ></textarea>
              {errors.description && (
                <p className="text-xs text-rose-600 mt-1">{errors.description}</p>
              )}
            </div>

            {/* Private Identifying Details (Locked / Secret) */}
            <div className="bg-indigo-50/50 border border-indigo-200 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-900">
                <Lock className="w-4 h-4 text-indigo-600" />
                <span>Private Verification Detail (Kept Hidden from Public)</span>
              </div>
              <p className="text-xs text-indigo-950/80 leading-relaxed">
                Add an unrevealed clue that only the true owner would know (e.g. initials scratched
                on the bottom, specific keychain charm, engraved serial snippet, or lockscreen
                wallpaper). Claimants will be asked to describe this to verify ownership!
              </p>
              <textarea
                id="textarea-private-details"
                rows={2}
                value={privateDetails}
                onChange={e => setPrivateDetails(e.target.value)}
                placeholder="e.g. Has silver initials 'AM' written on bottom; small Totoro sticker behind card sleeve..."
                className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              ></textarea>
            </div>
          </div>
        )}

        {/* STEP 4: Review & Submit */}
        {step === 4 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <h2 className="text-base font-bold text-slate-900">Review & Submit Report</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Confirm your details before publishing. Gemini will immediately scan for matching items!
              </p>
            </div>

            {/* Preview Card */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 flex gap-4">
              <img
                src={imageUrl}
                alt="Item preview"
                className="w-24 h-24 rounded-lg object-cover bg-slate-200 shrink-0 border border-slate-200"
              />
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      type === 'lost'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {type}
                  </span>
                  <span className="font-semibold text-indigo-600">{category}</span>
                </div>
                <h3 className="font-bold text-sm text-slate-900">{title}</h3>
                <p className="text-slate-600 line-clamp-2">{description}</p>
                <div className="flex items-center gap-3 text-slate-500 pt-1">
                  <span>📍 {location}</span>
                  <span>🗓️ {date}</span>
                </div>
              </div>
            </div>

            {privateDetails && (
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 flex items-start gap-2 text-xs text-amber-900">
                <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Private Verification Guard:</span> "
                  {privateDetails}" will be safely hidden from the public browse listing.
                </div>
              </div>
            )}

            {errors.form && (
              <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-lg border border-rose-200">
                {errors.form}
              </div>
            )}
          </div>
        )}

        {/* Buttons Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(prev => prev - 1)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>
          ) : (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
          )}

          {step < 4 ? (
            <button
              id="btn-report-next"
              type="button"
              onClick={handleNext}
              className={`px-5 py-2.5 rounded-xl text-white font-semibold text-xs shadow-xs flex items-center gap-1.5 transition-all ${
                type === 'lost'
                  ? 'bg-amber-500 hover:bg-amber-600'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              id="btn-report-submit"
              type="button"
              disabled={submitting}
              onClick={handleSubmit}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs flex items-center gap-2 disabled:opacity-50 transition-all"
            >
              {submitting ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>Publishing & Checking Matches...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Publish Campus Report</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
