import { useState } from 'react';
import { predictTime, PredictionResult as ServicePredictionResult } from '../../../services/raceDataService';
import { toast } from 'sonner';
import { secondsToTime } from '../../../utils/timeUtils';
import type { DataSourceMode } from './useRaceData';

interface SourceRaceEntry {
  race: string;
  time: string;
}

export interface PredictionResult {
  avg?: {
    time: string;
    min: string;
    max: string;
  } | string;
  median?: { // Allow string type
    time: string;
    min: string;
    max: string;
  } | string;
  winner?: { // Allow string type
    time: string;
    min: string;
    max: string;
  } | string;
}

export function usePrediction() {
  const [predictedResult, setPredictedResult] = useState<PredictionResult | null>(null);
  
  const handlePrediction = (
    sourceRaces: SourceRaceEntry[], 
    targetRace: string,
    dataSourceMode: DataSourceMode
  ) => {
    // Validate all entries
    const invalidEntries = sourceRaces.filter(entry => !entry.race || !entry.time);
    if (invalidEntries.length > 0 || !targetRace) {
      toast.warning("Please fill all fields");
      return;
    }
    
    // Validate time format for all entries (HH:MM or HH:MM:SS format)
    const timePattern = /^(\d{1,2}):(\d{1,2})$/;
    const timePatternWithSeconds = /^(\d{1,2}):(\d{1,2}):(\d{1,2})$/;
    const invalidTimes = sourceRaces.filter(entry => 
        !timePattern.test(entry.time) && !timePatternWithSeconds.test(entry.time)
    );
    if (invalidTimes.length > 0) {
      toast.warning("Please enter valid times in HH:MM or HH:MM:SS format");
      return;
    }
    
    // Format times to ensure they're all in HH:MM:SS format for processing
    const formattedEntries = sourceRaces.map(entry => {
      // Add 00 seconds to the HH:MM format if necessary
      return {
        race: entry.race,
        time: timePattern.test(entry.time) ? `${entry.time}:00` : entry.time
      };
    });
    
    // Get prediction for each source race
    const predictions: ServicePredictionResult[] = formattedEntries.map(entry => {
      return predictTime(entry.time, entry.race, targetRace, dataSourceMode);
    });
    
    // Consolidate predictions
    const result: PredictionResult = {};
    
    // Filter out predictions that are "No data available" or similar, unless it's the only message
    const validAvgPredictions = predictions.map(p => p.avg).filter(p => p && !p.toLowerCase().includes("no data") && !p.toLowerCase().includes("n/a")  && !p.toLowerCase().includes("no runners"));
    const validMedianPredictions = predictions.map(p => p.median).filter(p => p && !p.toLowerCase().includes("no data") && !p.toLowerCase().includes("n/a"));
    const validWinnerPredictions = predictions.map(p => p.winner).filter(p => p && !p.toLowerCase().includes("no data") && !p.toLowerCase().includes("n/a"));

    if (validAvgPredictions.length > 0) {
      result.avg = processPredictions(validAvgPredictions as string[]);
    } else if (predictions.some(p => p.avg)) { // If no numeric, take the first message string if any
        const firstAvgMessage = predictions.find(p => p.avg)?.avg;
        if (firstAvgMessage && (firstAvgMessage.toLowerCase().includes("no runners") || firstAvgMessage.toLowerCase().includes("no data") || firstAvgMessage.toLowerCase().includes("n/a"))) {
           result.avg = firstAvgMessage;
        }
    }

    if (validMedianPredictions.length > 0) {
      result.median = processPredictions(validMedianPredictions as string[]);
    } else if (predictions.some(p => p.median)) {
        const firstMedianMessage = predictions.find(p => p.median)?.median;
        if (firstMedianMessage && (firstMedianMessage.toLowerCase().includes("no data") || firstMedianMessage.toLowerCase().includes("n/a"))) {
           result.median = firstMedianMessage as string; // Cast as string for message
        }
    }

    if (validWinnerPredictions.length > 0) {
      result.winner = processPredictions(validWinnerPredictions as string[]);
    } else if (predictions.some(p => p.winner)) {
        const firstWinnerMessage = predictions.find(p => p.winner)?.winner;
         if (firstWinnerMessage && (firstWinnerMessage.toLowerCase().includes("no data") || firstWinnerMessage.toLowerCase().includes("n/a"))) {
           result.winner = firstWinnerMessage as string; // Cast as string for message
        }
    }
    
    // If all are undefined or contain "No data" type messages, show a general toast.
    const noNumericAvg = !result.avg || (typeof result.avg === 'string' && (result.avg.toLowerCase().includes("no data") || result.avg.toLowerCase().includes("no runners") || result.avg.toLowerCase().includes("n/a")));
    const noNumericMedian = !result.median || (typeof result.median === 'string' && (result.median.toLowerCase().includes("no data") || result.median.toLowerCase().includes("n/a")));
    const noNumericWinner = !result.winner || (typeof result.winner === 'string' && (result.winner.toLowerCase().includes("no data") || result.winner.toLowerCase().includes("n/a")));

    if (noNumericAvg && noNumericMedian && noNumericWinner) {
        if (dataSourceMode === 'default' && predictions.some(p => p.avg === "No runners in common")) {
            toast.info("No runners in common for selected race pair(s).");
        } else if (predictions.some(p => p.avg === "No data available" || p.winner === "No data available")) {
            toast.info("No data available for prediction with selected race pair(s).");
        } else if (dataSourceMode === 'euWinner' && predictions.some(p => p.winner && p.winner.startsWith("No winner data"))){
             toast.info("No winner data available for this pair in the EU Winner Times source.");
        }
         else {
            toast.error("No valid predictions could be made.");
        }
    }
    
    // If result is empty, set to null to hide previous results, otherwise set it.
    if (Object.keys(result).length === 0) {
        setPredictedResult(null);
    } else {
        setPredictedResult(result);
    }
  };
  
  function processPredictions(predictions: string[]): { time: string; min: string; max: string; } {
    // Calculate average, min, and max predictions
    const secondsArray = predictions.map(time => {
      const parts = time.split(':');
      const hours = parseInt(parts[0], 10);
      const minutes = parseInt(parts[1], 10);
      const seconds = parseInt(parts[2], 10);
      return hours * 3600 + minutes * 60 + seconds;
    });
    
    const totalSeconds = secondsArray.reduce((sum, seconds) => sum + seconds, 0);
    const averageSeconds = totalSeconds / predictions.length;
    const minSeconds = Math.min(...secondsArray);
    const maxSeconds = Math.max(...secondsArray);
    
    return {
      time: secondsToTime(averageSeconds),
      min: secondsToTime(minSeconds),
      max: secondsToTime(maxSeconds)
    };
  }
  
  return { predictedResult, handlePrediction };
}
