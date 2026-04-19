import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden px-6 py-28 md:py-36 lg:py-44">
      {/* Subtle decorative elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-accent/20 blur-3xl -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-accent/15 blur-3xl translate-y-1/2 -translate-x-1/3" />

      <div className="relative mx-auto max-w-4xl text-center">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary mb-8 font-mono">
          Recursio Lab · Defensible Zone™
        </p>

        <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-semibold tracking-tight text-foreground mb-6">
          Is your career{" "}
          <span className="italic text-primary">defensible</span>{" "}
          against AI?
        </h1>

        <p className="mx-auto max-w-2xl text-muted-foreground text-lg md:text-xl mb-12 leading-relaxed">
          Defensible Zone™ provides rigorous, data-driven assessments of how artificial intelligence 
          will reshape your profession — and what you can do about it.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" className="text-lg px-8 py-6 rounded-xl font-medium shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all">
            Assess Your Career
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button variant="outline" size="lg" className="text-lg px-8 py-6 rounded-xl font-medium border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground transition-all">
            View Methodology
          </Button>
        </div>

        <p className="mt-10 text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground font-mono text-center max-w-3xl mx-auto">
          Built by a 20-year veteran of Google, Meta, Oracle &amp; Salesforce · Grounded in original research across 450 professionals
        </p>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
          <div className="rounded-xl bg-secondary/60 px-6 py-5 text-center">
            <p className="text-4xl md:text-5xl font-bold text-primary mb-1">65%</p>
            <p className="text-sm text-muted-foreground">of professionals have no clear first step on AI</p>
          </div>
          <div className="rounded-xl bg-secondary/60 px-6 py-5 text-center">
            <p className="text-4xl md:text-5xl font-bold text-primary mb-1">56.5/100</p>
            <p className="text-sm text-muted-foreground">average self-assessed AI risk clarity</p>
          </div>
          <div className="rounded-xl bg-secondary/60 px-6 py-5 text-center">
            <p className="text-4xl md:text-5xl font-bold text-primary mb-1">30%</p>
            <p className="text-sm text-muted-foreground">are actively repositioning — the rest are waiting</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
