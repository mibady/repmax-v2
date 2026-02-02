"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { useImageUpload, useDropzone } from "@/hooks/useImageUpload";
import { useAthleteCardEditor } from "@/lib/hooks";

// Form sections
const positions = [
  "Quarterback",
  "Running Back",
  "Wide Receiver",
  "Tight End",
  "Offensive Line",
  "Defensive Line",
  "Linebacker",
  "Cornerback",
  "Safety",
  "Kicker",
  "Punter",
];

const classYears = [2024, 2025, 2026, 2027, 2028];

const DEFAULT_AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCpFOEUz_rfWWSVZf8V8mFWpvSX0XbEvnGhfEPVxD3mYrqKA6J94E78iBa_bR1caG28xt4BCjjnmdpZ8gfWL2lqcqVjfRncL7V0MxJBJxQQLl315vZyu2h6k9L5D4eNTwqVSBKB6cji7NJkO3WIoWyV4PeQrLPwNIgFa36RdDTOOR035pkGUVlwoADx0noxixr0W7lVDf9paHXe5l3fXR4SoKoRwegF0Uejyfdrq-vkbtjy7k-3snSTmQeCc6x5BHmksTTT1Aer9Qo";

export default function EditCardPage() {
  const {
    data: formData,
    isLoading,
    isSaving,
    error,
    saveError,
    updateField,
    save,
    profileCompletion,
  } = useAthleteCardEditor();

  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { isUploading, progress, error: uploadError, upload } = useImageUpload({
    type: "profile",
    onSuccess: (url) => {
      updateField("avatarUrl", url);
    },
  });

  const handleFileSelect = async (file: File) => {
    try {
      await upload(file);
    } catch {
      // Error is already handled in the hook
    }
  };

  const { isDragging, dropzoneProps } = useDropzone(handleFileSelect);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (formData) {
      updateField(name as keyof typeof formData, value);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleSave = async () => {
    setSaveSuccess(false);
    const success = await save();
    if (success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error && !formData) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error.message}</p>
          <Link href="/dashboard/athlete" className="text-primary hover:underline">
            Return to dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!formData) {
    return null;
  }

  const profileImage = formData.avatarUrl || DEFAULT_AVATAR;

  return (
    <div className="p-8">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* Page Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/athlete"
              className="flex items-center gap-2 text-text-grey hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </Link>
            <h1 className="text-2xl font-bold text-white">Edit Companion Card</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-24 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${profileCompletion}%` }}
                />
              </div>
              <span className="text-sm text-text-grey">{profileCompletion}% Complete</span>
            </div>
            {saveSuccess && (
              <span className="text-sm text-green-500 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                Saved!
              </span>
            )}
            {saveError && (
              <span className="text-sm text-red-500">{saveError.message}</span>
            )}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 rounded-lg bg-primary text-black font-bold text-sm hover:bg-primary-hover transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Sections */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Photo */}
            <section className="rounded-xl bg-surface-dark border border-white/5 p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">photo_camera</span>
                Profile Photo
              </h2>
              <div className="flex items-start gap-6">
                <div className="relative">
                  <div
                    {...dropzoneProps}
                    className={`h-32 w-32 rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-colors ${
                      isDragging
                        ? "border-primary bg-primary/10"
                        : "border-white/20 bg-white/5"
                    } ${isUploading ? "opacity-50" : ""}`}
                  >
                    {isUploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs text-text-grey">{progress}%</span>
                      </div>
                    ) : (
                      <Image
                        src={profileImage}
                        alt="Profile"
                        width={128}
                        height={128}
                        className="object-cover w-full h-full"
                      />
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-primary text-black flex items-center justify-center shadow-lg hover:bg-primary-hover transition-colors disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-text-grey mb-3">
                    Upload an action shot or headshot. This will be the main image on your card.
                  </p>
                  {uploadError && (
                    <p className="text-sm text-red-400 mb-3">{uploadError}</p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm font-medium hover:bg-white/10 transition-colors disabled:opacity-50"
                    >
                      {isUploading ? "Uploading..." : "Upload Photo"}
                    </button>
                    <button className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm font-medium hover:bg-white/10 transition-colors">
                      Take Photo
                    </button>
                  </div>
                  <p className="text-xs text-text-grey mt-2">
                    Drag and drop or click to upload. Max 5MB. JPEG, PNG, WebP, or GIF.
                  </p>
                </div>
              </div>
            </section>

            {/* Basic Information */}
            <section className="rounded-xl bg-surface-dark border border-white/5 p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">person</span>
                Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-text-grey mb-2">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-text-grey focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-grey mb-2">Primary Position</label>
                  <select
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:border-primary focus:outline-none transition-colors"
                  >
                    <option value="" className="bg-surface-dark">Select position</option>
                    {positions.map((pos) => (
                      <option key={pos} value={pos} className="bg-surface-dark">
                        {pos}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-text-grey mb-2">Secondary Position</label>
                  <select
                    name="secondaryPosition"
                    value={formData.secondaryPosition}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:border-primary focus:outline-none transition-colors"
                  >
                    <option value="" className="bg-surface-dark">
                      None
                    </option>
                    {positions.map((pos) => (
                      <option key={pos} value={pos} className="bg-surface-dark">
                        {pos}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-text-grey mb-2">Class Year</label>
                  <select
                    name="classYear"
                    value={formData.classYear}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:border-primary focus:outline-none transition-colors"
                  >
                    {classYears.map((year) => (
                      <option key={year} value={year} className="bg-surface-dark">
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-text-grey mb-2">High School</label>
                  <input
                    type="text"
                    name="highSchool"
                    value={formData.highSchool}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-text-grey focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm text-text-grey mb-2">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-text-grey focus:border-primary focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="w-24">
                    <label className="block text-sm text-text-grey mb-2">State</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      maxLength={2}
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-text-grey focus:border-primary focus:outline-none transition-colors uppercase"
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-text-grey mb-2">Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    maxLength={280}
                    rows={3}
                    placeholder="Tell coaches about yourself..."
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-text-grey focus:border-primary focus:outline-none transition-colors resize-none"
                  />
                  <p className="text-xs text-text-grey mt-1">{formData.bio.length}/280 characters</p>
                </div>
              </div>
            </section>

            {/* Measurables */}
            <section className="rounded-xl bg-surface-dark border border-white/5 p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">straighten</span>
                Measurables
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm text-text-grey mb-2">Height</label>
                  <input
                    type="text"
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                    placeholder={`6'1"`}
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white font-mono placeholder:text-text-grey focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-grey mb-2">Weight (lbs)</label>
                  <input
                    type="text"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    placeholder="185"
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white font-mono placeholder:text-text-grey focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-grey mb-2">Wingspan (in)</label>
                  <input
                    type="text"
                    name="wingspan"
                    value={formData.wingspan}
                    onChange={handleChange}
                    placeholder="74"
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white font-mono placeholder:text-text-grey focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-grey mb-2">40-Yard (s)</label>
                  <input
                    type="text"
                    name="fortyYard"
                    value={formData.fortyYard}
                    onChange={handleChange}
                    placeholder="4.52"
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-primary font-mono placeholder:text-text-grey focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-grey mb-2">Bench Press (lbs)</label>
                  <input
                    type="text"
                    name="benchPress"
                    value={formData.benchPress}
                    onChange={handleChange}
                    placeholder="225"
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white font-mono placeholder:text-text-grey focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-grey mb-2">Squat (lbs)</label>
                  <input
                    type="text"
                    name="squat"
                    value={formData.squat}
                    onChange={handleChange}
                    placeholder="405"
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white font-mono placeholder:text-text-grey focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-grey mb-2">Vertical (in)</label>
                  <input
                    type="text"
                    name="vertical"
                    value={formData.vertical}
                    onChange={handleChange}
                    placeholder="36"
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white font-mono placeholder:text-text-grey focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </section>

            {/* Academics */}
            <section className="rounded-xl bg-surface-dark border border-white/5 p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">school</span>
                Academics
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm text-text-grey mb-2">GPA</label>
                  <input
                    type="text"
                    name="gpa"
                    value={formData.gpa}
                    onChange={handleChange}
                    placeholder="3.8"
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white font-mono placeholder:text-text-grey focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-grey mb-2">SAT Score</label>
                  <input
                    type="text"
                    name="sat"
                    value={formData.sat}
                    onChange={handleChange}
                    placeholder="1280"
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white font-mono placeholder:text-text-grey focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-grey mb-2">ACT Score</label>
                  <input
                    type="text"
                    name="act"
                    value={formData.act}
                    onChange={handleChange}
                    placeholder="28"
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white font-mono placeholder:text-text-grey focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-grey mb-2">Desired Major</label>
                  <input
                    type="text"
                    name="major"
                    value={formData.major}
                    onChange={handleChange}
                    placeholder="Business"
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-text-grey focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </section>

            {/* Film & Highlights */}
            <section className="rounded-xl bg-surface-dark border border-white/5 p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">smart_display</span>
                Film & Highlights
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-text-grey mb-2">Hudl Profile Link</label>
                  <input
                    type="url"
                    name="hudlLink"
                    value={formData.hudlLink}
                    onChange={handleChange}
                    placeholder="https://www.hudl.com/profile/..."
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-text-grey focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-grey mb-2">YouTube Highlight Reel</label>
                  <input
                    type="url"
                    name="youtubeLink"
                    value={formData.youtubeLink}
                    onChange={handleChange}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-text-grey focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </section>
          </div>

          {/* Live Preview */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <h3 className="text-sm font-medium text-text-grey mb-4">LIVE PREVIEW</h3>
              <div className="rounded-2xl bg-[#0A0A0A] border border-white/10 overflow-hidden shadow-2xl">
                {/* Preview Header */}
                <div className="relative h-24 bg-gradient-to-br from-primary/30 to-purple-900/30">
                  <div className="absolute top-3 right-3 px-2 py-1 rounded bg-purple-900/80 border border-purple-500/30">
                    <span className="text-[10px] font-bold text-purple-200">{formData.zone || "ZONE"}</span>
                  </div>
                </div>

                {/* Preview Content */}
                <div className="p-4 -mt-10 relative">
                  <div className="flex gap-3 mb-3">
                    <div className="h-16 w-16 rounded-full border-3 border-primary bg-surface-dark overflow-hidden">
                      <Image
                        src={profileImage}
                        alt="Preview"
                        width={64}
                        height={64}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-white text-lg">
                        {formData.name || "Your Name"}
                      </h4>
                      <p className="text-xs text-text-grey">{formData.position || "Position"}</p>
                      <div className="flex gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className="material-symbols-outlined text-[14px] text-primary"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            star
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="rounded bg-white/5 p-2 text-center">
                      <p className="text-[10px] text-text-grey">Height</p>
                      <p className="text-sm font-bold text-white font-mono">
                        {formData.height || "--"}
                      </p>
                    </div>
                    <div className="rounded bg-white/5 p-2 text-center">
                      <p className="text-[10px] text-text-grey">Weight</p>
                      <p className="text-sm font-bold text-white font-mono">
                        {formData.weight || "--"}
                      </p>
                    </div>
                    <div className="rounded bg-white/5 p-2 text-center">
                      <p className="text-[10px] text-text-grey">40YD</p>
                      <p className="text-sm font-bold text-primary font-mono">
                        {formData.fortyYard || "--"}
                      </p>
                    </div>
                  </div>

                  <div className="text-xs text-text-grey text-center">
                    {formData.highSchool || "School"}, {formData.city || "City"}, {formData.state || "ST"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
