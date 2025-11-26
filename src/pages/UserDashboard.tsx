import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Shield,
  Calendar,
  Store,
  Package,
  FileText,
  ChevronRight,
} from "lucide-react";

export function UserDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const stats = [
    {
      label: "Claims Submitted",
      value: "2",
      icon: FileText,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Active Stores",
      value: user.role === "vendor" ? "1" : "0",
      icon: Store,
      color: "bg-green-100 text-green-600",
    },
    {
      label: "Products Listed",
      value: user.role === "vendor" ? "5" : "0",
      icon: Package,
      color: "bg-purple-100 text-purple-600",
    },
    {
      label: "Member Since",
      value: "Nov 2024",
      icon: Calendar,
      color: "bg-orange-100 text-orange-600",
    },
  ];

  const quickActions = [
    {
      label: "Browse Vendors",
      description: "Find local businesses to support",
      icon: Store,
      action: () => navigate("/vendors"),
      show: true,
    },
    {
      label: "My Claims",
      description: "View your claim requests",
      icon: FileText,
      action: () => navigate("/my-claims"),
      show: true,
    },
    {
      label: "Vendor Dashboard",
      description: "Manage your stores and products",
      icon: Package,
      action: () => navigate("/vendor-dashboard"),
      show: user.role === "vendor",
    },
    {
      label: "Browse Products",
      description: "Shop from local sellers",
      icon: Package,
      action: () => navigate("/products"),
      show: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl text-gray-900 mb-2">
            Welcome back, {user.displayName}!
          </h1>
          <p className="text-gray-600">Manage your account and activity</p>
        </div>

        {/* User Info Card */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0">
              <User className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl text-gray-900 mb-1">
                {user.displayName}
              </h2>
              <div className="flex items-center gap-2 text-gray-600 mb-3">
                <Mail className="w-4 h-4" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                    user.role === "vendor"
                      ? "bg-green-100 text-green-700"
                      : user.role === "pending_vendor"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  <span className="capitalize">
                    {user.role.replace("_", " ")}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate("/account-settings")}
              className="px-6 py-2 border-2 border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
            >
              Edit Profile
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-2xl shadow-sm p-6">
                <div
                  className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center mb-4`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div className="text-3xl text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickActions
              .filter((action) => action.show)
              .map((action, index) => {
                const Icon = action.icon;
                return (
                  <button
                    key={index}
                    onClick={action.action}
                    className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-all group text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-sky-200 transition-colors">
                          <Icon className="w-6 h-6 text-sky-600" />
                        </div>
                        <div>
                          <h3 className="text-gray-900 mb-1 group-hover:text-sky-600 transition-colors">
                            {action.label}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {action.description}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-sky-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </button>
                );
              })}
          </div>
        </div>

        {/* Role-based Info */}
        {user.role === "customer" && (
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-8">
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Store className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl text-gray-900 mb-2">Become a Vendor</h3>
                <p className="text-gray-700 mb-4">
                  Do you own a local business? Claim your listing to manage your
                  storefront, add products, and reach more customers.
                </p>
                <button
                  onClick={() => navigate("/vendors")}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors inline-flex items-center gap-2"
                >
                  Browse Listings to Claim
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {user.role === "pending_vendor" && (
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl p-8">
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 bg-yellow-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl text-gray-900 mb-2">
                  Claim Under Review
                </h3>
                <p className="text-gray-700 mb-4">
                  Your claim request is being reviewed by our team. We'll notify
                  you within 24-48 hours. Thank you for your patience!
                </p>
                <button
                  onClick={() => navigate("/my-claims")}
                  className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl transition-colors inline-flex items-center gap-2"
                >
                  View Claim Status
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {user.role === "vendor" && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-8">
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Package className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl text-gray-900 mb-2">
                  You're a Vendor!
                </h3>
                <p className="text-gray-700 mb-4">
                  Manage your stores, add products, and track performance from
                  your vendor dashboard.
                </p>
                <button
                  onClick={() => navigate("/vendor-dashboard")}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors inline-flex items-center gap-2"
                >
                  Go to Vendor Dashboard
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserDashboard;
