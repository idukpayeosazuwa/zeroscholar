import React, { useState } from 'react';
import { NumericalQuestion } from '../types';
import { ChartRenderer } from './ChartRenderer';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';

interface NumericalQuestionCardProps {
  question: NumericalQuestion;
  questionNumber: number;
  onAnswer?: (questionId: string, selectedAnswer: string, isCorrect: boolean) => void;
}

export const NumericalQuestionCard: React.FC<NumericalQuestionCardProps> = ({ 
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
            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
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
          </div>
          <p className="text-gray-900 font-medium text-lg">{question.question}</p>
        </div>
      </div>

      {/* Chart/Table or Images */}
      {question.imageUrls && question.imageUrls.length > 0 ? (
        <div className="mb-4 space-y-3">
          {question.imageUrls.map((url, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-2 md:p-4 flex justify-center">
              <img 
                src={url} 
                alt={`Numerical reasoning question ${questionNumber} - image ${index + 1}`}
                className="w-full h-auto rounded max-h-[360px] sm:max-h-[576px] md:max-h-[864px] lg:max-h-[1152px]"
              />
            </div>
          ))}
        </div>
      ) : question.imageUrl ? (
        <div className="mb-4 bg-gray-50 rounded-lg p-2 md:p-4 flex justify-center">
          <img 
            src={question.imageUrl} 
            alt={`Numerical reasoning question ${questionNumber}`}
            className="w-full h-auto rounded max-h-[360px] sm:max-h-[576px] md:max-h-[864px] lg:max-h-[1152px]"
          />
        </div>
      ) : question.chartConfig ? (
        <ChartRenderer config={question.chartConfig} />
      ) : null}

      {/* Options */}
      <div className="space-y-2 mb-4">
        {question.options.map((option, index) => {
          const optionLetter = option.charAt(0);
          const isSelected = selectedAnswer === optionLetter;
          const isCorrectAnswer = optionLetter === question.correctAnswer;
          
          let buttonClass = "w-full text-left px-4 py-3 border-2 rounded-lg transition-all ";
          
          if (!hasAnswered) {
            buttonClass += "border-gray-300 hover:border-blue-500 hover:bg-blue-50";
          } else if (isSelected && isCorrect) {
            buttonClass += "border-green-500 bg-green-50";
          } else if (isSelected && !isCorrect) {
            buttonClass += "border-red-500 bg-red-50";
          } else if (isCorrectAnswer) {
            buttonClass += "border-green-500 bg-green-50";
          } else {
            buttonClass += "border-gray-300 opacity-50";
          }

          return (
            <button
              key={index}
              onClick={() => handleAnswerSelect(optionLetter)}
              disabled={hasAnswered}
              className={buttonClass}
            >
              <div className="flex items-center justify-between">
                <span className="text-gray-800">{option}</span>
                {hasAnswered && isCorrectAnswer && (
                  <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0" />
                )}
                {hasAnswered && isSelected && !isCorrect && (
                  <XCircleIcon className="h-5 w-5 text-red-600 flex-shrink-0" />
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
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium text-sm mb-2"
          >
            <svg 
              className={`w-4 h-4 transition-transform ${showExplanation ? 'rotate-90' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            {showExplanation ? 'Hide Explanation' : 'Show Explanation'}
          </button>
          {showExplanation && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="prose prose-sm max-w-none">
                {question.explanation.split('\n').map((line, index) => {
                  const trimmedLine = line.trim();
                  if (!trimmedLine) return <div key={index} className="h-2" />;
                  
                  // Check if line starts with "Step"
                  if (trimmedLine.startsWith('Step')) {
                    return (
                      <p key={index} className="font-semibold text-gray-900 mt-3 mb-1">
                        {trimmedLine}
                      </p>
                    );
                  }
                  
                  // Check if line starts with "Note" or "Thus"
                  if (trimmedLine.startsWith('Note') || trimmedLine.startsWith('Thus')) {
                    return (
                      <p key={index} className="text-gray-700 mb-1 italic">
                        {trimmedLine}
                      </p>
                    );
                  }
                  
                  // Regular line
                  return (
                    <p key={index} className="text-gray-700 mb-1">
                      {trimmedLine}
                    </p>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
