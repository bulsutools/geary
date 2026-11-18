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
    const registrarMatches = searchCampusLocations(CAMPUS_BUILDINGS, 'Registrar');
    expect(registrarMatches.length).toBeGreaterThan(0);
    expect(registrarMatches[0]?.buildingId).toBe('flores-hall');
    expect(registrarMatches[0]?.buildingName).toBe('Flores Hall');

    const osoaMatches = searchCampusLocations(CAMPUS_BUILDINGS, 'OSOA');
    expect(osoaMatches.length).toBeGreaterThan(0);
    expect(osoaMatches[0]?.buildingId).toBe('roxas-hall');
    expect(osoaMatches[0]?.buildingName).toBe('Roxas Hall');
  });

  test('filters by location category without throwing on special regex characters', () => {
    const emptyWithSpecialChars = searchCampusLocations(
      CAMPUS_BUILDINGS,
      '([registrar?.*])',
      'library'
    );
    expect(Array.isArray(emptyWithSpecialChars)).toBe(true);
    expect(emptyWithSpecialChars).toHaveLength(0);

    const libraries = searchCampusLocations(CAMPUS_BUILDINGS, '', 'library');
    expect(libraries.length).toBeGreaterThanOrEqual(3);
    expect(libraries.every((m) => m.category === 'library')).toBe(true);
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
