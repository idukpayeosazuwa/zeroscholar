import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { databases, USERS_COLLECTION_ID, DATABASE_ID } from '../appwriteConfig';
import { UserProfile } from '../types';
import { Query } from 'appwrite';

interface Props {
  userProfile: UserProfile;
  userId: string;
}

const AmbassadorOnboarding: React.FC<Props> = ({ userProfile, userId }) => {
  const navigate = useNavigate();
  const [referralCode, setReferralCode] = useState(userProfile.referralCode || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [dashboardError, setDashboardError] = useState('');
  const [referralsLoading, setReferralsLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [liveReferralCount, setLiveReferralCount] = useState<number>(userProfile.referralCount || 0);
  const [referrals, setReferrals] = useState<Array<{ id: string; refereeName: string; createdAt: string }>>([]);
  const [monthCount, setMonthCount] = useState<number>(0);
  const [weekCount, setWeekCount] = useState<number>(0);

  const getInitials = (name?: string) => {
    const safe = (name || '').trim();
    if (!safe) return 'ZS';
    const parts = safe.split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] || 'Z';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase();
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  useEffect(() => {
    if (!userProfile.isAmbassador) return;
    if (!userId) return;
    const code = (userProfile.referralCode || '').trim().toLowerCase();
    if (!code) return;

    const fetchDashboard = async () => {
      setDashboardError('');

      // Derive referral totals from users collection.
      // This works immediately as long as new users store `referredBy`.
      try {
        const allTimeResp = await databases.listDocuments(DATABASE_ID, USERS_COLLECTION_ID, [
          Query.equal('referredBy', code),
          Query.limit(1)
        ]);
        setLiveReferralCount(allTimeResp.total || 0);
      } catch (e) {
        // Non-fatal; keep whatever we already have
      }

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(now.getDate() - 7);

      setStatsLoading(true);
      try {
        const [monthResp, weekResp] = await Promise.all([
          databases.listDocuments(DATABASE_ID, USERS_COLLECTION_ID, [
            Query.equal('referredBy', code),
            Query.greaterThanEqual('$createdAt', startOfMonth.toISOString()),
            Query.limit(1)
          ]),
          databases.listDocuments(DATABASE_ID, USERS_COLLECTION_ID, [
            Query.equal('referredBy', code),
            Query.greaterThanEqual('$createdAt', sevenDaysAgo.toISOString()),
            Query.limit(1)
          ])
        ]);
        setMonthCount(monthResp.total || 0);
        setWeekCount(weekResp.total || 0);
      } catch (e: any) {
        setDashboardError('Could not load referral stats right now.');
      } finally {
        setStatsLoading(false);
      }

      setReferralsLoading(true);
      try {
        const listResp = await databases.listDocuments(DATABASE_ID, USERS_COLLECTION_ID, [
          Query.equal('referredBy', code),
          Query.orderDesc('$createdAt'),
          Query.limit(50)
        ]);

        const mapped = listResp.documents.map((doc: any) => ({
          id: doc.$id,
          refereeName: doc.fullName || doc.email || 'Anonymous',
          createdAt: doc.$createdAt
        }));
        setReferrals(mapped);
      } catch (e: any) {
        if (!dashboardError) {
          setDashboardError('Could not load referral list right now.');
        }
      } finally {
        setReferralsLoading(false);
      }
    };

    fetchDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile.isAmbassador, userId, userProfile.referralCode]);

  if (userProfile.isAmbassador) {
    const initials = getInitials(userProfile.fullName);

    return (
      <div className="p-6 bg-white rounded-lg shadow max-w-3xl mx-auto mt-10">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg">
              {initials}
            </div>
            <div>
              <h2 className="text-2xl font-bold">Ambassador Dashboard</h2>
              <p className="text-gray-600 text-sm">Track your referrals</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/app/leaderboard')}
            className="px-3 py-2 text-sm font-semibold text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            View Leaderboard
          </button>
        </div>

        <div className="bg-gray-50 border rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600 mb-2">Your referral link</p>
          <code className="bg-white px-3 py-2 rounded text-blue-600 font-mono block break-all border">
            {window.location.origin}/login?ref={userProfile.referralCode}&showLogin=false
          </code>
        </div>

        {dashboardError && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded mb-6">
            {dashboardError}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="border rounded-lg p-4">
            <p className="text-sm text-gray-600">All-time</p>
            <p className="text-2xl font-bold text-blue-700">{liveReferralCount}</p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-sm text-gray-600">This month</p>
            <p className="text-2xl font-bold text-gray-900">{statsLoading ? '…' : monthCount}</p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-sm text-gray-600">Last 7 days</p>
            <p className="text-2xl font-bold text-gray-900">{statsLoading ? '…' : weekCount}</p>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-gray-100 border-b">
            <h3 className="font-semibold text-gray-800">Your referrals (name only)</h3>
            <p className="text-xs text-gray-600">Shows referrals once processed</p>
          </div>
          {referralsLoading ? (
            <div className="p-4 text-gray-500">Loading referrals…</div>
          ) : referrals.length === 0 ? (
            <div className="p-4 text-gray-500">No referrals yet.</div>
          ) : (
            <div className="divide-y">
              {referrals.map((r) => (
                <div key={r.id} className="px-4 py-3 flex items-center justify-between">
                  <span className="font-medium text-gray-900">{r.refereeName}</span>
                  <span className="text-sm text-gray-600">{formatDate(r.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!referralCode.trim()) return;

    const normalizedReferralCode = referralCode.trim().toLowerCase();
    if (!normalizedReferralCode) return;

    setLoading(true);
    setError('');
    setMessage('');

    try {
      // Check if code is unique
      const existing = await databases.listDocuments(DATABASE_ID, USERS_COLLECTION_ID, [
        Query.equal('referralCode', normalizedReferralCode)
      ]);

      if (existing.documents.length > 0) {
        throw new Error('This referral code is already taken.');
      }

      await databases.updateDocument(DATABASE_ID, USERS_COLLECTION_ID, userId, {
        isAmbassador: true,
        referralCode: normalizedReferralCode
      });

      setMessage('Congratulations! You are now an ambassador.');
      // A full page reload to refresh the cached userProfile in App.tsx might be useful,
      // or calling a prop to update it.
      setTimeout(() => window.location.reload(), 1500);

    } catch (err: any) {
      setError(err.message || 'Failed to become an ambassador. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow max-w-lg mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-4">Become an Ambassador</h2>
      <p className="text-gray-600 mb-6">Create your unique referral code and start earning rewards by bringing in new users!</p>

      {message && <div className="p-3 bg-green-100 text-green-700 rounded mb-4">{message}</div>}
      {error && <div className="p-3 bg-red-100 text-red-700 rounded mb-4">{error}</div>}

      <form onSubmit={handleApply}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Choose Your Referral Code
          </label>
          <input
            type="text"
            required
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
            className="w-full px-3 py-2 border rounded focus:ring focus:ring-blue-200"
            placeholder="e.g. john2024"
          />
          <p className="text-xs text-gray-500 mt-1">Alphanumeric characters only.</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white font-semibold py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Claim Link'}
        </button>
      </form>
    </div>
  );
};

export default AmbassadorOnboarding;
