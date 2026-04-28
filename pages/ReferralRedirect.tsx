import React, { useEffect } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';

export default function ReferralRedirect() {
  const { code } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (code) {
      const normalizedCode = code.trim().toLowerCase();
      if (normalizedCode) {
        console.log("🔗 [ReferralRedirect] Caught referral code before redirect:", normalizedCode);
        localStorage.setItem('referredByItem', normalizedCode);
      }
    }
    // Navigate after we make sure it's stored
    navigate('/login?showLogin=false', { replace: true });
  }, [code, navigate]);

  return <div className="p-10 text-center text-gray-500">Processing referral...</div>;
}
