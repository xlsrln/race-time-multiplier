
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
    
    // Validate time format for all entries
    const timePattern = /^(\d{1,2}:)?(\d{1,2})(?::(\d{1,2}))?$/;
    const invalidTimes = sourceRaces.filter(entry => !timePattern.test(entry.time));
    if (invalidTimes.length > 0) {
      toast.warning("Please enter valid times (HH:MM, MM:SS or HH:MM:SS)");
      return;
    }
    
    // Format times to ensure they're all in HH:MM:SS format
    const formattedEntries = sourceRaces.map(entry => {
      const parts = entry.time.split(':');
      let formattedTime = entry.time;
      
      // If only two parts, assume it's MM:SS and add 00 for hours
      if (parts.length === 2) {
        formattedTime = `00:${entry.time}`;
      }
      // If only one part, assume it's just seconds
      else if (parts.length === 1) {
        formattedTime = `00:00:${entry.time}`;
      }
      
      return {
        race: entry.race,
        time: formattedTime
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
