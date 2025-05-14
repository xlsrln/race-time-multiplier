
import React from 'react';

interface PredictionResultProps {
  time: string;
  min: string;
  max: string;
  sourceRacesCount: number;
}

const PredictionResult: React.FC<PredictionResultProps> = ({
  time,
  min,
  max,
  sourceRacesCount
}) => {
  return (
    <div className="mt-6 p-4 border rounded-lg bg-muted/50 space-y-3">
      <div>
        <p className="text-sm font-medium text-muted-foreground">Predicted time:</p>
        <p className="text-3xl font-bold text-center">{time}</p>
      </div>
      
      {sourceRacesCount > 1 && (
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Min prediction:</p>
            <p className="text-lg font-semibold">{min}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Max prediction:</p>
            <p className="text-lg font-semibold">{max}</p>
          </div>
        </div>
      )}
      
      <div className="pt-2 text-xs text-muted-foreground border-t border-border/50">
        <p className="italic">Disclaimer: Race conditions and routes may vary year to year. These predictions should be considered as indications only.</p>
      </div>
    </div>
  );
};

export default PredictionResult;
