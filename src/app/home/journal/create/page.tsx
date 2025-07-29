"use client";

import JournalEditor from "@/components/journal-editor";

export default function Home() {
  return (
    <>
      {" "}
      <h1 className="text-background text-2xl md:text-3xl leading-tight font-semibold mb-2 md:mb-6">
        How are you feeling today?
      </h1>{" "}
      <div className="mx-[-16px] md:mx-0">
        <JournalEditor />
      </div>
    </>
  );
}
