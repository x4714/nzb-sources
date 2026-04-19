import { writable } from 'svelte/store';

export type LanguageCode = 'any' | string;
export type NumericLimitMode = 'any' | 'min' | 'unlimited';

export interface FiltersState {
  apiMode: NumericLimitMode;
  minApi: number | null;
  nzbMode: NumericLimitMode;
  minNzb: number | null;
  language: LanguageCode; // 'any' or 2-letter codes (EN/DE/... from data)
  lifetimeOnly: boolean;
  freeOnly: boolean;
  supportsCrypto: boolean;
}

export const defaultFilters: FiltersState = {
  apiMode: 'any',
  minApi: null,
  nzbMode: 'any',
  minNzb: null,
  language: 'any',
  lifetimeOnly: false,
  freeOnly: false,
  supportsCrypto: false,
};

export const filters = writable<FiltersState>({ ...defaultFilters });

export function resetFilters() {
  filters.set({ ...defaultFilters });
}
