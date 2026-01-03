import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogoIcon } from '../components/icons/LogoIcon';

const Privacy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50 h-16 flex items-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <LogoIcon className="h-8 w-8 text-[#2240AF]" />
            <span className="text-xl font-bold text-[#2240AF]">ScholarAI</span>
          </div>
          <button 
            onClick={() => navigate('/')}
            className="text-gray-500 hover:text-gray-700 text-sm font-medium"
          >
            ← Back to Home
          </button>
        </div>
      </nav>

      {/* Content */}
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto bg-white shadow-sm rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-sm text-gray-500 mb-8">Last updated: January 3, 2026</p>

          <div className="prose prose-sm max-w-none space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Introduction</h2>
              <p>
                ScholarAI ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy 
                explains how we collect, use, and safeguard your personal information when you use our scholarship 
                matching platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Information We Collect</h2>
              <p>We collect the following information to match you with relevant scholarships:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li><strong>Account Information:</strong> Email address and password</li>
                <li><strong>Academic Information:</strong> University level, CGPA, JAMB score, university name, and course category</li>
                <li><strong>Personal Information:</strong> Gender, state of origin, LGA, and religion</li>
                <li><strong>Special Criteria:</strong> Financial need status, orphan status, and disability status (optional)</li>
                <li><strong>Application Data:</strong> Scholarships you've applied to and application dates</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">How We Use Your Information</h2>
              <p>We use your information to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Match you with relevant scholarship opportunities</li>
                <li>Provide personalized scholarship recommendations</li>
                <li>Track your scholarship applications</li>
                <li>Send notifications about new matching scholarships (if enabled)</li>
                <li>Calculate your CGPA and track academic progress</li>
                <li>Improve our matching algorithms and service quality</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Data Storage and Security</h2>
              <p>
                Your data is securely stored using <strong>Appwrite</strong>, a secure backend-as-a-service platform. 
                We implement industry-standard security measures including:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Encrypted data transmission (HTTPS/TLS)</li>
                <li>Secure authentication and password hashing</li>
                <li>Regular security updates and monitoring</li>
                <li>Limited access to personal data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Data Sharing</h2>
              <p>
                We <strong>do not sell</strong> your personal information. We only share data with:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li><strong>Appwrite:</strong> Our backend service provider for data storage</li>
                <li><strong>Email Service:</strong> For sending verification and notification emails</li>
              </ul>
              <p className="mt-2">
                We may disclose information if required by law or to protect our legal rights.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Access and update your personal information through your profile</li>
                <li>Delete your account and associated data at any time</li>
                <li>Opt-out of email notifications</li>
                <li>Request a copy of your data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Cookies and Tracking</h2>
              <p>
                We use local storage and session cookies to maintain your login state and provide offline functionality. 
                We do not use third-party tracking or advertising cookies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Data Retention</h2>
              <p>
                We retain your information for as long as your account is active. If you delete your account, 
                we will remove your personal data within 30 days, except where required to retain it for legal purposes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Children's Privacy</h2>
              <p>
                Our service is intended for university students. We do not knowingly collect information from 
                individuals under 18 years of age without parental consent.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify users of significant changes 
                via email or through the platform. Your continued use after changes constitutes acceptance.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Contact Us</h2>
              <p>
                If you have questions about this Privacy Policy or your data, please contact us at:
              </p>
              <p className="mt-2">
                <strong>Email:</strong> <a href="mailto:support@scholarai.ng" className="text-blue-600 hover:underline">support@scholarai.ng</a>
              </p>
            </section>

            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>🔒 Your privacy matters:</strong> We are committed to protecting your data and using it 
                solely to help you find scholarships. We never sell your information to third parties.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
