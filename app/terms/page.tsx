import Link from 'next/link';

export default function TermsOfServicePage() {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-12">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Terms of Service</h1>
        <p className="text-lg text-gray-600">Last updated: February 28, 2025</p>

        <div className="prose prose-indigo max-w-none">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Acceptance of Terms</h2>
            <p>
              Welcome to MakeHub AI ("we," "our," or "us"). These Terms of Service ("Terms") govern your access to and use of our website, 
              makehub.ai, its subdomains, and our AI inference routing services (collectively, the "Service"). By accessing or using the 
              Service, you agree to be bound by these Terms and our <Link href="/policy" className="text-indigo-600 hover:text-indigo-800">Privacy Policy</Link>. 
              If you don't agree, please don't use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. Description of Service</h2>
            <p>
              MakeHub AI provides a platform for intelligent routing of AI inference requests across multiple third-party AI providers 
              (e.g., DeepSeek, Anthropic, Meta). We aim to deliver faster, cheaper, and reliable AI solutions with zero configuration 
              required. Features include real-time optimization, smart load balancing, and automatic failover. We don't guarantee specific 
              outcomes from AI models, as performance depends on third-party providers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. Eligibility</h2>
            <p>
              You must be at least 18 years old and capable of entering into a binding contract to use the Service. By using the Service, 
              you represent that you meet these requirements. We don't knowingly allow use by individuals under 18.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. Account Registration</h2>
            <ul className="list-disc pl-6 mt-2 mb-4 space-y-2">
              <li>
                <span className="font-semibold">Account Creation:</span> To access certain features, you must create an account with a valid 
                email address and password. You're responsible for keeping your login details secure and notifying us at privacy@makehub.ai 
                if you suspect unauthorized access.
              </li>
              <li>
                <span className="font-semibold">Accuracy:</span> Provide accurate and current information when registering. You're liable 
                for any issues arising from false data.
              </li>
              <li>
                <span className="font-semibold">Termination:</span> We can suspend or terminate your account if you violate these Terms, 
                with or without notice.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Use of the Service</h2>
            <p>
              <span className="font-semibold">Permitted Use:</span> You may use the Service for lawful purposes only, consistent with its 
              intended functionality (e.g., AI inference routing for personal or business projects).
            </p>    
            <p className="mt-4">
              <span className="font-semibold">Prohibited Actions:</span> You agree not to:
            </p>
            <ul className="list-disc pl-6 mt-2 mb-4 space-y-2">
              <li>Reverse-engineer, decompile, or hack the Service.</li>
              <li>Overload or disrupt the Service (e.g., DDoS attacks, excessive API calls beyond your plan).</li>
              <li>Use the Service to generate illegal, harmful, or infringing content.</li>
              <li>Resell or sublicense the Service without our written consent.</li>
            </ul>
            <p>
              <span className="font-semibold">Compliance:</span> You're responsible for ensuring your use complies with all applicable laws 
              and third-party AI provider terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. Payments and Subscriptions</h2>
            <ul className="list-disc pl-6 mt-2 mb-4 space-y-2">
              <li>
                <span className="font-semibold">Fees:</span> Some features require payment. Pricing is listed on our website and subject to 
                change with notice.
              </li>
              <li>
                <span className="font-semibold">Billing:</span> You authorize us to charge your provided payment method for applicable fees. 
                All payments are non-refundable unless stated otherwise.
              </li>
              <li>
                <span className="font-semibold">Cancellation:</span> You can cancel your subscription anytime via your account dashboard; no 
                refunds for partial periods unless required by law.
              </li>
              <li>
                <span className="font-semibold">Taxes:</span> Fees exclude taxes—you're responsible for any applicable sales tax, VAT, etc.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. Intellectual Property</h2>
            <ul className="list-disc pl-6 mt-2 mb-4 space-y-2">
              <li>
                <span className="font-semibold">Our Rights:</span> We own all rights to the Service, including its software, design, and 
                trademarks. You get a non-exclusive, revocable license to use it under these Terms.
              </li>
              <li>
                <span className="font-semibold">Your Content:</span> You retain ownership of inputs you send via the Service and outputs 
                generated by AI providers. We claim no rights to them but may use anonymized data for analytics.
              </li>
              <li>
                <span className="font-semibold">Feedback:</span> If you provide suggestions or feedback, we can use them freely without 
                compensation.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">8. Third-Party Providers</h2>
            <ul className="list-disc pl-6 mt-2 mb-4 space-y-2">
              <li>
                <span className="font-semibold">Dependency:</span> The Service relies on third-party AI providers. We're not liable for 
                their performance, downtime, or content accuracy.
              </li>
              <li>
                <span className="font-semibold">Terms:</span> Your use of their models may be subject to their own terms. Check those 
                directly—we're just the router.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">9. Disclaimers</h2>
            <ul className="list-disc pl-6 mt-2 mb-4 space-y-2">
              <li>
                <span className="font-semibold">As-Is:</span> The Service is provided "as is" and "as available." We don't guarantee 
                uninterrupted access, error-free operation, or specific AI results.
              </li>
              <li>
                <span className="font-semibold">No Warranties:</span> We disclaim all warranties, express or implied, to the fullest extent 
                allowed by law.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">10. Limitation of Liability</h2>
            <ul className="list-disc pl-6 mt-2 mb-4 space-y-2">
              <li>
                To the maximum extent permitted by law, we're not liable for any indirect, incidental, special, 
                consequential, or punitive damages arising from your use of the Service.
              </li>
              <li>
                <span className="font-semibold">Cap:</span> Our total liability for any claim is limited to the amount 
                you paid us in the 12 months before the claim arose.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">11. Changes to Terms</h2>
            <p>
              We may modify these Terms at any time. We'll notify you of material changes via email or Service notification. 
              Continued use after changes means you accept the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">12. Governing Law</h2>
            <p>
              These Terms are governed by French law. Any disputes will be resolved in the courts of Paris, France, 
              and you consent to their jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">13. Contact</h2>
            <p>
              Questions about these Terms? Contact us at legal@makehub.ai or:
            </p>
            <p className="mt-2">
              MakeHub AI<br />
              123 Tech Street<br />
              75001 Paris, France
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}