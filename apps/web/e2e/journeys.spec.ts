import fs from 'fs';
import path from 'path';
import { test } from '@playwright/test';
import type { JourneyDefinition, JourneyGroup } from './utils/journey-runner';
import { runJourney } from './utils/journey-runner';

const journeyDir = path.resolve(process.cwd(), 'apps/web/journeys');
const journeyFiles = fs
  .readdirSync(journeyDir)
  .filter((file) => file.endsWith('.json') && !file.startsWith('.'))
  .sort();

const groupFilter = (process.env.PLAYWRIGHT_JOURNEY_GROUP || '')
  .split(',')
  .map((value) => value.trim().toLowerCase())
  .filter(Boolean);
const priorityFilter = (process.env.PLAYWRIGHT_JOURNEY_PRIORITY || '')
  .split(',')
  .map((value) => value.trim().toLowerCase())
  .filter(Boolean);
const journeyNameFilter = process.env.PLAYWRIGHT_JOURNEY_FILTER?.toLowerCase() ?? null;

const shouldIncludeGroup = (groupId: string) => {
  if (!groupFilter.length) return true;
  return groupFilter.includes(groupId.toLowerCase());
};

const shouldIncludeJourney = (journey: JourneyDefinition) => {
  if (priorityFilter.length && !priorityFilter.includes(journey.priority.toLowerCase())) {
    return false;
  }
  if (journeyNameFilter && !journey.name.toLowerCase().includes(journeyNameFilter)) {
    return false;
  }
  return true;
};

const selectedGroups = journeyFiles
  .map((file) => {
    const raw = fs.readFileSync(path.join(journeyDir, file), 'utf-8');
    const parsed = JSON.parse(raw) as JourneyGroup;
    return { ...parsed, file };
  })
  .filter((group) => shouldIncludeGroup(group.group));

if (selectedGroups.length === 0) {
  test.describe('journeys', () => {
    test('no journeys matched provided filters', async () => {
      test.skip(true, 'Adjust PLAYWRIGHT_JOURNEY_GROUP / PLAYWRIGHT_JOURNEY_FILTER to select at least one group.');
    });
  });
} else {
  for (const group of selectedGroups) {
    const journeys = (group.journeys || []).filter(shouldIncludeJourney);
    if (journeys.length === 0) {
      continue;
    }

    test.describe(`[${group.group}] ${group.name}`, () => {
      for (const journey of journeys) {
        const title = `${group.group} › ${journey.name}`;
        test(title, async ({ page }, testInfo) => {
          test.skip(
            testInfo.project.name !== 'desktop',
            'Journey suite runs in desktop viewport only to control runtime.',
          );
          await runJourney(page, group, journey, testInfo);
        });
      }
    });
  }
}
