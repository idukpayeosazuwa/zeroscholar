import React, { useState, useEffect } from 'react';
import { Models } from 'appwrite';
import { databases, ID, DATABASE_ID, TEST_RESULTS_COLLECTION_ID } from '../appwriteConfig';
import { TestQuestion } from '../types';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import QuizBarChart from './charts/QuizBarChart';

interface QuizProps {
  user: Models.User<Models.Preferences>;
  testName: string;
  questions: TestQuestion[];
  onFinish: () => void;
}

const Quiz: React.FC<QuizProps> = ({ user, testName, questions, onFinish }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [showScore, setShowScore] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20 * 60); // 20 minutes in seconds

  const isTimedTest = testName.startsWith('Verbal Reasoning') || testName.startsWith('Quantitative Reasoning') || testName.startsWith('Abstract Reasoning');
  const score = userAnswers.reduce((acc, answer, index) => {
    return questions[index] && answer === questions[index].correctAnswer ? acc + 1 : acc;
  }, 0);

  const handleFinish = async (finalAnswers: string[]) => {
    if (showScore) return; // Prevent multiple submissions

    const paddedAnswers = [...finalAnswers];
    while (paddedAnswers.length < questions.length) {
      paddedAnswers.push("Not Answered");
    }
    setUserAnswers(paddedAnswers);
    setShowScore(true);

    try {
      const finalScore = paddedAnswers.reduce((acc, ans, index) => (questions[index] && ans === questions[index].correctAnswer ? acc + 1 : acc), 0);
      await databases.createDocument(
        DATABASE_ID,
        TEST_RESULTS_COLLECTION_ID,
        ID.unique(),
        {
            testName,
            score: finalScore,
            totalQuestions: questions.length,
            userId: user.$id
        }
      );
    } catch (error) {
      console.error("Error saving test result: ", error);
    }
  };

  useEffect(() => {
    if (!isTimedTest || showScore) {
      return;
    }

    if (timeLeft <= 0) {
      handleFinish(userAnswers);
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft(prevTime => prevTime - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, showScore, isTimedTest, userAnswers]);


  const handleAnswer = (answer: string) => {
    const newAnswers = [...userAnswers, answer];
    setUserAnswers(newAnswers);

    const isLastQuestion = currentQuestionIndex === questions.length - 1;

    if (isLastQuestion) {
      handleFinish(newAnswers);
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  if (showScore) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg text-center">
        <h2 className="text-2xl font-bold text-gray-800">Test Completed!</h2>
        <p className="text-lg mt-2 text-gray-600">You scored <span className="font-bold text-blue-600">{score}</span> out of <span className="font-bold">{questions.length}</span>.</p>
        <div className="mt-6 space-y-4 max-h-[60vh] overflow-y-auto pr-2 text-left">
          {questions.map((q, index) => (
            <div key={index} className={`p-3 rounded-lg ${userAnswers[index] === q.correctAnswer ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
               <p className="font-semibold whitespace-pre-wrap">{index + 1}. {q.question}</p>
              <div className="flex items-center mt-2">
                {userAnswers[index] === q.correctAnswer ? 
                  <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" /> : 
                  <XCircleIcon className="h-5 w-5 text-red-600 mr-2 flex-shrink-0" />
                }
                <p>Your answer: {userAnswers[index] || 'Not Answered'}</p>
              </div>
              {userAnswers[index] !== q.correctAnswer && <p className="text-green-700 font-semibold ml-7">Correct: {q.correctAnswer}</p>}
              {q.explanation && <p className="text-sm text-gray-600 mt-2 p-2 bg-gray-100 rounded"><strong>Explanation:</strong> {q.explanation}</p>}
            </div>
          ))}
        </div>
        <button onClick={onFinish} className="mt-8 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">
          Back to Tests
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">{testName}</h2>
          {isTimedTest && (
            <div className={`text-lg font-semibold ${timeLeft < 60 ? 'text-red-600 animate-pulse' : 'text-gray-700'}`}>
              Time Left: {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
            </div>
          )}
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}></div>
          </div>
        </div>
        
        {currentQuestion.preamble && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg border" dangerouslySetInnerHTML={{ __html: currentQuestion.preamble }} />
        )}
        
        {currentQuestion.graphData && (
          <QuizBarChart data={currentQuestion.graphData} />
        )}

        <div className="text-lg font-medium mb-4 whitespace-pre-wrap">{currentQuestion.question}</div>
        
        {currentQuestion.questionImage && (
            <div className="mb-4 flex justify-center" dangerouslySetInnerHTML={{__html: currentQuestion.questionImage}} />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(option)}
              className="w-full text-left p-3 bg-white border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              {currentQuestion.optionImages?.[index] ? (
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-gray-700">{option}</span>
                  <div dangerouslySetInnerHTML={{ __html: currentQuestion.optionImages[index] }} />
                </div>
              ) : (
                <div className="flex items-start">
                  <span className="font-semibold text-gray-700 mr-2">{String.fromCharCode(65 + index)}.</span>
                  <span>{option}</span>
                </div>
              )}
            </button>
          ))}
        </div>
        
        <div className="mt-6 flex justify-end">
            <button 
                onClick={() => handleFinish(userAnswers)}
                className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700"
            >
                Finish Test
            </button>
        </div>
    </div>
  );
};

export default Quiz;