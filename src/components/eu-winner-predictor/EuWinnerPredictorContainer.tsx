
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardDescription, CardFooter } from "@/components/ui/card";
import { ArrowRight, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import SourceRaceForm from '../race-predictor/SourceRaceForm';
import TargetRaceSelector from '../race-predictor/TargetRaceSelector';
import PredictionResult from '../race-predictor/PredictionResult';
import LoadingState from '../race-predictor/LoadingState';

import { useRaceData } from '../race-predictor/hooks/useRaceData';
import { usePrediction } from '../race-predictor/hooks/usePrediction';

import type { EuRaceData } from '@/services/raceDataService';

const EuWinnerPredictorContainer: React.FC = () => {
  const {
    raceNames,
    euCountries,
    selectedCountry,
    setSelectedCountry,
    sourceRaces,
    targetRace,
    isLoading,
    error,
    dataSourceMode,
    setTargetRace,
    addSourceRace,
    removeSourceRace,
    updateSourceRace,
    getRaceDetails
  } = useRaceData('euWinner');
  
  const { predictedResult, handlePrediction } = usePrediction();
  
  const onPredictClick = () => {
    handlePrediction(sourceRaces, targetRace, dataSourceMode);
  };
  
  // Filter out empty country names
  const validCountries = euCountries.filter(country => country.trim() !== "");
  
  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <Badge variant="secondary" className="mb-2 mx-auto">Beta</Badge>
        <CardDescription className="text-center">
          EU Winner Times Mode: Predict your finish time based on winner times from European ultra races.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <LoadingState isLoading={isLoading} error={error} />
        
        {!isLoading && !error && (
          <>
            <Badge variant="outline" className="w-full flex justify-center text-xs py-1">
              Using EU Winner Times specific data (based on winning times)
            </Badge>
            
            <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
              <Label htmlFor="country-select" className="text-sm font-medium whitespace-nowrap">
                Filter by Country:
              </Label>
              <Select
                value={selectedCountry}
                onValueChange={setSelectedCountry}
              >
                <SelectTrigger className="flex-1" id="country-select">
                  <SelectValue placeholder="All Countries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Countries</SelectItem>
                  {validCountries.map(country => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>

            <SourceRaceForm
              sourceRaces={sourceRaces}
              raceNames={raceNames}
              updateSourceRace={updateSourceRace}
              addSourceRace={addSourceRace}
              removeSourceRace={removeSourceRace}
              dataSourceMode={dataSourceMode}
              getRaceDetails={getRaceDetails as (eventName: string) => EuRaceData | undefined}
            />
            
            <div className="flex items-center justify-center my-4">
              <ArrowRight className="text-muted-foreground" />
            </div>
            
            <TargetRaceSelector
              targetRace={targetRace}
              setTargetRace={setTargetRace}
              raceNames={raceNames}
              dataSourceMode={dataSourceMode}
              getRaceDetails={getRaceDetails as (eventName: string) => EuRaceData | undefined}
            />
            
            <Button 
              className="w-full mt-4" 
              onClick={onPredictClick}
              disabled={!targetRace || sourceRaces.some(entry => !entry.race || !entry.time)}
            >
              Predict Time
            </Button>
            
            {predictedResult && (
              <PredictionResult
                avg={predictedResult.avg}
                median={predictedResult.median}
                winner={predictedResult.winner}
                sourceRacesCount={sourceRaces.length}
              />
            )}
          </>
        )}
      </CardContent>
      
      <CardFooter className="text-xs text-center text-muted-foreground flex flex-col justify-center gap-2 pt-6">
        <p>This beta version uses winner times from races across Europe. Predictions are based on relative differences between race winner times.</p>
        <p className="pt-2 text-xs font-medium">by axel sarlin</p>
      </CardFooter>
    </Card>
  );
};

export default EuWinnerPredictorContainer;
