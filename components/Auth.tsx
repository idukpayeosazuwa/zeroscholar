import React, { useState } from 'react';
import { account, ID, databases, DATABASE_ID, USERS_COLLECTION_ID } from '../appwriteConfig';
import { LogoIcon } from './icons/LogoIcon';
import { Models } from 'appwrite';
import { UniversityLevel } from '../types';
import { UNIVERSITY_LEVELS } from '../constants';

interface AuthProps {
    onAuthSuccess: (user: Models.User<Models.Preferences>, level: UniversityLevel) => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [level, setLevel] = useState<UniversityLevel>(UniversityLevel.L200);
  const [course, setCourse] = useState('');
  const [gender, setGender] = useState('');
  const [state, setState] = useState('');
  const [university, setUniversity] = useState('');
  const [cgpa, setCgpa] = useState('3.5');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Course categories commonly required by scholarships
  const courseCategories = [
    'Engineering',
    'Sciences',
    'Medicine',
    'Law',
    'Business/Management',
    'Social Sciences',
    'Arts/Humanities',
    'Agriculture',
    'Technology',
    'Education',
    'Other'
  ];

  // Nigerian states
  const nigerianStates = [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa',
    'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo',
    'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo', 'Jigawa',
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
        onAuthSuccess(user, level);
      } else {
        // Validate CGPA for signup
        // const cgpaValue = parseFloat(cgpa);

        // Validate required fields
        if (!course || !gender || !state || !university) {
          setError('Please fill in all required fields.');
          setIsLoading(false);
          return;
        }

        await account.create(ID.unique(), email, password, email);
        await account.createEmailPasswordSession(email, password);
        const user = await account.get();
        
        // Save comprehensive user data to database
        await databases.createDocument(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          user.$id,
          {
            email: user.email,
            level: level,
            course: course,
            gender: gender,
            state: state,
            university: university,
            cgpa: cgpa,
            userID: user.$id,
            notifiedScholarships: [] // Initialize empty array for tracking notifications
          }
        );
        
        onAuthSuccess(user, level);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-white shadow-xl rounded-lg">
      <div className="text-center mb-8">
        <LogoIcon className="mx-auto h-12 w-12 text-blue-600" />
        <h2 className="text-3xl font-bold text-gray-800 mt-2">
          Welcome to ScholarAI
        </h2>
        <p className="text-gray-500">
          {isLogin ? 'Sign in to find your scholarships' : 'Create an account to get started'}
        </p>
        {!isLogin && (
          <p className="text-blue-600 font-medium mt-2">Your CGPA Must be above 3.5</p>
        )}
      </div>

      <form onSubmit={handleAuthSubmit} className="space-y-4">
        {!isLogin && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="level" className="block text-sm font-medium text-gray-700">
                  Level <span className="text-red-500">*</span>
                </label>
                <select
                  name="level"
                  id="level"
                  value={level}
                  onChange={(e) => setLevel(e.target.value as UniversityLevel)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  {UNIVERSITY_LEVELS.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                </select>
              </div>

              <div>
                <label htmlFor="cgpa" className="block text-sm font-medium text-gray-700">
                  CGPA <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="cgpa"
                  step="0.01"
                  min="3.5"
                  max="5.0"
                  value={cgpa}
                  onChange={(e) => setCgpa(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="3.5"
                />
              </div>
            </div>

            <div>
              <label htmlFor="course" className="block text-sm font-medium text-gray-700">
                Course Category <span className="text-red-500">*</span>
              </label>
              <select
                id="course"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">Select your course category</option>
                {courseCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                  State <span className="text-red-500">*</span>
                </label>
                <select
                  id="state"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="">Select</option>
                  {nigerianStates.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="university" className="block text-sm font-medium text-gray-700">
                University <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="university"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="e.g., University of Lagos"
              />
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
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
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
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            placeholder="••••••••"
          />
          {!isLogin && (
            <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters</p>
          )}
        </div>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
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
  );
};

export default Auth;