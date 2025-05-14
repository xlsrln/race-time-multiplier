
import { timeToSeconds, secondsToTime } from '../utils/timeUtils';

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

  // Parse header to get race names
  const header = lines[0].split(',');
  // First column is empty/row labels, so skip it
  raceNames = header.slice(1).filter(name => name.trim().length > 0);
  
  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = line.split(',');
    if (values.length < 2) continue;
    
    const sourceRace = values[0].trim();
    
    // Skip empty source race
    if (!sourceRace) continue;
    
    // Process each target race
    for (let j = 1; j < values.length && j <= raceNames.length; j++) {
      const ratioStr = values[j].trim();
      if (!ratioStr) continue;
      
      const ratio = parseFloat(ratioStr);
      if (isNaN(ratio) || ratio <= 0) continue;
      
      const targetRace = raceNames[j-1];
      
      raceRatios.push({
        source: sourceRace,
        target: targetRace,
        ratio: ratio
      });
    }
  }
  
  // Make sure race names list is unique and sorted
  raceNames = [...new Set(raceNames)].sort();
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
  // If same race, return source time
  if (sourceRace === targetRace) {
    return sourceTime;
  }
  
  const ratio = findRatio(sourceRace, targetRace);
  if (!ratio) return "No data available";
  
  const secondsSource = timeToSeconds(sourceTime);
  if (secondsSource <= 0) return "00:00:00";
  
  const secondsTarget = secondsSource * ratio;
  return secondsToTime(secondsTarget);
}
