import React from 'react'
import wordleicon from './assets/wordleIcon.png'
import dayjs from 'dayjs'

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f4f4f1] text-black flex flex-col items-center justify-center font-serif px-4 py-8 sm:px-6 md:px-10">
      {/* Icon */}
      <div className="mb-4 sm:mb-6">
        <div className="w-16 h-16 sm:w-20 sm:h-20">
          <img src={wordleicon} alt="Wordle Logo" className="w-full h-full object-contain" />
        </div>
      </div>

      {/* Title */}
      <h1 className="text-4xl sm:text-5xl font-black mb-3 sm:mb-4">Wordle</h1>
      <p className="text-base sm:text-lg mb-5 sm:mb-6 text-center">
        Get 6 chances to guess
        <br className="hidden sm:block" /> a 5-letter word.
      </p>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4 mb-6">
        <button className="border border-black rounded-full px-5 py-2 hover:bg-black hover:text-white transition">
          Subscribe
        </button>
        <button className="border border-black rounded-full px-5 py-2 hover:bg-black hover:text-white transition">
          Log in
        </button>
        <button className="bg-black text-white rounded-full px-6 py-2 font-semibold hover:opacity-80 transition">
          Play
        </button>
      </div>

      {/* Footer Info */}
      <div className="text-center text-sm mt-4 space-y-1">
        <p>{dayjs().format('MMMM D, YYYY')}</p>
        <p>No. {dayjs().diff('2020-06-19', 'day') + 1}</p>
        <p>Edited by Stevie</p>
      </div>
    </div>
  )
}

export default App
