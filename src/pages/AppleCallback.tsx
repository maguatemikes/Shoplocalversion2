import { useEffect } from "react";
import { Loader2 } from "lucide-react";

/**
 * AppleCallback Component
 * Handles the OAuth callback from Apple Sign In
 */
export function AppleCallback() {
  useEffect(() => {
    // Parse URL parameters (Apple uses form_post mode)
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const id_token = params.get("id_token");
    const error = params.get("error");

    // Also check for POST data in form
    const handleFormPost = () => {
      const form = document.querySelector("form");
      if (form) {
        const formData = new FormData(form);
        const postCode = formData.get("code") as string;
        const postIdToken = formData.get("id_token") as string;
        const postError = formData.get("error") as string;

        return { code: postCode, id_token: postIdToken, error: postError };
      }
      return null;
    };

    const formData = handleFormPost();
    const authCode = code || formData?.code;
    const idToken = id_token || formData?.id_token;
    const authError = error || formData?.error;

    if (window.opener) {
      if (authError) {
        // Send error to parent window
        window.opener.postMessage(
          { type: "APPLE_AUTH_ERROR", error: authError },
          window.location.origin
        );
      } else if (authCode || idToken) {
        // Send success with auth code/token to parent window
        window.opener.postMessage(
          { type: "APPLE_AUTH_SUCCESS", code: authCode, id_token: idToken },
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
          Completing Apple Sign In...
        </h2>
        <p className="text-gray-600 text-sm">
          Please wait while we complete your authentication.
        </p>
      </div>
    </div>
  );
}

export default AppleCallback;
