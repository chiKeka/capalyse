import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

/**
 * UI State atoms — shared across the application.
 * Core auth/notification atoms live in `@/lib/atoms/atoms.ts`.
 */

/** Whether the sidebar is collapsed (persisted across sessions) */
export const sidebarCollapsedAtom = atomWithStorage<boolean>("sidebar-collapsed", false);

/** Active colour-scheme preference (persisted) */
export const themeAtom = atomWithStorage<"light" | "dark" | "system">("theme", "system");

/** Badge count for unread notifications (runtime only) */
export const notificationCountAtom = atom<number>(0);

/** Global search query string (runtime only) */
export const globalSearchAtom = atom<string>("");

/** User-selected currency code (persisted) */
export const selectedCurrencyAtom = atomWithStorage<string>("selected-currency", "USD");
