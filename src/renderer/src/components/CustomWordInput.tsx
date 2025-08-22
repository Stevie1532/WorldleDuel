import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import validWordsData from '../data/validWords.json'

interface CustomWordInputProps {
  onWordSubmit: (word: string) => void
  onRandomWord: () => void
  disabled?: boolean
  isLoading?: boolean
}

export function CustomWordInput({ onWordSubmit, onRandomWord: _onRandomWord, disabled = false, isLoading = false }: CustomWordInputProps) {
  const [customWord, setCustomWord] = useState('')
  const [isValid, setIsValid] = useState(false)
  const [validationMessage, setValidationMessage] = useState('')
  const [searchResults, setSearchResults] = useState<string[]>([])

  // Use the comprehensive word list from JSON
  const validWords = validWordsData.words

  useEffect(() => {
    validateWord(customWord)
  }, [customWord])

  const validateWord = async (word: string) => {
    if (!word) {
      setIsValid(false)
      setValidationMessage('')
      setSearchResults([])
      return
    }

    if (word.length !== 5) {
      setIsValid(false)
      setValidationMessage('Word must be exactly 5 letters')
      setSearchResults([])
      return
    }

    if (!/^[A-Z]+$/.test(word)) {
      setIsValid(false)
      setValidationMessage('Word must contain only letters')
      setSearchResults([])
      return
    }

    // First check local validation for immediate feedback
    if (validWords.includes(word)) {
      setIsValid(true)
      setValidationMessage('✅ Valid word!')
      setSearchResults([])
    } else {
      setIsValid(false)
      setValidationMessage('Word not in dictionary')
      
      // Show similar word suggestions from local list
      const suggestions = validWords
        .filter(w => w.startsWith(word.substring(0, 2)) || w.includes(word.substring(0, 2)))
        .slice(0, 8)
      setSearchResults(suggestions)
    }
  }

  const handleSubmit = () => {
    if (isValid && customWord) {
      onWordSubmit(customWord.toUpperCase())
      setCustomWord('')
      setSearchResults([])
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isValid) {
      handleSubmit()
    }
  }

  const handleWordSuggestion = (word: string) => {
    setCustomWord(word)
    setSearchResults([])
  }

  const getRandomWord = () => {
    const randomIndex = Math.floor(Math.random() * validWords.length)
    return validWords[randomIndex]
  }

  const handleRandomWord = () => {
    const randomWord = getRandomWord()
    setCustomWord(randomWord)
    setSearchResults([])
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-xl font-bold mb-4 text-center">🎯 Set Custom Word</h3>
      
      <div className="space-y-4">
        {/* Custom Word Input */}
        <div>
          <label className="block text-sm font-medium mb-2">Enter a 5-letter word</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={customWord}
              onChange={(e) => setCustomWord(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              placeholder="e.g., HELLO"
              maxLength={5}
              disabled={disabled || isLoading}
              className={`flex-1 px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-[#1a1a1a] focus:border-transparent transition-colors ${
                customWord.length === 5
                  ? isValid
                    ? 'border-green-500 bg-green-50'
                    : 'border-red-500 bg-red-50'
                  : 'border-gray-300'
              }`}
            />
            <button
              onClick={handleSubmit}
              disabled={!isValid || disabled || isLoading}
              className="px-6 py-3 bg-[#1a1a1a] text-white rounded-lg font-semibold hover:bg-[#333] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Setting...' : 'Set Word'}
            </button>
          </div>
          
          {/* Validation Message */}
          <AnimatePresence>
            {validationMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`mt-2 text-sm font-medium ${
                  isValid ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {validationMessage}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Word Suggestions */}
          {searchResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg"
            >
              <div className="text-sm text-blue-800 mb-2">💡 Similar words:</div>
              <div className="grid grid-cols-4 gap-2">
                {searchResults.map((word, index) => (
                  <button
                    key={index}
                    onClick={() => handleWordSuggestion(word)}
                    className="p-2 bg-white rounded hover:bg-blue-100 transition-colors text-sm font-mono"
                  >
                    {word}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Random Word Button */}
        <div className="text-center">
          <span className="text-gray-500 text-sm">or</span>
          <button
            onClick={handleRandomWord}
            disabled={disabled || isLoading}
            className="ml-2 px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            🎲 Use Random Word
          </button>
        </div>

        {/* Word Statistics */}
        <div className="text-center">
          <details className="text-sm text-gray-600">
            <summary className="cursor-pointer hover:text-gray-800">
              📊 Word Database Info
            </summary>
            <div className="mt-2 p-3 bg-gray-100 rounded-lg">
              <div className="text-xs space-y-1">
                <div>Total valid words: <span className="font-semibold">{validWords.length.toLocaleString()}</span></div>
                <div>Source: <span className="font-semibold">{validWordsData.source}</span></div>
                <div>Description: <span className="font-semibold">{validWordsData.description}</span></div>
              </div>
            </div>
          </details>
        </div>

        {/* Quick Word Picker */}
        <div className="text-center">
          <details className="text-sm text-gray-600">
            <summary className="cursor-pointer hover:text-gray-800">
              🎯 Quick Word Picker
            </summary>
            <div className="mt-2 p-3 bg-gray-100 rounded-lg">
              <div className="grid grid-cols-4 gap-2 text-xs">
                {['HELLO', 'WORLD', 'GAMES', 'PLAYS', 'SMART', 'BRAIN', 'QUICK', 'FAST'].map((word, index) => (
                  <button
                    key={index}
                    onClick={() => handleWordSuggestion(word)}
                    className="p-1 bg-white rounded hover:bg-gray-200 transition-colors"
                  >
                    {word}
                  </button>
                ))}
              </div>
            </div>
          </details>
        </div>
      </div>
    </div>
  )
}
