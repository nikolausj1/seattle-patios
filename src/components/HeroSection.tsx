import Image from "next/image";

const pillars = [
  { icon: "☀️", name: "Sun",   blurb: "How much sun it gets" },
  { icon: "🍽️", name: "Food",  blurb: "Quality, variety & value" },
  { icon: "🍷", name: "Drink", blurb: "Creative & refreshing" },
  { icon: "🤙", name: "Vibe",  blurb: "Ambience & comfort" },
];

export default function HeroSection() {
  return (
    <section data-hero className="relative isolate overflow-hidden">
      {/* Background photo — full bleed behind everything */}
      <Image
        src="/images/header.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-[center_top] -z-10"
      />
      {/* Subtle wash to soften the photo behind the headline text */}
      <div
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, rgba(221,238,245,0.55) 0%, rgba(221,238,245,0.30) 30%, rgba(221,238,245,0.05) 55%, rgba(221,238,245,0) 70%)",
        }}
      />

      {/* Tropical leaves — peek in from the left edge of the hero */}
      <Image
        src="/images/leaves.png"
        alt=""
        width={813}
        height={789}
        priority
        className="pointer-events-none absolute left-0 bottom-0 w-[180px] md:w-[260px] lg:w-[300px] -translate-x-[55%] translate-y-[8%] -z-[5] hidden sm:block"
      />

      {/* Decorative cartoon sun — sits in the upper-right of the hero, behind the umbrella */}
      <svg
        className="absolute top-12 right-[35%] w-20 h-20 -z-[5] pointer-events-none hidden md:block"
        viewBox="0 0 100 100"
        aria-hidden
      >
        <g stroke="#F2742A" strokeWidth="6" strokeLinecap="round">
          <line x1="50" y1="6"  x2="50" y2="18" />
          <line x1="50" y1="82" x2="50" y2="94" />
          <line x1="6"  y1="50" x2="18" y2="50" />
          <line x1="82" y1="50" x2="94" y2="50" />
          <line x1="18" y1="18" x2="27" y2="27" />
          <line x1="73" y1="73" x2="82" y2="82" />
          <line x1="82" y1="18" x2="73" y2="27" />
          <line x1="18" y1="82" x2="27" y2="73" />
        </g>
        <circle cx="50" cy="50" r="20" fill="#F5C144" stroke="#F2742A" strokeWidth="3" />
      </svg>

      {/* Top nav */}
      <div className="relative max-w-7xl mx-auto px-6 pt-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl leading-none" aria-hidden>
            ☀️
          </span>
          <span className="text-lg font-bold tracking-tight">
            <span className="text-patio-navy">Seattle </span>
            <span className="text-patio-accent">Patio Vibes</span>
          </span>
        </div>
        <a
          href="mailto:hello@seattlepatiovibes.com?subject=Add%20a%20patio"
          className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-patio-accent text-white shadow-sm hover:bg-patio-accent-dark transition-colors"
        >
          Add a Patio
        </a>
      </div>

      {/* Hero body */}
      <div className="relative max-w-7xl mx-auto px-6 pt-10 pb-16 lg:pb-20">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.04] tracking-tight">
            <span className="text-patio-navy">Find Seattle&rsquo;s Best</span>
            <br />
            <span className="text-patio-accent">Patio Vibes</span>
          </h1>
          <p className="mt-4 text-base md:text-lg text-patio-navy/75 max-w-xl">
            Seattle&rsquo;s best patios, ranked by sun, food, drinks, and vibe.
          </p>

          {/* Score legend — 4 pillars explained */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-3 max-w-xl">
            {pillars.map((p) => (
              <div key={p.name} className="flex items-start gap-2">
                <span className="text-xl leading-none mt-0.5">{p.icon}</span>
                <div>
                  <div className="text-sm font-bold text-patio-navy leading-tight">
                    {p.name}
                  </div>
                  <div className="text-[11px] text-patio-navy/65 leading-tight mt-0.5">
                    {p.blurb}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
