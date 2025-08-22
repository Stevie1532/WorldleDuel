import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Game utility functions
export function evaluateGuess(guess: string, solution: string): ('correct' | 'present' | 'absent')[] {
  const evaluation: ('correct' | 'present' | 'absent')[] = []
  const solutionArray = solution.split('')
  const guessArray = guess.split('')
  
  // First pass: mark correct letters
  for (let i = 0; i < 5; i++) {
    if (guessArray[i] === solutionArray[i]) {
      evaluation[i] = 'correct'
      solutionArray[i] = '' // Mark as used
    }
  }
  
  // Second pass: mark present and absent letters
  for (let i = 0; i < 5; i++) {
    if (evaluation[i] === 'correct') continue
    
    const letterIndex = solutionArray.indexOf(guessArray[i])
    if (letterIndex !== -1) {
      evaluation[i] = 'present'
      solutionArray[letterIndex] = '' // Mark as used
    } else {
      evaluation[i] = 'absent'
    }
  }
  
  return evaluation
}

export function isValidWord(word: string): boolean {
  return word.length === 5 && /^[A-Za-z]{5}$/.test(word)
}

export function generateRoomCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}
