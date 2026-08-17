---
title: "Adding Web Haptics to my Portfolio"
date: "2026-03-05"
summary: "How I integrated tactile feedback into my portfolio using the web-haptics library and improved the feel of interactions on mobile devices."
tags: [nextjs, ux, haptics, portfolio]
coverImage: https://i.ibb.co/PzFBQHpq/gradii-1200x630-1.png
readtime: 8
prompt: Read https://rohitlodhi.in/web-haptics.md , I want to ask questions about it
introductionText: "Modern interfaces are visual, but the best mobile experiences also feel physical. In this post I explain how I added subtle haptic feedback to my portfolio using the web-haptics library and how it improves interaction feedback."
---

## Why I Added Haptics to My Portfolio

<p>
Most websites rely entirely on <b>visual feedback</b> — color changes, animations, or transitions. But modern mobile devices allow us to add <b>tactile feedback</b> using vibration.
</p>

<p>
When you press a button in a good mobile app, you often feel a small vibration confirming the action. That tiny detail makes the interface feel <b>responsive and physical</b>.
</p>

<p>
While working on my portfolio, I wanted interactions like:
</p>

<List>
    <li>button clicks</li>
    <li>toggles</li>
    <li>form submissions</li>
    <li>picker selections</li>
</List>

<p>
to feel <b>more alive on mobile devices</b>. So I experimented with the <b><code>web-haptics</code></b> library.
</p>

## What is Web Haptics?

<p>
<code>web-haptics</code> is a lightweight library that adds <b>haptic feedback to web apps</b> using the <b>Web Vibration API</b>.
</p>

<p>
Key things I liked about it:
</p>

<List>
    <li><b>Zero dependencies</b></li>
    <li><b>Very small</b></li>
    <li><b>Works across frameworks</b></li>
    <li><b>Gracefully does nothing on unsupported devices</b></li>
</List>

<p>
If a device does not support vibration (like most desktops), the library simply <b>no-ops silently</b>. That means no special feature detection is needed.
</p>

<p>
Installation is simple:
</p>

<Terminal pkg="web-haptics" />

<p>
Additionally for agents you can get the skills file from <a href="https://github.com/lochie/web-haptics/blob/main/SKILL.md">the library's SKILL.md</a>.
</p>

## Setting Up Web Haptics in a Next.js / React Project

<p>
Since my portfolio is built with Next.js and React, I used the React integration provided by the library.
</p>

<p>
The library provides a hook called <code>useWebHaptics</code>, which makes it easy to trigger vibrations from React components.
</p>

<p>
However, I wanted a small abstraction layer so I could attach additional UI feedback whenever haptics are triggered. For example:
</p>

<List>
    <li>shake the favicon</li>
    <li>enable debug vibration on desktop</li>
    <li>keep all haptic logic in one place</li>
</List>

<p>
So I created a custom hook called <code>useHaptics</code>.
</p>

## Creating a Custom Haptics Hook

<p>
This hook wraps the library and adds a little extra behavior.
</p>

```typescript
import { useCallback } from "react";
import { useWebHaptics } from "web-haptics/react";
import type { HapticInput, TriggerOptions } from "web-haptics";

export const useHaptics = () => {

  const { trigger } = useWebHaptics({ debug : true });

  const triggerWithShake = useCallback(
    (input?: HapticInput, options?: TriggerOptions) => {
      return trigger(input, options);
    },
    [trigger],
  );

  return {
    trigger: triggerWithShake,
  };
};
```

<p>
This gives me a single unified way to trigger haptics anywhere in the app. Now any component can simply call:
</p>

```typescript
const { trigger } = useHaptics()
```

## Using Haptics in a Component

<p>
Here is a simple example of triggering haptic feedback when a button is clicked.
</p>

```tsx
"use client"

import { useHaptics } from "@/hooks/useHaptics"

export default function DemoButton() {
  const { trigger } = useHaptics()

  return (
    <button
      onClick={() => trigger({ duration: 20 })}
      className="px-4 py-2 rounded-md bg-black text-white"
    >
      Click Me
    </button>
  )
}
```

<p>
When the button is pressed on a supported device, the phone produces a short vibration. This tiny feedback makes interactions feel much more responsive.
</p>

## Creating Custom Haptic Patterns

<p>
One of the most interesting features of the library is that you can define custom vibration patterns. You can experiment with patterns using <a href="https://haptics.lochie.me/">the online playground</a>.
</p>

<p>
For example, I created a small error vibration pattern like this:
</p>

```typescript
trigger([
  { duration: 40 },
  { delay: 40, duration: 40 },
  { delay: 40, duration: 40 },
], { intensity: 0.9 })
```

<p>
This produces a quick triple vibration, which feels similar to an error or failed action in many mobile apps. Small details like this help communicate state and feedback to the user without relying purely on visuals.
</p>

## Conclusion

<p>
Adding haptics to my portfolio was a small experiment, but it made the interface feel much more tactile and responsive on mobile devices. Instead of relying only on visual animations, the interface now physically responds to user actions.
</p>

<p>
The <code>web-haptics</code> library made this extremely easy to implement, and with a small custom hook I was able to integrate it cleanly into my React components.
</p>

<p>
If you are building mobile-first web experiences, subtle haptic feedback can significantly improve how interactions feel.
</p>

<Callout>
Sometimes the best UI improvements are the ones users can feel, not just see.
</Callout>
