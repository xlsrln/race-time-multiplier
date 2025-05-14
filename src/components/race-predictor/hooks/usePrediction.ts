
import { useState } from 'react';
import { predictTime, PredictionResult as ServicePredictionResult } from '../../../services/raceDataService';
import { toast } from 'sonner';
import { secondsToTime } from '../../../utils/timeUtils';

interface SourceRaceEntry {
  race: string;
  time: string;
}

export interface PredictionResult {
  avg: {
    time: string;
    min: string;
    max: string;
  };
  median?: {
    time: string;
    min: string;
    max: string;
  };
  winner?: {
    time: string;
    min: string;
    max: string;
  };
}

export function usePrediction() {
  const [predictedResult, setPredictedResult] = useState<PredictionResult | null>(null);
  
  const handlePrediction = (sourceRaces: SourceRaceEntry[], targetRace: string) => {
    // Validate all entries
    const invalidEntries = sourceRaces.filter(entry => !entry.race || !entry.time);
    if (invalidEntries.length > 0 || !targetRace) {
      toast.warning("Please fill all fields");
      return;
    }
    
    // Validate time format for all entries (HH:MM format)
    const timePattern = /^(\d{1,2}):(\d{1,2})$/;
    const invalidTimes = sourceRaces.filter(entry => !timePattern.test(entry.time));
    if (invalidTimes.length > 0) {
      toast.warning("Please enter valid times in HH:MM format");
      return;
    }
    
    // Format times to ensure they're all in HH:MM:SS format for processing
    const formattedEntries = sourceRaces.map(entry => {
      // Add 00 seconds to the HH:MM format
      return {
        race: entry.race,
        time: `${entry.time}:00`
      };
    });
    
    // Get prediction for each source race
    const predictions = formattedEntries.map(entry => {
      return predictTime(entry.time, entry.race, targetRace);
    });
    
    // Filter out any "No data available" predictions
    const validPredictions = predictions.filter(pred => pred.avg !== "No data available");
    
    if (validPredictions.length === 0) {
      setPredictedResult(null);
      toast.error("No valid predictions available");
      return;
    }
    
    if (validPredictions.length < predictions.length) {
      toast.warning(`${predictions.length - validPredictions.length} prediction(s) could not be calculated due to missing data`);
    }
    
    // Process average predictions
    const avgResult = processPredictions(validPredictions.map(p => p.avg));
    
    // Initialize result with average predictions
    const result: PredictionResult = { avg: avgResult };
    
    // Process median predictions if available
    const medianPredictions = validPredictions
      .map(p => p.median)
      .filter(p => p !== undefined) as string[];
    
    if (medianPredictions.length > 0) {
      result.median = processPredictions(medianPredictions);
    }
    
    // Process winner predictions if available
    const winnerPredictions = validPredictions
      .map(p => p.winner)
      .filter(p => p !== undefined) as string[];
    
    if (winnerPredictions.length > 0) {
      result.winner = processPredictions(winnerPredictions);
    }
    
    setPredictedResult(result);
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
