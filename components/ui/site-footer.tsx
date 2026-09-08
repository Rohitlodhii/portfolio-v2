"use client";

import { useEffect, useState } from "react";
import { Kalam } from "next/font/google";

const kalam = Kalam({
  subsets: ["latin", "devanagari"],
  weight: ["400", "700"],
  variable: "--font-kalam",
});

function formatKolkataTime(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export function SiteFooter() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => setTime(formatKolkataTime(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <footer className="mx-auto flex w-full max-w-xl items-center justify-between px-4 py-8">
      <span className="text-xs text-muted-foreground tabular-nums">
        {time ? `IST — ${time}` : "IST — --:--"}
      </span>
      <span className="flex items-center gap-1.5">
        <img src="/icon.ico" alt="" width={16} height={16} className="size-4 rounded-sm object-contain opacity-80" />
        <span className={`${kalam.className} text-[15px] font-normal tracking-wide text-foreground`}>रोहित लोधी</span>
      </span>
    </footer>
  );
}
