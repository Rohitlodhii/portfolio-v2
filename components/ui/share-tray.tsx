"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { IconQrcode, IconDownload, IconCopy, IconCheck, IconX } from "@tabler/icons-react"

const PROFILE_URL = "https://rohitlodhi.in"

export function ShareProfileButton() {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  useEffect(() => {
    if (!copied) return
    const t = setTimeout(() => setCopied(false), 1800)
    return () => clearTimeout(t)
  }, [copied])

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(PROFILE_URL)
      setCopied(true)
    } catch {
      const el = document.createElement("textarea")
      el.value = PROFILE_URL
      document.body.appendChild(el)
      el.select()
      document.execCommand("copy")
      el.remove()
      setCopied(true)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex bg-secondary px-2 py-1 rounded-xl gap-1 items-center cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-ring/50 transition-colors hover:bg-secondary/80"
      >
        <IconQrcode className="size-4" />
        <span>Share profile</span>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              aria-hidden
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-[2px]"
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Share profile"
              initial={{ y: "100%" }}
              animate={{ y: "0%" }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 420, damping: 36, mass: 0.8 }}
              className="fixed inset-x-0 bottom-0 z-[70] flex justify-center px-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-4 pointer-events-none"
            >
              <div className="pointer-events-auto w-full max-w-sm rounded-[28px] border border-white/20 dark:border-white/10 bg-white/80 dark:bg-zinc-900/70 backdrop-blur-md shadow-[0_16px_48px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)] overflow-hidden">
                <div className="flex justify-center pt-3 pb-1">
                  <div className="h-1 w-9 rounded-full bg-foreground/15" />
                </div>

                <div className="flex items-center justify-between px-4 pt-1 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex size-8 items-center justify-center rounded-full bg-secondary border border-black/5 dark:border-white/10">
                      <IconQrcode className="size-4 text-muted-foreground" />
                    </span>
                    <div className="flex flex-col leading-none">
                      <span className="text-sm font-medium">Share profile</span>
                      <span className="text-xs text-muted-foreground truncate max-w-[18ch]">{PROFILE_URL}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="Close"
                    className="size-8 rounded-full bg-secondary hover:bg-secondary/80 border border-black/5 dark:border-white/10 flex items-center justify-center transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                  >
                    <IconX className="size-4 text-muted-foreground" />
                  </button>
                </div>

                <div className="px-4 pb-4">
                  <div className="rounded-2xl bg-white p-3 shadow-sm border border-black/5 flex items-center justify-center">
                    <Image
                      src="/qr.png"
                      alt="QR code for profile"
                      width={320}
                      height={320}
                      className="w-full max-w-[240px] h-auto aspect-square object-contain rounded-xl"
                      priority
                    />
                  </div>
                </div>

                <div className="px-4 pb-4 flex flex-col gap-2">
                  <a
                    href="/qr.png"
                    download="rohitlodhii-qr.png"
                    className="w-full flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground py-3 text-sm font-medium hover:bg-primary/90 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                  >
                    <IconDownload className="size-4" />
                    Download QR
                  </a>
                  <button
                    type="button"
                    onClick={copyLink}
                    className="w-full flex items-center justify-center gap-2 rounded-full bg-secondary border border-black/5 dark:border-white/10 py-3 text-sm font-medium hover:bg-secondary/80 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                  >
                    {copied ? <IconCheck className="size-4 text-green-600" /> : <IconCopy className="size-4" />}
                    {copied ? "Copied" : "Copy link"}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
