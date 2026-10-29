import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="text-4xl font-semibold tracking-tight">PathFinder FCSIT</h1>
      <p className="text-muted-foreground max-w-md">
        Find the FCSIT bachelor programme that fits you best. Coming soon.
      </p>
      <Button disabled>Start the Match Quiz</Button>
    </main>
  );
}
