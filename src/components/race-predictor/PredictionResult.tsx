import React from 'react';

interface PredictionResultData {
  time: string;
  min: string;
  max: string;
}

interface PredictionResultProps {
  avg?: PredictionResultData | string; // Made avg optional
  median?: PredictionResultData | string; // Allow string type
  winner?: PredictionResultData | string; // Allow string type
  sourceRacesCount: number;
}

const PredictionResult: React.FC<PredictionResultProps> = ({
  avg,
  median,
  winner,
  sourceRacesCount
}) => {
  const renderPredictionSection = (title: string, data: PredictionResultData | string | undefined, isPrimary: boolean = false) => {
    if (data === undefined) { 
      return null;
    }
    
    if (typeof data === 'string') {
      if (data.includes("N/A (Winner Mode)") && !title.toLowerCase().includes("winner")) {
        return null;
      }
      return (
        <div className={`p-4 border rounded-lg bg-muted/50 space-y-2 ${isPrimary ? '' : 'mt-4'}`}>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}:</p>
            <p className={`${isPrimary ? 'text-3xl' : 'text-2xl'} font-bold text-center ${data.toLowerCase().includes("no data") || data.toLowerCase().includes("no runners") || data.toLowerCase().includes("n/a") ? 'text-yellow-600' : ''}`}>{data}</p>
          </div>
        </div>
      );
    }
    
    return (
      <div className={`p-4 border rounded-lg bg-muted/50 space-y-2 ${isPrimary ? '' : 'mt-4'}`}>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}:</p>
          <p className={`${isPrimary ? 'text-3xl' : 'text-2xl'} font-bold text-center`}>{data.time}</p>
        </div>
        
        {sourceRacesCount > 1 && (
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Min prediction:</p>
              <p className="text-lg font-semibold">{data.min}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Max prediction:</p>
              <p className="text-lg font-semibold">{data.max}</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  let primaryTitle = "Prediction based on runners in common";
  let primaryData = avg;

  if (avg === undefined && winner) { 
    primaryTitle = "Prediction based on winner times";
    primaryData = winner;
  } else if (avg === undefined && median) { 
     primaryTitle = "Prediction based on median times";
     primaryData = median;
  }

  return (
    <div className="mt-6 space-y-4">
      {primaryData !== undefined && renderPredictionSection(primaryTitle, primaryData, true)}
      
      {median && primaryData !== median && renderPredictionSection("Prediction based on median times", median)}
      {winner && primaryData !== winner && renderPredictionSection("Prediction based on winner times", winner)}

      {avg === undefined && median === undefined && winner === undefined && (
        <div className="p-4 border rounded-lg bg-muted/50 space-y-2">
          <p className="text-lg font-bold text-center text-yellow-600">No prediction data available.</p>
        </div>
      )}
    </div>
  );
};

export default PredictionResult;
