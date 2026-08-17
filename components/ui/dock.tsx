"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useAnimation } from "motion/react";
import { IconHome, IconBook } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useLiquidGlass } from "@/lib/glass/use-liquid-glass";
import { LiquidGlassFilter } from "@/components/ui/liquid-glass-filter";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  match: (pathname: string) => boolean;
}

export function Dock() {
  const pathname = usePathname();
  const dockControls = useAnimation();

  // The filter is derived from the rendered box, so adding nav items needs no
  // matching size constant here.
  const {
    ref: glassRef,
    style: glassStyle,
    filterId,
    filterProps,
    press: pressGlass,
  } = useLiquidGlass<HTMLDivElement>({
    depth: 8,
    blur: 2,
    strength: 75,
    chromaticAberration: 3,
  });

  const navItems: NavItem[] = [
    {
      label: "Home",
      href: "/",
      icon: IconHome,
      match: (path) => path === "/",
    },
    {
      label: "Blogs",
      href: "/blogs",
      icon: IconBook,
      match: (path) => path.startsWith("/blogs"),
    },
  ];

  const handleTabClick = () => {
    pressGlass();

    // Instant click scale response followed by spring return
    dockControls.set({ scale: 0.97 });
    dockControls.start({
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 280,
        damping: 16,
        mass: 0.7,
      },
    });
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      {filterProps && <LiquidGlassFilter id={filterId} {...filterProps} />}
      <motion.div
        ref={glassRef}
        animate={dockControls}
        className="relative flex items-center bg-white/10 dark:bg-black/35 border border-white/20 dark:border-white/10 rounded-full p-1 shadow-[inset_1px_1px_1px_rgba(255,255,255,0.6),inset_-1px_-1px_1px_rgba(255,255,255,0.6),0_12px_40px_rgba(0,0,0,0.12)]"
        style={{
          ...glassStyle,
          transformOrigin: "center bottom",
        }}
      >
        {/* Navigation Items */}
        <div className="flex items-center gap-2">
          {navItems.map((item) => {
            const isActive = item.match(pathname);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onPointerDown={handleTabClick}
                className="group relative select-none outline-none touch-manipulation"
              >
                <motion.div
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.94 }}
                  transition={{ type: "spring", stiffness: 450, damping: 16 }}
                  className={cn(
                    "relative size-10 rounded-full flex items-center justify-center transition-all cursor-pointer select-none",
                    isActive
                      ? "bg-white/10 dark:bg-white/5 border border-black/10 dark:border-white/10 border-t-white/40 dark:border-t-white/20 border-b-black/20 dark:border-b-black/40 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_4px_12px_rgba(0,0,0,0.08)]"
                      : "text-muted-foreground hover:text-foreground border border-transparent"
                  )}
                >
                  <motion.div
                    animate={{ scale: isActive ? 1.15 : 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 12 }}
                  >
                    <Icon
                      className={cn(
                        "size-5",
                        isActive ? "text-primary scale-110" : "group-hover:text-foreground"
                      )}
                    />
                  </motion.div>
                </motion.div>
                {/* Subtle tooltip on hover */}
                <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[10px] px-2 py-0.5 rounded border border-border opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-sm whitespace-nowrap">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
