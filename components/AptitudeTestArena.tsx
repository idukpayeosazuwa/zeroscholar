// import React, { useState, useEffect } from 'react';
// import { Query } from 'appwrite';
// import { Models } from 'appwrite';
// import { databases, DATABASE_ID} from '../appwriteConfig';
// import { APTITUDE_TESTS } from '../constants';
// import Quiz from './Quiz';
// import { BookOpenIcon } from './icons/BookOpenIcon';
// import { TestQuestion, TestResult, GraphData } from '../types';
// import BarChart from './charts/BarChart';

// interface AptitudeTestArenaProps {
//   user: Models.User<Models.Preferences>;
// }

// const AptitudeTestArena: React.FC<AptitudeTestArenaProps> = ({ user }) => {
//   const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
//   const [selectedTest, setSelectedTest] = useState<string | null>(null);
//   const [testQuestions, setTestQuestions] = useState<TestQuestion[]>([]);
//   const [view, setView] = useState<'tests' | 'analytics'>('tests');
//   const [testResults, setTestResults] = useState<TestResult[]>([]);
//   const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

//   useEffect(() => {
//     if (view === 'analytics') {
//       const fetchTestResults = async () => {
//         setIsLoadingAnalytics(true);
//         try {
//           const response = await databases.listDocuments(
//             DATABASE_ID,
//             [
//               Query.equal('userId', user.$id),
//               Query.orderDesc('$createdAt')
//             ]
//           );
//           setTestResults(response.documents as unknown as TestResult[]);
//         } catch (error) {
//           console.error("Failed to fetch test results:", error);
//           setTestResults([]);
//         } finally {
//           setIsLoadingAnalytics(false);
//         }
//       };
//       fetchTestResults();
//     }
//   }, [view, user.$id]);

//   const startTest = (categoryName: string, testNameInCat: string) => {
//     setSelectedTest(`${categoryName} - ${testNameInCat}`);
//     setTestQuestions(APTITUDE_TESTS[categoryName][testNameInCat]);
//   };

//   const resetTest = () => {
//     setSelectedTest(null);
//     setTestQuestions([]);
//     setSelectedCategory(null);
//     // Optionally refetch analytics after a test is finished
//     if (view === 'analytics') {
//         setView('tests'); // switch back to tests view first
//         setView('analytics'); // then trigger refetch
//     }
//   };
  
//   const getAnalyticsGraphData = (): GraphData | null => {
//     if (testResults.length === 0) return null;
    
//     const data: { [key: string]: { totalScore: number; count: number } } = {};
//     testResults.forEach(result => {
//         const simpleTestName = result.testName.replace("Verbal Reasoning - ", "").replace("Quantitative Reasoning - ", "");
//         if (!data[simpleTestName]) {
//             data[simpleTestName] = { totalScore: 0, count: 0 };
//         }
//         data[simpleTestName].totalScore += (result.score / result.totalQuestions) * 100; // as percentage
//         data[simpleTestName].count += 1;
//     });

//     const averagedData = Object.keys(data).map(testName => ({
//       label: testName,
//       value: Math.round(data[testName].totalScore / data[testName].count),
//     }));

//     return {
//       type: 'bar',
//       title: 'Your Average Performance',
//       labels: averagedData.map(d => d.label),
//       yAxisLabel: 'Average Score (%)',
//       datasets: [
//         {
//           label: 'Average Score',
//           data: averagedData.map(d => d.value),
//           backgroundColor: '#3B82F6'
//         }
//       ]
//     };
// };


//   if (selectedTest) {
//     return <Quiz user={user} testName={selectedTest} questions={testQuestions} onFinish={resetTest} />;
//   }

//   return (
//     <div className="max-w-4xl mx-auto">
//       <div className="text-center mb-8">
//         <BookOpenIcon className="mx-auto h-12 w-12 text-blue-500" />
//         <h2 className="text-3xl font-bold text-gray-800 mt-2">Aptitude Test Arena</h2>
//         <p className="text-gray-500 mt-1">Sharpen your skills and prepare for success.</p>
//       </div>

//       <div className="flex justify-center mb-6 bg-gray-200 p-1 rounded-full w-max mx-auto">
//         <button
//           onClick={() => setView('tests')}
//           className={`px-4 py-2 text-sm font-semibold rounded-full ${view === 'tests' ? 'bg-white text-blue-600 shadow' : 'text-gray-600'}`}
//         >
//           Practice Tests
//         </button>
//         <button
//           onClick={() => setView('analytics')}
//           className={`px-4 py-2 text-sm font-semibold rounded-full ${view === 'analytics' ? 'bg-white text-blue-600 shadow' : 'text-gray-600'}`}
//         >
//           My Analytics
//         </button>
//       </div>

//       {view === 'tests' && (
//         <div>
//           {selectedCategory ? (
//             <div>
//               <button onClick={() => setSelectedCategory(null)} className="mb-4 text-sm font-semibold text-blue-600 hover:text-blue-800">
//                 &larr; Back to Categories
//               </button>
//               <h3 className="text-2xl font-bold text-center text-gray-800 mb-6">{selectedCategory}</h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                 {Object.keys(APTITUDE_TESTS[selectedCategory]).map(testNameInCat => (
//                   <div key={testNameInCat} className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col items-center text-center">
//                     <h3 className="text-xl font-semibold text-gray-800">{testNameInCat}</h3>
//                     <p className="text-gray-500 mt-2 mb-4">Practice with {APTITUDE_TESTS[selectedCategory][testNameInCat].length} questions.</p>
//                     <button
//                       onClick={() => startTest(selectedCategory, testNameInCat)}
//                       className="mt-auto w-full px-4 py-2 bg-yellow-400 text-yellow-900 font-semibold rounded-lg hover:bg-yellow-500 transition-colors"
//                     >
//                       Start Practice
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {Object.keys(APTITUDE_TESTS).map(categoryName => {
//                 const testCount = Object.keys(APTITUDE_TESTS[categoryName]).length;
//                 return (
//                   <div key={categoryName} className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col items-center text-center">
//                     <h3 className="text-xl font-semibold text-gray-800">{categoryName}</h3>
//                     <p className="text-gray-500 mt-2 mb-4">{testCount} {testCount > 1 ? 'Tests' : 'Test'} available.</p>
//                     <button
//                       onClick={() => setSelectedCategory(categoryName)}
//                       className="mt-auto w-full px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
//                     >
//                       View Tests
//                     </button>
//                   </div> 
//                 )
//               })}
//             </div>
//           )}
//         </div>
//       )}

//       {view === 'analytics' && (
//         <div className="bg-white p-6 rounded-lg shadow-lg">
//           <h3 className="text-xl font-bold text-center text-gray-800 mb-4">Your Average Performance</h3>
//           {isLoadingAnalytics ? (
//             <p className="text-center text-gray-500">Loading analytics...</p>
//           ) : testResults.length > 0 ? (
//             <BarChart data={getAnalyticsGraphData()!} />
//           ) : (
//             <p className="text-center text-gray-500">No test results yet. Complete a practice test to see your analytics!</p>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default AptitudeTestArena;
