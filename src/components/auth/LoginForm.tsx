import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Mail, Lock, AlertCircle, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { config } from "../../lib/config";

const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";
const GOOGLE_REDIRECT_URI = window.location.origin + "/auth/google/callback";

const APPLE_CLIENT_ID = "com.shoplocal.signin";
const APPLE_REDIRECT_URI = window.location.origin + "/auth/apple/callback";

export function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithSocial } = useAuth();

  const [formData, setFormData] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.username || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      await login(formData.username, formData.password);
      toast.success("Successfully logged in!");
      const from = (location.state as any)?.from || "/create-listing";
      navigate(from, { replace: true });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        toast.error(err.message);
      } else {
        setError("Login failed. Please try again.");
        toast.error("Login failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Quick test login as vendor
  const handleTestVendorLogin = async () => {
    setIsLoading(true);
    setError("");

    try {
      // Use a real WordPress username (you need to create a vendor user in WordPress)
      // This is just a helper button - it still uses real authentication
      const testUsername = "vendortest"; // Change this to an actual vendor username in your WordPress
      const testPassword = "vendortest123"; // Change this to the actual password

      await login(testUsername, testPassword);
      toast.success("Logged in as Test Vendor!");
      navigate("/vendor-dashboard", { replace: true });
    } catch (err) {
      setError(
        "Test login failed. Make sure you have a vendor user created in WordPress with username 'vendortest' and password 'vendortest123'"
      );
      toast.error("Test vendor user not found in WordPress");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-semibold text-gray-900 mb-1">
            Welcome Back
          </h2>
          <p className="text-gray-600 text-sm">Sign in to your account</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Info Box */}
        <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-xl space-y-2">
          <p className="text-sm text-purple-900 font-medium">
            🔧 Troubleshooting Login Issues?
          </p>
          <div className="text-xs text-purple-700 space-y-1.5">
            <p>
              <strong>If you just registered and can't login:</strong>
            </p>
            <p>
              1. Check that user exists in WordPress admin (Users → All Users)
            </p>
            <p>
              2. Try logging in with your <strong>WordPress username</strong> or{" "}
              <strong>email address</strong>
            </p>
            <p>3. Verify your WordPress custom API endpoint is configured</p>
            <p>4. Check browser console (F12) for detailed error logs</p>
          </div>
          <div className="pt-2 border-t border-purple-200">
            <p className="text-xs text-purple-600">
              💡 <strong>Temporary workaround:</strong> Login to WordPress
              admin, then come back here
            </p>
          </div>
        </div>

        {/* Social Login Buttons */}
        <div className="space-y-3 mb-8">
          <button
            type="button"
            onClick={() => {}}
            className="w-full py-3 px-4 bg-white border border-gray-300 hover:border-gray-400 rounded-xl transition flex items-center justify-center gap-3 text-gray-700"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          <button
            type="button"
            onClick={() => {}}
            className="w-full py-3 px-4 bg-black text-white hover:bg-gray-900 rounded-xl transition flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
            Continue with Apple
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="text-sm text-gray-500">or</span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Username or Email
            </label>

            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

              <input
                type="text"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                placeholder="Enter your username or email"
                required
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl
                           focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">Password</label>

            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="Enter your password"
                required
                className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl
                           focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Remember + Forgot */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-sky-600"
              />
              <span className="text-sm text-gray-600">Remember me</span>
            </label>

            <Link
              className="text-sm text-sky-600 hover:text-sky-700"
              to="/forgot-password"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl transition
                       disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Register */}
        <p className="text-center mt-8 text-gray-600">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-sky-600 hover:text-sky-700 font-medium"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
