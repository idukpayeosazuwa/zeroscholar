import React, { useState, useEffect } from 'react';
import { account, databases, DATABASE_ID, VOTES_COLLECTION_ID } from '../appwriteConfig';
import { ID, Query } from 'appwrite';

interface Candidate {
  id: string;
  name: string;
  manifesto: string;
}

const candidates: Candidate[] = [
  { 
    id: 'mike', 
    name: 'Mike', 
    manifesto: 'Assistant Course Rep of CS240'
  },
  { 
    id: 'esosa', 
    name: 'Esosa', 
    manifesto: 'Assistant Course Rep of CS240'
  },
  { 
    id: 'hope', 
    name: 'Hope', 
    manifesto: 'Assistant Course Rep of CS240'
  },
  { 
    id: 'gilbert', 
    name: 'Gilbert', 
    manifesto: 'Assistant Course Rep of CS240'
  },
];

type Step = 'email' | 'otp' | 'vote' | 'success' | 'admin-login' | 'admin-results';

interface VoteResult {
  candidate: string;
  count: number;
}

const ADMIN_KEY = 'STAR_ADMIN';

const VotingPage: React.FC = () => {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [votedFor, setVotedFor] = useState('');
  const [existingSession, setExistingSession] = useState<string | null>(null);
  const [adminKey, setAdminKey] = useState('');
  const [voteResults, setVoteResults] = useState<VoteResult[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);

  // Check for existing session on mount
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const session = await account.get();
        if (session) {
          setExistingSession(session.email || session.name || 'another account');
        }
      } catch {
        // No existing session, which is fine
        setExistingSession(null);
      }
    };
    checkExistingSession();
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await account.deleteSession('current');
      setExistingSession(null);
      setError('');
    } catch (err: any) {
      console.error('Logout error:', err);
      setError('Failed to logout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (adminKey === ADMIN_KEY) {
      fetchResults();
      setStep('admin-results');
    } else {
      setError('Invalid admin key. Please try again.');
    }
  };

  const fetchResults = async () => {
    setLoading(true);
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        VOTES_COLLECTION_ID,
        [Query.limit(1000)]
      );

      // Count votes per candidate
      const counts: { [key: string]: number } = {};
      candidates.forEach(c => counts[c.id] = 0);

      response.documents.forEach((doc: any) => {
        if (counts[doc.candidate] !== undefined) {
          counts[doc.candidate]++;
        }
      });

      const results: VoteResult[] = candidates.map(c => ({
        candidate: c.name,
        count: counts[c.id]
      }));

      // Sort by votes descending
      results.sort((a, b) => b.count - a.count);

      setVoteResults(results);
      setTotalVotes(response.documents.length);
    } catch (err: any) {
      console.error('Fetch results error:', err);
      if (err.code === 404) {
        setVoteResults(candidates.map(c => ({ candidate: c.name, count: 0 })));
        setTotalVotes(0);
      } else {
        setError('Failed to fetch results.');
      }
    } finally {
      setLoading(false);
    }
  };

  const validateEmail = (email: string): boolean => {
    const pattern = /^[a-zA-Z0-9._%+-]+@physci\.uniben\.edu$/i;
    return pattern.test(email);
  };

  const checkIfAlreadyVoted = async (email: string): Promise<boolean> => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        VOTES_COLLECTION_ID,
        [Query.equal('email', email.toLowerCase())]
      );
      return response.documents.length > 0;
    } catch (err: any) {
      // Collection might not exist yet
      if (err.code === 404) {
        return false;
      }
      console.error('Error checking vote status:', err);
      return false;
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateEmail(email)) {
      setError('Please use your University of Benin Physics email (@physci.uniben.edu)');
      return;
    }

    setLoading(true);

    try {
      // Check if already voted
      const hasVoted = await checkIfAlreadyVoted(email);
      if (hasVoted) {
        setError('This email has already been used to vote. Each student can only vote once.');
        setLoading(false);
        return;
      }

      // Create email OTP session
      const token = await account.createEmailToken(ID.unique(), email);
      setUserId(token.userId);
      setStep('otp');
    } catch (err: any) {
      console.error('OTP Error:', err);
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!userId) {
        setError('Session expired. Please start again.');
        setStep('email');
        return;
      }

      await account.createSession(userId, otp);
      setStep('vote');
    } catch (err: any) {
      console.error('Verification Error:', err);
      setError('Invalid OTP. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async () => {
    if (!selectedCandidate) {
      setError('Please select a candidate');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Double-check if already voted
      const hasVoted = await checkIfAlreadyVoted(email);
      if (hasVoted) {
        setError('This email has already been used to vote.');
        setLoading(false);
        return;
      }

      // Record the vote
      await databases.createDocument(
        DATABASE_ID,
        VOTES_COLLECTION_ID,
        ID.unique(),
        {
          email: email.toLowerCase(),
          candidate: selectedCandidate,
          votedAt: new Date().toISOString(),
        }
      );

      const candidateName = candidates.find(c => c.id === selectedCandidate)?.name || '';
      setVotedFor(candidateName);
      setStep('success');

      // Logout the session
      try {
        await account.deleteSession('current');
      } catch (e) {
        // Ignore logout errors
      }
    } catch (err: any) {
      console.error('Vote Error:', err);
      if (err.code === 404) {
        setError('Voting system is being set up. Please contact the administrator.');
      } else {
        setError(err.message || 'Failed to record vote. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderEmailStep = () => (
    <form onSubmit={handleSendOTP} className="space-y-6">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          University Email Address
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="yourname@physci.uniben.edu"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          required
        />
        <p className="mt-2 text-sm text-gray-500">
          Only @physci.uniben.edu emails are allowed
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {existingSession && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-amber-800 text-sm mb-3">
            You're already logged in as <strong>{existingSession}</strong>. Please logout first to vote with a different email.
          </p>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loading}
            className="w-full bg-amber-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-amber-700 transition disabled:opacity-50"
          >
            {loading ? 'Logging out...' : 'Logout from existing session'}
          </button>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !!existingSession}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Sending OTP...' : 'Send Verification Code'}
      </button>

      <div className="text-center pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={() => { setStep('admin-login'); setError(''); }}
          className="text-sm text-gray-500 hover:text-gray-700 transition"
        >
          Log In as Admin
        </button>
      </div>
    </form>
  );

  const renderOTPStep = () => (
    <form onSubmit={handleVerifyOTP} className="space-y-6">
      <div>
        <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
          Enter Verification Code
        </label>
        <p className="text-sm text-gray-500 mb-3">
          We sent a code to <strong>{email}</strong>
        </p>
        <input
          type="text"
          id="otp"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter 6-digit code"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-center text-2xl tracking-widest"
          maxLength={6}
          required
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Verifying...' : 'Verify & Continue'}
      </button>

      <button
        type="button"
        onClick={() => {
          setStep('email');
          setOtp('');
          setError('');
        }}
        className="w-full text-gray-600 py-2 hover:text-gray-800 transition"
      >
        ← Use different email
      </button>
    </form>
  );

  const renderVoteStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
          Select Your Candidate
        </h3>
        <div className="grid grid-cols-1 gap-4">
          {candidates.map((candidate) => (
            <button
              key={candidate.id}
              onClick={() => setSelectedCandidate(candidate.id)}
              className={`p-5 rounded-xl border-2 transition-all text-left ${
                selectedCandidate === candidate.id
                  ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-gray-900">{candidate.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{candidate.manifesto}</p>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ml-4 flex-shrink-0 ${
                  selectedCandidate === candidate.id
                    ? 'border-blue-600 bg-blue-600'
                    : 'border-gray-300'
                }`}>
                  {selectedCandidate === candidate.id && (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <button
        onClick={handleVote}
        disabled={loading || !selectedCandidate}
        className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Submitting Vote...' : 'Cast My Vote'}
      </button>

      <p className="text-center text-sm text-gray-500">
        Your vote is anonymous and secure
      </p>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Vote Recorded!</h3>
        <p className="text-gray-600">
          You voted for <strong className="text-blue-600">{votedFor}</strong>
        </p>
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <h4 className="text-xl font-bold mb-3">Join ScholarAI!</h4>
        <p className="text-blue-100 mb-4 text-sm">
          Get access to exclusive features designed for Nigerian students:
        </p>
        <ul className="text-left space-y-2 mb-4">
          <li className="flex items-center">
            <svg className="w-5 h-5 mr-2 text-green-300" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Find scholarships matching your profile
          </li>
          <li className="flex items-center">
            <svg className="w-5 h-5 mr-2 text-green-300" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Practice aptitude tests (75+ questions)
          </li>
          <li className="flex items-center">
            <svg className="w-5 h-5 mr-2 text-green-300" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Calculate and track your CGPA
          </li>
          <li className="flex items-center">
            <svg className="w-5 h-5 mr-2 text-green-300" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Join student community discussions
          </li>
        </ul>
        <a
          href="/app"
          className="inline-block w-full bg-white text-blue-600 py-3 px-4 rounded-lg font-semibold hover:bg-blue-50 transition text-center"
        >
          Sign Up for ScholarAI - It's Free!
        </a>
      </div>

      <p className="text-sm text-gray-500">
        Thank you for participating in the CS240 election!
      </p>
    </div>
  );

  const renderAdminLogin = () => (
    <form onSubmit={handleAdminLogin} className="space-y-6">
      <div>
        <label htmlFor="adminKey" className="block text-sm font-medium text-gray-700 mb-2">
          Admin Access Key
        </label>
        <input
          type="password"
          id="adminKey"
          value={adminKey}
          onChange={(e) => setAdminKey(e.target.value)}
          placeholder="Enter admin key"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          required
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <button
        type="submit"
        className="w-full bg-gray-800 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-900 transition"
      >
        Access Results
      </button>

      <button
        type="button"
        onClick={() => { setStep('email'); setError(''); setAdminKey(''); }}
        className="w-full text-gray-600 hover:text-gray-900 text-sm font-medium transition"
      >
        Back to Voting
      </button>
    </form>
  );

  const renderAdminResults = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Live Results</h3>
        <button
          onClick={fetchResults}
          disabled={loading}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-sm text-gray-600 mb-1">Total Votes Cast</p>
        <p className="text-3xl font-bold text-gray-900">{totalVotes}</p>
      </div>

      <div className="space-y-3">
        {voteResults.map((result, index) => {
          const percentage = totalVotes > 0 ? (result.count / totalVotes) * 100 : 0;
          return (
            <div key={result.candidate} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-700 text-sm font-medium flex items-center justify-center mr-3">
                    {index + 1}
                  </span>
                  <span className="font-semibold text-gray-900">{result.candidate}</span>
                </div>
                <span className="text-lg font-bold text-gray-900">{result.count}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">{percentage.toFixed(1)}%</p>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <button
        onClick={() => { setStep('email'); setAdminKey(''); setError(''); }}
        className="w-full text-gray-600 hover:text-gray-900 text-sm font-medium transition"
      >
        Exit Admin View
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">CS240 Election</h1>
          <p className="text-gray-600 mt-1">Assistant Course Representative</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          {step === 'email' && renderEmailStep()}
          {step === 'otp' && renderOTPStep()}
          {step === 'vote' && renderVoteStep()}
          {step === 'success' && renderSuccessStep()}
          {step === 'admin-login' && renderAdminLogin()}
          {step === 'admin-results' && renderAdminResults()}
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Powered by <a href="/" className="text-blue-600 hover:underline font-medium">ScholarAI</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VotingPage;
