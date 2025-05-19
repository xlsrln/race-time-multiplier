
import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";
import type { DataSourceMode } from './hooks/useRaceData';
import type { EuRaceData } from '@/services/raceDataService';

interface SourceRaceEntry {
  race: string;
  time: string;
}

interface SourceRaceFormProps {
  sourceRaces: SourceRaceEntry[];
  raceNames: string[]; // These are event names
  updateSourceRace: (index: number, field: 'race' | 'time', value: string) => void;
  addSourceRace: () => void;
  removeSourceRace: (index: number) => void;
  dataSourceMode: DataSourceMode;
  getRaceDetails: (eventName: string) => EuRaceData | undefined;
}

const SourceRaceForm: React.FC<SourceRaceFormProps> = ({
  sourceRaces,
  raceNames,
  updateSourceRace,
  addSourceRace,
  removeSourceRace,
  dataSourceMode,
  getRaceDetails
}) => {
  // Ensure we have valid race names to display
  const validRaceNames = raceNames.filter(event => event !== "" && event !== undefined);
  
  // If there are no valid races, show a placeholder
  if (validRaceNames.length === 0) {
    return (
      <div className="space-y-4">
        <Label>Races you've completed</Label>
        <div className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm opacity-50">
          No races available
        </div>
      </div>
    );
  }

  return (
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
              value={entry.race} // Value is the event name
              onValueChange={(value) => updateSourceRace(index, 'race', value)}
            >
              <SelectTrigger id={`sourceRace-${index}`}>
                <SelectValue placeholder="Select race" />
              </SelectTrigger>
              <SelectContent>
                {validRaceNames.map((event) => {
                  let displayName = event;
                  if (dataSourceMode === 'euWinner') {
                    const details = getRaceDetails(event);
                    if (details && details.name) {
                      displayName = `${details.country} - ${details.name}`;
                    } else if (details) { // Fallback if details.name is empty
                      displayName = `${details.country} - ${event}`;
                    }
                    // If details is undefined, displayName remains event (safe fallback)
                  }
                  return <SelectItem key={`source-${index}-${event}`} value={event}>{displayName}</SelectItem>;
                })}
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-1/2 space-y-2">
            <Label htmlFor={`sourceTime-${index}`}>Time (HH:MM)</Label>
            <Input 
              id={`sourceTime-${index}`} 
              placeholder="HH:MM" 
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
  );
};

export default SourceRaceForm;
