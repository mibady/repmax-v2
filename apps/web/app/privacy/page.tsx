import Link from 'next/link';

export default function PrivacyPage(): React.JSX.Element {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">
        &larr; Back to RepMax
      </Link>

      <h1 className="text-2xl font-bold text-white mb-2 mt-6">Privacy Policy</h1>
      <p className="text-gray-400 text-sm mb-8">Last updated: February 2026</p>

      <div className="space-y-6 text-gray-300 text-sm leading-relaxed">
        <section>
          <h2 className="text-white text-lg font-semibold mt-8 mb-3">1. Introduction</h2>
          <p>
            RepMax (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is a recruiting intelligence platform
            designed to connect elite football talent with top-tier college programs. This Privacy Policy
            explains how we collect, use, disclose, and safeguard your information when you use our
            platform. By accessing or using RepMax, you agree to the terms of this Privacy Policy.
          </p>
        </section>

        <section>
          <h2 className="text-white text-lg font-semibold mt-8 mb-3">2. Information We Collect</h2>
          <p className="mb-2">We collect information that you provide directly to us, including:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Personal information such as name, email address, phone number, and date of birth</li>
            <li>School and academic information including GPA, class year, and school name</li>
            <li>Athletic measurables such as height, weight, 40-yard dash time, and position</li>
            <li>Highlight videos and film content you upload</li>
            <li>Payment and billing information processed through Stripe</li>
          </ul>
          <p className="mt-3 mb-2">We also automatically collect:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Usage data such as pages visited, features used, and search queries</li>
            <li>Device information including browser type, operating system, and IP address</li>
            <li>Log data and analytics to improve our services</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white text-lg font-semibold mt-8 mb-3">3. How We Use Your Information</h2>
          <p className="mb-2">We use the information we collect to:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Provide, maintain, and improve our recruiting intelligence platform</li>
            <li>Match athletes with college programs based on athletic and academic profiles</li>
            <li>Facilitate NCAA-compliant communication between athletes and coaches</li>
            <li>Process subscriptions, payments, and transactions</li>
            <li>Send service-related notifications and updates</li>
            <li>Analyze usage patterns to improve user experience</li>
            <li>Ensure platform security and prevent fraud</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white text-lg font-semibold mt-8 mb-3">4. Information Sharing</h2>
          <p className="mb-2">We do not sell your personal information. We may share your information with:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Service providers who assist in operating our platform (e.g., hosting, payment processing, analytics)</li>
            <li>College coaches and recruiters, only as part of the platform&apos;s intended functionality and with your consent</li>
            <li>Legal authorities when required by law, subpoena, or legal process</li>
            <li>Third parties in connection with a merger, acquisition, or sale of assets</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white text-lg font-semibold mt-8 mb-3">5. Children&apos;s Privacy</h2>
          <p>
            RepMax is not intended for use by anyone under the age of 13. We do not knowingly collect
            personal information from children under 13. If you are under 13, please do not use our
            platform or provide any information. If we learn that we have collected information from a
            child under 13, we will delete that information promptly.
          </p>
        </section>

        <section>
          <h2 className="text-white text-lg font-semibold mt-8 mb-3">6. Data Security</h2>
          <p>
            We implement industry-standard security measures to protect your information, including
            encryption in transit and at rest, access controls, regular security audits, and secure
            infrastructure hosted on enterprise-grade platforms. However, no method of transmission
            over the Internet is 100% secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 className="text-white text-lg font-semibold mt-8 mb-3">7. Your Rights</h2>
          <p className="mb-2">You have the right to:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Access the personal information we hold about you</li>
            <li>Request correction of inaccurate or incomplete data</li>
            <li>Request deletion of your personal information</li>
            <li>Export your data in a portable format (data portability)</li>
            <li>Opt out of marketing communications</li>
            <li>Withdraw consent where processing is based on consent</li>
          </ul>
          <p className="mt-2">
            To exercise these rights, contact us at support@repmax.com.
          </p>
        </section>

        <section>
          <h2 className="text-white text-lg font-semibold mt-8 mb-3">8. Cookies</h2>
          <p className="mb-2">We use cookies and similar technologies for:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Essential cookies required for authentication and core platform functionality</li>
            <li>Analytics cookies to understand how our platform is used</li>
            <li>Preference cookies to remember your settings and choices</li>
          </ul>
          <p className="mt-2">
            You can manage cookie preferences through your browser settings. Disabling essential
            cookies may affect platform functionality.
          </p>
        </section>

        <section>
          <h2 className="text-white text-lg font-semibold mt-8 mb-3">9. Third-Party Links</h2>
          <p>
            Our platform may contain links to third-party websites, including NCAA resources and
            college program sites. We are not responsible for the privacy practices or content of
            these external sites. We encourage you to review the privacy policies of any third-party
            sites you visit.
          </p>
        </section>

        <section>
          <h2 className="text-white text-lg font-semibold mt-8 mb-3">10. California Privacy Rights</h2>
          <p>
            If you are a California resident, you have additional rights under the California Consumer
            Privacy Act (CCPA), including the right to know what personal information we collect, the
            right to request deletion, and the right to opt out of the sale of personal information.
            As noted above, we do not sell personal information. To submit a CCPA request, contact us
            at support@repmax.com.
          </p>
        </section>

        <section>
          <h2 className="text-white text-lg font-semibold mt-8 mb-3">11. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any material
            changes by posting the updated policy on this page and updating the &quot;Last updated&quot;
            date. Your continued use of RepMax after changes are posted constitutes acceptance of the
            revised policy.
          </p>
        </section>

        <section>
          <h2 className="text-white text-lg font-semibold mt-8 mb-3">12. Contact Us</h2>
          <p>
            If you have questions or concerns about this Privacy Policy, please contact us at{' '}
            <a href="mailto:support@repmax.com" className="text-primary hover:underline">
              support@repmax.com
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
}
