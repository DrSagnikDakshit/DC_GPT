import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

export function Navigation() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/outfits", label: "Couture" },
    { href: "/wardrobe", label: "Wardrobe" },
    { href: "/health", label: "Health" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-border/40">
      <div className="max-w-screen-xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-serif font-bold text-2xl tracking-tight text-[#0B0B0B]">D-Couture</span>
        </Link>

        <nav className="flex items-center gap-8">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href} className={cn(
                "relative py-2 text-sm font-medium transition-colors hover:text-foreground",
                isActive 
                  ? "text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-foreground" 
                  : "text-muted-foreground"
              )}>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
