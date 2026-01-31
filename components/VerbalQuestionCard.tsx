import React, { useState } from 'react';
import { VerbalQuestion } from '../types';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';

interface VerbalQuestionCardProps {
  question: VerbalQuestion;
  questionNumber: number;
  onAnswer: (isCorrect: boolean) => void;
}

const VerbalQuestionCard: React.FC<VerbalQuestionCardProps> = ({
  question,
  questionNumber,
  onAnswer,
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleAnswerSelect = (option: string) => {
    if (selectedAnswer) return; // Already answered

    const answerLetter = option.charAt(0); // Extract 'A', 'B', or 'C'
    setSelectedAnswer(answerLetter);
    const isCorrect = answerLetter === question.correctAnswer;
    onAnswer(isCorrect);
    
    // Auto-show explanation after answering
    setTimeout(() => setShowExplanation(true), 300);
  };

  const isCorrect = selectedAnswer === question.correctAnswer;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      {/* Question Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-blue-600">
            Question {questionNumber}
          </span>
          {selectedAnswer && (
            <span
              className={`flex items-center text-sm font-medium ${
                isCorrect ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {isCorrect ? (
                <>
                  <CheckCircleIcon className="h-5 w-5 mr-1" />
                  Correct
                </>
              ) : (
                <>
                  <XCircleIcon className="h-5 w-5 mr-1" />
                  Incorrect
                </>
              )}
            </span>
          )}
        </div>
      </div>

      {/* Passage */}
      {question.passage && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Passage
          </h4>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {question.passage}
          </p>
        </div>
      )}

      {/* Question Text */}
      <div className="mb-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">
          {question.question}
        </h3>

        {/* Options */}
        <div className="space-y-3">
          {question.options.map((option, index) => {
            const optionLetter = option.charAt(0);
            const isSelected = selectedAnswer === optionLetter;
            const isCorrectOption = optionLetter === question.correctAnswer;
            const showAsCorrect = selectedAnswer && isCorrectOption;
            const showAsIncorrect = isSelected && !isCorrect;

            return (
              <button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                disabled={!!selectedAnswer}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  showAsCorrect
                    ? 'border-green-500 bg-green-50'
                    : showAsIncorrect
                    ? 'border-red-500 bg-red-50'
                    : isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                } ${selectedAnswer ? 'cursor-default' : 'cursor-pointer'}`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-sm font-medium ${
                      showAsCorrect
                        ? 'text-green-900'
                        : showAsIncorrect
                        ? 'text-red-900'
                        : 'text-gray-900'
                    }`}
                  >
                    {option}
                  </span>
                  {showAsCorrect && <CheckCircleIcon className="h-5 w-5 text-green-600" />}
                  {showAsIncorrect && <XCircleIcon className="h-5 w-5 text-red-600" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Explanation */}
      {selectedAnswer && (
        <div className="mt-6 border-t pt-4">
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="flex items-center justify-between w-full text-left"
          >
            <span className="text-sm font-semibold text-gray-700">
              Explanation
            </span>
            <span className="text-gray-500">
              {showExplanation ? '▼' : '▶'}
            </span>
          </button>
          {showExplanation && (
            <div className="mt-3 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {question.explanation}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VerbalQuestionCard;
