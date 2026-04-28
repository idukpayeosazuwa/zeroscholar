import React, { useEffect, useState } from 'react';
import { databases, USERS_COLLECTION_ID, DATABASE_ID } from '../appwriteConfig';
import { Query } from 'appwrite';

interface Ambassador {
  $id: string;
  fullName: string;
  referralCode: string;
  referralCount: number;
}

const Leaderboard: React.FC = () => {
  const [ambassadors, setAmbassadors] = useState<Ambassador[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await databases.listDocuments(DATABASE_ID, USERS_COLLECTION_ID, [
          Query.equal('isAmbassador', true),
          Query.limit(50)
        ]);

        const baseAmbassadors: Array<{ $id: string; fullName: string; referralCode: string }> = response.documents
          .map((doc: any) => ({
            $id: doc.$id,
            fullName: doc.fullName || 'Anonymous',
            referralCode: (doc.referralCode || '').trim().toLowerCase()
          }))
          .filter((a) => Boolean(a.referralCode));

        const counts = await Promise.all(
          baseAmbassadors.map(async (a) => {
            try {
              const resp = await databases.listDocuments(DATABASE_ID, USERS_COLLECTION_ID, [
                Query.equal('referredBy', a.referralCode),
                Query.limit(1)
              ]);
              return resp.total || 0;
            } catch {
              return 0;
            }
          })
        );

        const mappedData: Ambassador[] = baseAmbassadors
          .map((a, idx) => ({
            ...a,
            referralCount: counts[idx] || 0
          }))
          .sort((x, y) => (y.referralCount || 0) - (x.referralCount || 0));

        setAmbassadors(mappedData);
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow max-w-4xl mx-auto mt-10">
      <h2 className="text-3xl font-bold mb-6 text-center text-blue-600">🏆 Ambassador Leaderboard</h2>
      
      {loading ? (
        <p className="text-gray-500 text-center py-4">Loading top ambassadors...</p>
      ) : ambassadors.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No ambassadors yet. Be the first!</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="py-3 px-4 font-semibold text-gray-700">Rank</th>
                <th className="py-3 px-4 font-semibold text-gray-700">Ambassador Name</th>
                <th className="py-3 px-4 text-right font-semibold text-gray-700">Referrals</th>
              </tr>
            </thead>
            <tbody>
              {ambassadors.map((ambassador, idx) => (
                <tr key={ambassador.$id} className="border-b hover:bg-gray-50 transition">
                  <td className="py-3 px-4">
                    {idx === 0 && '🥇 '}
                    {idx === 1 && '🥈 '}
                    {idx === 2 && '🥉 '}
                    {idx > 2 && `${idx + 1}.`}
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-900">{ambassador.fullName}</td>
                  <td className="py-3 px-4 text-right text-blue-600 font-bold">{ambassador.referralCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
