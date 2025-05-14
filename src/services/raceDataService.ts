
import { timeToSeconds, secondsToTime, formatTimeString } from '../utils/timeUtils';

export interface RaceRatio {
  source: string;
  target: string;
  ratioAvg: number;
  ratioMedian?: number;
  ratioWinner?: number;
}

let raceRatios: RaceRatio[] = [];
let raceNames: string[] = [];

export async function fetchRaceData(): Promise<void> {
  try {
    const response = await fetch('https://raw.githubusercontent.com/xlsrln/urtp/main/combined_ratios.csv');
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

  // Parse header to find column indexes
  const header = lines[0].split(',');
  const sourceIndex = header.indexOf('source');
  const targetIndex = header.indexOf('target');
  const ratioAvgIndex = header.indexOf('ratio_avg');
  const ratioMedianIndex = header.indexOf('ratio_median');
  const ratioWinnerIndex = header.indexOf('ratio_winner');
  
  if (sourceIndex === -1 || targetIndex === -1 || ratioAvgIndex === -1) {
    console.error('CSV format is invalid, missing required columns');
    return;
  }
  
  const uniqueRaces = new Set<string>();
  
  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = line.split(',');
    if (values.length <= Math.max(sourceIndex, targetIndex, ratioAvgIndex)) continue;
    
    const sourceRace = values[sourceIndex].trim();
    const targetRace = values[targetIndex].trim();
    const ratioAvgStr = values[ratioAvgIndex].trim();
    
    // Skip empty values for required fields
    if (!sourceRace || !targetRace || !ratioAvgStr) continue;
    
    // Add races to unique set
    uniqueRaces.add(sourceRace);
    uniqueRaces.add(targetRace);
    
    const ratioAvg = parseFloat(ratioAvgStr);
    if (isNaN(ratioAvg) || ratioAvg <= 0) continue;
    
    // Create ratio object
    const ratio: RaceRatio = {
      source: sourceRace,
      target: targetRace,
      ratioAvg: ratioAvg
    };
    
    // Add optional ratios if they exist
    if (ratioMedianIndex !== -1 && values[ratioMedianIndex]) {
      const ratioMedianStr = values[ratioMedianIndex].trim();
      const ratioMedian = parseFloat(ratioMedianStr);
      if (!isNaN(ratioMedian) && ratioMedian > 0) {
        ratio.ratioMedian = ratioMedian;
      }
    }
    
    if (ratioWinnerIndex !== -1 && values[ratioWinnerIndex]) {
      const ratioWinnerStr = values[ratioWinnerIndex].trim();
      const ratioWinner = parseFloat(ratioWinnerStr);
      if (!isNaN(ratioWinner) && ratioWinner > 0) {
        ratio.ratioWinner = ratioWinner;
      }
    }
    
    raceRatios.push(ratio);
  }
  
  // Convert set to sorted array
  raceNames = Array.from(uniqueRaces).sort();
}

export function getRaceNames(): string[] {
  return raceNames;
}

export function findRatio(sourceRace: string, targetRace: string): RaceRatio | null {
  const ratio = raceRatios.find(r => 
    r.source === sourceRace && r.target === targetRace
  );
  
  return ratio || null;
}

export interface PredictionResult {
  avg: string;
  median?: string;
  winner?: string;
}

export function predictTime(sourceTime: string, sourceRace: string, targetRace: string): PredictionResult {
  // If same race, return source time with proper formatting for all types
  if (sourceRace === targetRace) {
    const formattedTime = secondsToTime(timeToSeconds(sourceTime));
    return {
      avg: formattedTime,
      median: formattedTime,
      winner: formattedTime
    };
  }
  
  const ratio = findRatio(sourceRace, targetRace);
  if (!ratio) return { avg: "No data available" };
  
  const secondsSource = timeToSeconds(sourceTime);
  if (secondsSource <= 0) return { avg: "00:00:00" };
  
  const result: PredictionResult = {
    avg: secondsToTime(secondsSource / ratio.ratioAvg)
  };
  
  if (ratio.ratioMedian) {
    result.median = secondsToTime(secondsSource / ratio.ratioMedian);
  }
  
  if (ratio.ratioWinner) {
    result.winner = secondsToTime(secondsSource / ratio.ratioWinner);
  }
  
  return result;
}
