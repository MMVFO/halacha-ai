"use client";

import dynamic from "next/dynamic";
import KeyboardShortcuts from "./KeyboardShortcuts";
import ShortcutHelp from "./ShortcutHelp";
import ServiceWorkerRegistration from "./ServiceWorkerRegistration";

const CommandPalette = dynamic(() => import("./CommandPalette"), {
  ssr: false,
});
const AIPanel = dynamic(
  () => import("./AIPanel").then((mod) => mod.AIPanel),
  { ssr: false }
);
const DictionaryPopover = dynamic(
  () => import("./DictionaryPopover").then((mod) => mod.DictionaryPopover),
  { ssr: false }
);

export default function ClientShell() {
  return (
    <>
      <KeyboardShortcuts />
      <ShortcutHelp />
      <CommandPalette />
      <AIPanel />
      <DictionaryPopover />
      <ServiceWorkerRegistration />
    </>
  );
}
