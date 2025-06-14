import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function cnSimple(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}