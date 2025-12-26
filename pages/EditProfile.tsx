import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { databases, DATABASE_ID, USERS_COLLECTION_ID } from '../appwriteConfig';
import { UserProfile, UniversityLevel } from '../types';
import { UNIVERSITY_LEVELS } from '../constants';

interface EditProfileProps {
  userProfile: UserProfile;
  userId: string;
  onProfileUpdate: (updatedProfile: UserProfile) => void;
}

const EditProfile: React.FC<EditProfileProps> = ({ userProfile, userId, onProfileUpdate }) => {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  // Match Auth.tsx exactly - Course Categories with Codes
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

  // Match Auth.tsx exactly - Nigerian states
  const nigerianStates = [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa',
    'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo',
    'Ekiti', 'Enugu', 'Gombe', 'Imo', 'Jigawa',
    'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
    'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun',
    'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
  ];

  // Form state matching Auth.tsx field names
  // Convert numeric level from DB to UniversityLevel format
  const getInitialLevel = (): UniversityLevel => {
    if (!userProfile.level) return UniversityLevel.L200;
    const levelStr = userProfile.level.toString();
    // If it's already a proper UniversityLevel format like "200 Level", return as is
    if (levelStr.includes('Level')) {
      return userProfile.level as UniversityLevel;
    }
    // If it's just a number like "200", convert to "200 Level"
    const foundLevel = UNIVERSITY_LEVELS.find(lvl => lvl.toString().includes(levelStr));
    return foundLevel || UniversityLevel.L200;
  };

  const [level, setLevel] = useState<UniversityLevel>(getInitialLevel());
  const [course, setCourse] = useState(userProfile.course || '');
  const [gender, setGender] = useState(userProfile.gender || '');
  const [state, setState] = useState(userProfile.state || '');
  const [lga, setLga] = useState(userProfile.lga || '');
  const [university, setUniversity] = useState(userProfile.uni || '');
  const [cgpa, setCgpa] = useState(String(userProfile.cgpa || 0));
  const [jambScore, setJambScore] = useState(String(userProfile.jamb || 0));
  const [religion, setReligion] = useState(userProfile.rel || '');
  const [isOrphan, setIsOrphan] = useState(userProfile.orphan || false);
  const [isIndigent, setIsIndigent] = useState(userProfile.finance || false);
  const [isDisabled, setIsDisabled] = useState(userProfile.chal || false);

  // Match Auth.tsx - Automatically normalize CGPA to 0.0 for 100 Level
  useEffect(() => {
    if (level.toString().includes('100')) {
      setCgpa('0.0');
    }
  }, [level]);

  const handleSave = async () => {
    try {
      setError('');
      setIsSaving(true);

      // Validate required fields - same as Auth.tsx
      if (!course || !gender || !state || !university || !jambScore || !religion) {
        setError('Please fill in all required fields.');
        return;
      }

      // Normalize State - same as Auth.tsx
      const normalizedState = nigerianStates.find(s => s.toLowerCase() === state.trim().toLowerCase());
      if (!normalizedState) {
        setError('Please select a valid Nigerian state from the list.');
        return;
      }

      // Prepare payload - EXACT same structure as Auth.tsx
      const levelStr = level ? level.toString() : "200";
      const numericLevel = parseInt(levelStr.replace(/\D/g, '')) || 200;
      const safeCgpa = parseFloat(cgpa) || 0.0;
      const safeJamb = parseInt(jambScore) || 0;

      const payload = {
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
      };

      // Update profile in Appwrite
      await databases.updateDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        userId,
        payload
      );

      onProfileUpdate(payload as unknown as UserProfile);
      navigate('/app');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      console.error('Error updating profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-[#2240AF] mb-2">Edit Profile</h1>
        <p className="text-gray-600 mb-8">Update your profile information</p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Academic Profile - Match Auth.tsx */}
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

        {/* Personal Details - Match Auth.tsx */}
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

        {/* Additional Criteria - Match Auth.tsx */}
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

        {/* Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold transition-colors"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={() => navigate('/app')}
            disabled={isSaving}
            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 font-semibold transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
