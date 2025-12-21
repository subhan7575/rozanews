import React from 'react';
import { Scale, FileWarning, Copyright, Gavel, AlertCircle } from 'lucide-react';

const TermsOfService: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 animate-fade-in">
       <div className="text-center mb-12">
        <div className="inline-block p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full mb-4">
          <Scale size={40} />
        </div>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 dark:text-white mb-4">Terms of Service</h1>
        <p className="text-gray-500 dark:text-gray-400">Effective Date: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-8 md:p-12 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 space-y-8 text-gray-700 dark:text-gray-300 leading-relaxed">
        
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Acceptance of Terms</h2>
          <p className="mb-4">
            By accessing or using the <strong>Roza News</strong> website (the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of the terms, then you may not access the Service.
          </p>
          <p>
            These Terms apply to all visitors, users, and others who access or use the Service. Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <Copyright className="mr-2 text-primary" size={24} /> 2. Intellectual Property
          </h2>
          <p className="mb-4">
            The Service and its original content (excluding Content provided by users), features, and functionality are and will remain the exclusive property of Roza News Media Group and its licensors. The Service is protected by copyright, trademark, and other laws of both the domestic and foreign countries.
          </p>
          <p>
            You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any of the material on our Website, except as follows:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>Your computer may temporarily store copies of such materials in RAM incidental to your accessing and viewing those materials.</li>
            <li>You may store files that are automatically cached by your Web browser for display enhancement purposes.</li>
            <li>You may print or download one copy of a reasonable number of pages of the Website for your own personal, non-commercial use and not for further reproduction, publication, or distribution.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <FileWarning className="mr-2 text-primary" size={24} /> 3. User Conduct
          </h2>
          <p className="mb-4">
            You agree not to use the Service:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>In any way that violates any applicable federal, state, local, or international law or regulation.</li>
            <li>To exploit, harm, or attempt to exploit or harm minors in any way by exposing them to inappropriate content, asking for personally identifiable information, or otherwise.</li>
            <li>To transmit, or procure the sending of, any advertising or promotional material, including any "junk mail", "chain letter," "spam," or any other similar solicitation.</li>
            <li>To impersonate or attempt to impersonate the Company, a Company employee, another user, or any other person or entity.</li>
            <li>To engage in any other conduct that restricts or inhibits anyone's use or enjoyment of the Service, or which, as determined by us, may harm the Company or users of the Service or expose them to liability.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Accuracy of Information</h2>
          <p className="mb-4">
            The news, information, and other content on Roza News are for general informational purposes only. While we strive to provide accurate and up-to-date information, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability with respect to the website or the information, products, services, or related graphics contained on the website for any purpose.
          </p>
          <p>
            Any reliance you place on such information is therefore strictly at your own risk. We reserve the right to correct any errors, inaccuracies, or omissions and to change or update information at any time without prior notice.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Advertisements and Third-Party Links</h2>
          <p className="mb-4">
            Roza News may contain links to third-party web sites or services that are not owned or controlled by Roza News. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party web sites or services.
          </p>
          <p>
            Our website displays advertisements from third-party networks (e.g., Google AdSense). We do not endorse the products or services advertised in these ads. Your dealings with advertisers found on or through the Service are solely between you and such advertiser.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <AlertCircle className="mr-2 text-primary" size={24} /> 6. Limitation of Liability
          </h2>
          <p className="mb-4">
            In no event shall Roza News, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Your access to or use of or inability to access or use the Service;</li>
            <li>Any conduct or content of any third party on the Service;</li>
            <li>Any content obtained from the Service; and</li>
            <li>Unauthorized access, use or alteration of your transmissions or content.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <Gavel className="mr-2 text-primary" size={24} /> 7. Governing Law
          </h2>
          <p className="mb-4">
            These Terms shall be governed and construed in accordance with the laws of the jurisdiction in which Roza News operates, without regard to its conflict of law provisions.
          </p>
          <p>
            Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect. These Terms constitute the entire agreement between us regarding our Service, and supersede and replace any prior agreements we might have between us regarding the Service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">8. Termination</h2>
          <p>
            We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
          </p>
          <p>
            All provisions of the Terms which by their nature should survive termination shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity and limitations of liability.
          </p>
        </section>

        <section className="border-t border-gray-200 dark:border-gray-700 pt-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Contact Information</h2>
          <p className="mb-2">If you have any questions about these Terms, please contact us:</p>
          <p className="font-mono text-gray-600 dark:text-gray-400">rozanewsofficial@gmail.com</p>
        </section>
      </div>
    </div>
  );
};

export default TermsOfService;