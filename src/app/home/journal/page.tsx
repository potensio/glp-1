import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";

const journalEntries = [
  {
    date: "Saturday, January 11, 2025",
    content: [
      {
        question: "How are you feeling today?",
        answer:
          "Today I felt really good about my progress. I managed to stick to my medication schedule and even went for a 30-minute walk. The weather was perfect - not too cold, not too warm. I’ve been thinking about how much my energy levels have improved since starting this health journey.\n\nI noticed that my mood has been more stable lately. I think the combination of regular exercise, proper medication, and keeping track of my health metrics is really paying off. Dr. Smith mentioned that consistency is key, and I’m finally starting to see what she meant.\n\nTomorrow I want to try that new recipe I found – the one with salmon and vegetables. It looks healthy",
      },
    ],
  },
  {
    date: "Friday, January 10, 2025",
    content: [
      {
        question: "How are you feeling today?",
        answer:
          "Had a bit of a rough day today. Forgot to take my morning medication and didn’t realize until evening. Made a note to set up better reminders in the app.\n\nBlood pressure was a bit higher than usual - probably stress from work. Need to work on managing that better. Maybe I should try those breathing exercises the app suggested.\n\nOn the positive side. I did meal prep for the weekend. so that’s something to be proud of.",
      },
    ],
  },
  {
    date: "Thursday, January 9, 2025",
    content: [
      {
        question: "How are you feeling today?",
        answer:
          "Great day! Weight is down 2 pounds from last week. Feeling motivated to keep going with the healthy eating plan.",
      },
    ],
  },
  {
    date: "Wednesday, January 8, 2025",
    content: [
      {
        question: "How are you feeling today?",
        answer: "Start writing your thoughts here…",
      },
    ],
  },
];

export default function JournalPage() {
  return (
    <div className="flex flex-col gap-8 pb-8 min-h-[80vh]">
      {/* Title and Month Navigation */}
      <div className="flex flex-col sm:flex-row justify-between">
        <div className="flex flex-col">
          <h1 className="text-background text-3xl leading-tight font-semibold mb-2">
            Journal
          </h1>
          <p className="text-background text-lg mb-6">
            Your personal space for thoughts and reflections
          </p>
        </div>{" "}
        <Button
          size={"lg"}
          variant={"outline"}
          className="md:w-36 bg-transparent text-background hover:bg-background/10 hover:text-background"
        >
          Add New Entry
        </Button>
      </div>

      {/* Journal Entries */}
      <div className="flex flex-col gap-6">
        {journalEntries.map((entry) => (
          <Card key={entry.date} className="p-0">
            <div className="flex items-center justify-between px-6 pt-6 pb-1">
              <span className="font-semibold text-base">{entry.date}</span>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                aria-label="Entry Options"
              >
                <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
              </Button>
            </div>
            <CardContent className="pt-0 pb-4">
              {entry.content.map((c, i) => (
                <div key={i} className="mb-2">
                  <div className="italic text-muted-foreground text-sm mb-2">
                    {c.question}
                  </div>
                  <div className="whitespace-pre-line text-base text-foreground">
                    {c.answer}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add New Entry Button */}
      <div className="flex justify-center mt-8">
        <Button
          size="lg"
          className="w-full max-w-xs text-base font-semibold py-6 rounded-xl shadow-md"
        >
          + Add New Entry
        </Button>
      </div>
    </div>
  );
}
