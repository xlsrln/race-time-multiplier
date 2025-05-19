
import { EuWinnerPredictor } from "@/components";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const EuWinnerBeta = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted">
      <main className="container max-w-4xl px-4 py-8">
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center justify-between w-full">
            <Button variant="ghost" size="sm" asChild className="self-start">
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to standard calculator
              </Link>
            </Button>
          </div>
          
          <h1 className="text-4xl font-extrabold text-center">European Winner Times Calculator</h1>
          <p className="text-muted-foreground text-center">Beta Version</p>
          
          <div className="flex justify-center w-full">
            <EuWinnerPredictor />
          </div>
        </div>
      </main>
    </div>
  );
};

export default EuWinnerBeta;
