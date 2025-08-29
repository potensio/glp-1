import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* Beta Badge */}
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-8">
          🚀 Open Beta - Join Early Access
        </div>
        
        {/* Main Heading */}
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Your Daily Health
          <span className="text-blue-600"> Journal</span>
        </h1>
        
        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
          Track weight, blood pressure, medications, and more — designed for GLP‑1 users, diabetics, and anyone committed to better health.
        </p>
        
        {/* Key Benefits */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-sm">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Tracking</h3>
            <p className="text-gray-600">Monitor weight, blood pressure, blood sugar, and medications in one place</p>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-sm">
            <div className="text-3xl mb-4">💊</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">GLP-1 Focused</h3>
            <p className="text-gray-600">Specially designed for GLP-1 users with tailored insights and tracking</p>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-sm">
            <div className="text-3xl mb-4">📈</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Progress Insights</h3>
            <p className="text-gray-600">Visualize your health journey with beautiful charts and trends</p>
          </div>
        </div>
        
        {/* CTA Button */}
        <Link 
          href="/home" 
          className="inline-flex items-center px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
        >
          Start Your Journal
          <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
        
        {/* Beta Notice */}
        <p className="text-sm text-gray-500 mt-8">
          Currently in open beta • Free to use • Your feedback shapes the future
        </p>
        
        {/* Footer Links */}
        <div className="flex items-center justify-center gap-4 mt-6 text-xs text-gray-400">
          <Link href="/privacy" className="hover:text-gray-600 transition-colors">
            Privacy Policy
          </Link>
          <span>•</span>
          <Link href="/terms" className="hover:text-gray-600 transition-colors">
            Terms of Service
          </Link>
        </div>
      </div>
    </div>
  );
}
