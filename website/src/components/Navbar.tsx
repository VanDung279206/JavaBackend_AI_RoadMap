"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Coffee, Menu, Search, X } from "lucide-react";
import AuthButton from "@/components/AuthButton";
import SearchCommand from "@/components/command/SearchCommand";

const links = [
  { href: "/today", label: "Hôm nay" },
  { href: "/roadmap", label: "Lộ trình" },
  { href: "/docs", label: "Bài tập" },
  { href: "/materials", label: "Tài liệu" },
  { href: "/projects", label: "Dự án" },
  { href: "/leaderboard", label: "Xếp hạng" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const openSearch = () => {
    setMenuOpen(false);
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }));
  };

  const navLinks = (mobile = false) => links.map((link) => {
    const active = pathname === link.href || (link.href !== "/" && pathname.startsWith(`${link.href}/`));
    return (
      <Link
        key={link.href}
        href={link.href}
        className={`nav-link${active ? " nav-link-active" : ""}`}
        aria-current={active ? "page" : undefined}
        onClick={() => mobile && setMenuOpen(false)}
      >
        {link.label}
      </Link>
    );
  });

  return (
    <>
      <SearchCommand />
      <nav className="site-nav" aria-label="Điều hướng chính">
        <div className="nav-inner">
          <Link href="/" className="brand-link" onClick={() => setMenuOpen(false)}>
            <span className="brand-mark"><Coffee size={17} strokeWidth={2.2} aria-hidden="true" /></span>
            <span>Java Backend</span>
          </Link>

          <div className="nav-links">{navLinks()}</div>

          <div className="nav-actions">
            <button className="search-trigger" onClick={openSearch} aria-label="Tìm kiếm" title="Tìm kiếm (Ctrl K)">
              <Search size={15} aria-hidden="true" />
              <span className="search-trigger-label">Tìm kiếm</span>
              <kbd>Ctrl K</kbd>
            </button>
            <AuthButton />
            <button
              className="mobile-nav-trigger"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={menuOpen ? "Đóng menu" : "Mở menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
        <div className="mobile-nav-panel" id="mobile-navigation" hidden={!menuOpen}>
          {navLinks(true)}
        </div>
      </nav>
    </>
  );
}

