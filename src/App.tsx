/**
 * App.tsx - Main Application Component
 *
 * This is the root component of the ShopLocal marketplace application.
 * It handles:
 * - React Router setup and route definitions
 * - Application layout structure (Navigation, Content, Footer)
 * - Route wrappers for dynamic URL parameters
 * - Stub pages for authentication and error handling
 *
 * @module App
 */

import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useParams,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { Navigation } from "./components/Navigation";
import { Footer } from "./components/Footer";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { Homepage } from "./pages/Homepage";
import VendorsDirectory from "./pages/VendorsDirectory";
import { VendorStorefront } from "./pages/VendorStorefront";
import { VendorDetail } from "./pages/VendorDetail";
import { ProductCatalog } from "./pages/ProductCatalog";
import { ProductDetail } from "./pages/ProductDetail";
import { BecomeSeller } from "./pages/BecomeSeller";
import { HowItWorks } from "./pages/HowItWorks";
import { HelpCenter } from "./pages/HelpCenter";
import { AboutPage } from "./pages/AboutPage";
import { PolicyPage } from "./pages/PolicyPage";
import { ContactPage } from "./pages/ContactPage";
import { FeesPage } from "./pages/FeesPage";
import { FAQ } from "./pages/FAQ";
import { Cart } from "./pages/Cart";
import { Checkout } from "./pages/Checkout";
import { CustomerDashboard } from "./pages/CustomerDashboard";
// import VendorDashboard from "./pages/VendorDashboard";
import { Wishlist } from "./pages/Wishlist";
import { OrderHistory } from "./pages/OrderHistory";
import { UserProfile } from "./pages/UserProfile";
import { SearchResults } from "./pages/SearchResults";
import { DealsPromotions } from "./pages/DealsPromotions";
import { ClaimListing } from "./pages/ClaimListing";
import { CreateListing } from "./pages/CreateListing";
// import { CreateProduct } from "./pages/CreateProduct";
// import { EditProduct } from "./pages/EditProduct";
// import { SubscriptionPlans } from "./pages/SubscriptionPlans";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import UserDashboard from "./pages/UserDashboard";
import GoogleCallback from "./pages/GoogleCallback";
import AppleCallback from "./pages/AppleCallback";
import OrderSuccess from "./pages/OrderSuccess";
// import { AccountSettings } from "./pages/AccountSettings";
import { vendors } from "./lib/mockData";
import { Store } from "lucide-react";

/**
 * AppContent Component
 *
 * Main content wrapper that includes the navigation, routing system, and footer.
 * This component is wrapped by BrowserRouter in the default export.
 *
 * @returns {JSX.Element} The main application layout with routing
 */
function AppContent() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Global Navigation */}
      <Navigation />

      {/* Main Content Area - Grows to fill available space */}
      <main className="flex-grow">
        <Routes>
          {/* ============================================
              HOMEPAGE ROUTE
              ============================================ */}
          <Route path="/" element={<Homepage />} />

          {/* ============================================
              VENDOR ROUTES
              Handles vendor directory, detail pages, and storefronts
              ============================================ */}
          <Route path="/vendors" element={<VendorsDirectory />} />
          <Route
            path="/vendor-detail/:slug"
            element={<VendorDetailWrapper />}
          />
          <Route path="/vendor/:slug" element={<VendorStorefrontWrapper />} />

          {/* ============================================
              PRODUCT ROUTES
              Handles product catalog and individual product pages
              ============================================ */}
          <Route path="/products" element={<ProductCatalog />} />
          <Route path="/product/:slug" element={<ProductDetailWrapper />} />

          {/* ============================================
              SELLER ONBOARDING ROUTES
              For new sellers to sign up and claim listings
              ============================================ */}
          <Route path="/sell" element={<BecomeSeller />} />
          {/* <Route path="/pricing" element={<SubscriptionPlans />} /> */}
          <Route
            path="/claim-listing"
            element={
              <ProtectedRoute>
                <ClaimListing />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-listing"
            element={
              <ProtectedRoute>
                <CreateListing />
              </ProtectedRoute>
            }
          />

          {/* ============================================
              INFORMATIONAL PAGES
              Static/semi-static content pages
              ============================================ */}
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/help" element={<HelpCenter />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/fees" element={<FeesPage />} />
          <Route path="/faq" element={<FAQ />} />

          {/* ============================================
              POLICY & LEGAL PAGES
              Terms, privacy, refunds, and agreements
              ============================================ */}
          <Route path="/terms" element={<PolicyPage type="terms" />} />
          <Route path="/privacy" element={<PolicyPage type="privacy" />} />
          <Route path="/refund-policy" element={<PolicyPage type="refund" />} />
          <Route
            path="/seller-agreement"
            element={<PolicyPage type="seller-agreement" />}
          />

          {/* ============================================
              SHOPPING FLOW ROUTES
              Cart, checkout, wishlist, search, and deals
              ============================================ */}
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/deals" element={<DealsPromotions />} />

          {/* ============================================
              CUSTOMER ACCOUNT ROUTES
              Customer dashboard, orders, and profile
              ============================================ */}
          <Route path="/my-account" element={<CustomerDashboard />} />
          <Route path="/orders" element={<OrderHistory />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route
            path="/account-settings"
            element={
              <ProtectedRoute>{/* <AccountSettings /> */}</ProtectedRoute>
            }
          />

          {/* ============================================
              VENDOR DASHBOARD ROUTES
              Vendor management and authentication
              ============================================ */}
          {/* Temporarily disabled */}
          {/* <Route
            path="/vendor-dashboard"
            element={
              <ProtectedRoute requiredRole="vendor">
                <VendorDashboard />
              </ProtectedRoute>
            }
          /> */}
          <Route path="/vendor-login" element={<VendorLoginPage />} />

          {/* ============================================
              USER AUTHENTICATION ROUTES
              Login, register, and user dashboard
              ============================================ */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/auth/google/callback" element={<GoogleCallback />} />
          <Route path="/auth/apple/callback" element={<AppleCallback />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/order-success" element={<OrderSuccess />} />

          {/* ============================================
              PRODUCT CREATION ROUTE
              Create products directly for WooCommerce
              ============================================ */}
          <Route
            path="/create-product"
            element={<ProtectedRoute>{/* <CreateProduct /> */}</ProtectedRoute>}
          />
          <Route
            path="/edit-product/:id"
            element={<ProtectedRoute>{/* <EditProduct /> */}</ProtectedRoute>}
          />

          {/* ============================================
              404 NOT FOUND
              Catch-all route for invalid URLs
              ============================================ */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}

/**
 * VendorDetailWrapper Component
 *
 * Extracts the vendor slug from URL parameters and fetches the corresponding
 * vendor data from GeoDirectory API. First checks location state, then fetches from API.
 * If vendor is not found, redirects to vendors directory.
 *
 * @returns {JSX.Element} VendorDetail page or VendorsDirectory if not found
 */
function VendorDetailWrapper() {
  const { slug } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(state?.vendor);
  const [loading, setLoading] = useState(!state?.vendor);
  const [error, setError] = useState(false);

  useEffect(() => {
    // If we already have vendor from state, don't fetch
    if (state?.vendor) {
      setVendor(state.vendor);
      setLoading(false);
      return;
    }

    // Fetch vendor from GeoDirectory API
    const fetchVendorFromAPI = async () => {
      try {
        setLoading(true);
        console.log(
          "🔍 VendorDetailWrapper: Fetching vendor from API with slug:",
          slug
        );

        // Fetch all places from GeoDirectory API
        const response = await fetch(
          `https://shoplocal.kinsta.cloud/wp-json/geodir/v2/places?per_page=100`,
          {
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const places = await response.json();

        // Find the vendor by slug
        const place = places.find((p: any) => {
          const placeSlug =
            p.slug ||
            (typeof p.title === "string"
              ? p.title
                  .toLowerCase()
                  .replace(/\s+/g, "-")
                  .replace(/[^a-z0-9-]/g, "")
              : p.title?.rendered
                  ?.toLowerCase()
                  .replace(/\s+/g, "-")
                  .replace(/[^a-z0-9-]/g, ""));
          return placeSlug === slug;
        });

        if (!place) {
          console.warn(
            `⚠️ Vendor not found for slug: ${slug} in GeoDirectory API`
          );
          setError(true);
          setLoading(false);

          // Redirect after a delay
          const timer = setTimeout(() => {
            navigate("/vendors", { replace: true });
          }, 3000);

          return () => clearTimeout(timer);
        }

        // Convert API place to Vendor format (same as VendorsDirectory.tsx)
        const stripHtml = (html: string | null | undefined) => {
          if (!html || typeof html !== "string") return "";
          return html.replace(/<[^>]*>/g, "").trim();
        };

        const titleString =
          typeof place.title === "string"
            ? place.title
            : place.title?.rendered || "Business";

        const content = stripHtml(
          typeof place.content === "string"
            ? place.content
            : place.content?.rendered
        );

        const thumbnailUrl =
          place.featured_image?.thumbnail || place.images?.[0]?.thumbnail || "";
        const fullImageUrl =
          place.featured_image?.src || place.images?.[0]?.src || "";

        const logo =
          thumbnailUrl || fullImageUrl || "https://via.placeholder.com/150";
        const banner =
          fullImageUrl || thumbnailUrl || "https://via.placeholder.com/800x300";

        let specialty = "General";
        let categoryId: number | undefined;

        if (place.default_category) {
          categoryId = place.default_category;
        }

        if (place.post_category) {
          if (typeof place.post_category === "string") {
            specialty = place.post_category;
          } else if (Array.isArray(place.post_category)) {
            specialty = place.post_category
              .map((cat: any) => cat.name)
              .join(", ");
            if (!categoryId && place.post_category.length > 0) {
              categoryId = place.post_category[0].id;
            }
          } else if (typeof place.post_category === "object") {
            specialty = place.post_category.name;
            if (!categoryId) {
              categoryId = place.post_category.id;
            }
          }
        }

        const customRating =
          place.gd_custom_ratings ||
          place.gd_custom_rating ||
          place.acf?.rating ||
          place.acf?.custom_rating ||
          place.custom_rating ||
          place.gd_rating ||
          place.overall_rating ||
          place.review_rating ||
          place.rating ||
          4.5;

        const vendorData = {
          id: place.id.toString(),
          name: titleString,
          slug: place.slug || slug,
          dokanUsername: place.dokanUsername,
          logo: logo,
          banner: banner,
          tagline: content.substring(0, 100) || "Quality local business",
          bio: content || "A trusted local business in your community.",
          specialty: specialty,
          categoryId: categoryId,
          rating:
            typeof customRating === "number"
              ? customRating
              : parseFloat(String(customRating)) || 0,
          location:
            place.city && place.region
              ? `${place.city}, ${place.region}`
              : place.city || place.region || "Local",
          latitude: place.latitude,
          longitude: place.longitude,
          claimed: place.claimed || 0,
          socialLinks: {
            website: place.website || undefined,
            instagram: place.twitter || undefined,
          },
          policies: {
            shipping:
              place.special_offers ||
              "Please contact us for shipping details and rates.",
            returns:
              "Returns accepted within 30 days. Please contact us for more information.",
            faqs: "For any questions, please reach out to us directly.",
          },
        };

        console.log("✅ VendorDetailWrapper: Vendor found:", vendorData.name);
        setVendor(vendorData);
        setLoading(false);
      } catch (err: any) {
        console.error("❌ VendorDetailWrapper: Error fetching vendor:", err);
        setError(true);
        setLoading(false);

        // Redirect after a delay
        const timer = setTimeout(() => {
          navigate("/vendors", { replace: true });
        }, 3000);

        return () => clearTimeout(timer);
      }
    };

    fetchVendorFromAPI();
  }, [slug, state, navigate]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Store className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl text-gray-900 mb-2">Loading vendor...</h3>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !vendor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Store className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl text-gray-900 mb-2">Vendor not found</h3>
          <p className="text-gray-600 mb-4">
            The vendor "{slug}" could not be found.
          </p>
          <button
            onClick={() => navigate("/vendors")}
            className="px-6 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors"
          >
            Browse All Vendors
          </button>
        </div>
      </div>
    );
  }

  return <VendorDetail vendor={vendor} />;
}

/**
 * VendorStorefrontWrapper Component
 *
 * Extracts the vendor slug from URL parameters and passes it to the
 * VendorStorefront component. Also checks for vendor data in location state.
 *
 * @returns {JSX.Element} VendorStorefront page with the vendor slug
 */
function VendorStorefrontWrapper() {
  const { slug } = useParams();
  const { state } = useLocation();

  // Pass vendor data if available, use key to force re-mount on slug change
  return (
    <VendorStorefront
      key={slug}
      vendorSlug={slug || ""}
      vendor={state?.vendor}
    />
  );
}

/**
 * ProductDetailWrapper Component
 *
 * Extracts the product slug from URL parameters and passes it to the
 * ProductDetail component.
 *
 * @returns {JSX.Element} ProductDetail page with the product slug
 */
function ProductDetailWrapper() {
  const { slug } = useParams();
  return <ProductDetail productSlug={slug || ""} />;
}

/**
 * App Component (Default Export)
 *
 * Root component that wraps the application with React Router's BrowserRouter.
 *
 * @returns {JSX.Element} The complete application wrapped in BrowserRouter
 */
export default function App() {
  // Use basename only on GitHub Pages (check if URL includes github.io)
  const basename = window.location.hostname.includes("github.io")
    ? "/Shoplocal"
    : "/";

  return (
    <BrowserRouter basename={basename}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

/**
 * VendorLoginPage Component
 *
 * Authentication page for vendors to access their dashboard.
 * Currently implemented as a stub with mock authentication.
 *
 * Features:
 * - Email and password input fields
 * - Login button that navigates to vendor dashboard
 * - Link to seller registration page
 *
 * @returns {JSX.Element} Vendor login form
 */
function VendorLoginPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-16">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* Page Header */}
          <h1 className="text-black mb-2 text-center">Vendor Login</h1>
          <p className="text-gray-600 mb-8 text-center">
            Access your vendor dashboard
          </p>

          {/* Login Form */}
          <div className="space-y-4">
            {/* Email Input */}
            <div>
              <label className="block text-sm mb-2">Email</label>
              <input
                type="email"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-600"
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm mb-2">Password</label>
              <input
                type="password"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-600"
              />
            </div>

            {/* Login Button - Currently bypasses authentication */}
            <button
              onClick={() => navigate("/vendor-dashboard")}
              className="w-full bg-sky-600 hover:bg-sky-700 text-white py-3 rounded-lg"
            >
              Login
            </button>
          </div>

          {/* Registration Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Don't have an account?{" "}
              <button
                onClick={() => navigate("/sell")}
                className="text-sky-600 hover:underline"
              >
                Become a Seller
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * NotFoundPage Component
 *
 * 404 error page displayed when users navigate to invalid URLs.
 * Provides a clear message and navigation back to homepage.
 *
 * @returns {JSX.Element} 404 error page with home navigation
 */
function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        {/* Large 404 indicator */}
        <h1 className="text-6xl text-gray-300 mb-4">404</h1>

        {/* Error message */}
        <h2 className="text-black mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist.
        </p>

        {/* Back to home button */}
        <button
          onClick={() => navigate("/")}
          className="bg-sky-600 hover:bg-sky-700 text-white px-8 py-3 rounded-lg"
        >
          Go Home
        </button>
      </div>
    </div>
  );
}
