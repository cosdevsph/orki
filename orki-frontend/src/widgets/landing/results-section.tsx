import Image from "next/image";

const stats = [
  { value: "10,000+", label: "Students Enrolled", accent: "text-primary" },
  { value: "92%", label: "Average Pass Rate", accent: "text-success" },
  { value: "2.4M", label: "Flashcards Studied", accent: "text-primary" },
  { value: "365", label: "Day Max Study Streak", accent: "text-success" },
];

const testimonials = [
  {
    quote:
      "Orki completely changed how I prepared for the nursing board exam. The analytics helped me pinpoint exactly which topics needed the most work. I passed on my first attempt.",
    name: "Maria Santos",
    role: "Nursing Board Passer, 2024",
    initials: "MS",
    color: "#3B82F6",
    stars: 5,
  },
  {
    quote:
      "The spaced repetition flashcards are incredible. I went from failing mock exams at 60% to comfortably passing the real thing. The streak system kept me disciplined every single day.",
    name: "Carlos Reyes",
    role: "CPA Board Exam Passer, 2024",
    initials: "CR",
    color: "#8B5CF6",
    stars: 5,
  },
  {
    quote:
      "Studying for the bar felt overwhelming until I found Orki. The clean dashboard and daily progress tracking made a mountain of material feel manageable. Highly recommend.",
    name: "Anika Lim",
    role: "Bar Exam Passer, 2023",
    initials: "AL",
    color: "#EC4899",
    stars: 5,
  },
];

function StarRow({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 14 14" fill="#FBBF24">
          <path d="M7 1l1.8 3.6L13 5.5l-3 2.9.7 4.1L7 10.4l-3.7 2.1.7-4.1L1 5.5l4.2-.9L7 1z" />
        </svg>
      ))}
    </div>
  );
}

export function ResultsSection() {
  return (
    <section id="results" className="bg-background py-28 transition-colors duration-300">
      <div className="mx-auto w-full max-w-6xl px-6">
        {/* Section header */}
        <div className="flex flex-col items-center gap-4 text-center mb-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/8 px-4 py-1.5 text-sm font-medium text-success">
            Proven Results
          </span>
          <h2 className="font-heading text-5xl font-bold text-foreground leading-tight">
            Students who study with Orki pass.
          </h2>
          <p className="text-lg text-secondary max-w-lg leading-relaxed">
            The numbers speak for themselves — and so do the students behind them.
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-4 gap-5 mb-16">
          {stats.map(({ value, label, accent }) => (
            <div
              key={label}
              className="flex flex-col gap-2 items-center text-center rounded-3xl border border-border/60 bg-card-bg p-8 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <span className={`font-heading text-5xl font-bold leading-none ${accent}`}>
                {value}
              </span>
              <span className="text-sm font-semibold text-secondary">{label}</span>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-3 gap-6">
          {testimonials.map(({ quote, name, role, initials, color, stars }) => (
            <div
              key={name}
              className="flex flex-col gap-5 rounded-3xl border border-border/60 bg-card-bg p-7 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <StarRow count={stars} />
              <p className="text-[15px] text-foreground leading-relaxed flex-1">
                &ldquo;{quote}&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                  style={{ background: color }}
                >
                  {initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{name}</p>
                  <p className="text-xs text-secondary mt-0.5">{role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mascot accent */}
      <div className="flex justify-center mt-12 pointer-events-none select-none">
        <Image
          src="/mascott/OrkiLogoRight.webp"
          alt="Orki mascot"
          width={120}
          height={120}
          className="object-contain drop-shadow-md opacity-80"
        />
      </div>
    </section>
  );
}
