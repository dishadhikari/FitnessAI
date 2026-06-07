"use client";
import Link from "next/link";
export default function Home()
{
  return(
    <main>
      FitMeAI<br></br>
      Get AI-powered personalized workout plans and real-time computer vision to track exercise execution and progress of your workouts
      <nav>
        <a href="/plan">Plan AI</a><br></br>
        <a href="#">News</a><br></br>
        <a href="#">Nearby Gyms</a><br></br>
        <a href="#">Blogs</a><br></br>
          <button>
          <a href="/login">Log In/Sign Up</a>
          </button> <br></br>
      </nav>
    </main>
  )
}