"use client";

import Image from "next/image";

interface Measurables {
  height: string;
  weight: number;
  fortyYard?: number;
  verticalJump?: number;
  benchPress?: number;
  squat?: number;
}

interface Academics {
  gpa: number;
  satScore?: number;
  actScore?: number;
  classRank?: string;
}

interface AthleteData {
  id: string;
  fullName: string;
  position: string;
  classYear: number;
  highSchool: string;
  city: string;
  state: string;
  starRating: number;
  imageUrl?: string;
  measurables: Measurables;
  academics: Academics;
  highlightUrl?: string;
  offers: string[];
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    hudl?: string;
  };
}

interface CardIdealProps {
  athlete: AthleteData;
  onShare?: () => void;
  onEdit?: () => void;
  onContact?: () => void;
}

function StarRating({ stars }: { stars: number }) {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <span
          key={i}
          className={`text-lg ${
            i < stars ? "text-primary" : "text-white/20"
          }`}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export function CardIdeal({ athlete, onShare, onEdit, onContact }: CardIdealProps) {
  return (
    <div className="w-full max-w-md mx-auto rounded-2xl bg-gradient-to-b from-surface-dark to-background-dark border border-white/10 overflow-hidden shadow-2xl">
      {/* Header with Photo */}
      <div className="relative">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-transparent" />

        {/* Photo */}
        <div className="relative pt-6 pb-4 flex justify-center">
          <div className="w-32 h-32 rounded-full border-4 border-primary overflow-hidden bg-surface-dark">
            {athlete.imageUrl ? (
              <Image
                src={athlete.imageUrl}
                alt={athlete.fullName}
                width={128}
                height={128}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-4xl font-bold text-white">
                  {athlete.fullName.split(" ").map((n) => n[0]).join("")}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Edit Button */}
        {onEdit && (
          <button
            onClick={onEdit}
            className="absolute top-4 right-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <span className="material-symbols-rounded text-white">edit</span>
          </button>
        )}
      </div>

      {/* Name & Position */}
      <div className="text-center px-6 pb-4">
        <h1 className="text-2xl font-bold text-white">{athlete.fullName}</h1>
        <div className="flex items-center justify-center gap-2 mt-1">
          <span className="text-primary font-bold">{athlete.position}</span>
          <span className="text-text-grey">•</span>
          <span className="text-text-grey">Class of {athlete.classYear}</span>
        </div>
        <p className="text-sm text-text-grey mt-1">
          {athlete.highSchool} • {athlete.city}, {athlete.state}
        </p>
        <div className="flex justify-center mt-2">
          <StarRating stars={athlete.starRating} />
        </div>
      </div>

      {/* Measurables */}
      <div className="px-6 py-4 border-t border-white/10">
        <h3 className="text-xs text-text-grey uppercase tracking-wider mb-3">Measurables</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-xl font-bold text-white">{athlete.measurables.height}</p>
            <p className="text-xs text-text-grey">Height</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-white">{athlete.measurables.weight}</p>
            <p className="text-xs text-text-grey">Weight</p>
          </div>
          {athlete.measurables.fortyYard && (
            <div className="text-center">
              <p className="text-xl font-bold text-primary">{athlete.measurables.fortyYard}</p>
              <p className="text-xs text-text-grey">40-Yard</p>
            </div>
          )}
        </div>
        {(athlete.measurables.verticalJump || athlete.measurables.benchPress) && (
          <div className="grid grid-cols-2 gap-4 mt-4">
            {athlete.measurables.verticalJump && (
              <div className="text-center">
                <p className="text-lg font-bold text-white">{athlete.measurables.verticalJump}&quot;</p>
                <p className="text-xs text-text-grey">Vertical</p>
              </div>
            )}
            {athlete.measurables.benchPress && (
              <div className="text-center">
                <p className="text-lg font-bold text-white">{athlete.measurables.benchPress}</p>
                <p className="text-xs text-text-grey">Bench</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Academics */}
      <div className="px-6 py-4 border-t border-white/10">
        <h3 className="text-xs text-text-grey uppercase tracking-wider mb-3">Academics</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-xl font-bold text-white">{athlete.academics.gpa.toFixed(2)}</p>
            <p className="text-xs text-text-grey">GPA</p>
          </div>
          {athlete.academics.satScore && (
            <div className="text-center">
              <p className="text-xl font-bold text-white">{athlete.academics.satScore}</p>
              <p className="text-xs text-text-grey">SAT</p>
            </div>
          )}
          {athlete.academics.actScore && (
            <div className="text-center">
              <p className="text-xl font-bold text-white">{athlete.academics.actScore}</p>
              <p className="text-xs text-text-grey">ACT</p>
            </div>
          )}
        </div>
      </div>

      {/* Offers */}
      {athlete.offers.length > 0 && (
        <div className="px-6 py-4 border-t border-white/10">
          <h3 className="text-xs text-text-grey uppercase tracking-wider mb-3">
            Offers ({athlete.offers.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {athlete.offers.slice(0, 6).map((offer) => (
              <span
                key={offer}
                className="px-3 py-1 rounded-full bg-white/10 text-sm text-white"
              >
                {offer}
              </span>
            ))}
            {athlete.offers.length > 6 && (
              <span className="px-3 py-1 rounded-full bg-primary/20 text-sm text-primary">
                +{athlete.offers.length - 6} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="px-6 py-4 border-t border-white/10 flex gap-3">
        {onContact && (
          <button
            onClick={onContact}
            className="flex-1 py-3 rounded-lg bg-primary hover:bg-primary-hover text-black font-bold transition-colors"
          >
            Contact
          </button>
        )}
        {onShare && (
          <button
            onClick={onShare}
            className="p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <span className="material-symbols-rounded text-white">share</span>
          </button>
        )}
      </div>

      {/* Social Links */}
      {athlete.socialLinks && (
        <div className="px-6 py-3 border-t border-white/10 flex justify-center gap-4">
          {athlete.socialLinks.twitter && (
            <a
              href={athlete.socialLinks.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-grey hover:text-white transition-colors"
            >
              𝕏
            </a>
          )}
          {athlete.socialLinks.instagram && (
            <a
              href={athlete.socialLinks.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-grey hover:text-white transition-colors"
            >
              <span className="material-symbols-rounded">photo_camera</span>
            </a>
          )}
          {athlete.socialLinks.hudl && (
            <a
              href={athlete.socialLinks.hudl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-grey hover:text-white transition-colors"
            >
              <span className="material-symbols-rounded">play_circle</span>
            </a>
          )}
        </div>
      )}
    </div>
  );
}
