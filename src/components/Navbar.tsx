import { Button } from "@/components/ui/button";
import { Search, Menu } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import futDataLogo from "@/assets/png_fut_data.png";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="nav-glass sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img
            src={futDataLogo}
            alt="FutData Logo"
            className="w-24 h-24 object-contain drop-shadow-md"
          />
        </Link>

        {/* Center nav links - desktop */}
        <div className="hidden md:flex items-center gap-1">
          {([{ label: "Ao Vivo", to: "/ao-vivo" }, { label: "Sugestões", to: "/" }] as const).map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className={`px-4 py-2 text-sm font-medium transition-colors duration-200 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <button className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary">
            <Search className="w-5 h-5" />
          </button>
          <button
            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-border px-4 py-3 space-y-1">
          {([{ label: "Ao Vivo", to: "/ao-vivo" }, { label: "Sugestões", to: "/" }] as const).map((item) => (
            <Link
              key={item.label}
              to={item.to}
              onClick={() => setMenuOpen(false)}
              className="block w-full text-left px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
