import type { Chapter, Card, Exam } from "../src/lib/content";
type Question = [
  question: string,
  correctAnswer: string,
  distractors: [string, string, string],
  explanation: string,
];
export function chapter(
  id: string,
  title: string,
  description: string,
  minutes: number,
  sections: Chapter["sections"],
  takeaway: string,
  questions: Question[],
  written: [string, string, string[]],
): Chapter {
  const cards: Card[] = questions.map(
    ([question, answer, distractors, explanation], i) => {
      const choices = [...distractors];
      choices.splice(i % 4, 0, answer);
      return {
        id: `${id}-q${i + 1}`,
        question,
        answer,
        choices,
        correct: i % 4,
        explanation,
      };
    },
  );
  const exams: Exam[] = [
    {
      id: `${id}-e1`,
      question: written[0],
      modelAnswer: written[1],
      rubric: written[2],
    },
  ];
  return { id, title, description, minutes, sections, takeaway, cards, exams };
}
