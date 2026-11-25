"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
export function SiteHeader() {
  const pathname = usePathname(), [open, setOpen] = useState(false), toggle = useRef<HTMLButtonElement>(null);
  return <header className="site-header" onKeyDown={e => { if (e.key === "Escape" && open) { setOpen(false); toggle.current?.focus(); } }}>
    <a className="site-skip" href={pathname === "/create" ? "#campaign-gallery" : "#main"}>Skip to content</a>
    <Link className="site-logo" href="/" aria-label="Chowk home" onClick={() => setOpen(false)}><Image src="/brand/chowk-logo.svg" alt="Chowk" width={137} height={36} unoptimized priority /></Link>
    <button ref={toggle} className="site-menu-button" aria-expanded={open} aria-controls="site-navigation" onClick={() => setOpen(!open)}>Menu <span aria-hidden="true">{open ? "−" : "+"}</span></button>
    <nav id="site-navigation" className={`site-navigation ${open ? "is-open" : ""}`} aria-label="Main navigation">{[["/create", "Create"], ["/explore", "Explore"], ["/docs", "Docs"]].map(([href, name]) => <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined} onClick={() => setOpen(false)}>{name}</Link>)}</nav>
    <Link className="site-button site-primary header-create" href="/create" onClick={() => setOpen(false)}>Start creating <span aria-hidden="true">↗</span></Link>
  </header>;
}
