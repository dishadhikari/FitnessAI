"use client";
import { useState } from "react";
import { questions } from "../../lib/questions";
import {useRouter} from "next/navigation";

type Answers = Record<string, string>;

type Plan = {
  goal: string;
  level: string;
  weekPlan: {
    day: string;
    focus: string;
    exercises: {
      name: string;
      sets: number;
      reps: number;
      notes?: string;
    }[];
  }[];
};

export default function PlanPage() {
  const router=useRouter();

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [messages, setMessages] = useState<
    { role: "bot" | "user"; content: string }[]
  >([
    {
      role: "bot",
      content: "Hi 👋 I am your AI fitness coach. Let’s build your plan.",
    },
    {
      role: "bot",
      content: questions[0].question,
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<Plan | null>(null);

  const handleAnswer = (option: string) => {
    const question = questions[step];

    const updatedAnswers = {
      ...answers,
      [question.id]: option,
    };

    setAnswers(updatedAnswers);

    setMessages((prev) => [...prev, { role: "user", content: option }]);

    const nextStep = step + 1;

    if (nextStep < questions.length) {
      setStep(nextStep);

      setMessages((prev) => [
        ...prev,
        { role: "bot", content: questions[nextStep].question },
      ]);
    } else {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content: "Generating your workout plan... 💪",
        },
      ]);

      generatePlan(updatedAnswers);
    }
  };

  const generatePlan = async (data: Answers) => {
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/generateplan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      setPlan(result);

      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content: "Your plan is ready! 🎉",
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content: "Something went wrong while generating your plan.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "700px", margin: "auto" }}>
      <h1>AI Fitness Coach</h1>

      {/* CHAT */}
      <div
        style={{
          border: "1px solid #ddd",
          padding: "10px",
          minHeight: "250px",
          marginBottom: "20px",
        }}
      >
        {messages.map((msg, i) => (
          <div key={i} style={{ margin: "8px 0" }}>
            <b>{msg.role === "bot" ? "AI" : "You"}:</b> {msg.content}
          </div>
        ))}
      </div>

      {/* QUESTIONS */}
      {step < questions.length && !loading && (
        <div>
          <p style={{ fontWeight: "bold" }}>
            {questions[step].question}
          </p>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {questions[step].options.map((opt) => (
              <button
                key={opt}
                onClick={() => handleAnswer(opt)}
                style={{
                  padding: "8px 12px",
                  border: "1px solid black",
                  cursor: "pointer",
                  borderRadius: "6px",
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* LOADING */}
      {loading && <p>⏳ Generating your personalized plan...</p>}

      {/* PLAN OUTPUT */}
      {plan && (
        <div style={{ marginTop: "20px" }}>
          <h2>🏋️ Your Weekly Plan</h2>

          <p>
            <b>Goal:</b> {plan.goal}
          </p>
          <p>
            <b>Level:</b> {plan.level}
          </p>
          {plan?.weekPlan?.map((day, i) => (
            <div
              key={i}
              style={{
                border: "1px solid #ccc",
                padding: "12px",
                marginTop: "10px",
                borderRadius: "8px",
              }}
            >
              <h3>
                {day.day} — <small>{day.focus}</small>
              </h3>

              {day.exercises.map((ex, j) => (
                <div key={j} style={{ marginBottom: "6px" }}>
                  <b>{ex.name}</b> — {ex.sets} sets × {ex.reps} reps
                  {ex.notes && (
                    <p style={{ margin: 0, fontSize: "12px" }}>
                      💡 {ex.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ))}

          {/* USE PLAN BUTTON */}
          <button
            onClick={async() => {
               const res=await fetch("http://localhost:5000/saveplan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({userid:1,plan}),
              });
              const saved=await res.json();
              alert("Plan saved successfully 💪");
              router.push(`/plan/${saved.id}`);
            }}
            style={{
              marginTop: "15px",
              padding: "10px 15px",
              background: "black",
              color: "white",
              border: "none",
              cursor: "pointer",
              borderRadius: "6px",
            }}
          >
            Use This Plan
          </button>
        </div>
      )}
    </div>
  );
}