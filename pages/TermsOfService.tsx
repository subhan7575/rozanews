import React from 'react';
import { Scale, FileWarning, Copyright, Gavel, AlertCircle, Mail } from 'lucide-react';

const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6 shadow-lg">
            <Scale size={48} className="text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Terms of Service
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400">Effective Date: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 md:p-12 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 space-y-10 text-gray-700 dark:text-gray-300 leading-relaxed">
          
          {/* Introduction */}
          <section className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-xl">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Welcome to Roza News</h2>
            <p className="mb-4">
              Welcome to Roza News ("Service"), operated by Roza News Media Group. These Terms of Service ("Terms") govern your access to and use of our website, mobile applications, and related services. Please read these Terms carefully before using our Service.
            </p>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 mt-4">
              <p className="text-yellow-700 dark:text-yellow-300 font-medium">
                <strong>Important:</strong> By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the Service.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
              <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
                <Copyright className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
              <span>1. Intellectual Property Rights</span>
            </h2>
            <div className="space-y-3">
              <p>
                The Service and its original content, features, and functionality are owned by Roza News Media Group and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
              </p>
              <p>
                <strong>You are granted a limited license</strong> to access and use the Service for your personal, non-commercial use. This license does not include:
              </p>
              <ul className="list-disc pl-6 space-y-2 ml-2">
                <li>Resale or commercial use of the Service or its contents</li>
                <li>Collection and use of any product listings, descriptions, or prices</li>
                <li>Derivative use of the Service or its contents</li>
                <li>Downloading or copying account information for the benefit of another merchant</li>
                <li>Any use of data mining, robots, or similar data gathering and extraction tools</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
              <div className="bg-red-100 dark:bg-red-900 p-2 rounded-lg">
                <FileWarning className="text-red-600 dark:text-red-400" size={24} />
              </div>
              <span>2. User Responsibilities & Prohibited Activities</span>
            </h2>
            <div className="space-y-3">
              <p>You agree not to engage in any of the following prohibited activities:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-2">Content Violations</h4>
                  <ul className="list-disc pl-4 space-y-1 text-sm">
                    <li>Posting unlawful, defamatory, or obscene content</li>
                    <li>Infringing intellectual property rights</li>
                    <li>Posting false or misleading information</li>
                    <li>Harassing or threatening other users</li>
                  </ul>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-2">Security Violations</h4>
                  <ul className="list-disc pl-4 space-y-1 text-sm">
                    <li>Attempting to breach security measures</li>
                    <li>Uploading viruses or malicious code</li>
                    <li>Unauthorized access to systems</li>
                    <li>Interfering with Service operation</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. Content Accuracy & Disclaimer</h2>
            <div className="space-y-3">
              <p>
                <strong>Roza News provides news and information for general informational purposes only.</strong> We strive to ensure accuracy but make no guarantees about the completeness, reliability, or accuracy of this information.
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-blue-700 dark:text-blue-300">
                  <strong>Note:</strong> Any action you take upon the information on our website is strictly at your own risk. We are not liable for any losses or damages in connection with the use of our website.
                </p>
              </div>
              <p>
                From our website, you can visit other websites by following hyperlinks to such external sites. While we strive to provide quality links, we have no control over the content and nature of these sites.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
              <div className="bg-yellow-100 dark:bg-yellow-900 p-2 rounded-lg">
                <AlertCircle className="text-yellow-600 dark:text-yellow-400" size={24} />
              </div>
              <span>4. Limitation of Liability</span>
            </h2>
            <div className="space-y-3">
              <p>
                To the maximum extent permitted by applicable law, Roza News Media Group shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Loss of profits, revenue, or data</li>
                <li>Business interruption</li>
                <li>Personal injury or property damage</li>
                <li>Cost of substitute goods or services</li>
              </ul>
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mt-4">
                <p className="font-medium">
                  In no event shall our total liability to you for all claims exceed the amount paid by you, if any, for accessing the Service during the twelve (12) months prior to the claim.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
              <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-lg">
                <Gavel className="text-purple-600 dark:text-purple-400" size={24} />
              </div>
              <span>5. Governing Law & Dispute Resolution</span>
            </h2>
            <div className="space-y-3">
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the jurisdiction where Roza News Media Group is registered, without regard to its conflict of law provisions.
              </p>
              <p>
                <strong>Dispute Resolution:</strong> Any dispute arising from these Terms will first be attempted to be resolved through informal negotiations. If such negotiations fail, the dispute will be resolved through binding arbitration in accordance with the rules of the relevant arbitration association.
              </p>
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 p-4 rounded-lg border border-gray-300 dark:border-gray-600">
                <h4 className="font-bold text-gray-900 dark:text-white mb-2">Jurisdiction</h4>
                <p className="text-sm">
                  You agree to submit to the personal jurisdiction of the courts located within our jurisdiction for the purpose of litigating all such claims or disputes.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. Modifications to Terms</h2>
            <div className="space-y-3">
              <p>
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect.
              </p>
              <p>
                <strong>Continued use</strong> of our Service after any revisions become effective constitutes your acceptance of the new terms. If you do not agree to the new terms, you must stop using the Service.
              </p>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-green-700 dark:text-green-300">
                  <strong>Tip:</strong> We recommend reviewing this page periodically for any changes. Changes to these terms are effective when they are posted on this page.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">7. Termination</h2>
            <div className="space-y-3">
              <p>
                We may terminate or suspend your access to the Service immediately, without prior notice or liability, for any reason, including but not limited to breach of these Terms.
              </p>
              <p>
                Upon termination, your right to use the Service will immediately cease. If you wish to terminate your account, you may simply discontinue using the Service.
              </p>
              <p className="font-medium">
                All provisions of the Terms which by their nature should survive termination shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
              </p>
            </div>
          </section>

          {/* Contact Section */}
          <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-2xl mt-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Questions About Our Terms?</h2>
                <p className="opacity-90">We're here to help clarify any questions you may have about our Terms of Service.</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-full">
                  <Mail size={24} />
                </div>
                <div>
                  <p className="text-sm opacity-80">Contact our legal team</p>
                  <a 
                    href="mailto:rozanewsofficial@gmail.com"
                    className="text-lg font-bold hover:underline transition-all"
                  >
                    rozanewsofficial@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Acceptance Section */}
          <section className="border-t border-gray-200 dark:border-gray-700 pt-8 mt-8">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Acceptance of Terms</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                By accessing or using Roza News, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
              </p>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <p>Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                <p className="mt-2">© {new Date().getFullYear()} Roza News Media Group. All rights reserved.</p>
              </div>
            </div>
          </section>
        </div>

        {/* Navigation Back */}
        <div className="text-center mt-8">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-full transition-colors font-medium"
          >
            ← Back to Previous Page
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
