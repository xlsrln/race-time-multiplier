
import { useState, useEffect } from 'react';
import { fetchRaceData, getRaceNames, getEuCountries, getEuRacesByCountry, getRaceDetails as getRaceDetailsFromService, EuRaceData } from '../../../services/raceDataService';
import { toast } from 'sonner';

interface SourceRaceEntry {
  race: string;
  time: string;
}

export type DataSourceMode = 'default' | 'euWinner';

export function useRaceData(initialMode: DataSourceMode = 'default') {
  const [raceNames, setRaceNames] = useState<string[]>([]);
  const [euCountries, setEuCountries] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [sourceRaces, setSourceRaces] = useState<SourceRaceEntry[]>([{ race: "", time: "" }]);
  const [targetRace, setTargetRace] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSourceMode] = useState<DataSourceMode>(initialMode);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        await fetchRaceData();
        const initialGlobalRaceNames = getRaceNames().filter(name => name.trim() !== ""); 
        const countries = getEuCountries();
        
        setRaceNames(initialGlobalRaceNames);
        setEuCountries(countries);
        
        if (initialGlobalRaceNames.length > 0) {
          const currentSourceRace = sourceRaces[0]?.race;
          const currentTargetRace = targetRace;

          if (!initialGlobalRaceNames.includes(currentSourceRace) || currentSourceRace === "") {
             setSourceRaces([{ race: initialGlobalRaceNames[0], time: "" }]);
          }
          if (!initialGlobalRaceNames.includes(currentTargetRace) || currentTargetRace === "") {
             setTargetRace(initialGlobalRaceNames[0]);
          }
        } else {
          setSourceRaces([{ race: "", time: "" }]);
          setTargetRace("");
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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps 

  useEffect(() => {
    let newRaceNamesList: string[];
    if (dataSourceMode === 'euWinner') {
      newRaceNamesList = getEuRacesByCountry(selectedCountry).filter(name => name.trim() !== "");
    } else {
      newRaceNamesList = getRaceNames().filter(name => name.trim() !== "");
    }
    setRaceNames(newRaceNamesList);
    
    // Reset selections if they are no longer valid in the new list
    const isSourceRaceValid = (race: string) => race.trim() !== "" && newRaceNamesList.includes(race);
    const isTargetRaceValid = (race: string) => race.trim() !== "" && newRaceNamesList.includes(race);

    const updatedSourceRaces = sourceRaces.map(entry => {
      if (!isSourceRaceValid(entry.race)) {
        return { ...entry, race: newRaceNamesList.length > 0 ? newRaceNamesList[0] : "placeholder" };
      }
      return entry;
    });
    setSourceRaces(updatedSourceRaces.length > 0 ? updatedSourceRaces : [{ race: newRaceNamesList.length > 0 ? newRaceNamesList[0] : "placeholder", time: "" }]);
    
    if (!isTargetRaceValid(targetRace)) {
      setTargetRace(newRaceNamesList.length > 0 ? newRaceNamesList[0] : "placeholder");
    }
    
    // Handle case where newRaceNamesList is empty
    if (newRaceNamesList.length === 0) {
        setSourceRaces([{ race: "placeholder", time: "" }]);
        setTargetRace("placeholder");
    }

  }, [selectedCountry, dataSourceMode]); // eslint-disable-line react-hooks/exhaustive-deps

  const addSourceRace = () => {
    if (raceNames.length === 0) return;
    const defaultNewRace = raceNames.length > 0 ? raceNames[0] : "placeholder";
    setSourceRaces([...sourceRaces, { race: defaultNewRace, time: "" }]);
  };
  
  const removeSourceRace = (index: number) => {
    if (sourceRaces.length === 1) {
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
  
  const getRaceDetails = (eventName: string): EuRaceData | undefined => {
    return getRaceDetailsFromService(eventName); // Use the aliased import
  };
  
  return {
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
  };
}
