import { Star, MapPin, Globe, Instagram, Mail, ArrowLeft, Heart, Share2, Search, Filter, Package, Users, Clock, Shield, TrendingUp, SlidersHorizontal, Award, Phone, MessageCircle, Grid3x3, List, ChevronDown } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ProductCard } from '../components/ProductCard';
import { vendors, products } from '../lib/mockData';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useState,useEffect } from 'react';
import { getVendorDetail, getVendorDetailAndRecordVisit } from '../api/dokan/vendors';
import Loading from '../components/Loading';

interface VendorStorefrontProps {
  vendorSlug: string;
}

export function VendorStorefront({ vendorSlug }: VendorStorefrontProps) {
  const navigate = useNavigate();
 
  const [vendorProducts,setVendorProducts] = useState([]);
   const [vendor,setVendor] =useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading,setLoading] =useState(0);
  const { slug } = useParams();



  useEffect(() => {
    let isMounted = true;
  
    const fetchShortProductDetail = async () => {
    if (!slug) return;

    try {
    
      const vendorDetail = await getVendorDetail(slug);
      if (isMounted) setVendor(vendorDetail),setVendorProducts(vendorDetail.products),setLoading(1);
       
        // 2️⃣ Check localStorage to avoid counting multiple visits
        const visitedVendors = JSON.parse(localStorage.getItem("visitedVendors") || "[]");

        if (!visitedVendors.includes(vendorDetail.id)) {
          await getVendorDetailAndRecordVisit(vendorDetail.id);

          // Add this vendor to localStorage
          visitedVendors.push(vendorDetail.id);
          localStorage.setItem("visitedVendors", JSON.stringify(visitedVendors));
        }
        
    } catch (err) {
      console.error("Failed to fetch product details:", err);
    }
  };
  
  fetchShortProductDetail();
  
    return () => {
      isMounted = false;
    };
  }, []);


    if (!loading) {
      return <Loading message="Getting Info..." />;
   
  }

  if (!vendor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-black mb-4">Vendor not found</h2>
          <Button onClick={() => navigate('/vendors/')}>
            Back to Vendors
          </Button>
        </div>
      </div>
    );
  }

  // Mock data for store stats
  const storeStats = {
    followers: 1248,
    totalSales: 3420,
    yearsInBusiness: 5,
    responseTime: '< 2 hours'
  };

  // Get unique categories from vendor products
  const categories = ['all', ...new Set(vendorProducts.map(p => p.category))];

  // Filter and sort products
  const filteredProducts =vendorProducts
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

    
  return (
    <div className="min-h-screen bg-white">
      {/* Compact Header with Breadcrumb */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 py-4">
            <button
              onClick={() => navigate('/vendors/')}
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
                    <h1 className="text-3xl text-gray-900 mb-2 tracking-tight">{vendor.name}</h1>
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="text-gray-900">{vendor.rating}</span>
                        <span className="text-gray-500">(240 reviews)</span>
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
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                          : 'bg-sky-600 text-white hover:bg-sky-700'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isFollowing ? 'fill-current' : ''}`} />
                      <span>{isFollowing ? 'Following' : 'Follow'}</span>
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
                    <span className="text-gray-600">{vendorProducts.length} Products</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{vendor.visits} Visits</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{storeStats.totalSales.toLocaleString()} Sales</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Responds in {storeStats.responseTime}</span>
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
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                      >
                        <Grid3x3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded ${viewMode === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
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
                        <option value="price-high">Sort by: Price (High)</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
                
                {/* Category Pills */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-gray-600">Categories:</span>
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
                        selectedCategory === cat
                          ? 'bg-sky-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {cat === 'all' ? 'All' : cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Products Grid */}
              {filteredProducts.length > 0 ? (
                <div className={`grid gap-6 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                    : 'grid-cols-1'
                }`}>
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
                  <h3 className="text-xl text-gray-900 mb-2">No products found</h3>
                  <p className="text-gray-600">Try adjusting your search or filters</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="about" className="mt-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main About Content */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h2 className="text-xl text-gray-900 mb-4">About {vendor.name}</h2>
                    <p className="text-gray-700 leading-relaxed">{vendor.bio}</p>
                  </div>
                  
                  {/* Store Highlights */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
                      <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <Award className="w-6 h-6 text-sky-600" />
                      </div>
                      <div className="text-2xl text-gray-900 mb-1">{storeStats.yearsInBusiness} Years</div>
                      <div className="text-sm text-gray-600">In Business</div>
                    </div>
                    
                    <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <TrendingUp className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="text-2xl text-gray-900 mb-1">{storeStats.totalSales.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">Total Sales</div>
                    </div>
                  </div>
                </div>
                
                {/* Sidebar - Contact Info */}
                <div className="space-y-4">
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="text-lg text-gray-900 mb-4">Contact Store</h3>
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
                            @{vendor.name.toLowerCase().replace(/\s+/g, '')}
                          </a>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-3 text-sm">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">Contact for details</span>
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
                          <div className="text-sm text-sky-900">Verified Seller</div>
                          <div className="text-xs text-sky-700">Trusted by ShopLocal</div>
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
                    <p className="text-gray-700 leading-relaxed">{vendor.policies.shipping}</p>
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
                    <p className="text-gray-700 leading-relaxed">{vendor.policies.returns}</p>
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
                    <p className="text-gray-700 leading-relaxed">{vendor.policies.faqs}</p>
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


