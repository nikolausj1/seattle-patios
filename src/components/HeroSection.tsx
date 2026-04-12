export default function HeroSection() {
  return (
    <section className="relative h-[40vh] min-h-[420px] flex items-end">
      {/* Gradient background — warm sunset orange tones */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(160deg, #7c2d12 0%, #c2410c 30%, #ea580c 55%, #f97316 75%, #fb923c 100%)",
        }}
      >
        {/* Subtle texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        {/* Bottom gradient for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#7c2d12]/60 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto px-6 pb-12 text-center">
        <h1 className="font-serif text-5xl md:text-7xl text-white mb-6 leading-tight">
          Seattle Patios
        </h1>
        <p className="text-lg md:text-xl text-white/85 leading-relaxed max-w-2xl mx-auto text-left">
          <span className="font-serif text-[36px] text-white float-left leading-[1] mr-1.5 mt-0.5">A</span>
          scored guide to the best patios in Seattle. Every patio is rated on
          sun, food and drink, and the space itself &mdash; so you can find the
          perfect spot for a sunny afternoon.
        </p>
        <div className="mt-8 animate-bounce">
          <svg
            className="w-6 h-6 mx-auto text-white/60"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}
