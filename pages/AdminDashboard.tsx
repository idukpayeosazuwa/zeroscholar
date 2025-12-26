import React, { useState, useEffect } from 'react';
import { account, databases } from '../appwriteConfig';
import { Query } from 'appwrite';

const DB_ID = 'scholarship_db';
const SCHOLARSHIP_COL_ID = 'scholarships';
const TRACKS_COL_ID = 'eligibility_tracks';

interface Scholarship {
  $id: string;
  scholarship_name: string;
  provider: string;
  deadline: string;
  award_amount: string;
  official_link: string;
  is_active: boolean;
}

interface Track {
  $id: string;
  scholarship_id: string;
  track_name: string;
  allowed_levels?: number[];
  min_cgpa: number;
  min_jamb_score: number;
  required_gender?: string;
  is_financial_need_required?: boolean;
  is_orphan_or_single_parent_required?: boolean;
  required_religion?: string;
  is_disability_specific?: boolean;
  is_aptitude_test_required?: boolean;
  required_state_of_origin?: string[];
  required_lga_list?: string[];
  required_universities?: string[];
  course_category?: string[];
  specific_requirements?: string[];
}

const AdminDashboard: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [selectedScholarship, setSelectedScholarship] = useState<Scholarship | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [editingScholarship, setEditingScholarship] = useState<Scholarship | null>(null);
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Temporary text fields for array inputs to allow comma display
  const [tempArrayInputs, setTempArrayInputs] = useState<{
    allowed_levels?: string;
    required_universities?: string;
    course_category?: string;
    required_state_of_origin?: string;
    required_lga_list?: string;
    specific_requirements?: string;
  }>({});

  // Check authorization and fetch data
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await account.get();
        setUser(currentUser);

        // Check if authorized admin
        if (currentUser.email === 'idukpayealex@gmail.com') {
          setAuthorized(true);
          await fetchScholarships();
        } else {
          setAuthorized(false);
        }
      } catch (error) {
        console.error('Not authenticated:', error);
        setAuthorized(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [refreshTrigger]);

  const fetchScholarships = async () => {
    try {
      console.log('📂 Fetching scholarships from database...');
      const response = await databases.listDocuments(DB_ID, SCHOLARSHIP_COL_ID, [
        Query.orderDesc('$createdAt'),
        Query.limit(500)
      ]);
      console.log(`✅ Fetched ${response.documents.length} scholarships`);
      console.log('Total scholarships in DB:', response.total);
      setScholarships(response.documents as unknown as Scholarship[]);
    } catch (error) {
      console.error('Error fetching scholarships:', error);
    }
  };

  const fetchTracks = async (scholarshipId: string) => {
    try {
      console.log(`📂 Fetching tracks for scholarship: ${scholarshipId}`);
      const response = await databases.listDocuments(DB_ID, TRACKS_COL_ID, [
        Query.equal('scholarship_id', scholarshipId),
        Query.limit(50)
      ]);
      console.log(`✅ Found ${response.documents.length} tracks`);
      setTracks(response.documents as unknown as Track[]);
    } catch (error) {
      console.error('Error fetching tracks:', error);
      setTracks([]); // Clear tracks on error
    }
  };

  const handleSelectScholarship = async (scholarship: Scholarship) => {
    setSelectedScholarship(scholarship);
    setEditingScholarship(scholarship);
    setEditingTrack(null); // Clear any editing track state
    setTracks([]); // Clear previous tracks
    await fetchTracks(scholarship.$id);
  };

  const updateScholarship = async () => {
    if (!editingScholarship) return;

    try {
      await databases.updateDocument(
        DB_ID,
        SCHOLARSHIP_COL_ID,
        editingScholarship.$id,
        {
          scholarship_name: editingScholarship.scholarship_name,
          provider: editingScholarship.provider,
          deadline: editingScholarship.deadline,
          award_amount: editingScholarship.award_amount,
          official_link: editingScholarship.official_link,
          is_active: editingScholarship.is_active
        }
      );
      
      alert('✅ Scholarship updated successfully');
      await fetchScholarships();
      setSelectedScholarship(null);
      setEditingScholarship(null);
    } catch (error) {
      console.error('Error updating scholarship:', error);
      alert('❌ Error updating scholarship');
    }
  };

  // Helper function to check if deadline is in the future
  const isDeadlineFuture = (deadline: string): boolean => {
    if (!deadline || deadline === 'Not Specified') return true; // Assume active if no deadline
    const deadlineDate = new Date(deadline);
    return deadlineDate > new Date();
  };

  const createScholarship = async () => {
    if (!editingScholarship) return;

    if (!editingScholarship.scholarship_name.trim()) {
      alert('❌ Please enter scholarship name');
      return;
    }

    if (!editingScholarship.provider.trim()) {
      alert('❌ Please enter provider name');
      return;
    }

    try {
      const newScholarship = await databases.createDocument(
        DB_ID,
        SCHOLARSHIP_COL_ID,
        'unique()',
        {
          scholarship_name: editingScholarship.scholarship_name,
          provider: editingScholarship.provider,
          deadline: editingScholarship.deadline || 'Not Specified',
          award_amount: editingScholarship.award_amount,
          official_link: editingScholarship.official_link,
          is_active: editingScholarship.is_active
        }
      );
      
      alert('✅ Scholarship created! Now add eligibility tracks.');
      await fetchScholarships();
      
      // Set the newly created scholarship with its ID
      const createdScholarship: Scholarship = {
        $id: newScholarship.$id,
        scholarship_name: newScholarship.scholarship_name,
        provider: newScholarship.provider,
        deadline: newScholarship.deadline,
        award_amount: newScholarship.award_amount,
        official_link: newScholarship.official_link,
        is_active: newScholarship.is_active
      };
      
      setSelectedScholarship(createdScholarship);
      setEditingScholarship(createdScholarship);
      setTracks([]);
      setIsCreatingNew(false); // Change to false so tracks section shows
    } catch (error) {
      console.error('Error creating scholarship:', error);
      alert('❌ Error creating scholarship');
    }
  };

  const updateTrack = async () => {
    if (!editingTrack) return;
    if (!editingScholarship) return;

    console.log('🔍 Validating track form...');

    if (!editingTrack.track_name.trim()) {
      alert('❌ Please enter track name');
      console.error('❌ Track name is empty');
      return;
    }

    // Ensure scholarship_id is set
    const scholarshipId = editingTrack.scholarship_id || editingScholarship.$id;
    if (!scholarshipId) {
      alert('❌ Error: Scholarship ID not found');
      console.error('❌ Scholarship ID not found');
      return;
    }

    console.log('✅ Validation passed, preparing to save track...');

    try {
      const trackData = {
        scholarship_id: scholarshipId,
        track_name: editingTrack.track_name,
        allowed_levels: editingTrack.allowed_levels,
        min_cgpa: editingTrack.min_cgpa,
        min_jamb_score: editingTrack.min_jamb_score,
        required_gender: editingTrack.required_gender,
        is_financial_need_required: editingTrack.is_financial_need_required,
        is_orphan_or_single_parent_required: editingTrack.is_orphan_or_single_parent_required,
        required_religion: editingTrack.required_religion,
        is_disability_specific: editingTrack.is_disability_specific,
        is_aptitude_test_required: editingTrack.is_aptitude_test_required,
        required_state_of_origin: editingTrack.required_state_of_origin,
        required_lga_list: editingTrack.required_lga_list,
        required_universities: editingTrack.required_universities,
        course_category: editingTrack.course_category,
        specific_requirements: editingTrack.specific_requirements
      };

      console.log(`💾 Saving track with scholarship_id: ${scholarshipId}`, trackData);

      // Check if this is a new track (temp ID starts with "temp-")
      if (editingTrack.$id.startsWith('temp-')) {
        // Create new track
        await databases.createDocument(
          DB_ID,
          TRACKS_COL_ID,
          'unique()',
          trackData
        );
        alert('✅ Track created successfully');
      } else {
        // Update existing track
        await databases.updateDocument(
          DB_ID,
          TRACKS_COL_ID,
          editingTrack.$id,
          trackData
        );
        alert('✅ Track updated successfully');
      }
      
      if (editingScholarship) {
        await fetchTracks(editingScholarship.$id);
      }
      setEditingTrack(null);
    } catch (error) {
      console.error('Error saving track:', error);
      alert('❌ Error saving track');
    }
  };

  const deleteScholarship = async (id: string) => {
    if (!confirm('Are you sure you want to delete this scholarship?')) return;

    try {
      // Delete all tracks first
      const tracksToDelete = tracks.filter(t => t.scholarship_id === id);
      for (const track of tracksToDelete) {
        await databases.deleteDocument(DB_ID, TRACKS_COL_ID, track.$id);
      }

      // Then delete scholarship
      await databases.deleteDocument(DB_ID, SCHOLARSHIP_COL_ID, id);
      alert('✅ Scholarship deleted successfully');
      await fetchScholarships();
      setSelectedScholarship(null);
      setEditingScholarship(null);
      setEditingTrack(null);
      setTracks([]);
    } catch (error) {
      console.error('Error deleting scholarship:', error);
      alert('❌ Error deleting scholarship');
    }
  };

  const deleteTrack = async (id: string) => {
    if (!confirm('Are you sure you want to delete this track?')) return;

    try {
      await databases.deleteDocument(DB_ID, TRACKS_COL_ID, id);
      alert('✅ Track deleted successfully');
      if (editingScholarship) {
        await fetchTracks(editingScholarship.$id);
      }
    } catch (error) {
      console.error('Error deleting track:', error);
      alert('❌ Error deleting track');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center bg-red-50 p-8 rounded-lg">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="text-red-500 mt-2">Only administrators can access this page</p>
        </div>
      </div>
    );
  }

  const filteredScholarships = scholarships.filter(s => {
    const matchesSearch = s.scholarship_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         s.provider.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterActive === 'all' || 
                         (filterActive === 'active' && s.is_active) ||
                         (filterActive === 'inactive' && !s.is_active);
    return matchesSearch && matchesFilter;
  });

  console.log(`📊 Total scholarships loaded: ${scholarships.length}, Filtered: ${filteredScholarships.length}, Filter: ${filterActive}, Search: "${searchTerm}"`);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage scholarships and eligibility tracks</p>
            </div>
            <button 
              onClick={() => account.deleteSession('current').then(() => window.location.href = '/')}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Scholarships List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Scholarships</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setRefreshTrigger(prev => prev + 1)}
                      className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                    >
                      ↻ Refresh
                    </button>
                    <button
                      onClick={() => {
                        setIsCreatingNew(true);
                        setSelectedScholarship(null);
                        setEditingTrack(null);
                        setEditingScholarship({
                          $id: '',
                          scholarship_name: '',
                          provider: '',
                          deadline: '',
                          award_amount: '',
                          official_link: '',
                          is_active: true
                        });
                        setTracks([]);
                      }}
                      className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                    >
                      + New
                    </button>
                  </div>
                </div>
                
                {/* Search */}
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {/* Filter */}
                <select
                  value={filterActive}
                  onChange={(e) => setFilterActive(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Scholarships</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>
              </div>

              <div className="px-6 py-3 bg-blue-50 border-t">
                <p className="text-sm font-semibold text-blue-800">
                  📊 Showing: <span className="text-lg">{filteredScholarships.length}</span> scholarship{filteredScholarships.length !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="divide-y max-h-[70vh] overflow-y-auto">
                {filteredScholarships.map(scholarship => (
                  <button
                    key={scholarship.$id}
                    onClick={() => handleSelectScholarship(scholarship)}
                    className={`w-full text-left p-4 hover:bg-blue-50 transition ${
                      selectedScholarship?.$id === scholarship.$id ? 'bg-blue-100 border-l-4 border-blue-600' : ''
                    }`}
                  >
                    <h3 className="font-semibold text-gray-900 truncate">{scholarship.scholarship_name}</h3>
                    <p className="text-sm text-gray-600">{scholarship.provider}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-500">{scholarship.deadline}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        scholarship.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {scholarship.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Details Editor */}
          <div className="lg:col-span-2">
            {(selectedScholarship || isCreatingNew) && editingScholarship ? (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">
                      {isCreatingNew ? 'Create New Scholarship' : 'Edit Scholarship'}
                    </h2>
                    <button
                      onClick={() => {
                        setSelectedScholarship(null);
                        setEditingScholarship(null);
                        setEditingTrack(null);
                        setTracks([]);
                        setIsCreatingNew(false);
                      }}
                      className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Scholarship Details */}
                <div className="p-6 border-b">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Scholarship Details</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        value={editingScholarship.scholarship_name}
                        onChange={(e) => setEditingScholarship({...editingScholarship, scholarship_name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
                      <input
                        type="text"
                        value={editingScholarship.provider}
                        onChange={(e) => setEditingScholarship({...editingScholarship, provider: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                      <input
                        type="text"
                        value={editingScholarship.deadline}
                        onChange={(e) => setEditingScholarship({...editingScholarship, deadline: e.target.value})}
                        placeholder="e.g., 2025-12-31 or Not Specified"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Award Amount</label>
                      <input
                        type="text"
                        value={editingScholarship.award_amount}
                        onChange={(e) => setEditingScholarship({...editingScholarship, award_amount: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Official Link</label>
                      <input
                        type="url"
                        value={editingScholarship.official_link}
                        onChange={(e) => setEditingScholarship({...editingScholarship, official_link: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="is_active"
                        checked={editingScholarship.is_active}
                        onChange={(e) => setEditingScholarship({...editingScholarship, is_active: e.target.checked})}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                        Active
                      </label>
                    </div>

                    <div className="flex space-x-2 pt-4">
                      {isCreatingNew ? (
                        <>
                          <button
                            onClick={createScholarship}
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                          >
                            Create Scholarship
                          </button>
                          <button
                            onClick={() => {
                              setSelectedScholarship(null);
                              setEditingScholarship(null);
                              setIsCreatingNew(false);
                            }}
                            className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={updateScholarship}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                          >
                            Save Changes
                          </button>
                          <button
                            onClick={() => deleteScholarship(editingScholarship.$id)}
                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tracks */}
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Eligibility Tracks ({tracks.length})</h3>
                    <button
                      onClick={() => {
                        if (!editingScholarship || !editingScholarship.$id) {
                          alert('❌ Please save the scholarship first before adding tracks');
                          return;
                        }
                        const newTrack: Track = {
                          $id: `temp-${Date.now()}`,
                          scholarship_id: editingScholarship.$id,
                          track_name: '',
                          allowed_levels: [],
                          min_cgpa: 0,
                          min_jamb_score: 0,
                          required_gender: undefined,
                          is_financial_need_required: false,
                          is_orphan_or_single_parent_required: false,
                          required_religion: undefined,
                          is_disability_specific: false,
                          is_aptitude_test_required: false,
                          required_state_of_origin: [],
                          required_lga_list: [],
                          required_universities: [],
                          course_category: [],
                          specific_requirements: []
                        };
                        console.log(`✨ Creating new track with scholarship_id: ${newTrack.scholarship_id}`);
                        setEditingTrack(newTrack);
                      }}
                      className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                    >
                      + Add Track
                    </button>
                  </div>
                  
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {tracks.map(track => (
                      <div
                        key={track.$id}
                        className={`border rounded-lg p-4 cursor-pointer hover:bg-gray-50 ${
                          editingTrack?.$id === track.$id ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                        }`}
                        onClick={() => setEditingTrack(track)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-gray-900">{track.track_name}</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              Min CGPA: {track.min_cgpa} | Min JAMB: {track.min_jamb_score}
                            </p>
                            {track.required_universities && track.required_universities.length > 0 && (
                              <p className="text-sm text-gray-600">
                                Universities: {track.required_universities.join(', ')}
                              </p>
                            )}
                            {track.course_category && track.course_category.length > 0 && (
                              <p className="text-sm text-gray-600">
                                Courses: {track.course_category.join(', ')}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteTrack(track.$id);
                            }}
                            className="text-red-600 hover:text-red-700 font-medium text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Edit Track Form */}
                  {editingTrack && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-gray-900 mb-4">Edit Track: {editingTrack.track_name}</h4>
                      
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Track Name</label>
                          <input
                            type="text"
                            value={editingTrack.track_name}
                            onChange={(e) => setEditingTrack({...editingTrack, track_name: e.target.value})}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Allowed Levels <span className="text-red-500">*</span> (comma-separated numbers, e.g., 100,200,300)
                          </label>
                          <textarea
                            value={tempArrayInputs.allowed_levels !== undefined ? tempArrayInputs.allowed_levels : (editingTrack.allowed_levels?.join(', ') || '')}
                            onChange={(e) => {
                              console.log('📝 Allowed Levels - Raw input:', e.target.value);
                              setTempArrayInputs({...tempArrayInputs, allowed_levels: e.target.value});
                            }}
                            onBlur={() => {
                              // Parse when user leaves the field
                              const values = (tempArrayInputs.allowed_levels || '').split(',').map(s => {
                                const num = parseInt(s.trim());
                                return isNaN(num) ? null : num;
                              }).filter(n => n !== null) as number[];
                              console.log('📝 Allowed Levels - Parsed on blur:', values);
                              setEditingTrack({...editingTrack, allowed_levels: values});
                              setTempArrayInputs({...tempArrayInputs, allowed_levels: undefined});
                            }}
                            onFocus={() => console.log('🔍 Allowed Levels field focused')}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={1}
                            placeholder="100, 200, 300, 400, 500"
                            disabled={false}
                          />
                          <p className="text-xs text-gray-500 mt-1">Enter student levels separated by commas (e.g., 100, 200, 300)</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Min CGPA <span className="text-red-500">*</span></label>
                          <input
                            type="number"
                            step="0.01"
                            value={editingTrack.min_cgpa}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              console.log('📝 Min CGPA updated:', val);
                              setEditingTrack({...editingTrack, min_cgpa: val});
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., 2.5"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Min JAMB Score <span className="text-red-500">*</span></label>
                          <input
                            type="number"
                            value={editingTrack.min_jamb_score}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              console.log('📝 Min JAMB Score updated:', val);
                              setEditingTrack({...editingTrack, min_jamb_score: val});
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., 180"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Required Universities (comma-separated or "ALL")
                          </label>
                          <textarea
                            value={tempArrayInputs.required_universities !== undefined ? tempArrayInputs.required_universities : (editingTrack.required_universities?.join(', ') || '')}
                            onChange={(e) => {
                              console.log('📝 Required Universities - Raw input:', e.target.value);
                              setTempArrayInputs({...tempArrayInputs, required_universities: e.target.value});
                            }}
                            onBlur={() => {
                              const values = (tempArrayInputs.required_universities || '').split(',').map(s => s.trim()).filter(s => s);
                              console.log('📝 Required Universities - Parsed on blur:', values);
                              setEditingTrack({...editingTrack, required_universities: values});
                              setTempArrayInputs({...tempArrayInputs, required_universities: undefined});
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={2}
                            placeholder="ALL, University of Ibadan, Lagos State University, or type specific universities"
                            disabled={false}
                          />
                          <p className="text-xs text-gray-500 mt-1">Use "ALL" for all universities or list specific ones separated by commas</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Course Categories (comma-separated or "ALL")
                          </label>
                          <textarea
                            value={tempArrayInputs.course_category !== undefined ? tempArrayInputs.course_category : (editingTrack.course_category?.join(', ') || '')}
                            onChange={(e) => {
                              console.log('📝 Course Categories - Raw input:', e.target.value);
                              setTempArrayInputs({...tempArrayInputs, course_category: e.target.value});
                            }}
                            onBlur={() => {
                              const values = (tempArrayInputs.course_category || '').split(',').map(s => s.trim()).filter(s => s);
                              console.log('📝 Course Categories - Parsed on blur:', values);
                              setEditingTrack({...editingTrack, course_category: values});
                              setTempArrayInputs({...tempArrayInputs, course_category: undefined});
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={2}
                            placeholder="ALL, Engineering, Medicine, Law, Sciences, Arts, Social Sciences"
                            disabled={false}
                          />
                          <p className="text-xs text-gray-500 mt-1">Use "ALL" for all courses or list specific categories separated by commas</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Required States of Origin (comma-separated or "ALL")
                          </label>
                          <textarea
                            value={tempArrayInputs.required_state_of_origin !== undefined ? tempArrayInputs.required_state_of_origin : (editingTrack.required_state_of_origin?.join(', ') || '')}
                            onChange={(e) => {
                              console.log('📝 Required States - Raw input:', e.target.value);
                              setTempArrayInputs({...tempArrayInputs, required_state_of_origin: e.target.value});
                            }}
                            onBlur={() => {
                              const values = (tempArrayInputs.required_state_of_origin || '').split(',').map(s => s.trim()).filter(s => s);
                              console.log('📝 Required States - Parsed on blur:', values);
                              setEditingTrack({...editingTrack, required_state_of_origin: values});
                              setTempArrayInputs({...tempArrayInputs, required_state_of_origin: undefined});
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={2}
                            placeholder="ALL, Lagos, Oyo, Osun, Ogun, Kano, Kaduna, etc."
                            disabled={false}
                          />
                          <p className="text-xs text-gray-500 mt-1">Use "ALL" for all states or list specific states separated by commas</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Required LGA (comma-separated)</label>
                          <textarea
                            value={tempArrayInputs.required_lga_list !== undefined ? tempArrayInputs.required_lga_list : (editingTrack.required_lga_list?.join(', ') || '')}
                            onChange={(e) => {
                              console.log('📝 Required LGA - Raw input:', e.target.value);
                              setTempArrayInputs({...tempArrayInputs, required_lga_list: e.target.value});
                            }}
                            onBlur={() => {
                              const values = (tempArrayInputs.required_lga_list || '').split(',').map(s => s.trim()).filter(s => s);
                              console.log('📝 Required LGA - Parsed on blur:', values);
                              setEditingTrack({...editingTrack, required_lga_list: values});
                              setTempArrayInputs({...tempArrayInputs, required_lga_list: undefined});
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={2}
                            placeholder="Leave empty for all LGAs, or enter specific LGAs: Ikeja, Amuwo-Odofin, Lagos Island, etc."
                            disabled={false}
                          />
                          <p className="text-xs text-gray-500 mt-1">Leave empty to allow all LGAs, or list specific LGAs separated by commas</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Specific Requirements (comma-separated)
                          </label>
                          <textarea
                            value={tempArrayInputs.specific_requirements !== undefined ? tempArrayInputs.specific_requirements : (editingTrack.specific_requirements?.join(', ') || '')}
                            onChange={(e) => {
                              console.log('📝 Specific Requirements - Raw input:', e.target.value);
                              setTempArrayInputs({...tempArrayInputs, specific_requirements: e.target.value});
                            }}
                            onBlur={() => {
                              const values = (tempArrayInputs.specific_requirements || '').split(',').map(s => s.trim()).filter(s => s);
                              console.log('📝 Specific Requirements - Parsed on blur:', values);
                              setEditingTrack({...editingTrack, specific_requirements: values});
                              setTempArrayInputs({...tempArrayInputs, specific_requirements: undefined});
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={2}
                            placeholder="e.g., Must have valid national ID, Nigerian citizen, First class honors"
                            disabled={false}
                          />
                          <p className="text-xs text-gray-500 mt-1">Additional specific requirements for this track</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Required Gender</label>
                          <input
                            type="text"
                            value={editingTrack.required_gender || ''}
                            onChange={(e) => {
                              const val = e.target.value || undefined;
                              console.log('📝 Required Gender updated:', val);
                              setEditingTrack({...editingTrack, required_gender: val});
                            }}
                            placeholder="Male, Female, or ANY"
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <p className="text-xs text-gray-500 mt-1">Leave empty for no gender restriction</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Required Religion</label>
                          <input
                            type="text"
                            value={editingTrack.required_religion || ''}
                            onChange={(e) => {
                              const val = e.target.value || undefined;
                              console.log('📝 Required Religion updated:', val);
                              setEditingTrack({...editingTrack, required_religion: val});
                            }}
                            placeholder="Christian, Muslim, or NONE"
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <p className="text-xs text-gray-500 mt-1">Leave empty for no religion restriction</p>
                        </div>

                        <div className="space-y-2 pt-2">
                          <label className="flex items-center text-sm">
                            <input
                              type="checkbox"
                              checked={editingTrack.is_financial_need_required || false}
                              onChange={(e) => setEditingTrack({...editingTrack, is_financial_need_required: e.target.checked})}
                              className="h-3 w-3 text-blue-600"
                            />
                            <span className="ml-2 text-gray-700">Financial Need Required</span>
                          </label>

                          <label className="flex items-center text-sm">
                            <input
                              type="checkbox"
                              checked={editingTrack.is_orphan_or_single_parent_required || false}
                              onChange={(e) => setEditingTrack({...editingTrack, is_orphan_or_single_parent_required: e.target.checked})}
                              className="h-3 w-3 text-blue-600"
                            />
                            <span className="ml-2 text-gray-700">Orphan/Single Parent Required</span>
                          </label>

                          <label className="flex items-center text-sm">
                            <input
                              type="checkbox"
                              checked={editingTrack.is_disability_specific || false}
                              onChange={(e) => setEditingTrack({...editingTrack, is_disability_specific: e.target.checked})}
                              className="h-3 w-3 text-blue-600"
                            />
                            <span className="ml-2 text-gray-700">Disability Specific</span>
                          </label>

                          <label className="flex items-center text-sm">
                            <input
                              type="checkbox"
                              checked={editingTrack.is_aptitude_test_required || false}
                              onChange={(e) => setEditingTrack({...editingTrack, is_aptitude_test_required: e.target.checked})}
                              className="h-3 w-3 text-blue-600"
                            />
                            <span className="ml-2 text-gray-700">Aptitude Test Required</span>
                          </label>
                        </div>

                        <div className="flex space-x-2 pt-4">
                          <button
                            onClick={updateTrack}
                            className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium text-sm"
                          >
                            {editingTrack.$id.startsWith('temp-') ? 'Create Track' : 'Save Track'}
                          </button>
                          <button
                            onClick={() => setEditingTrack(null)}
                            className="flex-1 px-3 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 font-medium text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-gray-500">Select a scholarship to edit or create a new one</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
