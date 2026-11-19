import { describe, expect, test } from 'bun:test';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { CAMPUS_BUILDINGS } from '../../src/data/campus-map';
import {
  computePanViewBox,
  computePinchViewBox,
  computeZoomViewBox,
  DEFAULT_MAP_VIEWBOX,
  focusBuildingViewBox,
  searchCampusLocations,
} from '../../src/lib/map-search';

const ARTICLES_DIR = resolve(import.meta.dir, '..', '..', 'src', 'content', 'articles');

describe('TC-UNIT-06: Campus map search, directory integrity, and viewBox math', () => {
  test('matches indoor locations cleanly and identifies their parent building', () => {
    const cictMatches = searchCampusLocations(CAMPUS_BUILDINGS, 'CICT');
    expect(cictMatches.length).toBeGreaterThan(0);
    expect(cictMatches[0]?.buildingId).toBe('pimentel-hall');
    expect(cictMatches[0]?.buildingName).toBe('Pimentel Hall');

    const ccjeMatches = searchCampusLocations(CAMPUS_BUILDINGS, 'CCJE');
    expect(ccjeMatches.length).toBeGreaterThan(0);
    expect(ccjeMatches[0]?.buildingId).toBe('chocolate-building');
    expect(ccjeMatches[0]?.buildingName).toBe('Chocolate Building');

    const kaEkekMatches = searchCampusLocations(CAMPUS_BUILDINGS, 'Ka Ekek');
    expect(kaEkekMatches.length).toBeGreaterThan(0);
    expect(kaEkekMatches[0]?.buildingId).toBe('con-canteen');
    expect(kaEkekMatches[0]?.buildingName).toBe('CON Canteen');
  });

  test('filters by location category without throwing on special regex characters', () => {
    const emptyWithSpecialChars = searchCampusLocations(
      CAMPUS_BUILDINGS,
      '([cict?.*])',
      'academic'
    );
    expect(Array.isArray(emptyWithSpecialChars)).toBe(true);
    expect(emptyWithSpecialChars).toHaveLength(0);

    const foodLocations = searchCampusLocations(CAMPUS_BUILDINGS, '', 'food-housing');
    expect(foodLocations.length).toBeGreaterThanOrEqual(2);
    expect(foodLocations.every((m) => m.category === 'food-housing')).toBe(true);
  });

  test('every location articleSlug in CAMPUS_BUILDINGS points to an existing article markdown file', () => {
    const missing: string[] = [];
    for (const building of CAMPUS_BUILDINGS) {
      for (const loc of building.locations) {
        if (!loc.articleSlug) continue;
        const filePath = resolve(ARTICLES_DIR, `${loc.articleSlug}.md`);
        if (!existsSync(filePath)) {
          missing.push(`${building.id}/${loc.id} -> ${loc.articleSlug}.md`);
        }
      }
    }
    expect(missing).toEqual([]);
  });

  test('viewBox zoom and building focus stay clamped within campus canvas bounds', () => {
    const zoomedIn = computeZoomViewBox(DEFAULT_MAP_VIEWBOX, 2);
    expect(zoomedIn.width).toBe(500);
    expect(zoomedIn.height).toBe(425);

    const overZoomedOut = computeZoomViewBox(DEFAULT_MAP_VIEWBOX, 0.2);
    expect(overZoomedOut).toEqual(DEFAULT_MAP_VIEWBOX);

    const focused = focusBuildingViewBox({ center: { x: 10, y: 10 } }, 480);
    expect(focused.x).toBe(0);
    expect(focused.y).toBe(0);
    expect(focused.width).toBe(480);
  });

  test('computePinchViewBox and computePanViewBox zoom around focal midpoint and pan within bounds', () => {
    const svgRect = { left: 0, top: 0, width: 1000, height: 850 };
    const pinchedOut = computePinchViewBox(
      DEFAULT_MAP_VIEWBOX,
      svgRect,
      { x: 400, y: 425 },
      { x: 600, y: 425 },
      { x: 300, y: 425 },
      { x: 700, y: 425 }
    );
    expect(pinchedOut.width).toBe(500);
    expect(pinchedOut.x).toBe(250);
    expect(pinchedOut.y).toBe(212.5);

    const panned = computePanViewBox(pinchedOut, -100, -50, svgRect);
    expect(panned.x).toBe(300);
    expect(panned.y).toBe(237.5);
  });
});
