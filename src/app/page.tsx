import Link from 'next/link';
import { ArrowRightIcon, AcademicCapIcon, CurrencyDollarIcon, ChartBarIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container-responsive py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AcademicCapIcon className="h-8 w-8 text-primary-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Vel Elementary School</h1>
                <p className="text-sm text-gray-600">PTA Management System</p>
              </div>
            </div>
            <Link
              href="/auth/login"
              className="btn-primary"
            >
              Sign In
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container-responsive py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Streamline Your PTA Management
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Efficiently manage PTA contributions, track payments, generate reports, and maintain transparency 
            with our comprehensive school management system.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/login" className="btn-primary btn-lg">
              Get Started
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
            <Link href="#features" className="btn-outline btn-lg">
              Learn More
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div id="features" className="grid-responsive mb-16">
          <div className="card">
            <div className="card-body text-center">
              <CurrencyDollarIcon className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Tracking</h3>
              <p className="text-gray-600">
                Track PTA contributions and other fees with automated status updates for families with multiple children.
              </p>
            </div>
          </div>

          <div className="card">
            <div className="card-body text-center">
              <ChartBarIcon className="h-12 w-12 text-success-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-time Reports</h3>
              <p className="text-gray-600">
                Generate comprehensive reports for principals, teachers, and PTA officers with live data updates.
              </p>
            </div>
          </div>

          <div className="card">
            <div className="card-body text-center">
              <ShieldCheckIcon className="h-12 w-12 text-warning-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure & Transparent</h3>
              <p className="text-gray-600">
                Role-based access control with complete audit trails for transparency and accountability.
              </p>
            </div>
          </div>

          <div className="card">
            <div className="card-body text-center">
              <AcademicCapIcon className="h-12 w-12 text-danger-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Multi-Role Access</h3>
              <p className="text-gray-600">
                Tailored interfaces for administrators, principals, teachers, treasurers, and parents.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Built for Efficiency</h3>
            <p className="text-gray-600">Designed to streamline PTA operations and improve transparency</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">₱250</div>
              <div className="text-sm text-gray-600">PTA Contribution Fee</div>
              <div className="text-xs text-gray-500 mt-1">One-time payment per family</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-success-600 mb-2">100%</div>
              <div className="text-sm text-gray-600">Payment Transparency</div>
              <div className="text-xs text-gray-500 mt-1">Complete audit trails</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-warning-600 mb-2">5</div>
              <div className="text-sm text-gray-600">User Roles</div>
              <div className="text-xs text-gray-500 mt-1">Admin, Principal, Teacher, Treasurer, Parent</div>
            </div>
          </div>
        </div>

        {/* User Roles Section */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">User Roles & Access</h3>
            <p className="text-gray-600">Each role has specific permissions and tailored interfaces</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">👨‍💼 Admin</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Full system access</li>
                <li>• User management</li>
                <li>• System configuration</li>
                <li>• All reports and analytics</li>
              </ul>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">🏫 Principal</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• View all financial reports</li>
                <li>• Access KPI dashboards</li>
                <li>• Monitor school-wide payments</li>
                <li>• Export audit reports</li>
              </ul>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">👩‍🏫 Teachers</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• View class payment status</li>
                <li>• Monitor student compliance</li>
                <li>• Access class reports</li>
                <li>• Track unpaid students</li>
              </ul>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">💰 Treasurer</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Record income/expenses</li>
                <li>• Upload receipts</li>
                <li>• Issue payment confirmations</li>
                <li>• Manage parent records</li>
              </ul>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">👨‍👩‍👧‍👦 Parents</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• View payment history</li>
                <li>• Access receipts</li>
                <li>• Update contact info</li>
                <li>• Check children's status</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="container-responsive py-8">
          <div className="text-center text-gray-600">
            <p className="mb-2">© 2024 Vel Elementary School PTA Management System</p>
            <p className="text-sm">Built with Next.js, TypeScript, and Supabase</p>
          </div>
        </div>
      </footer>
    </div>
  );
}