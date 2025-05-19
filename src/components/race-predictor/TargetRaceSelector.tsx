
import React from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { DataSourceMode } from './hooks/useRaceData';
import type { EuRaceData } from '@/services/raceDataService';

interface TargetRaceSelectorProps {
  targetRace: string; // This is an event name
  setTargetRace: (race: string) => void; // Expects event name
  raceNames: string[]; // These are event names
  dataSourceMode: DataSourceMode;
  getRaceDetails: (eventName: string) => EuRaceData | undefined;
}

const TargetRaceSelector: React.FC<TargetRaceSelectorProps> = ({
  targetRace,
  setTargetRace,
  raceNames,
  dataSourceMode,
  getRaceDetails
}) => {
  // Ensure we have valid race names to display
  const validRaceNames = raceNames.filter(event => event !== "" && event !== undefined);
  
  // If there are no valid races, show a placeholder
  if (validRaceNames.length === 0) {
    return (
      <div className="space-y-2">
        <Label htmlFor="targetRace">Race you want to predict</Label>
        <div className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm opacity-50">
          No races available
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="targetRace">Race you want to predict</Label>
      <Select value={targetRace} onValueChange={setTargetRace}>
        <SelectTrigger id="targetRace">
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
            return <SelectItem key={`target-${event}`} value={event}>{displayName}</SelectItem>;
          })}
        </SelectContent>
      </Select>
    </div>
  );
};

export default TargetRaceSelector;
