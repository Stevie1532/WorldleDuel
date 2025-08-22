import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: About
})

function About() {
  return (
    <div className="min-h-screen bg-[#f4f4f1] text-black flex flex-col items-center justify-center font-serif px-4 py-8 sm:px-6 md:px-10">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl sm:text-5xl font-black mb-6">About Wordle</h1>
        <p className="text-lg mb-4">
          Wordle is a daily word guessing game where players have six attempts to guess a five-letter word.
        </p>
        <p className="text-base mb-4">
          After each guess, the color of the tiles will change to show how close your guess was to the word.
        </p>
        <div className="text-sm text-gray-600 mt-8">
          <p>Created by Josh Wardle</p>
          <p>Edited by Stevie</p>
        </div>
      </div>
    </div>
  )
}
