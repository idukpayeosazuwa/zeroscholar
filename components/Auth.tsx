/*
  CRITICAL DATABASE CHECKLIST:
  ----------------------------
  Go to Appwrite Console > Database > Users Collection > Attributes.
  Ensure the "Attribute Key" (ID) matches EXACTLY (case-sensitive) with the code below:

  1. level (Integer)
  2. cgpa (Float)
  3. jamb (Integer)
  4. uni (String)
  5. course (String)
  6. state (String)
  7. lga (String)
  8. rel (String)
  9. orphan (Boolean)
  10. finance (Boolean)
  11. chal (Boolean)
  12. uid (String)
  13. notified (String Array)
  14. gender (String)
  15. email (String)
*/

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { client, account, ID, databases, DATABASE_ID, USERS_COLLECTION_ID } from '../appwriteConfig';
import { LogoIcon } from './icons/LogoIcon';
import { Models } from 'appwrite';
import { UniversityLevel } from '../types';
import { UNIVERSITY_LEVELS } from '../constants';
import EmailOTPVerification from './EmailOTPVerification';
import { retryWithBackoff, getErrorMessage, classifyError } from '../utils/errorHandler';

// Helper function to handle Appwrite latency/processing delays
const createDocumentWithRetry = async (
  databaseId: string,
  collectionId: string,
  documentId: string,
  data: any,
  retries = 3,
  delay = 2000
) => {
  try {
    return await databases.createDocument(databaseId, collectionId, documentId, data);
  } catch (error: any) {
    // Check for errors that suggest the schema is still updating (400 Bad Request / Unknown Attribute)
    const isSchemaIssue = error.message?.includes('Unknown attribute') || error.code === 400;
    
    if (retries > 0 && isSchemaIssue) {
      await new Promise(resolve => setTimeout(resolve, delay));
      // Increase delay for next attempt (backoff)
      return createDocumentWithRetry(databaseId, collectionId, documentId, data, retries - 1, delay + 1000);
    }
    throw error;
  }
};

interface AuthProps {
    onAuthSuccess: (user: Models.User<Models.Preferences>, level: UniversityLevel) => void;
    showLogin?: boolean;
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess, showLogin = false }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(showLogin || searchParams.get('showLogin') === 'true');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [needsOTPVerification, setNeedsOTPVerification] = useState(false);
  const [otpUserId, setOtpUserId] = useState('');
  const [verificationEmail, setVerificationEmail] = useState('');
  const [level, setLevel] = useState<UniversityLevel>(UniversityLevel.L200);
  const [course, setCourse] = useState('');
  const [gender, setGender] = useState('');
  const [state, setState] = useState('');
  const [university, setUniversity] = useState('');
  const [cgpa, setCgpa] = useState('3.5');
  
  const [jambScore, setJambScore] = useState('');
  const [lga, setLga] = useState('');
  const [religion, setReligion] = useState('');
  const [isOrphan, setIsOrphan] = useState(false);
  const [isIndigent, setIsIndigent] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Automatically normalize CGPA to 0.0 for 100 Level
  useEffect(() => {
    if (level.toString().includes('100')) {
      setCgpa('0.0');
    }
  }, [level]);

  // Updated Course Categories with Codes
  const courseOptions = [
    { code: 'ENG', label: 'Engineering' },
    { code: 'SCI', label: 'Sciences' },
    { code: 'MED', label: 'Medicine & Health' },
    { code: 'LAW', label: 'Law' },
    { code: 'BUS', label: 'Business' },
    { code: 'ARTS\\HUM', label: 'Arts & Humanities' },
    { code: 'ICT', label: 'ICT / Technology' },
    { code: 'BLD', label: 'Building / Environmental' }
  ];

  // Nigerian states
  const nigerianStates = [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa',
    'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo',
    'Ekiti', 'Enugu', 'Gombe', 'Imo', 'Jigawa',
    'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
    'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun',
    'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
  ];

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isLogin) {
        await account.createEmailPasswordSession(email, password);
        const user = await account.get();
        
        // Check if email is verified
        if (!user.emailVerification) {
          setError('Please verify your email before logging in. Check your inbox.');
          await account.deleteSession('current'); // Log them out
          setNeedsOTPVerification(true);
          setOtpUserId(user.$id);
          setVerificationEmail(user.email);
          setIsLoading(false);
          return;
        }
        onAuthSuccess(user, level);
      } else {
        // Validate required fields
        if (!course || !gender || !state || !university || !jambScore || !religion) {
          setError('Please fill in all required fields.');
          setIsLoading(false);
          return;
        }

        // Normalize State
        const normalizedState = nigerianStates.find(s => s.toLowerCase() === state.trim().toLowerCase());
        if (!normalizedState) {
            setError('Please select a valid Nigerian state from the list.');
            setIsLoading(false);
            return;
        }

        // 1. Create Account
        const newUser = await account.create(ID.unique(), email, password, email);
        
        // 2. Create Session
        await account.createEmailPasswordSession(email, password);
        const user = await account.get();
        
        // 3. Prepare Database Payload
        const levelStr = level ? level.toString() : "200";
        const numericLevel = parseInt(levelStr.replace(/\D/g, '')) || 200;
        const safeCgpa = parseFloat(cgpa) || 0.0;
        const safeJamb = parseInt(jambScore) || 0;

        // DO NOT CHANGE THIS PAYLOAD STRUCTURE
        const payload = {
            email: user.email,
            level: numericLevel,
            course: course,
            gender: gender,
            state: normalizedState,
            lga: lga || null,
            uni: university,
            cgpa: safeCgpa,
            jamb: safeJamb,
            rel: religion,
            orphan: isOrphan,
            finance: isIndigent,
            chal: isDisabled,
            uid: user.$id,
            notified: [],
            applications: []
        };

        // 4. Save to Database (Using Retry Logic)
        await createDocumentWithRetry(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          user.$id,
          payload
        );
        
        // 5. Send OTP via Email
        try {
          const tokenResult = await account.createEmailToken(user.$id, user.email);
        } catch (otpErr) {
          console.error('❌ Failed to send OTP:', otpErr);
          throw new Error('Failed to send verification code. Please try again.');
        }
        
        // 6. Show OTP verification screen (block access)
        setNeedsOTPVerification(true);
        setOtpUserId(newUser.$id);
        setVerificationEmail(user.email);
        setIsLoading(false);
        await account.deleteSession('current'); // Log them out until verified
      }
    } catch (err: any) {
      console.error("Auth Error Details:", err);
      
      // Use improved error classification
      const classified = classifyError(err);
      
      // Provide helpful user messages based on error type
      if (classified.type === 'network') {
        // Network errors are temporary - suggest retry
        setError(`${classified.message} Try again in a moment.`);
      } else if (classified.type === 'schema') {
        // Schema errors are usually transient during deployment
        setError(classified.message);
      } else if (classified.type === 'config') {
        // Config errors need support
        setError(classified.message);
      } else if (classified.type === 'offline') {
        setError('You are offline. Please check your internet connection.');
      } else {
        // Fallback for unknown errors
        setError(classified.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerificationSuccess = (user: Models.User<Models.Preferences>, userLevel: UniversityLevel) => {
    onAuthSuccess(user, userLevel);
  };

  const handleCancelOTPVerification = () => {
    setNeedsOTPVerification(false);
    setOtpUserId('');
    setVerificationEmail('');
    setEmail('');
    setPassword('');
  };

  // Show OTP verification screen if needed
  if (needsOTPVerification) {
    return (
      <EmailOTPVerification
        userId={otpUserId}
        email={verificationEmail}
        level={level}
        onVerificationSuccess={handleOTPVerificationSuccess}
        onCancel={handleCancelOTPVerification}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* White Navbar */}
      <nav className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50 h-16 flex items-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <LogoIcon className="h-8 w-8 text-[#2240AF]" />
            <span className="text-xl font-bold text-[#2240AF]">ScholarAI</span>
          </div>
          <button 
            onClick={() => navigate('/')}
            className="text-gray-500 hover:text-gray-700 text-sm font-medium flex items-center"
          >
            ← Back to Home
          </button>
        </div>
      </nav>

      {/* Main Content with padding for navbar */}
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto p-8 bg-white shadow-xl rounded-lg">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mt-2">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-gray-500 mt-2">
              {isLogin ? 'Sign in to find your scholarships' : 'Complete your profile to get matched'}
            </p>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-6">
            {!isLogin && (
              <>
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <h3 className="text-sm font-bold text-blue-800 mb-3 uppercase tracking-wide">Academic Profile</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="level" className="block text-sm font-medium text-gray-700">
                        Current Level <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="level"
                        value={level}
                        onChange={(e) => setLevel(e.target.value as UniversityLevel)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                      >
                        {UNIVERSITY_LEVELS.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="cgpa" className="block text-sm font-medium text-gray-700">
                        Current CGPA <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        id="cgpa"
                        step="0.01"
                        min="0"
                        max="5.0"
                        value={cgpa}
                        onChange={(e) => setCgpa(e.target.value)}
                        required
                        disabled={level.toString().includes('100')}
                        className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm ${level.toString().includes('100') ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white'}`}
                        placeholder={level.toString().includes('100') ? "0.0" : "e.g. 4.5"}
                      />
                      {level.toString().includes('200') && (
                        <p className="mt-1 text-xs text-blue-600">
                          If you don't know your results yet, select at least 3.5. You can update it later.
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="jamb" className="block text-sm font-medium text-gray-700">
                        JAMB Score <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        id="jamb"
                        min="0"
                        max="400"
                        value={jambScore}
                        onChange={(e) => setJambScore(e.target.value)}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                        placeholder="e.g. 280"
                      />
                    </div>

                    <div>
                      <label htmlFor="university" className="block text-sm font-medium text-gray-700">
                        University Alias <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="university"
                        value={university}
                        onChange={(e) => setUniversity(e.target.value)}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                        placeholder="e.g. UNILAG, OAU"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label htmlFor="course" className="block text-sm font-medium text-gray-700">
                      Course Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="course"
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                      <option value="">Select Category</option>
                      {courseOptions.map(opt => (
                        <option key={opt.code} value={opt.code}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <h3 className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide">Personal Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                        Gender <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="gender"
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                      >
                        <option value="">Select</option>
                        <option value="M">Male</option>
                        <option value="F">Female</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="religion" className="block text-sm font-medium text-gray-700">
                        Religion <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="religion"
                        value={religion}
                        onChange={(e) => setReligion(e.target.value)}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                      >
                        <option value="">Select</option>
                        <option value="Christian">Christian</option>
                        <option value="Muslim">Muslim</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                        State of Origin <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="state"
                        list="nigerian-states-list"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                        placeholder="Search State..."
                      />
                      <datalist id="nigerian-states-list">
                        {nigerianStates.map(st => (
                          <option key={st} value={st} />
                        ))}
                      </datalist>
                    </div>

                    <div>
                      <label htmlFor="lga" className="block text-sm font-medium text-gray-700">
                        LGA of Origin <span className="text-gray-400 text-xs">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        id="lga"
                        value={lga}
                        onChange={(e) => setLga(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                        placeholder="e.g. Ajegunle"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg mb-4">
                  <h3 className="text-sm font-bold text-yellow-800 mb-3 uppercase tracking-wide">Additional Criteria</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        id="orphan"
                        type="checkbox"
                        checked={isOrphan}
                        onChange={(e) => setIsOrphan(e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="orphan" className="ml-2 block text-sm text-gray-700">
                        I am an Orphan or from a Single Parent home
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        id="indigent"
                        type="checkbox"
                        checked={isIndigent}
                        onChange={(e) => setIsIndigent(e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="indigent" className="ml-2 block text-sm text-gray-700">
                        I am Financially Indigent (Only Select for a serious need)
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        id="disabled"
                        type="checkbox"
                        checked={isDisabled}
                        onChange={(e) => setIsDisabled(e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="disabled" className="ml-2 block text-sm text-gray-700">
                        I am Physically Challenged / Living with Disability
                      </label>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="••••••••"
              />
              {!isLogin && (
                <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters</p>
              )}
            </div>

            {error && <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 transition-colors"
            >
              {isLoading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button 
              onClick={() => { 
                setIsLogin(!isLogin); 
                setError(null); 
              }} 
              className="text-sm text-blue-600 hover:underline"
            >
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;