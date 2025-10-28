import type { Studio } from '../types';
import { GENRES, PLATFORMS, TEAM_SIZES, LOCATIONS } from '../constants';

export const ALL_STUDIOS: Studio[] = Array.from({ length: 9 }).map((_, i) => ({
  id: i + 1,
  name: `Studio ${String.fromCharCode(65 + (i % 26))}`,
  tagline: [
    'Crafting memorable pixel worlds',
    'Atmospheric adventures with heart',
    'Systems-first strategy and sim',
  ][i % 3],
  genre: GENRES[i % GENRES.length],
  platform: PLATFORMS[i % PLATFORMS.length],
  teamSize: TEAM_SIZES[i % TEAM_SIZES.length],
  location: LOCATIONS[(i + 1) % LOCATIONS.length],
  hue: (i * 37) % 360,
}));
