"use client";
import { StreetlampIcon } from "@/components/StreetlampIcon";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Map, CirclePlus, FileText } from "lucide-react";

export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const links = [
    { href: "/", label: "Home", icon: Home },
    { href: "/map", label: "Map", icon: Map },
    { href: "/report", label: "Report", icon: CirclePlus },
    { href: "/reports", label: "My reports", icon: FileText },
  ];
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <header className="site-header">
        <Link className="brand" href="/" aria-label="Streetlight Check home">
          <span className="brand-icon">
            <StreetlampIcon strokeWidth={1.8} />
          </span>
          <span>Streetlight Check</span>
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              aria-current={path === href ? "page" : undefined}
            >
              {label}
            </Link>
          ))}
        </nav>
      </header>
      {children}
      <footer className="site-footer">
        <span>Streetlight Check · Houston, TX</span>
        <span>Independent community demo</span>
      </footer>
      <nav className="bottom-nav" aria-label="Mobile navigation">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            aria-current={path === href ? "page" : undefined}
          >
            <Icon size={25} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
