
import { useState } from 'react';
import { predictTime } from '../../../services/raceDataService';
import { toast } from 'sonner';
import { secondsToTime } from '../../../utils/timeUtils';

interface SourceRaceEntry {
  race: string;
  time: string;
}

interface PredictionResult {
  time: string;
  min: string;
  max: string;
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
    const validPredictions = predictions.filter(pred => pred !== "No data available");
    
    if (validPredictions.length === 0) {
      setPredictedResult(null);
      toast.error("No valid predictions available");
      return;
    }
    
    if (validPredictions.length < predictions.length) {
      toast.warning(`${predictions.length - validPredictions.length} prediction(s) could not be calculated due to missing data`);
    }
    
    // Calculate average, min, and max predictions
    const secondsArray = validPredictions.map(time => {
      const parts = time.split(':');
      const hours = parseInt(parts[0], 10);
      const minutes = parseInt(parts[1], 10);
      const seconds = parseInt(parts[2], 10);
      return hours * 3600 + minutes * 60 + seconds;
    });
    
    const totalSeconds = secondsArray.reduce((sum, seconds) => sum + seconds, 0);
    const averageSeconds = totalSeconds / validPredictions.length;
    const minSeconds = Math.min(...secondsArray);
    const maxSeconds = Math.max(...secondsArray);
    
    // Use the utility function for consistent formatting
    setPredictedResult({
      time: secondsToTime(averageSeconds),
      min: secondsToTime(minSeconds),
      max: secondsToTime(maxSeconds)
    });
  };
  
  return { predictedResult, handlePrediction };
}
