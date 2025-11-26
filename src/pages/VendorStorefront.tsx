import {
  Star,
  MapPin,
  Globe,
  Instagram,
  Mail,
  ArrowLeft,
  Heart,
  Share2,
  Search,
  Filter,
  Package,
  Users,
  Clock,
  Shield,
  TrendingUp,
  SlidersHorizontal,
  Award,
  Phone,
  MessageCircle,
  Grid3x3,
  List,
  ChevronDown,
} from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { ProductCard } from "../components/ProductCard";
import { vendors, products } from "../lib/mockData";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useState, useEffect } from "react";
import {
  getVendorDetail,
  getVendorDetailAndRecordVisit,
} from "../api/dokan/vendors";

interface VendorStorefrontProps {
  vendorSlug: string;
  vendor?: any; // Vendor data passed from navigation state
}

export function VendorStorefront({
  vendorSlug,
  vendor: vendorFromProps,
}: VendorStorefrontProps) {
  const navigate = useNavigate();
  const { state } = useLocation();

  const [vendorProducts, setVendorProducts] = useState([]);
  const [vendor, setVendor] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [loading, setLoading] = useState(0); // 0 = loading, 1 = loaded
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const { slug } = useParams();

  // Get vendor from props or location state
  const vendorDataFromNav = vendorFromProps || state?.vendor;

  // Debug: Log received slug
  console.log("🔧 VendorStorefront Component Loaded");
  console.log("📍 URL slug from useParams():", slug);
  console.log("📍 Prop vendorSlug:", vendorSlug);
  console.log("📍 Vendor from navigation:", vendorDataFromNav);
  console.log("📍 Vendor slug from navigation:", vendorDataFromNav?.slug);
  console.log(
    "📍 Do slugs match?",
    vendorDataFromNav?.slug === (slug || vendorSlug)
  );
  console.log("📍 Using slug:", slug || vendorSlug);
  console.log(
    "📍 All available vendor slugs:",
    vendors.map((v) => v.slug)
  );

  useEffect(() => {
    let isMounted = true;

    const fetchVendorDetail = async () => {
      // Scroll to top when vendor changes
      window.scrollTo(0, 0);

      // Use slug from useParams first, fallback to vendorSlug prop
      const targetSlug = slug || vendorSlug;

      // ============================================
      // PRIORITY 1: USE VENDOR DATA FROM NAVIGATION STATE
      // If vendor data is passed from VendorsDirectory, use it directly!
      // ============================================
      if (vendorDataFromNav && isMounted) {
        console.log(
          "✅ Using vendor data from navigation state:",
          vendorDataFromNav.name
        );

        // Get products for this vendor
        const mockProducts = products.filter((p) => {
          const matchByName = p.vendor === vendorDataFromNav.name;
          const matchBySlug = p.vendorSlug === vendorDataFromNav.slug;
          return matchByName || matchBySlug;
        });

        console.log("✅ Found products:", mockProducts.length);

        setVendor({
          ...vendorDataFromNav,
          visits: vendorDataFromNav.visits || vendorDataFromNav.distance || 0,
          products: mockProducts,
          socialLinks: vendorDataFromNav.socialLinks || {},
          policies: vendorDataFromNav.policies || {
            shipping: "Standard shipping applies. Contact store for details.",
            returns:
              "30-day return policy. Items must be in original condition.",
            faqs: "Contact the store for any questions or concerns.",
          },
        });
        setVendorProducts(mockProducts);
        setLoading(1);
        return;
      }

      // ============================================
      // PRIORITY 2: FETCH FROM API OR MOCK DATA
      // Only if vendor data wasn't passed from navigation
      // ============================================

      // Store debug info
      const debug: any = {
        receivedSlug: targetSlug,
        slugFromParams: slug,
        slugFromProps: vendorSlug,
        allVendorSlugs: vendors.map((v) => v.slug),
        foundVendor: null,
        matchStrategy: null,
        attemptedStrategies: [],
      };

      if (!targetSlug) {
        console.error("❌ No slug provided - using first vendor as fallback");
        debug.error = "No slug provided";
        debug.matchStrategy = "fallback-no-slug";

        // Use first vendor as fallback
        if (isMounted && vendors.length > 0) {
          const fallbackVendor = vendors[0];
          const fallbackProducts = products.filter(
            (p) =>
              p.vendor === fallbackVendor.name ||
              p.vendorSlug === fallbackVendor.slug
          );

          debug.foundVendor = fallbackVendor.name;
          setDebugInfo(debug);

          setVendor({
            ...fallbackVendor,
            visits: fallbackVendor.distance || 0,
            products: fallbackProducts,
            socialLinks: fallbackVendor.socialLinks || {},
            policies: fallbackVendor.policies || {
              shipping: "Standard shipping applies. Contact store for details.",
              returns:
                "30-day return policy. Items must be in original condition.",
              faqs: "Contact the store for any questions or concerns.",
            },
          });
          setVendorProducts(fallbackProducts);
        }
        setLoading(1);
        return;
      }

      console.log(
        "🔍 VendorStorefront: Fetching vendor with slug:",
        targetSlug
      );
      console.log("🔍 Slug details:", {
        value: targetSlug,
        length: targetSlug.length,
        type: typeof targetSlug,
        hasTrailingSlash: targetSlug.endsWith("/"),
        hasLeadingSlash: targetSlug.startsWith("/"),
        raw: JSON.stringify(targetSlug),
        charCodes: Array.from(targetSlug).map((c) => c.charCodeAt(0)),
      });

      // ============================================
      // TRY API FIRST, THEN FALLBACK TO MOCK DATA
      // ============================================

      let apiVendor = null;
      let mockVendor = null;
      let matchedStrategy = null;

      console.log("\n🔍 === FETCHING FROM API ===");

      try {
        // Try getting vendor by slug from WordPress API
        const vendorData = await getVendorDetail(targetSlug);

        if (vendorData && vendorData.vendor) {
          console.log("✅ Found vendor from API:", vendorData.vendor);
          apiVendor = {
            id: vendorData.vendor.ID?.toString() || "0",
            name:
              vendorData.vendor.store_name ||
              vendorData.vendor.shop_name ||
              "Store",
            slug: targetSlug,
            logo:
              vendorData.vendor.gravatar ||
              "https://images.unsplash.com/photo-1523359346063-d879354c0ea5?w=200",
            banner:
              vendorData.vendor.banner ||
              "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200",
            tagline:
              vendorData.vendor.tagline ||
              vendorData.vendor.shop_description ||
              "Quality products and service",
            bio:
              vendorData.vendor.description ||
              vendorData.vendor.about ||
              "Welcome to our store",
            specialty: vendorData.vendor.categories?.[0] || "General",
            rating: parseFloat(vendorData.vendor.rating || "4.5"),
            location:
              vendorData.vendor.address?.city ||
              vendorData.vendor.address?.state ||
              "Location",
            latitude: vendorData.vendor.address?.latitude || "",
            longitude: vendorData.vendor.address?.longitude || "",
            visits: vendorData.vendor.visits || 0,
            totalSales: vendorData.vendor.total_sales || 0,
            reviewCount: vendorData.vendor.review_count || 0,
            responseTime: vendorData.vendor.response_time || "< 2 hours",
            yearsInBusiness: vendorData.vendor.years_in_business || 5,
            followers: vendorData.vendor.followers || 0,
            socialLinks: {
              website: vendorData.vendor.social?.website || "",
              instagram: vendorData.vendor.social?.instagram || "",
              facebook: vendorData.vendor.social?.fb || "",
              twitter: vendorData.vendor.social?.twitter || "",
            },
            policies: {
              shipping:
                vendorData.vendor.policies?.shipping ||
                "Standard shipping applies. Contact store for details.",
              returns:
                vendorData.vendor.policies?.returns ||
                "30-day return policy. Items must be in original condition.",
              faqs:
                vendorData.vendor.policies?.faqs ||
                "Contact the store for any questions or concerns.",
            },
          };
          matchedStrategy = "API: WordPress vendor endpoint";
        }
      } catch (err: any) {
        // Silently handle API errors (404, network issues, etc.) and fall back to mock data
        if (err.response?.status === 404) {
          console.log("ℹ️ Vendor not found in API, trying mock data...");
        } else {
          console.log("ℹ️ API unavailable, using mock data as fallback");
        }
      }

      console.log("\n🔍 === STARTING MOCK DATA SEARCH ===");
      console.log("Target slug to find:", `"${targetSlug}"`);

      // Strategy 1: Exact match
      console.log("\n🔍 Strategy 1: Exact match");
      debug.attemptedStrategies.push("exact-match");
      vendors.forEach((v) => {
        const matches = v.slug === targetSlug;
        console.log(`  "${v.slug}" === "${targetSlug}" ? ${matches}`);
        if (matches && !mockVendor) {
          mockVendor = v;
          if (!apiVendor) matchedStrategy = "Strategy 1: Exact match";
        }
      });

      // Strategy 2: Case-insensitive
      if (!mockVendor) {
        console.log("\n🔍 Strategy 2: Case-insensitive");
        debug.attemptedStrategies.push("case-insensitive");
        const targetLower = targetSlug.toLowerCase();
        vendors.forEach((v) => {
          const matches = v.slug.toLowerCase() === targetLower;
          console.log(
            `  "${v.slug.toLowerCase()}" === "${targetLower}" ? ${matches}`
          );
          if (matches && !mockVendor) {
            mockVendor = v;
            if (!apiVendor) matchedStrategy = "Strategy 2: Case-insensitive";
          }
        });
      }

      // Strategy 3: Normalized slug
      if (!mockVendor) {
        console.log("\n🔍 Strategy 3: Normalized");
        debug.attemptedStrategies.push("normalized");
        const normalizedSlug = targetSlug
          .toLowerCase()
          .trim()
          .replace(/\/+$/g, "")
          .replace(/^\/+/g, "")
          .replace(/\s+/g, "-");
        console.log(`  Normalized slug: "${normalizedSlug}"`);
        vendors.forEach((v) => {
          const matches = v.slug.toLowerCase() === normalizedSlug;
          console.log(
            `  "${v.slug.toLowerCase()}" === "${normalizedSlug}" ? ${matches}`
          );
          if (matches && !mockVendor) {
            mockVendor = v;
            if (!apiVendor) matchedStrategy = "Strategy 3: Normalized";
          }
        });
      }

      // Strategy 4: Name to slug
      if (!mockVendor) {
        console.log("\n🔍 Strategy 4: Name to slug");
        debug.attemptedStrategies.push("name-to-slug");
        const cleanedSlug = targetSlug
          .toLowerCase()
          .replace(/\/+$/g, "")
          .replace(/^\/+/g, "");
        vendors.forEach((v) => {
          const nameSlug = v.name
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "");
          const matches = nameSlug === cleanedSlug;
          console.log(
            `  "${v.name}" -> "${nameSlug}" === "${cleanedSlug}" ? ${matches}`
          );
          if (matches && !mockVendor) {
            mockVendor = v;
            if (!apiVendor) matchedStrategy = "Strategy 4: Name-to-slug";
          }
        });
      }

      // Strategy 5: Partial match
      if (!mockVendor) {
        console.log("\n🔍 Strategy 5: Partial match");
        debug.attemptedStrategies.push("partial-match");
        const cleanSlug = targetSlug
          .toLowerCase()
          .replace(/\/+$/g, "")
          .replace(/^\/+/g, "");
        vendors.forEach((v) => {
          const contains1 = v.slug.toLowerCase().includes(cleanSlug);
          const contains2 = cleanSlug.includes(v.slug.toLowerCase());
          const matches = contains1 || contains2;
          if (matches && !mockVendor) {
            mockVendor = v;
            if (!apiVendor) matchedStrategy = "Strategy 5: Partial match";
          }
        });
      }

      // Use API vendor if found, otherwise use mock vendor
      const selectedVendor = apiVendor || mockVendor;

      // ULTIMATE FALLBACK: Just use first vendor
      if (!selectedVendor && vendors.length > 0) {
        console.log("\n⚠️ NO MATCH FOUND - Using first vendor as fallback");
        mockVendor = vendors[0];
        matchedStrategy = "Fallback: First vendor";
        debug.matchStrategy = "fallback-no-match";
      }

      console.log("\n🔍 === SEARCH COMPLETE ===");
      console.log(
        `Result: ${
          apiVendor || mockVendor
            ? `✅ Found "${
                (apiVendor || mockVendor).name
              }" via ${matchedStrategy}`
            : "❌ Not found"
        }\n`
      );

      // Set vendor data
      const finalVendor = apiVendor || mockVendor;
      if (finalVendor && isMounted) {
        console.log("✅ SUCCESS! Using vendor:", finalVendor.name);

        debug.foundVendor = finalVendor.name;
        debug.matchStrategy = matchedStrategy;

        // Get products for this vendor
        const mockProducts = products.filter((p) => {
          const matchByName = p.vendor === finalVendor.name;
          const matchBySlug = p.vendorSlug === finalVendor.slug;
          return matchByName || matchBySlug;
        });

        console.log("✅ Found products:", mockProducts.length);
        debug.productsFound = mockProducts.length;

        setDebugInfo(debug);

        setVendor({
          ...finalVendor,
          visits: finalVendor.visits || finalVendor.distance || 0,
          products: mockProducts,
          socialLinks: finalVendor.socialLinks || {},
          policies: finalVendor.policies || {
            shipping: "Standard shipping applies. Contact store for details.",
            returns:
              "30-day return policy. Items must be in original condition.",
            faqs: "Contact the store for any questions or concerns.",
          },
        });
        setVendorProducts(mockProducts);
        setLoading(1);
      } else {
        // This should NEVER happen now
        console.error("❌ CRITICAL ERROR: No vendors available");
        debug.error = "No vendors in mock data";
        setDebugInfo(debug);
        setLoading(1);
      }
    };

    fetchVendorDetail();

    return () => {
      isMounted = false;
    };
  }, [slug, vendorSlug, vendorDataFromNav]);

  // Show loading spinner while loading is 0
  if (!loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Getting vendor info...</p>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-2xl mx-auto px-4">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-3xl text-black mb-3">Vendor not found</h2>
          <p className="text-gray-600 mb-6">
            We couldn't find a vendor with the slug "
            <span className="font-medium text-gray-900">{slug}</span>". Please
            try one of our available vendors below.
          </p>

          {/* Show Available Vendors */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
            <h3 className="text-lg text-gray-900 mb-4">Available Vendors:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {vendors.map((v) => (
                <button
                  key={v.id}
                  onClick={() => navigate(`/vendor/${v.slug}/`)}
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-sky-600 hover:bg-sky-50 transition-all text-left"
                >
                  <ImageWithFallback
                    src={v.logo}
                    alt={v.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-900 truncate">
                      {v.name}
                    </div>
                    <div className="text-xs text-gray-500">/{v.slug}/</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <Button onClick={() => navigate("/vendors/")}>
              View All Vendors
            </Button>
            <Button variant="outline" onClick={() => navigate("/")}>
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Mock data for store stats
  const storeStats = {
    followers: vendor?.visits || 1248,
    totalSales: vendor?.totalSales || 3420,
    yearsInBusiness: vendor?.yearsInBusiness || 5,
    responseTime: vendor?.responseTime || "< 2 hours",
    reviewCount: vendor?.reviewCount || 240,
  };

  // Get unique categories from vendor products
  const categories = ["all", ...new Set(vendorProducts.map((p) => p.category))];

  // Filter and sort products
  const filteredProducts = vendorProducts
    .filter((p) => {
      const matchesSearch = p.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return 0;
    });

  return (
    <div className="min-h-screen bg-white">
      {/* Compact Header with Breadcrumb */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 py-4">
            <button
              onClick={() => navigate("/vendors/")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Vendors</span>
            </button>
            <span className="text-gray-400">/</span>
            <span className="text-sm text-gray-900">{vendor.name}</span>
          </div>
        </div>
      </div>

      {/* Minimal Banner - Shorter Height */}
      <div className="relative h-72 bg-gradient-to-br from-gray-900 to-gray-700 overflow-hidden">
        <ImageWithFallback
          src={vendor.banner}
          alt={vendor.name}
          className="w-full h-full object-cover opacity-40"
        />
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Store Header - Compact Horizontal Layout */}
        <div className="relative -mt-16">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
              {/* Logo - Smaller */}
              <div className="relative flex-shrink-0">
                <ImageWithFallback
                  src={vendor.logo}
                  alt={vendor.name}
                  className="w-24 h-24 rounded-xl border-4 border-white shadow-lg object-cover bg-white"
                />
                {vendor.rating >= 4.5 && (
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-sky-600 rounded-lg flex items-center justify-center border-2 border-white shadow-md">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>

              {/* Store Info - Horizontal */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-3xl text-gray-900 mb-2 tracking-tight">
                      {vendor.name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="text-gray-900">{vendor.rating}</span>
                        <span className="text-gray-500">
                          ({vendor.reviewCount || 240} reviews)
                        </span>
                      </div>
                      <span className="text-gray-300">•</span>
                      <div className="flex items-center gap-1 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{vendor.location}</span>
                      </div>
                      <span className="text-gray-300">•</span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        {vendor.specialty}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons - Horizontal */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsFollowing(!isFollowing)}
                      className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm ${
                        isFollowing
                          ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          : "bg-sky-600 text-white hover:bg-sky-700"
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          isFollowing ? "fill-current" : ""
                        }`}
                      />
                      <span>{isFollowing ? "Following" : "Follow"}</span>
                    </button>

                    <button className="p-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                      <MessageCircle className="w-4 h-4" />
                    </button>

                    <button className="p-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Stats Row - Inline */}
                <div className="flex flex-wrap items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">
                      {vendorProducts.length} Products
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">
                      {vendor.visits || vendor.followers || 1248} Visits
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">
                      {(vendor.totalSales || 3420).toLocaleString()} Sales
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">
                      Responds in {vendor.responseTime || "< 2 hours"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs - Clean Minimal Style */}
        <div className="mt-8">
          <Tabs defaultValue="products" className="w-full">
            {/* Tab Navigation - Improved UI */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-2">
              <TabsList className="bg-transparent h-auto p-0 gap-2 w-full grid grid-cols-3">
                <TabsTrigger
                  value="products"
                  className="bg-transparent data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 py-3 rounded-lg text-gray-600 data-[state=active]:text-gray-900 transition-all"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Package className="w-4 h-4" />
                    <span>Products ({vendorProducts.length})</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger
                  value="about"
                  className="bg-transparent data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 py-3 rounded-lg text-gray-600 data-[state=active]:text-gray-900 transition-all"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>About</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger
                  value="policies"
                  className="bg-transparent data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 py-3 rounded-lg text-gray-600 data-[state=active]:text-gray-900 transition-all"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Shield className="w-4 h-4" />
                    <span>Policies</span>
                  </div>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="products" className="mt-8">
              {/* Filters & Search Bar - Full Width Single Row */}
              <div className="mb-6 space-y-4">
                {/* Search and View Toggle */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-transparent"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    {/* View Mode Toggle */}
                    <div className="flex items-center border border-gray-200 rounded-lg p-1">
                      <button
                        onClick={() => setViewMode("grid")}
                        className={`p-2 rounded ${
                          viewMode === "grid"
                            ? "bg-gray-100 text-gray-900"
                            : "text-gray-500 hover:text-gray-900"
                        }`}
                      >
                        <Grid3x3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewMode("list")}
                        className={`p-2 rounded ${
                          viewMode === "list"
                            ? "bg-gray-100 text-gray-900"
                            : "text-gray-500 hover:text-gray-900"
                        }`}
                      >
                        <List className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Sort Dropdown */}
                    <div className="relative">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="appearance-none pl-4 pr-10 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-transparent bg-white text-sm"
                      >
                        <option value="default">Sort by: Default</option>
                        <option value="name">Sort by: Name</option>
                        <option value="price-low">Sort by: Price (Low)</option>
                        <option value="price-high">
                          Sort by: Price (High)
                        </option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Category Pills */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-gray-600">Categories:</span>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
                        selectedCategory === cat
                          ? "bg-sky-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {cat === "all" ? "All" : cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Products Grid */}
              {filteredProducts.length > 0 ? (
                <div
                  className={`grid gap-6 ${
                    viewMode === "grid"
                      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                      : "grid-cols-1"
                  }`}
                >
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onViewProduct={(slug) => navigate(`/product/${slug}/`)}
                      onViewVendor={(slug) => navigate(`/vendor/${slug}/`)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl text-gray-900 mb-2">
                    No products found
                  </h3>
                  <p className="text-gray-600">
                    Try adjusting your search or filters
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="about" className="mt-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main About Content */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h2 className="text-xl text-gray-900 mb-4">
                      About {vendor.name}
                    </h2>
                    <div
                      className="prose"
                      dangerouslySetInnerHTML={{ __html: vendor.bio }}
                    />
                  </div>

                  {/* Store Highlights */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
                      <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <Award className="w-6 h-6 text-sky-600" />
                      </div>
                      <div className="text-2xl text-gray-900 mb-1">
                        {storeStats.yearsInBusiness} Years
                      </div>
                      <div className="text-sm text-gray-600">In Business</div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <TrendingUp className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="text-2xl text-gray-900 mb-1">
                        {storeStats.totalSales.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Total Sales</div>
                    </div>
                  </div>
                </div>

                {/* Sidebar - Contact Info */}
                <div className="space-y-4">
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="text-lg text-gray-900 mb-4">
                      Contact Store
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">{vendor.location}</span>
                      </div>

                      {vendor.socialLinks?.website && (
                        <div className="flex items-center gap-3 text-sm">
                          <Globe className="w-4 h-4 text-gray-400" />
                          <a
                            href={vendor.socialLinks.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sky-600 hover:underline"
                          >
                            Visit Website
                          </a>
                        </div>
                      )}

                      {vendor.socialLinks?.instagram && (
                        <div className="flex items-center gap-3 text-sm">
                          <Instagram className="w-4 h-4 text-gray-400" />
                          <a
                            href={vendor.socialLinks.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sky-600 hover:underline"
                          >
                            @{vendor.name.toLowerCase().replace(/\s+/g, "")}
                          </a>
                        </div>
                      )}

                      <div className="flex items-center gap-3 text-sm">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">
                          Contact for details
                        </span>
                      </div>
                    </div>

                    <button className="w-full mt-4 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-sm">Send Message</span>
                    </button>
                  </div>

                  {/* Trust Badge */}
                  {vendor.rating >= 4.5 && (
                    <div className="bg-sky-50 border border-sky-200 rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-sky-600 rounded-xl flex items-center justify-center">
                          <Shield className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="text-sm text-sky-900">
                            Verified Seller
                          </div>
                          <div className="text-xs text-sky-700">
                            Trusted by ShopLocal
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="policies" className="mt-8">
              <div className="max-w-3xl space-y-6">
                {/* Shipping */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-sky-600 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg text-gray-900">Shipping Policy</h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-700 leading-relaxed">
                      {vendor.policies.shipping}
                    </p>
                  </div>
                </div>

                {/* Returns */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                        <Shield className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg text-gray-900">Return Policy</h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-700 leading-relaxed">
                      {vendor.policies.returns}
                    </p>
                  </div>
                </div>

                {/* FAQs */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-600 rounded-lg flex items-center justify-center">
                        <MessageCircle className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg text-gray-900">FAQs</h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-700 leading-relaxed">
                      {vendor.policies.faqs}
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Footer Spacing */}
      <div className="h-16"></div>
    </div>
  );
}

export default VendorStorefront;
