import { Button } from "@/components/ui/button";
import { Search, Menu, TrendingUp } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="nav-glass sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            <span className="text-foreground">Ajuda</span>{" "}
            <span className="text-primary">da Sorte</span>
          </span>
        </Link>

        {/* Center nav links - desktop */}
        <div className="hidden md:flex items-center gap-1">
          {([{ label: "Análises", to: "/analises" }, { label: "Ao Vivo", to: "/" }, { label: "Sugestões", to: "/" }] as const).map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className={`px-4 py-2 text-sm font-medium transition-colors duration-200 rounded-lg ${location.pathname === item.to && item.label === "Análises" ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}
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
          {([{ label: "Análises", to: "/analises" }, { label: "Ao Vivo", to: "/" }, { label: "Sugestões", to: "/" }] as const).map((item) => (
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
