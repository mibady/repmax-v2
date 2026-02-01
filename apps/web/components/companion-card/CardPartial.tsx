"use client";

import Image from "next/image";

interface PartialAthleteData {
  id: string;
  fullName: string;
  position?: string;
  classYear?: number;
  highSchool?: string;
  city?: string;
  state?: string;
  imageUrl?: string;
  completionPercentage: number;
  missingFields: string[];
}

interface CardPartialProps {
  athlete: PartialAthleteData;
  onComplete?: () => void;
}

const fieldLabels: Record<string, string> = {
  position: "Position",
  classYear: "Graduation Year",
  highSchool: "High School",
  city: "City",
  state: "State",
  height: "Height",
  weight: "Weight",
  gpa: "GPA",
  imageUrl: "Profile Photo",
  highlightUrl: "Game Highlights",
  fortyYard: "40-Yard Dash",
  satScore: "SAT Score",
  actScore: "ACT Score",
};

export function CardPartial({ athlete, onComplete }: CardPartialProps) {
  const getFieldLabel = (field: string) => fieldLabels[field] || field;

  // Categorize missing fields by priority
  const essentialFields = athlete.missingFields.filter((f) =>
    ["position", "classYear", "highSchool", "height", "weight"].includes(f)
  );
  const recommendedFields = athlete.missingFields.filter((f) =>
    ["imageUrl", "gpa", "highlightUrl"].includes(f)
  );
  const optionalFields = athlete.missingFields.filter(
    (f) => !essentialFields.includes(f) && !recommendedFields.includes(f)
  );

  return (
    <div className="w-full max-w-md mx-auto rounded-2xl bg-gradient-to-b from-surface-dark to-background-dark border border-white/10 overflow-hidden shadow-2xl">
      {/* Header with Photo */}
      <div className="relative">
        {/* Background - Muted */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent" />

        {/* Photo */}
        <div className="relative pt-6 pb-4 flex justify-center">
          <div className="w-32 h-32 rounded-full border-4 border-white/20 overflow-hidden bg-surface-dark relative">
            {athlete.imageUrl ? (
              <Image
                src={athlete.imageUrl}
                alt={athlete.fullName}
                width={128}
                height={128}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <span className="material-symbols-rounded text-4xl text-text-grey">
                  add_a_photo
                </span>
                <span className="text-xs text-text-grey mt-1">Add Photo</span>
              </div>
            )}
          </div>
        </div>

        {/* Completion Badge */}
        <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/30">
          <span className="text-xs font-bold text-yellow-400">
            {athlete.completionPercentage}% Complete
          </span>
        </div>
      </div>

      {/* Name & Basic Info */}
      <div className="text-center px-6 pb-4">
        <h1 className="text-2xl font-bold text-white">{athlete.fullName}</h1>
        <div className="flex items-center justify-center gap-2 mt-1">
          {athlete.position ? (
            <span className="text-primary font-bold">{athlete.position}</span>
          ) : (
            <span className="text-text-grey italic">Add Position</span>
          )}
          <span className="text-text-grey">•</span>
          {athlete.classYear ? (
            <span className="text-text-grey">Class of {athlete.classYear}</span>
          ) : (
            <span className="text-text-grey italic">Add Class Year</span>
          )}
        </div>
        {athlete.highSchool ? (
          <p className="text-sm text-text-grey mt-1">
            {athlete.highSchool}
            {athlete.city && athlete.state && ` • ${athlete.city}, ${athlete.state}`}
          </p>
        ) : (
          <p className="text-sm text-text-grey italic mt-1">Add High School</p>
        )}
      </div>

      {/* Progress Bar */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-text-grey">Profile Completion</span>
          <span className="text-xs font-bold text-primary">{athlete.completionPercentage}%</span>
        </div>
        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-yellow-500 to-primary transition-all duration-500"
            style={{ width: `${athlete.completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Missing Fields */}
      <div className="px-6 py-4 border-t border-white/10">
        <h3 className="text-xs text-text-grey uppercase tracking-wider mb-3">
          Complete Your Profile
        </h3>

        {/* Essential Fields */}
        {essentialFields.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-red-400 mb-2 flex items-center gap-1">
              <span className="material-symbols-rounded text-sm">priority_high</span>
              Essential (Required)
            </p>
            <div className="space-y-2">
              {essentialFields.map((field) => (
                <div
                  key={field}
                  className="flex items-center gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20"
                >
                  <span className="material-symbols-rounded text-red-400">radio_button_unchecked</span>
                  <span className="text-sm text-white">{getFieldLabel(field)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Fields */}
        {recommendedFields.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-yellow-400 mb-2 flex items-center gap-1">
              <span className="material-symbols-rounded text-sm">star</span>
              Recommended
            </p>
            <div className="space-y-2">
              {recommendedFields.map((field) => (
                <div
                  key={field}
                  className="flex items-center gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20"
                >
                  <span className="material-symbols-rounded text-yellow-400">radio_button_unchecked</span>
                  <span className="text-sm text-white">{getFieldLabel(field)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Optional Fields */}
        {optionalFields.length > 0 && (
          <div>
            <p className="text-xs text-text-grey mb-2 flex items-center gap-1">
              <span className="material-symbols-rounded text-sm">add_circle_outline</span>
              Optional
            </p>
            <div className="space-y-2">
              {optionalFields.slice(0, 3).map((field) => (
                <div
                  key={field}
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/5"
                >
                  <span className="material-symbols-rounded text-text-grey">radio_button_unchecked</span>
                  <span className="text-sm text-text-grey">{getFieldLabel(field)}</span>
                </div>
              ))}
              {optionalFields.length > 3 && (
                <p className="text-xs text-text-grey text-center">
                  +{optionalFields.length - 3} more optional fields
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="px-6 py-4 border-t border-white/10">
        <button
          onClick={onComplete}
          className="w-full py-3 rounded-lg bg-primary hover:bg-primary-hover text-black font-bold transition-colors flex items-center justify-center gap-2"
        >
          <span className="material-symbols-rounded">edit</span>
          Complete Profile
        </button>
        <p className="text-xs text-text-grey text-center mt-3">
          Complete profiles get <span className="text-primary">3x more views</span> from recruiters
        </p>
      </div>
    </div>
  );
}
