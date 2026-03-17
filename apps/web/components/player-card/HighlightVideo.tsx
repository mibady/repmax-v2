'use client';

export default function HighlightVideo({
  thumbnail,
  title,
  videoUrl,
}: {
  thumbnail: string;
  title: string;
  videoUrl: string | null;
}) {
  return (
    <div
      className="relative w-full aspect-video rounded-2xl overflow-hidden group cursor-pointer border border-white/10"
      onClick={() => videoUrl && window.open(videoUrl, '_blank')}
    >
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
        style={{
          backgroundImage: `url('${thumbnail}')`,
        }}
      />
      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center pl-1 shadow-glow group-hover:scale-110 transition-transform">
          <span className="material-symbols-outlined text-black text-[32px] font-bold">
            play_arrow
          </span>
        </div>
      </div>
      <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md">
        <p className="text-[10px] text-white font-medium">
          {title}
        </p>
      </div>
    </div>
  );
}
