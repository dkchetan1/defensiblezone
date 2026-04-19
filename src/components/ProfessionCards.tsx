import { ArrowRight } from "lucide-react";

interface ProfessionCard {
  title: string;
  description: string;
  link?: string;
}

const professions: ProfessionCard[] = [
  {
    title: "Physician / Doctor",
    description: "AI is matching specialist diagnostic accuracy in radiology, pathology, and imaging.",
    link: "https://defensiblezone.ai/doctor",
  },
  {
    title: "Software Engineer",
    description: "AI tools like Copilot and Cursor are automating code generation, testing, and documentation.",
    link: "https://defensiblezone.ai/engineer",
  },
  {
    title: "UX Professional",
    description: "AI is reshaping design, research, and strategy work. Find out where your practice is defensible.",
    link: "https://defensiblezone.ai/designer",
  },
  {
    title: "Marketing Specialist",
    description: "AI automates campaign execution, segmentation, reporting, and content production.",
  },
  {
    title: "Accountant / Bookkeeper",
    description: "AI handles routine reconciliation, tax prep, and financial reporting with increasing accuracy.",
  },
  {
    title: "Financial Analyst",
    description: "AI drafts models, generates reports, and processes data at speeds no human analyst can match.",
  },
  {
    title: "Management Consultant",
    description: "AI automates research synthesis, benchmarking, and slide generation — the core of junior consulting work.",
  },
  {
    title: "HR / Recruiter",
    description: "AI screens resumes, schedules interviews, and drafts job descriptions faster than any human team.",
  },
  {
    title: "Product Manager",
    description: "AI handles backlog grooming, user research synthesis, and roadmap documentation.",
  },
];

const ProfessionCards = () => {
  return (
    <section className="px-6 pt-8 md:pt-10 pb-20 md:pb-28 bg-secondary">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-4">
            Find Your Defensible Zone™
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground text-lg">
            Select your profession below. Each assessment is calibrated to your specific role, seniority, and work context — not a generic career quiz.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {professions.map((profession) =>
            profession.link ? (
              <a
                key={profession.title}
                href={profession.link}
                className="group relative rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:shadow-lg hover:shadow-primary/8 hover:-translate-y-1.5 cursor-pointer flex flex-col no-underline"
              >
                <h3 className="font-heading text-xl font-semibold text-card-foreground mb-3">
                  {profession.title}
                </h3>
                <p className="text-muted-foreground text-[0.9rem] leading-relaxed mb-5 flex-1">
                  {profession.description}
                </p>
                <span className="flex items-center text-primary text-sm font-medium group-hover:translate-x-1 transition-transform">
                  Take the Assessment
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </span>
              </a>
            ) : (
              <article
                key={profession.title}
                className="relative rounded-2xl border border-border bg-card p-6 flex flex-col"
              >
                <h3 className="font-heading text-xl font-semibold text-card-foreground mb-3">
                  {profession.title}
                </h3>
                <p className="text-muted-foreground text-[0.9rem] leading-relaxed mb-5 flex-1">
                  {profession.description}
                </p>
                <span className="text-muted-foreground/60 text-sm font-medium cursor-default">
                  Coming Soon
                </span>
              </article>
            )
          )}
        </div>
      </div>
    </section>
  );
};

export default ProfessionCards;
