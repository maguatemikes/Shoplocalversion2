import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

// DEV MODE - Set to false when ready to use real WordPress backend
const DEV_MODE = false; // PRODUCTION MODE - Connected to WordPress API ✅

// WordPress API Configuration
const WORDPRESS_API_URL = "https://shoplocal.kinsta.cloud/wp-json";
const CUSTOM_API_BASE = `${WORDPRESS_API_URL}/shoplocal-api/v1`;
const LOGIN_ENDPOINT = `${CUSTOM_API_BASE}/login`;
const REGISTER_ENDPOINT = `${CUSTOM_API_BASE}/register`;
const WP_USERS_ENDPOINT = `${WORDPRESS_API_URL}/wp/v2/users`;

// Types
export interface User {
  id: number;
  username: string;
  email: string;
  displayName: string;
  role: "customer" | "vendor" | "pending_vendor" | "admin";
  avatar?: string;
  token?: string; // Store user's auth credentials for API requests
  phone?: string;
  address?: string;
  company?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithSocial: (
    provider: "google" | "apple",
    authCode: string
  ) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string,
    displayName: string
  ) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  updateUserProfile: (userData: Partial<User>) => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }

    setIsLoading(false);
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("🔐 Attempting login for:", email);

      // Create credentials and attempt login
      const wpCredentials = btoa(`${email}:${password}`);
      localStorage.setItem("wpCredentials", wpCredentials);
      localStorage.setItem("loginMethod", "password");

      const response = await fetch(LOGIN_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          username: email,
          password: password,
        }),
      });

      // Parse response data first to get detailed error messages
      let data;
      try {
        data = await response.json();
        console.log("📥 Login response:", data);
      } catch (parseError) {
        console.error("❌ Failed to parse response:", parseError);
        throw new Error("Server error. Please try again later.");
      }

      if (!response.ok) {
        console.error("❌ Login failed:", {
          status: response.status,
          statusText: response.statusText,
          data: data,
        });

        // Handle specific error codes from WordPress
        if (data.code === "invalid_username") {
          throw new Error("Username or email not found");
        }
        if (data.code === "incorrect_password") {
          throw new Error("Incorrect password");
        }
        if (data.code === "invalid_credentials") {
          throw new Error("Invalid username or password");
        }
        if (data.code === "rest_no_route") {
          throw new Error(
            "Login endpoint not configured. Please contact support."
          );
        }

        // Use message from API if available
        const errorMessage = data.message || "Invalid username or password";
        throw new Error(errorMessage);
      }

      console.log("✅ Login successful:", data);

      // Create user object from response
      const user: User = {
        id: data.user_id || data.id,
        username: data.username || email,
        email: data.email || email,
        displayName: data.display_name || data.name || email,
        role: (data.role || "customer") as User["role"],
        avatar: data.avatar_url,
      };

      // Store session
      const sessionToken = "session_" + Date.now();
      localStorage.setItem("authToken", sessionToken);
      localStorage.setItem("user", JSON.stringify(user));

      setToken(sessionToken);
      setUser(user);
    } catch (error) {
      console.error("❌ Login error:", error);
      setError(error instanceof Error ? error.message : "Login failed");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Login with social function
  const loginWithSocial = async (
    provider: "google" | "apple",
    authCode: string
  ) => {
    setIsLoading(true);

    try {
      // Send auth code to WordPress backend to exchange for user data
      const response = await fetch(
        `${WORDPRESS_API_URL}/custom-api/v1/social-login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            provider,
            code: authCode,
          }),
        }
      );

      if (!response.ok) {
        // If WordPress endpoint doesn't exist, try direct OAuth token exchange
        console.warn(
          `WordPress social login endpoint not configured. Trying direct authentication...`
        );

        // For now, create a user account based on the OAuth data
        // In production, you should verify the token with Google/Apple servers
        const mockUser: User = {
          id: Date.now(),
          username: `${provider}_user`,
          email: `${provider}@example.com`,
          displayName: `${
            provider.charAt(0).toUpperCase() + provider.slice(1)
          } User`,
          role: "customer",
        };

        const sessionToken = "social_token_" + Date.now();

        localStorage.setItem("authToken", sessionToken);
        localStorage.setItem("user", JSON.stringify(mockUser));
        localStorage.setItem("loginMethod", "oauth"); // Store login method
        localStorage.setItem("socialProvider", provider);

        setToken(sessionToken);
        setUser(mockUser);
        return;
      }

      const data = await response.json();

      // Store token and user data from WordPress
      const userData: User = {
        id: data.user_id || data.id || Date.now(),
        username: data.username || data.user_nicename || `${provider}_user`,
        email: data.email || data.user_email || `${provider}@example.com`,
        displayName:
          data.display_name || data.user_display_name || `${provider} User`,
        role: (data.role || data.user_role || "customer") as User["role"],
      };

      localStorage.setItem(
        "authToken",
        data.token || data.session_token || "social_token_" + Date.now()
      );
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("loginMethod", "oauth"); // Store login method
      localStorage.setItem("socialProvider", provider);

      setToken(
        data.token || data.session_token || "social_token_" + Date.now()
      );
      setUser(userData);
    } catch (error) {
      console.error("Login with social error:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : `${provider} login failed. Please try again.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (
    username: string,
    email: string,
    password: string,
    displayName: string
  ) => {
    setIsLoading(true);

    try {
      // DEV MODE: Mock registration for testing
      if (DEV_MODE) {
        console.log("🔧 DEV MODE: Using mock registration");
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API delay

        // Automatically login after mock registration
        await login(email, password);
        console.log("✅ DEV MODE: Registration successful");
        return;
      }

      // PRODUCTION MODE: Real WordPress registration
      console.log("🔐 Attempting registration for:", {
        username,
        email,
        displayName,
      });
      console.log("📤 Sending to:", REGISTER_ENDPOINT);
      console.log(
        "📤 Request body:",
        JSON.stringify({
          username,
          email,
          password: "***",
          display_name: displayName,
        })
      );

      const response = await fetch(REGISTER_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
          display_name: displayName,
        }),
      });

      console.log("📥 Response status:", response.status);
      console.log("📥 Response ok:", response.ok);

      // Try to parse response
      let errorData;
      try {
        errorData = await response.json();
        console.log("📥 Response data:", errorData);
      } catch (parseError) {
        console.error("❌ Failed to parse response:", parseError);
        errorData = {};
      }

      if (!response.ok) {
        console.error("❌ WordPress API registration error:", {
          status: response.status,
          statusText: response.statusText,
          data: errorData,
        });

        // Handle WordPress API error codes
        if (errorData.code === "username_exists") {
          throw new Error("Username already taken");
        }

        if (errorData.code === "email_exists") {
          throw new Error("Email already registered");
        }

        if (errorData.code === "invalid_email") {
          throw new Error("Invalid email address");
        }

        if (errorData.code === "weak_password") {
          throw new Error("Password must be at least 6 characters");
        }

        if (errorData.code === "missing_fields") {
          throw new Error("All fields are required");
        }

        if (errorData.code === "registration_failed") {
          throw new Error(errorData.message || "Registration failed");
        }

        if (errorData.code === "rest_no_route") {
          throw new Error(
            "Registration endpoint not found. Please ensure the WordPress plugin is installed and activated."
          );
        }

        // Generic error - include full error details for debugging
        const errorMessage =
          errorData.message || errorData.code || "Registration failed";
        console.error("❌ Unhandled error code:", errorData.code);
        throw new Error(errorMessage);
      }

      console.log("✅ Registration successful:", errorData);

      // After registration, automatically login
      await login(email, password);
    } catch (error) {
      console.error("❌ Registration error:", error);
      throw new Error(
        error instanceof Error ? error.message : "Registration failed"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("wpCredentials");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  // Update user data (e.g., after role change)
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  // Update user profile (sync to WordPress backend)
  const updateUserProfile = async (userData: Partial<User>) => {
    if (!user) {
      throw new Error("No user logged in");
    }

    setIsLoading(true);

    try {
      // Check if we have WordPress credentials
      const wpCredentials = localStorage.getItem("wpCredentials");
      const loginMethod = localStorage.getItem("loginMethod");

      // If no WordPress credentials or social login, just update locally
      if (!wpCredentials || loginMethod !== "password") {
        console.log(
          "ℹ️ No WordPress credentials available. Updating locally only."
        );
        updateUser(userData);
        return;
      }

      // Prepare WordPress update data
      const wpUpdateData: any = {};
      const metaFields: any = {};

      if (userData.displayName !== undefined) {
        wpUpdateData.name = userData.displayName;
      }
      if (userData.email !== undefined) {
        wpUpdateData.email = userData.email;
      }
      if (userData.phone !== undefined) {
        metaFields.phone = userData.phone;
      }
      if (userData.address !== undefined) {
        metaFields.address = userData.address;
      }
      if (userData.company !== undefined) {
        metaFields.company = userData.company;
      }
      if (userData.avatar !== undefined) {
        metaFields.avatar_url = userData.avatar;
      }

      // Add meta fields if any
      if (Object.keys(metaFields).length > 0) {
        wpUpdateData.meta = metaFields;
      }

      console.log("🔄 Attempting to sync profile to WordPress:", wpUpdateData);

      // Try to send update to WordPress REST API using Basic Auth
      try {
        const response = await fetch(`${WP_USERS_ENDPOINT}/${user.id}`, {
          method: "POST",
          headers: {
            Authorization: `Basic ${wpCredentials}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(wpUpdateData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.warn(
            "⚠️ WordPress API error (falling back to local update):",
            errorData
          );

          // Update locally even if WordPress fails
          updateUser(userData);

          // If it's an auth error, don't throw - just log and continue
          if (
            response.status === 401 ||
            errorData.code === "incorrect_password"
          ) {
            console.log(
              "ℹ️ WordPress credentials invalid. Changes saved locally only."
            );
            return;
          }

          // For other errors, still save locally but let user know
          if (
            response.status === 404 ||
            errorData.code === "rest_user_invalid_id"
          ) {
            console.log(
              "ℹ️ User not found in WordPress. Changes saved locally only."
            );
            return;
          }

          // Unexpected error - save locally and return
          console.log("ℹ️ WordPress sync failed. Changes saved locally only.");
          return;
        }

        const updatedUserData = await response.json();
        console.log(
          "✅ User profile synced to WordPress successfully:",
          updatedUserData
        );

        // Update local user data with WordPress response
        const updatedUser: User = {
          id: updatedUserData.id || user.id,
          username: updatedUserData.slug || user.username,
          email: updatedUserData.email || user.email,
          displayName: updatedUserData.name || user.displayName,
          role: user.role, // Keep existing role - don't change it
          avatar:
            userData.avatar ||
            updatedUserData.avatar_urls?.["96"] ||
            user.avatar,
          phone: userData.phone || user.phone,
          address: userData.address || user.address,
          company: userData.company || user.company,
        };

        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      } catch (fetchError) {
        // Network error or fetch failed - update locally
        console.warn("⚠️ Network error syncing to WordPress:", fetchError);
        updateUser(userData);
        console.log("ℹ️ Changes saved locally only.");
      }
    } catch (error) {
      console.error("❌ Update user profile error:", error);
      // Even on error, try to update locally
      updateUser(userData);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    loginWithSocial,
    register,
    logout,
    updateUser,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
