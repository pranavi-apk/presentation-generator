import { PresentationGenerator } from "./components/PresentationGenerator";

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col py-12 px-4 sm:px-6 lg:px-8 selection:bg-primary/30 selection:text-primary-foreground">
      <main className="flex-1 container mx-auto">
        <PresentationGenerator />
      </main>
      
      <footer className="mt-12 text-center text-sm text-muted-foreground opacity-50 hover:opacity-100 transition-opacity">
        <p>Built with React + Gemini API</p>
      </footer>
    </div>
  );
}

export default App;
