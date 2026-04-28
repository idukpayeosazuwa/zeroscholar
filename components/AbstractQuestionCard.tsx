import React, { useState } from 'react';
import { AbstractQuestion } from '../types';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';

interface AbstractQuestionCardProps {
  question: AbstractQuestion;
  questionNumber: number;
  onAnswer?: (questionId: string, selectedAnswer: string, isCorrect: boolean) => void;
}

export const AbstractQuestionCard: React.FC<AbstractQuestionCardProps> = ({ 
  question, 
  questionNumber,
  onAnswer 
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleAnswerSelect = (answer: string) => {
    if (selectedAnswer !== null) return; // Already answered
    
    setSelectedAnswer(answer);
    const isCorrect = answer === question.correctAnswer;
    
    if (onAnswer) {
      onAnswer(question.id, answer, isCorrect);
    }
  };

  const isCorrect = selectedAnswer === question.correctAnswer;
  const hasAnswered = selectedAnswer !== null;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      {/* Question Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-2.5 py-0.5 rounded">
              Question {questionNumber}
            </span>
            {question.difficulty && (
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded ${
                question.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {question.difficulty.toUpperCase()}
              </span>
            )}
            {question.timeLimit && (
              <span className="text-xs text-gray-500">
                {question.timeLimit}s
              </span>
            )}
          </div>
          <p className="text-gray-900 font-medium text-lg">{question.question}</p>
        </div>
      </div>

      {/* Pattern Image */}
      <div className="mb-4 bg-gray-50 rounded-lg p-4 flex justify-center">
        <img 
          src={question.imageUrl} 
          alt={`Abstract reasoning question ${questionNumber}`}
          className="max-w-full h-auto rounded"
          style={{ maxHeight: '500px' }}
        />
      </div>

      {/* Options */}
      <div className="grid grid-cols-5 gap-3 mb-4">
        {question.options.map((option) => {
          const isSelected = selectedAnswer === option;
          const isCorrectAnswer = option === question.correctAnswer;
          
          let buttonClass = "px-6 py-4 border-2 rounded-lg font-bold text-lg transition-all ";
          
          if (!hasAnswered) {
            buttonClass += "border-gray-300 hover:border-purple-500 hover:bg-purple-50";
          } else if (isSelected && isCorrect) {
            buttonClass += "border-green-500 bg-green-50 text-green-700";
          } else if (isSelected && !isCorrect) {
            buttonClass += "border-red-500 bg-red-50 text-red-700";
          } else if (isCorrectAnswer) {
            buttonClass += "border-green-500 bg-green-50 text-green-700";
          } else {
            buttonClass += "border-gray-300 opacity-50";
          }

          return (
            <button
              key={option}
              onClick={() => handleAnswerSelect(option)}
              disabled={hasAnswered}
              className={buttonClass}
            >
              <div className="flex flex-col items-center">
                <span>{option}</span>
                {hasAnswered && isCorrectAnswer && (
                  <CheckCircleIcon className="h-4 w-4 text-green-600 mt-1" />
                )}
                {hasAnswered && isSelected && !isCorrect && (
                  <XCircleIcon className="h-4 w-4 text-red-600 mt-1" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Result Feedback */}
      {hasAnswered && (
        <div className={`p-4 rounded-lg mb-4 ${
          isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center gap-2">
            {isCorrect ? (
              <>
                <CheckCircleIcon className="h-6 w-6 text-green-600 flex-shrink-0" />
                <span className="font-semibold text-green-800">Correct!</span>
              </>
            ) : (
              <>
                <XCircleIcon className="h-6 w-6 text-red-600 flex-shrink-0" />
                <span className="font-semibold text-red-800">
                  Incorrect. The correct answer is {question.correctAnswer}
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Explanation */}
      {hasAnswered && question.explanation && (
        <div className="border-t pt-4">
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="text-purple-600 hover:text-purple-800 font-medium text-sm mb-2"
          >
            {showExplanation ? '▼ Hide Explanation' : '▶ Show Explanation'}
          </button>
          {showExplanation && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-sm text-gray-700">
              {question.explanation}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AbstractQuestionCard;
