"use client";

export default function MusicEqualizer() {
  return (
    <div className="flex items-end gap-1 h-10">
      {[...Array(5)].map((_, i) => (
        <span
          key={i}
          className="w-1 bg-primary rounded-sm animate-equalizer"
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </div>
  );
}