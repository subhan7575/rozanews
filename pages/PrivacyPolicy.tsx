import React from 'react';
import { Shield, Lock, Eye, Server, Globe, FileText } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 animate-fade-in">
      <div className="text-center mb-12">
        <div className="inline-block p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full mb-4">
          <Shield size={40} />
        </div>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 dark:text-white mb-4">Privacy Policy</h1>
        <p className="text-gray-500 dark:text-gray-400">Last Updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-8 md:p-12 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 space-y-8 text-gray-700 dark:text-gray-300 leading-relaxed">
        
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <Globe className="mr-2 text-primary" size={24} /> 1. Introduction
          </h2>
          <p className="mb-4">
            Welcome to <strong>Roza News</strong> ("we," "our," or "us"). We are committed to protecting your privacy and ensuring you have a positive experience on our website and in using our services. This Privacy Policy sets forth our policy with respect to information that is collected from visitors to the website and users of the services.
          </p>
          <p>
            By accessing or using Roza News, you agree to the terms of this Privacy Policy. If you do not agree with the practices described in this policy, please do not use our website. We serve a global audience, and as such, we strive to comply with major data protection regulations including GDPR, CCPA, and international standards.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <FileText className="mr-2 text-primary" size={24} /> 2. Information We Collect
          </h2>
          <p className="mb-4">
            We collect information that identifies, relates to, describes, references, is capable of being associated with, or could reasonably be linked, directly or indirectly, with a particular consumer or device ("personal information"). In particular, we have collected the following categories of personal information from consumers within the last twelve (12) months:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li><strong>Personal Identifiers:</strong> Name, email address, and IP address when you voluntarily provide them via our Contact forms or Newsletter subscriptions.</li>
            <li><strong>Internet Activity:</strong> Browsing history, search history, and information regarding a consumer's interaction with an Internet Web site, application, or advertisement.</li>
            <li><strong>Geolocation Data:</strong> Physical location or movements (e.g., city level data for Weather services).</li>
            <li><strong>Technical Data:</strong> Browser type, operating system, device information, and screen resolution.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <Eye className="mr-2 text-primary" size={24} /> 3. Cookies and Tracking Technologies
          </h2>
          <p className="mb-4">
            Roza News uses "cookies" and similar tracking technologies to track the activity on our Service and hold certain information. Cookies are files with small amount of data which may include an anonymous unique identifier.
          </p>
          <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">Types of Cookies We Use:</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Session Cookies:</strong> We use Session Cookies to operate our Service. These are temporary and disappear after you close your browser.</li>
            <li><strong>Preference Cookies:</strong> We use Preference Cookies to remember your preferences and various settings, such as Dark Mode or Light Mode configurations.</li>
            <li><strong>Security Cookies:</strong> We use Security Cookies for security purposes to identify trusted web traffic.</li>
            <li><strong>Advertising Cookies:</strong> Cookies used to serve you with advertisements that may be relevant to you and your interests.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <Server className="mr-2 text-primary" size={24} /> 4. How We Use Your Information
          </h2>
          <p className="mb-4">
            We use the collected data for various purposes:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>To provide and maintain our Service, including monitoring the usage of our Service.</li>
            <li>To manage your account (if applicable) and registration as a user of the Service.</li>
            <li>To contact you: To contact you by email, telephone calls, SMS, or other equivalent forms of electronic communication regarding updates or informative communications related to the functionalities.</li>
            <li>To provide you with news, special offers, and general information about other goods, services, and events which we offer.</li>
            <li>To manage your requests: To attend and manage your requests to us.</li>
            <li>For business transfers: We may use your information to evaluate or conduct a merger, divestiture, restructuring, reorganization, dissolution, or other sale or transfer of some or all of our assets.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <Lock className="mr-2 text-primary" size={24} /> 5. Data Security
          </h2>
          <p className="mb-4">
            The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
          </p>
          <p>
            We implement a variety of security measures to maintain the safety of your personal information when you enter, submit, or access your personal information. We offer the use of a secure server. All supplied sensitive/credit information is transmitted via Secure Socket Layer (SSL) technology and then encrypted into our Payment gateway providers database only to be accessible by those authorized with special access rights to such systems, and are required to keep the information confidential.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. Third-Party Service Providers</h2>
          <p className="mb-4">
            We may employ third-party companies and individuals to facilitate our Service ("Service Providers"), to provide the Service on our behalf, to perform Service-related services, or to assist us in analyzing how our Service is used.
          </p>
          <p className="mb-2"><strong>Advertising Partners:</strong></p>
          <p className="mb-4">
            We work with third-party advertising companies (such as Google AdSense) to serve ads when you visit our website. These companies may use information (not including your name, address, email address, or telephone number) about your visits to this and other websites in order to provide advertisements about goods and services of interest to you.
          </p>
          <p className="mb-2"><strong>Analytics:</strong></p>
          <p>
            We may use third-party Service Providers to monitor and analyze the use of our Service, such as Google Analytics, to help us understand visitor trends and effectiveness of our content.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">7. Children's Privacy</h2>
          <p>
            Our Service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information from anyone under the age of 13. If You are a parent or guardian and You are aware that Your child has provided Us with Personal Data, please contact Us. If We become aware that We have collected Personal Data from anyone under the age of 13 without verification of parental consent, We take steps to remove that information from Our servers.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">8. Changes to This Privacy Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. We will let you know via email and/or a prominent notice on our Service, prior to the change becoming effective and update the "Last Updated" date at the top of this Privacy Policy.
          </p>
          <p className="mt-4">
            You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
          </p>
        </section>

        <section className="border-t border-gray-200 dark:border-gray-700 pt-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Contact Us</h2>
          <p className="mb-2">If you have any questions about this Privacy Policy, please contact us:</p>
          <ul className="list-disc pl-6">
            <li>By visiting the Contact page on our website: <a href="#/contact" className="text-primary hover:underline">Roza News Contact</a></li>
            <li>By email: <span className="font-mono text-gray-600 dark:text-gray-400">jobsofficial786.com</span></li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;