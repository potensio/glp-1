import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-gray-600">Last updated: January 2025</p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
            
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700 leading-relaxed">
                Welcome to My Daily Health Journal (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting your privacy and ensuring the security of your personal health information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our health tracking application and related services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">2.1 Health Information</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We collect health-related information that you voluntarily provide, including:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Weight measurements and tracking data</li>
                <li>Blood pressure readings</li>
                <li>Blood sugar levels</li>
                <li>Medication information and dosages</li>
                <li>GLP-1 treatment progress and side effects</li>
                <li>Food intake and dietary information</li>
                <li>Physical activity and exercise data</li>
                <li>Health journal entries and notes</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3">2.2 Account Information</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                When you create an account, we collect:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Email address</li>
                <li>Name and profile information</li>
                <li>Account preferences and settings</li>
                <li>Authentication credentials</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3">2.3 Technical Information</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We automatically collect certain technical information:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Device information and operating system</li>
                <li>Browser type and version</li>
                <li>IP address and location data</li>
                <li>Usage patterns and app interactions</li>
                <li>Error logs and performance data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use your information for the following purposes:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Providing and maintaining our health tracking services</li>
                <li>Generating personalized health insights and trends</li>
                <li>Sending medication reminders and health notifications</li>
                <li>Improving our application features and user experience</li>
                <li>Providing customer support and technical assistance</li>
                <li>Ensuring security and preventing fraud</li>
                <li>Complying with legal obligations and healthcare regulations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Information Sharing and Disclosure</h2>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">4.1 Healthcare Providers</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                With your explicit consent, we may share your health information with your healthcare providers to support your treatment and care coordination.
              </p>

              <h3 className="text-xl font-medium text-gray-800 mb-3">4.2 Service Providers</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may share information with trusted third-party service providers who assist us in operating our application, including:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Cloud hosting and data storage providers</li>
                <li>Analytics and performance monitoring services</li>
                <li>Customer support platforms</li>
                <li>Payment processing services</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3">4.3 Legal Requirements</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may disclose your information when required by law, court order, or government regulation, or to protect our rights, property, or safety.
              </p>

              <h3 className="text-xl font-medium text-gray-800 mb-3">4.4 Business Transfers</h3>
              <p className="text-gray-700 leading-relaxed">
                In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of the business transaction, subject to the same privacy protections.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Security</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We implement comprehensive security measures to protect your health information:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>End-to-end encryption for data transmission</li>
                <li>Secure data storage with industry-standard encryption</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Access controls and authentication protocols</li>
                <li>Employee training on data privacy and security</li>
                <li>Compliance with HIPAA and other healthcare data protection standards</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Your Rights and Choices</h2>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">6.1 Access and Control</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Access and review your personal health information</li>
                <li>Update or correct inaccurate information</li>
                <li>Delete your account and associated data</li>
                <li>Export your health data in a portable format</li>
                <li>Opt-out of certain data processing activities</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3">6.2 Communication Preferences</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                You can control how we communicate with you:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Manage email notification preferences</li>
                <li>Opt-out of marketing communications</li>
                <li>Control push notification settings</li>
                <li>Set medication reminder preferences</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Data Retention</h2>
              <p className="text-gray-700 leading-relaxed">
                We retain your health information for as long as necessary to provide our services and comply with legal obligations. You may request deletion of your data at any time, subject to certain legal and regulatory requirements. Deleted data is permanently removed from our systems within 30 days of your request.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. International Data Transfers</h2>
              <p className="text-gray-700 leading-relaxed">
                Your information may be processed and stored in countries other than your own. We ensure that all international data transfers comply with applicable data protection laws and implement appropriate safeguards to protect your information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Children&apos;s Privacy</h2>
              <p className="text-gray-700 leading-relaxed">
                Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that we have collected such information, we will take steps to delete it promptly.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Third-Party Integrations</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Our application may integrate with third-party services such as:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Google Calendar for appointment scheduling</li>
                <li>Health monitoring devices and wearables</li>
                <li>Electronic health record systems</li>
                <li>Pharmacy and medication management platforms</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                These integrations are subject to their own privacy policies, and we encourage you to review them before connecting your accounts.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to This Privacy Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of any material changes by email or through our application. Your continued use of our services after such changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 mb-2"><strong>Email:</strong> privacy@mydailyhealthjournal.com</p>
                <p className="text-gray-700 mb-2"><strong>Address:</strong> My Daily Health Journal Privacy Office</p>
                <p className="text-gray-700"><strong>Response Time:</strong> We will respond to your inquiry within 30 days</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Compliance and Certifications</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Our privacy practices comply with:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Health Insurance Portability and Accountability Act (HIPAA)</li>
                <li>General Data Protection Regulation (GDPR)</li>
                <li>California Consumer Privacy Act (CCPA)</li>
                <li>SOC 2 Type II security standards</li>
                <li>ISO 27001 information security management</li>
              </ul>
            </section>

          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <Link 
            href="/" 
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}