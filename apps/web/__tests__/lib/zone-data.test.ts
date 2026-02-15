import { describe, it, expect } from 'vitest';
import {
  DB_ZONE_TO_UI,
  UI_ZONE_TO_DB,
  ZONE_METADATA,
  ZONE_COLORS,
  ZONE_SLUG_MAP,
  ZONE_DISPLAY_NAMES,
  getPlaceholderImage,
  DEFAULT_ATHLETE_IMAGES,
  type ZoneCode,
} from '@/lib/data/zone-data';

const ALL_ZONE_CODES: ZoneCode[] = [
  'MIDWEST',
  'NORTHEAST',
  'PLAINS',
  'SOUTHEAST',
  'SOUTHWEST',
  'WEST',
];

describe('zone-data', () => {
  describe('DB_ZONE_TO_UI', () => {
    it('maps all 6 DB zone names', () => {
      const dbZones = ['West', 'Southwest', 'Midwest', 'Southeast', 'Northeast', 'Mid-Atlantic'];
      for (const zone of dbZones) {
        expect(DB_ZONE_TO_UI[zone]).toBeDefined();
      }
    });

    it('maps Mid-Atlantic to NORTHEAST', () => {
      expect(DB_ZONE_TO_UI['Mid-Atlantic']).toBe('NORTHEAST');
    });
  });

  describe('UI_ZONE_TO_DB', () => {
    it('NORTHEAST includes both Northeast and Mid-Atlantic', () => {
      expect(UI_ZONE_TO_DB.NORTHEAST).toEqual(['Northeast', 'Mid-Atlantic']);
    });

    it('PLAINS has empty array (no DB equivalent)', () => {
      expect(UI_ZONE_TO_DB.PLAINS).toEqual([]);
    });
  });

  describe('ZONE_METADATA', () => {
    it.each(ALL_ZONE_CODES)(
      '%s has states, metro_areas, and description',
      (zone) => {
        const meta = ZONE_METADATA[zone];
        expect(meta).toBeDefined();
        expect(Array.isArray(meta.states)).toBe(true);
        expect(meta.states.length).toBeGreaterThan(0);
        expect(Array.isArray(meta.metro_areas)).toBe(true);
        expect(meta.metro_areas.length).toBeGreaterThan(0);
        expect(typeof meta.description).toBe('string');
        expect(meta.description.length).toBeGreaterThan(0);
      }
    );
  });

  describe('ZONE_COLORS', () => {
    it.each(ALL_ZONE_CODES)('%s has primary, bg, border, text', (zone) => {
      const colors = ZONE_COLORS[zone];
      expect(colors).toBeDefined();
      expect(colors.primary).toBeTruthy();
      expect(colors.bg).toBeTruthy();
      expect(colors.border).toBeTruthy();
      expect(colors.text).toBeTruthy();
    });
  });

  describe('getPlaceholderImage', () => {
    it('returns a string from DEFAULT_ATHLETE_IMAGES', () => {
      const img = getPlaceholderImage('athlete-001');
      expect(typeof img).toBe('string');
      expect(DEFAULT_ATHLETE_IMAGES).toContain(img);
    });

    it('is deterministic — same input yields same output', () => {
      const first = getPlaceholderImage('some-id-xyz');
      const second = getPlaceholderImage('some-id-xyz');
      expect(first).toBe(second);
    });
  });

  describe('ZONE_SLUG_MAP', () => {
    it('has all 6 lowercase slug entries', () => {
      const slugs = ['midwest', 'northeast', 'plains', 'southeast', 'southwest', 'west'];
      for (const slug of slugs) {
        expect(ZONE_SLUG_MAP[slug]).toBeDefined();
      }
      expect(Object.keys(ZONE_SLUG_MAP)).toHaveLength(6);
    });
  });

  describe('ZONE_DISPLAY_NAMES', () => {
    it('has all 6 zone codes', () => {
      for (const code of ALL_ZONE_CODES) {
        expect(ZONE_DISPLAY_NAMES[code]).toBeDefined();
        expect(typeof ZONE_DISPLAY_NAMES[code]).toBe('string');
      }
      expect(Object.keys(ZONE_DISPLAY_NAMES)).toHaveLength(6);
    });
  });
});
