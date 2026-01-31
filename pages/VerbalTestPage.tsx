import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import VerbalQuestionCard from '../components/VerbalQuestionCard';
import verbalTest1Data from '../data/aptitude/verbal-test1.json';
import verbalTest3Data from '../data/aptitude/verbal-test3.json';
import verbalTest4Data from '../data/aptitude/verbal-test4.json';
import verbalTest5Data from '../data/aptitude/verbal-test5.json';
import verbalTest6Data from '../data/aptitude/verbal-test6.json';
import verbalTest7Data from '../data/aptitude/verbal-test7.json';
import verbalTest8Data from '../data/aptitude/verbal-test8.json';
import { VerbalQuestion } from '../types';

const VerbalTestPage: React.FC = () => {
  const navigate = useNavigate();
  const { testId } = useParams<{ testId: string }>();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());

  // Load questions based on test ID
  const { questions, testName } = useMemo(() => {
    if (testId === 'test2') {
      return {
        questions: verbalTest4Data as VerbalQuestion[],
        testName: 'Verbal Reasoning Test 2'
      };
    }
    if (testId === 'test3') {
      return {
        questions: verbalTest5Data as VerbalQuestion[],
        testName: 'Verbal Reasoning Test 3'
      };
    }
    if (testId === 'test4') {
      return {
        questions: verbalTest6Data as VerbalQuestion[],
        testName: 'Verbal Reasoning Test 4'
      };
    }
    if (testId === 'test5') {
      return {
        questions: verbalTest7Data as VerbalQuestion[],
        testName: 'Verbal Reasoning Test 5'
      };
    }
    if (testId === 'test6') {
      return {
        questions: verbalTest8Data as VerbalQuestion[],
        testName: 'Verbal Reasoning Test 6'
      };
    }
    // Default to test1 - combine test1 and test3 data (first 11 questions)
    const combinedQuestions = [
      ...(verbalTest1Data as VerbalQuestion[]),
      (verbalTest3Data as VerbalQuestion[])[0] // Add one from test3 to make 11
    ];
    return {
      questions: combinedQuestions,
      testName: 'Verbal Reasoning Test 1'
    };
  }, [testId]);

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

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setAnsweredQuestions(new Set());
  };

  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/app/test/verbal')}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Test Selection
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {testName}
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
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
            />
          </div>
        </div>

        {/* Test Completion Summary */}
        {allAnswered && (
          <div className="mb-6 p-6 bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg text-white">
            <h2 className="text-2xl font-bold mb-2">Test Complete!</h2>
            <p className="text-lg mb-4">
              You scored <span className="font-bold text-2xl">{score}</span> out of{' '}
              <span className="font-bold text-2xl">{totalQuestions}</span> ({percentage}%)
            </p>
            <p className="text-sm opacity-90 mb-4">
              {percentage >= 80
                ? 'Excellent work! You have a strong grasp of verbal reasoning.'
                : percentage >= 60
                ? 'Good job! Keep practicing to improve your critical thinking skills.'
                : 'Keep practicing! Review the explanations to strengthen your understanding.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleRestart}
                className="px-6 py-2 bg-white text-green-600 rounded-lg font-semibold hover:bg-green-50 transition-colors"
              >
                Restart Test
              </button>
              <button
                onClick={() => navigate('/app/test/verbal')}
                className="px-6 py-2 bg-green-700 text-white rounded-lg font-semibold hover:bg-green-800 transition-colors"
              >
                Choose Another Test
              </button>
            </div>
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
            Previous
          </button>
          <div className="text-sm text-gray-600">
            {answeredQuestions.size} of {totalQuestions} answered
          </div>
          <button
            onClick={handleNext}
            disabled={currentQuestionIndex === totalQuestions - 1}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>

        {/* Tips Section */}
        {!allAnswered && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Test Tips</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>Read the passage carefully before looking at the statement</li>
              <li>Only use information explicitly stated in the passage</li>
              <li>"Cannot Say" means the passage doesn't provide enough information</li>
              <li>Don't rely on external knowledge or assumptions</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerbalTestPage;
