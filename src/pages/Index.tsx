
import RacePredictor from "@/components/RacePredictor";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted">
      <main className="container max-w-4xl px-4 py-8">
        <h1 className="text-4xl font-extrabold text-center mb-8">Race Time Calculator</h1>
        <div className="flex justify-center">
          <RacePredictor />
        </div>
      </main>
    </div>
  );
};

export default Index;
