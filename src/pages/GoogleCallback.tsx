import { useEffect } from "react";
import { Loader2 } from "lucide-react";

/**
 * GoogleCallback Component
 * Handles the OAuth callback from Google Sign In
 */
export function GoogleCallback() {
  useEffect(() => {
    // Parse URL parameters
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const error = params.get("error");

    if (window.opener) {
      if (error) {
        // Send error to parent window
        window.opener.postMessage(
          { type: "GOOGLE_AUTH_ERROR", error },
          window.location.origin
        );
      } else if (code) {
        // Send success with auth code to parent window
        window.opener.postMessage(
          { type: "GOOGLE_AUTH_SUCCESS", code },
          window.location.origin
        );
      }

      // Close popup after sending message
      setTimeout(() => {
        window.close();
      }, 500);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <Loader2 className="w-12 h-12 text-sky-600 animate-spin mx-auto mb-4" />
        <h2 className="text-xl text-gray-900 mb-2">
          Completing Google Sign In...
        </h2>
        <p className="text-gray-600 text-sm">
          Please wait while we complete your authentication.
        </p>
      </div>
    </div>
  );
}

export default GoogleCallback;
