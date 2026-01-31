import React, { useState } from 'react';
import numericalQuestions from '../data/aptitude/numerical.json';
import { NumericalQuestion } from '../types';
import { NumericalQuestionCard } from '../components/NumericalQuestionCard';

interface AnswerRecord {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
}

export const AptitudeTestPreview: React.FC = () => {
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const questions = numericalQuestions as NumericalQuestion[];

  const handleAnswer = (questionId: string, selectedAnswer: string, isCorrect: boolean) => {
    setAnswers(prev => [...prev, { questionId, selectedAnswer, isCorrect }]);
  };

  const score = answers.filter(a => a.isCorrect).length;
  const totalAnswered = answers.length;
  const percentage = totalAnswered > 0 ? ((score / totalAnswered) * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Numerical Reasoning Test
          </h1>
          <p className="text-gray-600 mb-4">
            Practice questions to prepare for scholarship aptitude tests
          </p>
          
          {/* Progress Stats */}
          <div className="flex gap-4 flex-wrap">
            <div className="bg-blue-50 px-4 py-2 rounded-lg">
              <span className="text-blue-600 font-semibold">Total Questions: </span>
              <span className="text-gray-800">{questions.length}</span>
            </div>
            <div className="bg-green-50 px-4 py-2 rounded-lg">
              <span className="text-green-600 font-semibold">Answered: </span>
              <span className="text-gray-800">{totalAnswered}</span>
            </div>
            <div className="bg-purple-50 px-4 py-2 rounded-lg">
              <span className="text-purple-600 font-semibold">Score: </span>
              <span className="text-gray-800">{score}/{totalAnswered}</span>
            </div>
            {totalAnswered > 0 && (
              <div className="bg-yellow-50 px-4 py-2 rounded-lg">
                <span className="text-yellow-700 font-semibold">Percentage: </span>
                <span className="text-gray-800">{percentage}%</span>
              </div>
            )}
          </div>
        </div>

        {/* Questions */}
        <div>
          {questions.map((question, index) => (
            <NumericalQuestionCard
              key={question.id}
              question={question}
              questionNumber={index + 1}
              onAnswer={handleAnswer}
            />
          ))}
        </div>

        {/* Summary */}
        {totalAnswered === questions.length && (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-lg p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Test Complete!</h2>
            <p className="text-xl mb-2">
              Your Score: {score} out of {questions.length}
            </p>
            <p className="text-2xl font-bold">{percentage}%</p>
            <p className="mt-4 text-blue-100">
              {Number(percentage) >= 80 ? 'Excellent work!' :
               Number(percentage) >= 60 ? 'Good effort! Keep practicing.' :
               'Keep studying and try again!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AptitudeTestPreview;
