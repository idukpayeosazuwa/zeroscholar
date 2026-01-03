import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { account } from '../appwriteConfig';
import { LogoIcon } from './icons/LogoIcon';
import { Models } from 'appwrite';
import { UniversityLevel } from '../types';
import { getErrorMessage, classifyError } from '../utils/errorHandler';

interface EmailOTPVerificationProps {
  userId: string;
  email: string;
  onVerificationSuccess: (user: Models.User<Models.Preferences>, level: UniversityLevel) => void;
  onCancel: () => void;
  level: UniversityLevel;
}

const EmailOTPVerification: React.FC<EmailOTPVerificationProps> = ({
  userId,
  email,
  onVerificationSuccess,
  onCancel,
  level
}) => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setError('OTP expired. Please request a new one.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Auto-focus and handle input
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const otpCode = otp.join('');

    if (otpCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      setIsLoading(false);
      return;
    }

    try {
      // Use Appwrite's createSession with the OTP code as the secret
      const session = await account.createSession(userId, otpCode);
      console.log('✅ Session created with OTP:', session);

      // Get updated user info
      const user = await account.get();
      console.log('✅ User verified:', user);

      setSuccessMessage('Email verified successfully!');
      
      // Call success callback and redirect
      setTimeout(() => {
        onVerificationSuccess(user, level);
      }, 1500);
    } catch (err: any) {
      console.error('❌ OTP verification failed:', err);
      const classified = classifyError(err);
      setError(classified.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Request a new OTP
      const result = await account.createEmailToken(userId, email);
      console.log('✅ New OTP sent to:', email);
      
      // Reset OTP inputs and timer
      setOtp(['', '', '', '', '', '']);
      setTimeLeft(600);
      otpInputsRef.current[0]?.focus();
      
      setSuccessMessage('New code sent to your email!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError('Failed to resend code. Please try again.');
      console.error('❌ Resend failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Show success state
  if (successMessage) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50 h-16 flex items-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl w-full mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LogoIcon className="h-8 w-8 text-[#2240AF]" />
              <span className="text-xl font-bold text-[#2240AF]">ScholarAI</span>
            </div>
          </div>
        </nav>

        <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md mx-auto p-8 bg-white shadow-xl rounded-lg text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Email Verified!</h2>
            <p className="text-gray-600 mt-2">{successMessage}</p>
            <p className="text-sm text-gray-500 mt-4">Redirecting to your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50 h-16 flex items-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LogoIcon className="h-8 w-8 text-[#2240AF]" />
            <span className="text-xl font-bold text-[#2240AF]">ScholarAI</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto p-8 bg-white shadow-xl rounded-lg">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Verify Your Email</h2>
            <p className="text-gray-600 mt-2">
              We sent a 6-digit code to<br />
              <span className="font-semibold text-blue-600">{email}</span>
            </p>
          </div>

          <form onSubmit={handleVerifyOTP} className="space-y-6">
            {/* OTP Input Fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Enter Code
              </label>
              <div className="flex gap-2 justify-between mb-4">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      otpInputsRef.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    disabled={isLoading}
                    className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 transition-colors"
                    placeholder="0"
                  />
                ))}
              </div>

              {/* Timer */}
              <div className="text-center mb-4">
                {timeLeft > 0 ? (
                  <p className="text-sm text-gray-600">
                    Code expires in <span className="font-semibold text-red-600">{formatTime(timeLeft)}</span>
                  </p>
                ) : (
                  <p className="text-sm text-red-600 font-semibold">Code has expired</p>
                )}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-600">{successMessage}</p>
              </div>
            )}

            {/* Verify Button */}
            <button
              type="submit"
              disabled={isLoading || otp.some(d => !d)}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isLoading ? 'Verifying...' : 'Verify Code'}
            </button>
          </form>

          {/* Resend Section */}
          <div className="mt-6 text-center border-t pt-6">
            <p className="text-sm text-gray-600 mb-3">
              Didn't receive the code?
            </p>
            <button
              onClick={handleResendOTP}
              disabled={isLoading}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              Resend Code
            </button>
          </div>

          {/* Cancel/Back */}
          <div className="mt-4 text-center">
            <button
              onClick={onCancel}
              className="text-sm text-gray-600 hover:text-gray-800 underline"
            >
              Change Email
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailOTPVerification;
