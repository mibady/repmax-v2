import Link from 'next/link';

export default function TermsPage(): React.JSX.Element {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">
        &larr; Back to RepMax
      </Link>

      <h1 className="text-2xl font-bold text-white mb-2 mt-6">Terms of Service</h1>
      <p className="text-gray-400 text-sm mb-8">Last updated: February 2026</p>

      <div className="space-y-6 text-gray-300 text-sm leading-relaxed">
        <section>
          <h2 className="text-white text-lg font-semibold mt-8 mb-3">1. Acceptance of Terms</h2>
          <p>
            By accessing or using RepMax (&quot;the Platform&quot;), you agree to be bound by these
            Terms of Service. If you do not agree to these terms, you may not use the Platform. We
            reserve the right to update these terms at any time, and your continued use constitutes
            acceptance of any changes.
          </p>
        </section>

        <section>
          <h2 className="text-white text-lg font-semibold mt-8 mb-3">2. Eligibility</h2>
          <p>
            You must be at least 13 years old to use RepMax. If you are between 13 and 18, you must
            have parental or guardian consent to use the Platform. By using RepMax, you represent that
            you meet these eligibility requirements.
          </p>
        </section>

        <section>
          <h2 className="text-white text-lg font-semibold mt-8 mb-3">3. Account Registration</h2>
          <p>
            You must provide accurate and complete information when creating an account. You are
            responsible for maintaining the confidentiality of your account credentials and for all
            activities that occur under your account. You agree to notify us immediately of any
            unauthorized use of your account.
          </p>
        </section>

        <section>
          <h2 className="text-white text-lg font-semibold mt-8 mb-3">4. Acceptable Use</h2>
          <p className="mb-2">You agree not to:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Provide false, misleading, or fraudulent information</li>
            <li>Use the Platform to harass, abuse, or harm others</li>
            <li>Scrape, crawl, or use automated tools to access the Platform without permission</li>
            <li>Attempt to gain unauthorized access to other accounts or systems</li>
            <li>Use the Platform for any unlawful purpose</li>
            <li>Interfere with or disrupt the Platform&apos;s infrastructure</li>
            <li>Violate any applicable NCAA rules or regulations through use of the Platform</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white text-lg font-semibold mt-8 mb-3">5. Intellectual Property</h2>
          <p>
            The Platform, including its design, code, features, and content created by RepMax, is
            owned by RepMax and protected by intellectual property laws. You may not copy, modify,
            distribute, or create derivative works based on the Platform without our written consent.
          </p>
        </section>

        <section>
          <h2 className="text-white text-lg font-semibold mt-8 mb-3">6. User Content License</h2>
          <p>
            By uploading content to RepMax (including highlight videos, profile information, and
            measurables), you grant us a non-exclusive, worldwide, royalty-free license to use,
            display, and distribute that content solely for the purpose of operating and improving the
            Platform. You retain ownership of your content and may delete it at any time.
          </p>
        </section>

        <section>
          <h2 className="text-white text-lg font-semibold mt-8 mb-3">7. Subscriptions and Payments</h2>
          <p>
            Paid subscriptions are billed through Stripe. By subscribing, you authorize us to charge
            your payment method on a recurring basis. You may cancel your subscription at any time
            through your account settings. Cancellation takes effect at the end of the current billing
            period. Refunds are handled on a case-by-case basis and are not guaranteed.
          </p>
        </section>

        <section>
          <h2 className="text-white text-lg font-semibold mt-8 mb-3">8. NCAA Compliance</h2>
          <p>
            RepMax is designed to assist with the recruiting process in compliance with NCAA rules.
            However, the Platform does not guarantee NCAA compliance. Users are solely responsible for
            ensuring their use of the Platform complies with all applicable NCAA rules, regulations,
            and bylaws. RepMax is not affiliated with or endorsed by the NCAA.
          </p>
        </section>

        <section>
          <h2 className="text-white text-lg font-semibold mt-8 mb-3">9. Code of Conduct</h2>
          <p className="mb-2">All users must:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Communicate respectfully with all platform users</li>
            <li>Provide truthful and accurate profile information</li>
            <li>Respect the privacy and confidentiality of other users</li>
            <li>Report any suspicious or inappropriate behavior</li>
          </ul>
          <p className="mt-2">
            Violations may result in account suspension or termination at our sole discretion.
          </p>
        </section>

        <section>
          <h2 className="text-white text-lg font-semibold mt-8 mb-3">10. Disclaimers</h2>
          <p>
            THE PLATFORM IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES
            OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF
            MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT
            WARRANT THAT THE PLATFORM WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE.
          </p>
        </section>

        <section>
          <h2 className="text-white text-lg font-semibold mt-8 mb-3">11. Limitation of Liability</h2>
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, REPMAX SHALL NOT BE LIABLE FOR ANY INDIRECT,
            INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR RELATED TO YOUR
            USE OF THE PLATFORM, INCLUDING BUT NOT LIMITED TO LOSS OF REVENUE, DATA, OR RECRUITING
            OPPORTUNITIES, REGARDLESS OF THE THEORY OF LIABILITY.
          </p>
        </section>

        <section>
          <h2 className="text-white text-lg font-semibold mt-8 mb-3">12. Indemnification</h2>
          <p>
            You agree to indemnify, defend, and hold harmless RepMax and its officers, directors,
            employees, and agents from any claims, damages, losses, or expenses (including reasonable
            attorneys&apos; fees) arising from your use of the Platform, violation of these Terms, or
            infringement of any third-party rights.
          </p>
        </section>

        <section>
          <h2 className="text-white text-lg font-semibold mt-8 mb-3">13. Dispute Resolution</h2>
          <p>
            Any dispute arising out of or relating to these Terms or the Platform shall be resolved
            through binding arbitration administered in accordance with the rules of the American
            Arbitration Association. The arbitration shall be conducted in the State of Delaware.
            Judgment on the award may be entered in any court of competent jurisdiction.
          </p>
        </section>

        <section>
          <h2 className="text-white text-lg font-semibold mt-8 mb-3">14. Class Action Waiver</h2>
          <p>
            YOU AGREE THAT ANY DISPUTE RESOLUTION PROCEEDINGS WILL BE CONDUCTED ONLY ON AN INDIVIDUAL
            BASIS AND NOT IN A CLASS, CONSOLIDATED, OR REPRESENTATIVE ACTION. You waive any right to
            participate in a class action lawsuit or class-wide arbitration against RepMax.
          </p>
        </section>

        <section>
          <h2 className="text-white text-lg font-semibold mt-8 mb-3">15. Termination</h2>
          <p>
            We may suspend or terminate your account at any time, with or without cause, and with or
            without notice. Upon termination, your right to use the Platform ceases immediately. You
            may also delete your account at any time through your account settings.
          </p>
        </section>

        <section>
          <h2 className="text-white text-lg font-semibold mt-8 mb-3">16. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the State of
            Delaware, without regard to its conflict of law provisions.
          </p>
        </section>

        <section>
          <h2 className="text-white text-lg font-semibold mt-8 mb-3">17. Severability</h2>
          <p>
            If any provision of these Terms is found to be unenforceable or invalid, that provision
            shall be limited or eliminated to the minimum extent necessary, and the remaining
            provisions shall remain in full force and effect.
          </p>
        </section>

        <section>
          <h2 className="text-white text-lg font-semibold mt-8 mb-3">18. Contact</h2>
          <p>
            If you have questions about these Terms of Service, please contact us at{' '}
            <a href="mailto:support@repmax.io" className="text-primary hover:underline">
              support@repmax.io
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
}
