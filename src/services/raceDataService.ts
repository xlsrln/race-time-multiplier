
import { timeToSeconds, secondsToTime, formatTimeString } from '../utils/timeUtils';

export interface RaceRatio {
  source: string;
  target: string;
  ratio: number;
}

let raceRatios: RaceRatio[] = [];
let raceNames: string[] = [];

export async function fetchRaceData(): Promise<void> {
  try {
    const response = await fetch('https://raw.githubusercontent.com/xlsrln/urtp/main/avg_ratios.csv');
    if (!response.ok) {
      throw new Error('Failed to fetch race data');
    }
    
    const csvText = await response.text();
    parseRaceData(csvText);
    
    console.log('Race data loaded successfully', { races: raceNames.length, ratios: raceRatios.length });
  } catch (error) {
    console.error('Error loading race data:', error);
    throw error;
  }
}

function parseRaceData(csvText: string): void {
  const lines = csvText.split('\n');
  if (lines.length < 2) return;

  // Skip header row
  const header = lines[0].split(',');
  const uniqueRaces = new Set<string>();
  
  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = line.split(',');
    if (values.length < 3) continue;
    
    const sourceRace = values[0].trim();
    const targetRace = values[1].trim();
    const ratioStr = values[2].trim();
    
    // Skip empty values
    if (!sourceRace || !targetRace || !ratioStr) continue;
    
    // Add races to unique set
    uniqueRaces.add(sourceRace);
    uniqueRaces.add(targetRace);
    
    const ratio = parseFloat(ratioStr);
    if (isNaN(ratio) || ratio <= 0) continue;
    
    raceRatios.push({
      source: sourceRace,
      target: targetRace,
      ratio: ratio
    });
  }
  
  // Convert set to sorted array
  raceNames = Array.from(uniqueRaces).sort();
}

export function getRaceNames(): string[] {
  return raceNames;
}

export function findRatio(sourceRace: string, targetRace: string): number | null {
  const ratio = raceRatios.find(r => 
    r.source === sourceRace && r.target === targetRace
  );
  
  return ratio ? ratio.ratio : null;
}

export function predictTime(sourceTime: string, sourceRace: string, targetRace: string): string {
  // If same race, return source time with proper formatting
  if (sourceRace === targetRace) {
    return formatTimeString(sourceTime);
  }
  
  const ratio = findRatio(sourceRace, targetRace);
  if (!ratio) return "No data available";
  
  const secondsSource = timeToSeconds(sourceTime);
  if (secondsSource <= 0) return "00:00:00";
  
  const secondsTarget = secondsSource / ratio;
  return secondsToTime(secondsTarget);
}
