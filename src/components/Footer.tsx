const Footer = () => {
  return (
    <footer className="border-t border-border mt-12">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-extrabold text-xs">A</span>
            </div>
            <span className="text-sm font-semibold">
              <span className="text-foreground">Ajuda</span>{" "}
              <span className="text-primary">da Sorte</span>
            </span>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            18+ | Jogue com responsabilidade. © 2026 Ajuda da Sorte. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
