import { atom } from "jotai";

import { atomWithStorage } from "jotai/utils";

export const authAtom = atomWithStorage("auth", null, undefined, {
  getOnInit: true,
});
export const onboardingStepAtom = atom(1);
