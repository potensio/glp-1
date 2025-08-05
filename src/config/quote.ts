export const CONFIG = {
  motivationQuotes: [
    {
      quote: "Small steps lead to big results.",
      author: "",
    },
    {
      quote: "Progress over perfection.",
      author: "",
    },
    {
      quote: "You're showing up — that’s what matters.",
      author: "",
    },
    {
      quote: "One choice at a time.",
      author: "",
    },
    {
      quote: "Today’s win is consistency.",
      author: "",
    },
    {
      quote: "You don’t have to be perfect to make progress.",
      author: "",
    },
    {
      quote: "Momentum beats motivation.",
      author: "",
    },
    {
      quote: "Trust the process. It’s working.",
      author: "",
    },
    {
      quote: "Slow change is lasting change.",
      author: "",
    },
    {
      quote: "One day, one decision, one direction.",
      author: "",
    },
    {
      quote: "You’re stronger than you think.",
      author: "",
    },
    {
      quote: "Health is built daily.",
      author: "",
    },
    {
      quote: "Don’t quit. Adjust.",
      author: "",
    },
    {
      quote: "Data is feedback, not failure.",
      author: "",
    },
    {
      quote: "Every meal is a fresh start.",
      author: "",
    },
    {
      quote: "Your future self is proud of you.",
      author: "",
    },
    {
      quote: "Consistency is the key to transformation.",
      author: "",
    },
    {
      quote: "You’re not behind. You’re building.",
      author: "",
    },
    {
      quote: "One day at a time. One step at a time.",
      author: "",
    },
    {
      quote: "The best time to restart is now.",
      author: "",
    },
    {
      quote: "Celebrate small victories.",
      author: "",
    },
    {
      quote: "You are more than a number.",
      author: "",
    },
    {
      quote: "Fuel your body. Feed your mind.",
      author: "",
    },
    {
      quote: "You didn’t come this far to only come this far.",
      author: "",
    },
    {
      quote: "Every choice is a vote for your future.",
      author: "",
    },
    {
      quote: "Keep going. The data tells your story.",
      author: "",
    },
    {
      quote: "One week at a time — that’s how habits win.",
      author: "",
    },
    {
      quote: "Be kind to yourself. You're growing.",
      author: "",
    },
    {
      quote: "Let your journal be your compass.",
      author: "",
    },
    {
      quote: "Success leaves a trail — you're writing yours.",
      author: "",
    },
    {
      quote: "Every step forward counts — even the small ones.",
      author: "",
    },
    {
      quote: "You’re creating something better, one entry at a time.",
      author: "",
    },
    {
      quote: "Routines build resilience.",
      author: "",
    },
    {
      quote: "Let today be a new page.",
      author: "",
    },
    {
      quote: "Your effort is the best investment you can make.",
      author: "",
    },
    {
      quote: "Better is better. That’s enough.",
      author: "",
    },
    {
      quote: "Stay steady. Results follow consistency.",
      author: "",
    },
    {
      quote: "Small wins stack up.",
      author: "",
    },
    {
      quote: "This is progress. You’re living it.",
      author: "",
    },
    {
      quote: "Your journal is proof of your commitment.",
      author: "",
    },
  ],
};

export const getRandomQuote = () => {
  const randomIndex = Math.floor(
    Math.random() * CONFIG.motivationQuotes.length
  );
  return CONFIG.motivationQuotes[randomIndex];
};
