
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
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";

const RacePredictor: React.FC = () => {
  const [raceNames, setRaceNames] = useState<string[]>([]);
  const [sourceRace, setSourceRace] = useState<string>("");
  const [targetRace, setTargetRace] = useState<string>("");
  const [sourceTime, setSourceTime] = useState<string>("");
  const [predictedTime, setPredictedTime] = useState<string>("");
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
          setSourceRace(names[0]);
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
    if (!sourceRace || !targetRace || !sourceTime) {
      toast.warning("Please fill all fields");
      return;
    }
    
    // Validate time format
    const timePattern = /^(\d{1,2}:)?(\d{1,2}:)?(\d{1,2})$/;
    if (!timePattern.test(sourceTime)) {
      toast.warning("Please enter a valid time (HH:MM:SS, MM:SS or SS)");
      return;
    }
    
    const prediction = predictTime(sourceTime, sourceRace, targetRace);
    setPredictedTime(prediction);
  };
  
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Race Time Predictor</CardTitle>
        <CardDescription className="text-center">
          Predict your finish time for a race based on your performance in another race.
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
            <div className="space-y-2">
              <Label htmlFor="sourceRace">Race you've completed</Label>
              <Select value={sourceRace} onValueChange={setSourceRace}>
                <SelectTrigger id="sourceRace">
                  <SelectValue placeholder="Select race" />
                </SelectTrigger>
                <SelectContent>
                  {raceNames.map((race) => (
                    <SelectItem key={`source-${race}`} value={race}>{race}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sourceTime">Your finish time (HH:MM:SS)</Label>
              <Input 
                id="sourceTime" 
                placeholder="00:00:00" 
                value={sourceTime} 
                onChange={(e) => setSourceTime(e.target.value)} 
              />
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
              disabled={!sourceRace || !targetRace || !sourceTime}
            >
              Predict Time
            </Button>
            
            {predictedTime && (
              <div className="mt-6 p-4 border rounded-lg bg-muted/50">
                <p className="text-sm font-medium text-muted-foreground">Predicted time:</p>
                <p className="text-3xl font-bold text-center">{predictedTime}</p>
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
