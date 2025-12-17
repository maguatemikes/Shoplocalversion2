import { useAuth } from "../contexts/AuthContext";
import { useUserListings } from "../hooks/useUserListings";
import {
  Package,
  MapPin,
  Loader,
  FileText,
  Edit,
  User,
  Mail,
  Shield,
  Store,
  Calendar,
  ChevronRight,
  ExternalLink,
  Check,
  Star,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { getDokanProducts, DokanProduct } from "../api/dokan/createProduct";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";

type DashboardTab = "listings" | "products";

// Helper function to get the primary product image
const getProductImage = (
  product: DokanProduct & { _embedded?: any }
): string | null => {
  // First, try to get featured image from _embedded data (when using _embed parameter)
  if (product._embedded?.["wp:featuredmedia"]?.[0]?.source_url) {
    return product._embedded["wp:featuredmedia"][0].source_url;
  }

  // Then, try to get from images array (gallery)
  if (product.images && product.images.length > 0) {
    return product.images[0].src;
  }

  // No image available
  return null;
};

export function UserDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<DashboardTab>("listings");
  const [products, setProducts] = useState<DokanProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);

  const { listings, loading, error, stats } = useUserListings({
    claimed: false, // Get all listings (claimed and unclaimed)
    includeStats: true,
    autoFetch: true,
  });

  // Fetch products when switching to products tab
  useEffect(() => {
    if (activeTab === "products" && user && !productsLoading) {
      // Only fetch if we haven't fetched yet OR if products array is empty
      if (products.length === 0) {
        console.log("🔄 Fetching products for products tab...");
        setProductsLoading(true);
        setProductsError(null);
        getDokanProducts(user.id)
          .then((data) => {
            console.log("✅ Products fetched successfully:", data.length);
            setProducts(data);
            setProductsLoading(false);
          })
          .catch((err) => {
            console.error("❌ Error loading products:", err);
            setProductsError("Unable to load products. Please try refreshing.");
            setProductsLoading(false);
          });
      }
    }
  }, [activeTab, user]);

  // Function to refresh products
  const refreshProducts = () => {
    if (!user) return;
    setProductsLoading(true);
    setProductsError(null);
    getDokanProducts(user.id)
      .then((data) => {
        setProducts(data);
        setProductsLoading(false);
        setProductsError(null);
      })
      .catch((err) => {
        console.error("Error refreshing products:", err);
        setProductsError(
          "Unable to refresh products. Using cached data if available."
        );
        setProductsLoading(false);
      });
  };

  if (!user) return null;

  // Calculate real stats from data
  const displayStats = [
    {
      label: "Total Listings",
      value: loading ? "..." : stats?.totalListings?.toString() || "0",
      icon: FileText,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Claimed Listings",
      value: loading ? "..." : stats?.claimedListings?.toString() || "0",
      icon: Store,
      color: "bg-green-100 text-green-600",
    },
    {
      label: "Total Products",
      value: productsLoading ? "..." : products.length.toString(),
      icon: Package,
      color: "bg-purple-100 text-purple-600",
    },
    {
      label: "Average Rating",
      value: loading
        ? "..."
        : stats?.averageRating
        ? stats.averageRating.toFixed(1)
        : "0.0",
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
      show: user.role === "vendor" || user.role === "seller",
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
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl text-gray-900">
              Welcome back, {user.displayName}!
            </h1>
          </div>
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
                    user.role === "vendor" || user.role === "seller"
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
          {displayStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-2xl shadow-sm p-4">
                <div
                  className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center mb-3`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-2xl text-gray-900 mb-1">{stat.value}</div>
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
                const isHighlight = "highlight" in action && action.highlight;
                return (
                  <button
                    key={index}
                    onClick={action.action}
                    className={`rounded-2xl shadow-sm p-6 hover:shadow-md transition-all group text-left ${
                      isHighlight
                        ? "bg-gradient-to-br from-sky-500 to-blue-600 text-white"
                        : "bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                            isHighlight
                              ? "bg-white/20 group-hover:bg-white/30"
                              : "bg-sky-100 group-hover:bg-sky-200"
                          }`}
                        >
                          <Icon
                            className={`w-6 h-6 ${
                              isHighlight ? "text-white" : "text-sky-600"
                            }`}
                          />
                        </div>
                        <div>
                          <h3
                            className={`mb-1 transition-colors ${
                              isHighlight
                                ? "text-white"
                                : "text-gray-900 group-hover:text-sky-600"
                            }`}
                          >
                            {action.label}
                          </h3>
                          <p
                            className={`text-sm ${
                              isHighlight ? "text-white/90" : "text-gray-600"
                            }`}
                          >
                            {action.description}
                          </p>
                        </div>
                      </div>
                      <ChevronRight
                        className={`w-5 h-5 group-hover:translate-x-1 transition-all ${
                          isHighlight
                            ? "text-white/70 group-hover:text-white"
                            : "text-gray-400 group-hover:text-sky-600"
                        }`}
                      />
                    </div>
                  </button>
                );
              })}
          </div>
        </div>

        {/* Tab Navigation */}
        <Tabs
          defaultValue="listings"
          onValueChange={(value) => setActiveTab(value as DashboardTab)}
          className="space-y-8"
        >
          <TabsList className="bg-gray-100 p-1 rounded-lg">
            <TabsTrigger value="listings" className="rounded-lg">
              <Store className="w-4 h-4 mr-2" />
              Listings
            </TabsTrigger>
            <TabsTrigger value="products" className="rounded-lg">
              <Package className="w-4 h-4 mr-2" />
              Products
            </TabsTrigger>
          </TabsList>

          {/* My Listings Section */}
          <TabsContent value="listings">
            {listings.length > 0 ? (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl text-gray-900">My Listings</h2>
                  <button
                    onClick={() => navigate("/vendor-dashboard")}
                    className="text-sky-600 hover:text-sky-700 text-sm flex items-center gap-1"
                  >
                    View All
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {listings.slice(0, 3).map((listing) => {
                    // Generate stable review count based on listing ID
                    const reviewCount = Math.floor(
                      ((parseInt(listing.id) * 7) % 150) + 10
                    );
                    const isClaimed = listing.claimed === 1;

                    // Mock store hours
                    const storeHours = [
                      { day: "Mon-Fri", hours: "9:00 AM - 6:00 PM" },
                      { day: "Saturday", hours: "10:00 AM - 4:00 PM" },
                      { day: "Sunday", hours: "Closed" },
                    ];

                    return (
                      <div
                        key={listing.id}
                        className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl hover:shadow-gray-900/10 hover:border-gray-300 transition-all duration-300"
                      >
                        {/* Image */}
                        <div className="relative h-48 overflow-hidden bg-gray-100">
                          {listing.logo ? (
                            <ImageWithFallback
                              src={listing.logo}
                              alt={listing.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center">
                              <Store className="w-16 h-16 text-white opacity-50" />
                            </div>
                          )}
                          {/* Gradient overlay for better badge visibility */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

                          {/* Claimed/Unclaimed Badge */}
                          {isClaimed ? (
                            <div className="absolute top-4 left-4 bg-sky-600 text-white px-2.5 py-0.5 rounded-md text-xs font-medium shadow-lg backdrop-blur-sm flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              VERIFIED
                            </div>
                          ) : (
                            <div className="absolute top-4 left-4 bg-amber-600 text-white px-3 py-1 rounded-md text-xs font-medium shadow-lg backdrop-blur-sm">
                              UNCLAIMED
                            </div>
                          )}
                        </div>

                        {/* Content - Enhanced spacing */}
                        <div className="p-5">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-lg text-gray-950 truncate">
                                  {listing.name}
                                </h3>
                                {isClaimed && (
                                  <Check className="w-5 h-5 text-sky-600 flex-shrink-0" />
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Rating - Enhanced visual hierarchy */}
                          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
                            <div className="flex items-center gap-0.5">
                              {[...Array(5)].map((_, i) => {
                                const rating = Number(listing.rating) || 0;
                                const isFullStar = i < Math.floor(rating);
                                const isHalfStar =
                                  i === Math.floor(rating) && rating % 1 >= 0.5;

                                return (
                                  <div key={i} className="relative">
                                    {/* Background star (empty) */}
                                    <Star className="w-4 h-4 fill-none text-gray-300 transition-all" />
                                    {/* Foreground star (filled or half-filled) */}
                                    {(isFullStar || isHalfStar) && (
                                      <Star
                                        className="w-4 h-4 fill-amber-400 text-amber-400 absolute top-0 left-0 transition-all"
                                        style={
                                          isHalfStar
                                            ? {
                                                clipPath:
                                                  "polygon(0 0, 50% 0, 50% 100%, 0 100%)",
                                              }
                                            : undefined
                                        }
                                      />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                            <span className="text-sm text-gray-950">
                              {(Number(listing.rating) || 0).toFixed(1)}
                            </span>
                            <span className="text-sm text-gray-400">
                              ({reviewCount})
                            </span>
                          </div>

                          {/* Location & Status - Better spacing */}
                          <div className="flex items-center justify-between text-sm mb-5">
                            <div className="flex items-center gap-1.5 text-gray-600">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <span className="truncate">
                                {listing.location}
                              </span>
                            </div>
                          </div>

                          {/* Actions - Improved touch targets */}
                          <div className="flex gap-3">
                            <button
                              onClick={() =>
                                navigate(`/vendor-detail/${listing.slug}`)
                              }
                              className="flex-1 bg-sky-600 hover:bg-sky-700 text-white rounded-md h-10 text-sm shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
                            >
                              <ExternalLink className="w-4 h-4" />
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {listings.length > 3 && (
                  <div className="text-center mt-6">
                    <button
                      onClick={() => navigate("/vendor-dashboard")}
                      className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl transition-colors inline-flex items-center gap-2"
                    >
                      View All {listings.length} Listings
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            ) : loading ? (
              <div className="bg-white rounded-2xl shadow-sm p-12 mb-8">
                <div className="flex flex-col items-center gap-4">
                  <Loader className="w-8 h-8 text-sky-500 animate-spin" />
                  <p className="text-gray-600">Loading your listings...</p>
                </div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-red-900 font-medium mb-1">
                      Failed to Load Listings
                    </h3>
                    <p className="text-red-700 text-sm mb-3">{error}</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="text-sm text-red-600 hover:text-red-700 underline"
                    >
                      Reload Page
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm p-12 mb-8 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Store className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl text-gray-900 mb-2">No Listings Yet</h3>
                <p className="text-gray-600 mb-6">
                  You haven't claimed any business listings yet. Browse our
                  directory to find your business and claim it!
                </p>
                <button
                  onClick={() => navigate("/vendors")}
                  className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl transition-colors inline-flex items-center gap-2"
                >
                  Browse Vendors Directory
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </TabsContent>

          {/* My Products Section */}
          <TabsContent value="products">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl text-gray-900">My Products</h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={refreshProducts}
                    disabled={productsLoading}
                    className="text-sky-600 hover:text-sky-700 text-sm flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Refresh products"
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${
                        productsLoading ? "animate-spin" : ""
                      }`}
                    />
                    Refresh
                  </button>
                  <button
                    onClick={() => navigate("/vendor-dashboard")}
                    className="text-sky-600 hover:text-sky-700 text-sm flex items-center gap-1"
                  >
                    View All
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {productsLoading ? (
                <div className="bg-white rounded-2xl shadow-sm p-12">
                  <div className="flex flex-col items-center gap-4">
                    <Loader className="w-8 h-8 text-sky-500 animate-spin" />
                    <p className="text-gray-600">Loading your products...</p>
                  </div>
                </div>
              ) : productsError ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-red-900 font-medium mb-1">
                        Failed to Load Products
                      </h3>
                      <p className="text-red-700 text-sm">{productsError}</p>
                    </div>
                  </div>
                </div>
              ) : products.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl text-gray-900 mb-2">
                    No Products Yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    You haven't created any products yet. Start by creating your
                    first product!
                  </p>
                  <button
                    onClick={() => navigate("/create-product")}
                    className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl transition-colors inline-flex items-center gap-2"
                  >
                    Create Your First Product
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.slice(0, 3).map((product) => {
                      const productImage = getProductImage(
                        product as DokanProduct & { _embedded?: any }
                      );

                      return (
                        <div
                          key={product.id}
                          className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-all group relative"
                        >
                          {/* Product Image */}
                          {productImage ? (
                            <div
                              className="aspect-square bg-gray-200 overflow-hidden cursor-pointer"
                              onClick={() =>
                                navigate(`/products/${product.slug}`)
                              }
                            >
                              <ImageWithFallback
                                src={productImage}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          ) : (
                            <div
                              className="aspect-square bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center cursor-pointer"
                              onClick={() =>
                                navigate(`/products/${product.slug}`)
                              }
                            >
                              <Package className="w-16 h-16 text-white opacity-50" />
                            </div>
                          )}

                          {/* Product Content */}
                          <div className="p-6">
                            <h3
                              className="text-gray-900 mb-2 cursor-pointer hover:text-sky-600 transition-colors"
                              onClick={() =>
                                navigate(`/products/${product.slug}`)
                              }
                            >
                              {product.name}
                            </h3>
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {product.short_description
                                ? product.short_description
                                    .replace(/<[^>]*>/g, "")
                                    .trim() || "No description available"
                                : "No description available"}
                            </p>

                            {/* Price & Status */}
                            <div className="flex items-center justify-between mb-4">
                              <div className="text-lg text-gray-900">
                                ${product.price}
                              </div>
                              <div
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                                  product.status === "publish"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                <span className="capitalize">
                                  {product.status}
                                </span>
                              </div>
                            </div>

                            {/* Edit Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/edit-product/${product.id}`);
                              }}
                              className="w-full px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                              <Edit className="w-4 h-4" />
                              <span>Edit Product</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {products.length > 3 && (
                    <div className="text-center mt-6">
                      <button
                        onClick={() => navigate("/vendor-dashboard")}
                        className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl transition-colors inline-flex items-center gap-2"
                      >
                        View All {products.length} Products
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default UserDashboard;
