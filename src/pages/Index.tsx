
import { RacePredictor } from "@/components";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted">
      <main className="container max-w-4xl px-4 py-8">
        <h1 className="text-4xl font-extrabold text-center mb-4">Ultra race time calculator</h1>
        
        <div className="flex justify-center mb-8">
          <Button variant="outline" size="sm" asChild>
            <Link to="/eu-winner-beta">
              Try the European Winner Times Beta
            </Link>
          </Button>
        </div>
        
        <div className="flex justify-center">
          <RacePredictor />
        </div>
      </main>
    </div>
  );
};

export default Index;
