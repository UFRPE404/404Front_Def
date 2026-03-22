
import futDataLogo from "@/assets/png_fut_data.png";

const Footer = () => {
  return (
    <footer className="border-t border-border mt-12">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center gap-3">
          <img
            src={futDataLogo}
            alt="FutData Logo"
            className="w-24 h-24 object-contain rounded shadow-lg"
            style={{ background: "#ffffff00" }}
          />
          <p className="text-xs text-muted-foreground text-center mt-2">
            18+ | Jogue com responsabilidade. © 2026 FutData. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
