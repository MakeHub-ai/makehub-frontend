import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-12">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Privacy Policy</h1>
        <p className="text-lg text-gray-600">Last updated: February 28, 2025</p>

        <div className="prose prose-indigo max-w-none">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Introduction</h2>
            <p>
              MakeHub AI ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and disclose your personal information when you use our website, makehub.ai, and its associated subdomains (collectively, our "Service"). By accessing or using our Service, you agree to the collection, storage, use, and disclosure of your personal information as described in this Privacy Policy.
            </p>

            <h3 className="text-xl font-medium text-gray-900 mt-6 mb-3">Identity and Contact Details of the Data Controller</h3>
            <p>
              MakeHub AI is the data controller responsible for processing your personal information. If you have any questions about this Privacy Policy or our data practices, you can contact us at: <a href="mailto:privacy@makehub.ai" className="text-indigo-600 hover:text-indigo-800">privacy@makehub.ai</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. Information We Collect</h2>
            <h3 className="text-xl font-medium text-gray-900 mt-6 mb-3">2.1 Personal Information</h3>
            <p>We collect personal information you provide directly, such as:</p>
            <ul className="list-disc pl-6 mt-2 mb-4">
              <li>Your name and email address when you create an account or subscribe to our Service.</li>
              <li>Payment information when you process transactions.</li>
              <li>Any other information you choose to provide when requesting customer support, communicating with us via third-party social media, or subscribing to our newsletter.</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-900 mt-6 mb-3">2.2 Usage Data</h3>
            <p>We automatically collect information when you use our Service, including:</p>
            <ul className="list-disc pl-6 mt-2 mb-4">
              <li>Device and usage details like your IP address, browser type, device characteristics, operating system, language preferences, referring URLs, device name, country, and location.</li>
              <li>Information about how and when you use our Service, such as timestamps and technical logs.</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-900 mt-6 mb-3">2.3 AI Inference Data</h3>
            <p>When you use our AI routing services, we collect:</p>
            <ul className="list-disc pl-6 mt-2 mb-4">
              <li>API call details, including request timestamps, selected AI models, performance metrics, and error rates.</li>
              <li>We do not store the content of your prompts or responses unless you explicitly consent to this for debugging purposes.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. How We Use Your Information</h2>
            <p>We use your personal information for various business purposes, including to:</p>
            <ul className="list-disc pl-6 mt-2 mb-4">
              <li>Provide, operate, and maintain our Service</li>
              <li>Improve, personalize, and expand our Service</li>
              <li>Understand and analyze how you use our Service</li>
              <li>Develop new products, services, features, and functionality</li>
              <li>Communicate with you for customer service, updates, and marketing purposes</li>
              <li>Process your transactions and manage your account</li>
              <li>Find and prevent fraud</li>
              <li>For compliance, operations, and security reasons</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. Data Security</h2>
            <p>
              We have implemented appropriate technical and organizational security measures designed to protect the security of 
              any personal information we process. However, despite our safeguards and efforts to secure your information, no 
              electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Cookies and Tracking Technologies</h2>
            <p>
              We use cookies and similar tracking technologies to track activity on our Service and store certain information. 
              Cookies are files with a small amount of data which may include an anonymous unique identifier. You can instruct 
              your browser to refuse all cookies or to indicate when a cookie is being sent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. Third-Party Services</h2>
            <p>
              Our Service may contain links to other websites that are not operated by us. If you click on a third-party link, 
              you will be directed to that third party's site. We strongly advise you to review the Privacy Policy of every site 
              you visit. We have no control over and assume no responsibility for the content, privacy policies, or practices of 
              any third-party sites or services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. Your Rights</h2>
            <p>
              Depending on your location, you may have certain rights regarding your personal information, such as:
            </p>
            <ul className="list-disc pl-6 mt-2 mb-4">
              <li>The right to access personal information we hold about you</li>
              <li>The right to request that we correct inaccurate personal information</li>
              <li>The right to request that we delete your personal information</li>
              <li>The right to opt out of marketing communications</li>
              <li>The right to object to our processing of your personal information</li>
              <li>The right to request restriction of processing of your personal information</li>
            </ul>
            <p>
              To exercise any of these rights, please contact us using the contact information provided below.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">8. Updates to This Privacy Policy</h2>
            <p>
              We may update this privacy policy from time to time. The updated version will be indicated by an updated 
              "Last updated" date and the updated version will be effective as soon as it is accessible. We encourage you 
              to review this privacy policy frequently to be informed of how we are protecting your information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">9. Contact Us</h2>
            <p>
              If you have questions or comments about this policy, you may contact us by email at:
            </p>
            <p className="font-semibold mt-2">
              <a href="mailto:privacy@makehub.ai" className="text-indigo-600 hover:text-indigo-800">
                privacy@makehub.ai
              </a>
            </p>
          </section>
        </div>

        <div className="mt-10 border-t border-gray-200 pt-6">
          <Link href="/" className="text-indigo-600 hover:text-indigo-800 font-medium">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
