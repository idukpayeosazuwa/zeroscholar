import React, { useState } from 'react';
import { Models } from 'appwrite';
import { UserProfile, CourseCategory, UniversityLevel } from '../types';
import { NIGERIAN_UNIVERSITIES, COURSE_CATEGORIES, UNIVERSITY_LEVELS } from '../constants';
import { UserIcon } from './icons/UserIcon';
import { requestPermissionAndSaveSubscription } from '../services/notificationService';


interface UserProfileFormProps {
  onSave: (profile: UserProfile) => void;
  user: Models.User<Models.Preferences>;
}

const UserProfileForm: React.FC<UserProfileFormProps> = ({ onSave, user }) => {
  const [profile, setProfile] = useState<UserProfile>({
    fullName: user.name || '',
    cgpa: 3.5,
    level: UniversityLevel.L200,
    courseCategory: CourseCategory.STEM,
    university: NIGERIAN_UNIVERSITIES[0],
    location: 'Lagos',
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleCgpaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile(prev => ({ ...prev, cgpa: parseFloat(e.target.value) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.fullName) {
        setError('Full Name is required.');
        return;
    }
    setError('');
    onSave(profile);

    // After saving the profile, request permission to enable automatic notifications
    await requestPermissionAndSaveSubscription(user.$id);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 bg-white shadow-lg rounded-lg mt-8">
        <div className="text-center mb-6">
            <UserIcon className="mx-auto h-12 w-12 text-blue-500" />
            <h2 className="text-2xl font-bold text-gray-800 mt-2">Create Your Scholar Profile</h2>
            <p className="text-gray-500">Tell us about yourself to find matching scholarships.</p>
        </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
          <input
            type="text"
            name="fullName"
            id="fullName"
            value={profile.fullName}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., Bamidele Chidinma"
          />
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>

        <div>
            <label htmlFor="cgpa" className="block text-sm font-medium text-gray-700">
                Current CGPA: <span className="font-bold text-blue-600">{profile.cgpa.toFixed(2)}</span>
            </label>
            <input
                type="range"
                name="cgpa"
                id="cgpa"
                min="1.0"
                max="5.0"
                step="0.01"
                value={profile.cgpa}
                onChange={handleCgpaChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="level" className="block text-sm font-medium text-gray-700">Level</label>
              <select
                name="level"
                id="level"
                value={profile.level}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {UNIVERSITY_LEVELS.map(level => <option key={level} value={level}>{level}</option>)}
              </select>
            </div>

            <div>
              <label htmlFor="courseCategory" className="block text-sm font-medium text-gray-700">Course Category</label>
              <select
                name="courseCategory"
                id="courseCategory"
                value={profile.courseCategory}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {COURSE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="university" className="block text-sm font-medium text-gray-700">University</label>
              <select
                name="university"
                id="university"
                value={profile.university}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {NIGERIAN_UNIVERSITIES.map(uni => <option key={uni} value={uni}>{uni}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">State/Location</label>
              <input
                type="text"
                name="location"
                id="location"
                value={profile.location}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Lagos"
              />
            </div>
        </div>

        <button
          type="submit"
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Find My Scholarships
        </button>
      </form>
    </div>
  );
};

export default UserProfileForm;