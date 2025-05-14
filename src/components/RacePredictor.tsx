
import React, { useState, useEffect } from 'react';
import { fetchRaceData, getRaceNames, predictTime } from '../services/raceDataService';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface SourceRaceEntry {
  race: string;
  time: string;
}

interface PredictionResult {
  time: string;
  min: string;
  max: string;
}

const RacePredictor: React.FC = () => {
  const [raceNames, setRaceNames] = useState<string[]>([]);
  const [sourceRaces, setSourceRaces] = useState<SourceRaceEntry[]>([{ race: "", time: "" }]);
  const [targetRace, setTargetRace] = useState<string>("");
  const [predictedResult, setPredictedResult] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        await fetchRaceData();
        const names = getRaceNames();
        
        setRaceNames(names);
        
        if (names.length > 0) {
          setSourceRaces([{ race: names[0], time: "" }]);
          setTargetRace(names[0]);
        }
        
        setError(null);
      } catch (err) {
        setError("Failed to load race data. Please try again later.");
        toast.error("Failed to load race data");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  const handlePrediction = () => {
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
    
    // Convert seconds back to HH:MM:SS format
    const formatTimeFromSeconds = (seconds: number) => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = Math.floor(seconds % 60);
      
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };
    
    setPredictedResult({
      time: formatTimeFromSeconds(averageSeconds),
      min: formatTimeFromSeconds(minSeconds),
      max: formatTimeFromSeconds(maxSeconds)
    });
  };
  
  const addSourceRace = () => {
    if (raceNames.length === 0) return;
    setSourceRaces([...sourceRaces, { race: raceNames[0], time: "" }]);
  };
  
  const removeSourceRace = (index: number) => {
    if (sourceRaces.length === 1) {
      // Don't remove the last one
      return;
    }
    const updatedRaces = [...sourceRaces];
    updatedRaces.splice(index, 1);
    setSourceRaces(updatedRaces);
  };
  
  const updateSourceRace = (index: number, field: 'race' | 'time', value: string) => {
    const updatedRaces = [...sourceRaces];
    updatedRaces[index] = { ...updatedRaces[index], [field]: value };
    setSourceRaces(updatedRaces);
  };
  
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Race Time Predictor</CardTitle>
        <CardDescription className="text-center">
          Predict your finish time for a race based on your performance in other races.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-6">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : (
          <>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Races you've completed</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={addSourceRace}
                >
                  Add Race
                </Button>
              </div>
              
              {sourceRaces.map((entry, index) => (
                <div key={index} className="flex space-x-2 items-end">
                  <div className="w-1/2 space-y-2">
                    <Label htmlFor={`sourceRace-${index}`}>Race</Label>
                    <Select 
                      value={entry.race} 
                      onValueChange={(value) => updateSourceRace(index, 'race', value)}
                    >
                      <SelectTrigger id={`sourceRace-${index}`}>
                        <SelectValue placeholder="Select race" />
                      </SelectTrigger>
                      <SelectContent>
                        {raceNames.map((race) => (
                          <SelectItem key={`source-${index}-${race}`} value={race}>{race}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="w-1/2 space-y-2">
                    <Label htmlFor={`sourceTime-${index}`}>Time (HH:MM or MM:SS)</Label>
                    <Input 
                      id={`sourceTime-${index}`} 
                      placeholder="hh:mm or mm:ss" 
                      value={entry.time} 
                      onChange={(e) => updateSourceRace(index, 'time', e.target.value)} 
                    />
                  </div>
                  
                  {sourceRaces.length > 1 && (
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon"
                      onClick={() => removeSourceRace(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex items-center justify-center my-4">
              <ArrowRight className="text-muted-foreground" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="targetRace">Race you want to predict</Label>
              <Select value={targetRace} onValueChange={setTargetRace}>
                <SelectTrigger id="targetRace">
                  <SelectValue placeholder="Select race" />
                </SelectTrigger>
                <SelectContent>
                  {raceNames.map((race) => (
                    <SelectItem key={`target-${race}`} value={race}>{race}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              className="w-full mt-4" 
              onClick={handlePrediction}
              disabled={!targetRace || sourceRaces.some(entry => !entry.race || !entry.time)}
            >
              Predict Time
            </Button>
            
            {sourceRaces.length > 1 && (
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline" className="text-xs">Using average of {sourceRaces.length} races</Badge>
              </div>
            )}
            
            {predictedResult && (
              <div className="mt-6 p-4 border rounded-lg bg-muted/50 space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Predicted time:</p>
                  <p className="text-3xl font-bold text-center">{predictedResult.time}</p>
                </div>
                
                {sourceRaces.length > 1 && (
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Min prediction:</p>
                      <p className="text-lg font-semibold">{predictedResult.min}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Max prediction:</p>
                      <p className="text-lg font-semibold">{predictedResult.max}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
      
      <CardFooter className="text-xs text-center text-muted-foreground flex justify-center">
        <p>Based on historical data from race finishers</p>
      </CardFooter>
    </Card>
  );
};

export default RacePredictor;
