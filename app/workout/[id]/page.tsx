"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Exercise = {
  name: string;
  sets: number;
  reps: number;
  notes?: string;
};

type DayPlan = {
  day: string;
  focus: string;
  exercises: Exercise[];
};

type Plan = {
  goal: string;
  level: string;
  weekPlan: DayPlan[];
};

export default function WorkoutPage() {
  const { id } = useParams();
  const router = useRouter();

  const [plan, setPlan] = useState<Plan | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  useEffect(() => {
    const fetchWorkout = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/getplan/${id}`
        );

        const data = await res.json();

        // Your backend returns:
        // {
        //   id,
        //   userid,
        //   goal,
        //   level,
        //   plan
        // }

        setPlan(data.plan);

      } catch (err) {
        console.log(err);
      }
    };

    fetchWorkout();
  }, [id]);

  if (!plan) {
    return <p style={{ padding: 20 }}>Loading workout...</p>;
  }

  return (
    <div style={{ maxWidth: 800, margin: "auto", padding: 20 }}>
      <h1>🏋️ Your Workout Plan</h1>

      <p>
        <b>Goal:</b> {plan.goal}
      </p>

      <p>
        <b>Level:</b> {plan.level}
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          marginTop: 20,
        }}
      >
        {plan.weekPlan.map((day, index) => (
          <div
            key={index}
            onClick={() => setSelectedDay(index)}
            style={{
              border: "1px solid #ccc",
              borderRadius: 10,
              padding: 15,
              cursor: "pointer",
              background:
                selectedDay === index ? "#f0f8ff" : "white",
            }}
          >
            <h3>{day.day}</h3>

            <p>{day.focus}</p>

            <p>{day.exercises.length} exercises</p>
          </div>
        ))}
      </div>

      {selectedDay !== null && (
        <div
          style={{
            marginTop: 30,
            border: "2px solid black",
            borderRadius: 10,
            padding: 20,
          }}
        >
          <h2>
            {plan.weekPlan[selectedDay].day} -{" "}
            {plan.weekPlan[selectedDay].focus}
          </h2>

          {plan.weekPlan[selectedDay].exercises.map((exercise, index) => (
            <div
              key={index}
              style={{
                marginBottom: 15,
                borderBottom: "1px solid #ddd",
                paddingBottom: 10,
              }}
            >
              <b>{exercise.name}</b>

              <p>
                {exercise.sets} sets × {exercise.reps} reps
              </p>

              {exercise.notes && (
                <small>💡 {exercise.notes}</small>
              )}
            </div>
          ))}

          <button
            onClick={() =>
              router.push(`/workout/${id}/${selectedDay}`)
            }
            style={{
              marginTop: 20,
              padding: "10px 15px",
              background: "black",
              color: "white",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            Start Workout ▶
          </button>
        </div>
      )}
    </div>
  );
}