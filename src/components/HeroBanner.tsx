import { Button } from "@/components/ui/button";
import heroBanner from "@/assets/hero-banner.jpg";

const HeroBanner = () => {
  return (
    <section className="relative overflow-hidden rounded-2xl mx-4 mt-4">
      <img
        src={heroBanner}
        alt="Promoção de boas-vindas"
        className="absolute inset-0 w-full h-full object-cover"
        loading="eager"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-transparent" />
      <div className="relative z-10 px-8 py-12 md:py-16 max-w-lg">
        <span className="inline-block text-xs font-semibold tracking-widest uppercase text-primary mb-3">
          Boas-vindas
        </span>
        <h1
          className="text-3xl md:text-4xl font-extrabold text-foreground leading-tight mb-4"
          style={{ lineHeight: 1.1 }}
        >
          Ganhe até R$500 no primeiro depósito
        </h1>
        <p className="text-muted-foreground text-sm md:text-base mb-6 max-w-md" style={{ textWrap: "pretty" }}>
          Crie sua conta, faça seu primeiro depósito e receba um bônus de 100% para começar a apostar.
        </p>
        <Button variant="hero" size="lg">
          Aproveitar agora
        </Button>
      </div>
    </section>
  );
};

export default HeroBanner;
