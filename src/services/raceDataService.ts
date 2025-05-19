import { timeToSeconds, secondsToTime } from '../utils/timeUtils';

export interface RaceRatio {
  source: string;
  target: string;
  ratioAvg?: number | null;
  ratioMedian?: number | null;
  ratioWinner?: number | null;
}

export interface EuRaceData {
  country: string;
  name: string;
  event: string;
  distance: number;
  year: number;
  finishers: number;
  duration: string;
}

let defaultRaceRatios: RaceRatio[] = [];
let euWinnerRaceRatios: RaceRatio[] = [];
let euRaceDetails: Map<string, EuRaceData> = new Map(); // Store detailed race info
let raceNames: string[] = [];
let euCountries: string[] = []; // Track available countries

const ALL_EU_WINTIMES_CSV_URL = 'https://raw.githubusercontent.com/xlsrln/urtp/main/all_eu_wintimes.csv';
const COMBINED_RATIOS_CSV_URL = 'https://raw.githubusercontent.com/xlsrln/urtp/main/combined_ratios.csv';

async function fetchAndParseCsv(url: string, isEuWinnerData: boolean = false): Promise<{ratios: RaceRatio[], names: Set<string>}> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch race data from ${url}`);
  }
  const csvText = await response.text();
  
  const lines = csvText.split('\n');
  if (lines.length < 2) return { ratios: [], names: new Set() };

  const header = lines[0].split(',').map(h => h.trim());
  
  if (isEuWinnerData) {
    // Parse EU Winner Times CSV format
    const countryIndex = header.indexOf('country');
    const eventIndex = header.indexOf('event');
    const nameIndex = header.indexOf('name');
    const distanceIndex = header.indexOf('dist_km');
    const yearIndex = header.indexOf('year');
    const finishersIndex = header.indexOf('finishers');
    const durationIndex = header.indexOf('duration');
    
    if (eventIndex === -1 || durationIndex === -1) {
      console.error('CSV format is invalid for EU winner times:', url, { header });
      return { ratios: [], names: new Set() };
    }
    
    const parsedRatios: RaceRatio[] = [];
    const uniqueRaces = new Set<string>();
    const countries = new Set<string>();
    
    // Process EU winner times data
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = line.split(',').map(v => v.trim());
      if (values.length < Math.max(eventIndex, durationIndex) + 1) continue;
      
      const country = countryIndex !== -1 && countryIndex < values.length ? values[countryIndex] : 'UNK';
      const eventValue = values[eventIndex]; // Use a different variable name to avoid conflict
      const nameValue = nameIndex !== -1 && nameIndex < values.length ? values[nameIndex] : eventValue;
      const distance = distanceIndex !== -1 && distanceIndex < values.length ? 
                      parseFloat(values[distanceIndex]) : 0;
      const year = yearIndex !== -1 && yearIndex < values.length ? 
                    parseInt(values[yearIndex], 10) : 0;
      const finishers = finishersIndex !== -1 && finishersIndex < values.length ? 
                        parseInt(values[finishersIndex], 10) : 0;
      const duration = values[durationIndex];
      
      if (!eventValue || !duration || eventValue.trim() === "") continue;
      
      // Store detailed race information, keyed by eventValue
      euRaceDetails.set(eventValue, {
        country,
        name: nameValue, // Ensure 'name' is stored correctly
        event: eventValue, // Ensure 'event' is stored correctly
        distance,
        year,
        finishers,
        duration
      });
      
      countries.add(country);
      uniqueRaces.add(eventValue); // Add eventValue to uniqueRaces
      
      // For each race pair, calculate winner time ratios
      for (const otherRace of uniqueRaces) {
        if (otherRace === eventValue) continue; // Skip self comparison
        
        const otherRaceData = euRaceDetails.get(otherRace);
        if (!otherRaceData) continue;
        
        // Calculate ratios both ways
        const sourceTime = timeToSeconds(duration);
        const targetTime = timeToSeconds(otherRaceData.duration);
        
        if (sourceTime > 0 && targetTime > 0) {
          const ratio: RaceRatio = {
            source: eventValue,
            target: otherRace,
            ratioWinner: sourceTime / targetTime
          };
          
          parsedRatios.push(ratio);
        }
      }
    }
    
    euCountries = Array.from(countries).sort();
    return { ratios: parsedRatios, names: uniqueRaces };
    
  } else {
    // Original code for combined ratios CSV
    const sourceIndex = header.indexOf('event1');
    const targetIndex = header.indexOf('event2');
    const ratioWinnerIndex = header.indexOf('ratio_winner');
    const ratioMedianIndex = header.indexOf('ratio_median');
    const ratioAvgIndex = header.indexOf('ratio_avg');

    if (sourceIndex === -1 || targetIndex === -1) {
      console.error('CSV format is invalid for URL:', url, { header });
      return { ratios: [], names: new Set() };
    }

    const parsedRatios: RaceRatio[] = [];
    const uniqueRaces = new Set<string>();

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = line.split(',').map(v => v.trim());
      if (values.length < Math.max(sourceIndex, targetIndex) + 1) continue;
      
      const sourceRace = values[sourceIndex];
      const targetRace = values[targetIndex];
      
      if (!sourceRace || !targetRace || sourceRace.trim() === "" || targetRace.trim() === "") continue;
      
      uniqueRaces.add(sourceRace);
      uniqueRaces.add(targetRace);
      
      const ratio: RaceRatio = {
        source: sourceRace,
        target: targetRace,
      };

      if (ratioAvgIndex !== -1 && ratioAvgIndex < values.length) {
        const valStr = values[ratioAvgIndex];
        if (valStr && valStr.trim() !== '') ratio.ratioAvg = parseFloat(valStr) || null;
      }
      if (ratioMedianIndex !== -1 && ratioMedianIndex < values.length) {
        const valStr = values[ratioMedianIndex];
        if (valStr && valStr.trim() !== '') ratio.ratioMedian = parseFloat(valStr) || null;
      }
      if (ratioWinnerIndex !== -1 && ratioWinnerIndex < values.length) {
        const valStr = values[ratioWinnerIndex];
        if (valStr && valStr.trim() !== '') ratio.ratioWinner = parseFloat(valStr) || null;
      }
      
      // Ensure at least one ratio is present
      const hasRatio = ratio.ratioAvg || ratio.ratioMedian || ratio.ratioWinner;
      if (hasRatio) {
         parsedRatios.push(ratio);
      }
    }
    return { ratios: parsedRatios, names: uniqueRaces };
  }
}

export async function fetchRaceData(): Promise<void> {
  try {
    const [defaultData, euWinnerData] = await Promise.all([
      fetchAndParseCsv(COMBINED_RATIOS_CSV_URL, false),
      fetchAndParseCsv(ALL_EU_WINTIMES_CSV_URL, true)
    ]);

    defaultRaceRatios = defaultData.ratios;
    euWinnerRaceRatios = euWinnerData.ratios;

    const combinedRaceNames = new Set([...defaultData.names, ...euWinnerData.names]);
    // Filter out any empty strings
    raceNames = Array.from(combinedRaceNames).filter(name => name.trim() !== "").sort();
    
    console.log('Race data loaded successfully', {
      races: raceNames.length,
      defaultRatios: defaultRaceRatios.length,
      euWinnerRatios: euWinnerRaceRatios.length,
      euCountries: euCountries.length
    });
  } catch (error) {
    console.error('Error loading race data:', error);
    throw error;
  }
}

export function getRaceNames(): string[] {
  return raceNames;
}

export function getEuCountries(): string[] {
  return euCountries;
}

export function getEuRacesByCountry(countryCode?: string): string[] {
  const filteredRaces: string[] = [];
  euRaceDetails.forEach((data, raceEventName) => { // raceEventName is the key from euRaceDetails map
    if (!countryCode || data.country === countryCode) { // If no countryCode, include all EU races
      if (raceEventName && raceEventName.trim() !== "") {
        filteredRaces.push(raceEventName); // Add the event name (key)
      }
    }
  });
  return filteredRaces.sort();
}

export function getRaceDetails(raceName: string): EuRaceData | undefined {
  return euRaceDetails.get(raceName);
}

function findRatio(sourceRace: string, targetRace: string, dataSourceMode: 'default' | 'euWinner'): RaceRatio | null {
  const ratiosToSearch = dataSourceMode === 'euWinner' ? euWinnerRaceRatios : defaultRaceRatios;
  const ratio = ratiosToSearch.find(r => 
    r.source === sourceRace && r.target === targetRace
  );
  return ratio || null;
}

export interface PredictionResult {
  avg?: string;
  median?: string;
  winner?: string;
}

export function predictTime(
  sourceTime: string, 
  sourceRace: string, 
  targetRace: string,
  dataSourceMode: 'default' | 'euWinner' = 'default'
): PredictionResult {
  
  if (sourceRace === targetRace) {
    const formattedTime = secondsToTime(timeToSeconds(sourceTime));
    return { 
      avg: formattedTime,
      median: formattedTime,
      winner: formattedTime
    };
  }
  
  const ratio = findRatio(sourceRace, targetRace, dataSourceMode);

  if (!ratio) return dataSourceMode === 'euWinner' ? { winner: "No data available" } : { avg: "No data available" };
  
  const secondsSource = timeToSeconds(sourceTime);
  if (secondsSource <= 0) return { avg: "00:00:00", median: "00:00:00", winner: "00:00:00" };
  
  const result: PredictionResult = {};

  if (dataSourceMode === 'default') {
    if (ratio.ratioAvg !== null && ratio.ratioAvg !== undefined) {
      result.avg = secondsToTime(secondsSource / ratio.ratioAvg);
    } else {
      result.avg = "No runners in common";
    }
    if (ratio.ratioMedian !== null && ratio.ratioMedian !== undefined) {
      result.median = secondsToTime(secondsSource / ratio.ratioMedian);
    }
  } else { // euWinner mode
    // Avg and Median are not available from this data source
    result.avg = "N/A (Winner Mode)";
    result.median = "N/A (Winner Mode)";
  }
  
  if (ratio.ratioWinner !== null && ratio.ratioWinner !== undefined) {
    result.winner = secondsToTime(secondsSource / ratio.ratioWinner);
  } else if (dataSourceMode === 'euWinner') {
    result.winner = "No winner data";
  }
  
  if (dataSourceMode === 'default' && result.avg === "No runners in common" && !result.median && !result.winner) {
    result.avg = "No runners in common";
  } else if (dataSourceMode === 'default' && result.avg === "No runners in common" && (result.median || result.winner)) {
    result.avg = "No runners in common";
  }

  if (dataSourceMode === 'euWinner' && !result.winner) {
    result.winner = "No winner data for this pair in EU source";
  }
  
  if (dataSourceMode === 'default' && !ratio.ratioAvg && !ratio.ratioMedian && !ratio.ratioWinner) {
    return { avg: "No data available" };
  }

  if (result.avg === "N/A (Winner Mode)") delete result.avg;
  if (result.median === "N/A (Winner Mode)") delete result.median;

  return result;
}
