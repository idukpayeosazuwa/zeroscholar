import React, { useState } from 'react';
import VerbalQuestionCard from '../components/VerbalQuestionCard';
import verbalTest1Data from '../data/aptitude/verbal-test1.json';
import { VerbalQuestion } from '../types';

const VerbalTest1Preview: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());

  const questions = verbalTest1Data as VerbalQuestion[];
  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const allAnswered = answeredQuestions.size === totalQuestions;

  const handleAnswer = (isCorrect: boolean) => {
    if (!answeredQuestions.has(currentQuestionIndex)) {
      setAnsweredQuestions(new Set(answeredQuestions).add(currentQuestionIndex));
      if (isCorrect) {
        setScore(score + 1);
      }
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Verbal Reasoning - Test 1
        </h1>
        <p className="text-gray-600">
          Read each passage carefully and determine if the statement is True, False, or Cannot Say based on the information provided.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </span>
          <span className="text-sm font-medium text-gray-700">
            Score: {score}/{totalQuestions} ({percentage}%)
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Test Completion Summary */}
      {allAnswered && (
        <div className="mb-6 p-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg text-white">
          <h2 className="text-2xl font-bold mb-2">Test Complete!</h2>
          <p className="text-lg mb-4">
            You scored <span className="font-bold text-2xl">{score}</span> out of{' '}
            <span className="font-bold text-2xl">{totalQuestions}</span> ({percentage}%)
          </p>
          <p className="text-sm opacity-90">
            {percentage >= 80
              ? 'Excellent work! You have a strong grasp of verbal reasoning.'
              : percentage >= 60
              ? 'Good job! Keep practicing to improve your critical thinking skills.'
              : 'Keep practicing! Review the explanations to strengthen your understanding.'}
          </p>
        </div>
      )}

      {/* Question Card */}
      <VerbalQuestionCard
        question={currentQuestion}
        questionNumber={currentQuestionIndex + 1}
        onAnswer={handleAnswer}
      />

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center mt-6">
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          ← Previous
        </button>
        <button
          onClick={handleNext}
          disabled={currentQuestionIndex === totalQuestions - 1}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default VerbalTest1Preview;
