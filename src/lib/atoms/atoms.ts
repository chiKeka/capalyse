import { atom } from 'jotai';

import { atomWithStorage } from 'jotai/utils';
import { User } from '../auth-client';

export const authAtom = atomWithStorage<User | undefined>(
  'auth',
  undefined,
  undefined,
  {
    getOnInit: true,
  }
);
export const onboardingStepAtom = atom(1);
export const notificationAtom = atom(0);
export const messagesAtom = atom(0);
