"use client";

import { useEffect } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { authAtom } from "@/lib/atoms/atoms";
import { useSession } from "@/lib/auth-client";

/**
 * Keeps the local `authAtom` (persisted in localStorage) in sync with the
 * live better-auth session.  Whenever the session user object changes (e.g.
 * role updated server-side), this hook pushes the fresh data into the atom
 * so every consumer in the app sees the latest values.
 *
 * Mount this hook in any layout / component that should stay up-to-date.
 */
export function useAuthSync() {
  const { data: session, isPending } = useSession();
  const currentAuth = useAtomValue(authAtom);
  const setAuth = useSetAtom(authAtom);

  useEffect(() => {
    if (isPending || !session?.user) return;

    // Compare key fields – avoids unnecessary writes / re-renders
    const sessionUser = session.user;
    const isDifferent =
      currentAuth?.role !== sessionUser.role ||
      currentAuth?.email !== sessionUser.email ||
      currentAuth?.name !== sessionUser.name ||
      currentAuth?.emailVerified !== sessionUser.emailVerified ||
      currentAuth?.image !== sessionUser.image;

    if (isDifferent) {
      setAuth(sessionUser);
    }
  }, [session, isPending, currentAuth, setAuth]);
}
