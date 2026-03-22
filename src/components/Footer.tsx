const Footer = () => {
  return (
    <footer className="border-t border-border mt-12">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {[
            { title: "Esportes", links: ["Futebol", "Basquete", "Tênis", "E-Sports"] },
            { title: "Cassino", links: ["Slots", "Ao Vivo", "Roleta", "Blackjack"] },
            { title: "Suporte", links: ["FAQ", "Chat ao Vivo", "E-mail", "Termos"] },
            { title: "Sobre", links: ["Quem Somos", "Jogo Responsável", "Privacidade", "Contato"] },
          ].map((section) => (
            <div key={section.title}>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-border pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
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
