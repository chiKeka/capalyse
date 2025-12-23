export function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ChatParticipant } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats an address string to show the first 7 and last 4 characters with ellipses
 * @param address The address string to format
 * @returns Formatted address string (e.g., "0x12345...6789")
 */
export function formatAddress(address: string): string {
  if (!address || address.length < 11) return address;
  return `${address.slice(0, 7)}...${address.slice(-4)}`;
}

/**
 * Adds commas to a number for better readability
 * @param num The number to format
 * @returns Formatted number string with commas
 */
export function addCommasToNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export const getChatHeader = (currentUserId: string, participants: ChatParticipant[]) => {
  const users = participants?.filter(
    (participant) => participant.id !== currentUserId
  );

  if (!users || users.length === 0) return null;

  const getFirstName = (fullName: string) => fullName?.split?.(' ')?.[0];

  if (users.length === 1) {
    return {name:users?.[0].name, img: users?.[0]?.image}; // full name
  }

  if (users.length === 2) {
    return {
      name:`${getFirstName(users[0].name)} & ${getFirstName(users[1].name)}`, 
      img: users?.[0]?.image
    };
  }

  // More than 2 users
  const first = getFirstName(users[0].name);
  const second = getFirstName(users[1].name);
  const others = users.length - 2;

  return {
    name:`${first}, ${second} & ${others} others}`, img: users?.[0]?.image}
};