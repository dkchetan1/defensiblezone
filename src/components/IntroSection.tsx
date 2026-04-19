const blocks = [
  {
    label: "WHAT IS THE DEFENSIBLE ZONE?",
    body: "It's a simple idea. Your career has parts that AI can do — and parts it can't, at least not yet. The Defensible Zone is that second part. It's where your natural strengths meet what the market still needs from a real person. That's the space worth finding and moving toward.",
  },
  {
    label: "WHAT THE ASSESSMENT DOES",
    body: "You tell it your role and your skills. It scores each skill on two things — how replaceable it is by AI, and how much the market values it. Then it shows you where you actually stand. No fluff. Just a clear picture of what's at risk and what isn't.",
  },
  {
    label: "HOW TO USE THIS SITE",
    body: "Pick your profession from the list below. Answer a few questions. You'll get a score, a breakdown of your skills, and a sense of where to focus. It takes about 10 minutes. The goal isn't to scare you — it's to give you something specific to work with.",
  },
];

const IntroSection = () => {
  return (
    <>
      <section className="bg-background px-6 pt-20 md:pt-28 pb-6 md:pb-8">
        <div className="mx-auto max-w-[680px] flex flex-col gap-8">
          {blocks.map((block) => (
            <div key={block.label}>
              <p
                className="font-mono uppercase tracking-[0.15em] text-primary mb-3"
                style={{ fontSize: "11px" }}
              >
                {block.label}
              </p>
              <p className="text-base leading-[1.75] text-muted-foreground">
                {block.body}
              </p>
            </div>
          ))}
        </div>
      </section>
      <div className="mx-auto max-w-[680px] px-6">
        <hr className="border-t border-border" style={{ borderColor: "#DDD9D3" }} />
      </div>
    </>
  );
};

export default IntroSection;
