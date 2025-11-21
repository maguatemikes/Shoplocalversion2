import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Star, ShoppingCart, Heart, Share2, Package, Shield, ArrowLeft, Truck, CheckCircle, FileText, Award, MapPin, Navigation } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { products } from '../lib/mockData';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { getProductDetail,getNearbyVendors, getShortProductDetail  } from '../api/woo/products';
import AddToCartModal from "../components/AddtoCartModal";
interface ProductDetailProps {
  productSlug: string;
}

export function ProductDetail({ productSlug }: ProductDetailProps) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product_item,setProducItem] = useState({
    "acceptsOffers": false,
    "brand": "",
    "category": "Uncategorized",
    "colors": [
        ""
    ],
    "description": "this is a testing product\r\n\r\nthis is a testing product",
    "id": "10236",
    "image": "https://shoplocal.kinsta.cloud/wp-content/uploads/2025/11/cropped-pi4805000_ff_4805191-7b50b9ecf03784511cf9_full.jpg",
    "isNew": false,
    "isTrending": false,
    "name": "Men's Nike Black Lebron 20 Low Top Shoe",
    "originalPrice": 100,
    "price": 89,
    "rating": 5,
    "reviewCount": 1,
    "slug": "mens-nike-black-lebron-20-low-top-shoe",
    "stock": 6,
    "tags": [],
    "upc": "123123",
    "vendor": "Jhimson Store",
    "vendorSlug": null
});
  const [vendors, setVendors] = useState([]);
  const [coords, setCoords] = useState(null);
  const [product,setProduct] = useState( {
    id: '1',
    name: 'Organic Cotton T-Shirt',
    slug: 'organic-cotton-tshirt',
    price: 18.50,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop',
    vendor: 'Green Threads Co.',
    vendorSlug: 'green-threads-co',
    category: 'Eco-Friendly',
    description: '100% organic cotton t-shirt. Perfect for custom printing and embroidery.',
    tags: ['apparel', 'organic', 'customizable'],
    acceptsOffers: true,
    isNew: true,
    isTrending: true,
    rating: 4.8,
    reviewCount: 234,
    stock: 150,
    originalPrice: 24.99,
    colors: ['#000000', '#FFFFFF', '#0EA5E9', '#10B981', '#F59E0B']
  })
 
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [xtraData, setXtraData] = useState({});
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState(false);

const [showModal, setShowModal] = useState(false);
const [lastAddedProduct, setLastAddedProduct] = useState({
name: "",
image: "",
});


// 1️⃣ Fetch product detail on product ID change
useEffect(() => {
  let isMounted = true;

  const fetchProductDetail = async () => {
    if (!product_item?.id) return;

    try {
      const moreDetail = await getProductDetail(slug);
      if (isMounted) setXtraData(moreDetail);
    } catch (err) {
      console.error("Failed to fetch product details:", err);
    }
  };

    const fetchShortProductDetail = async () => {
    if (!slug) return;

    try {
      const shortDetail = await getShortProductDetail(slug);
      if (isMounted) setProducItem(shortDetail),setProduct(shortDetail)
    } catch (err) {
      console.error("Failed to fetch product details:", err);
    }
  };
  fetchShortProductDetail();
  fetchProductDetail();


  return () => {
    isMounted = false;
  };
}, [product_item?.id]);

// 2️⃣ Get user location once
useEffect(() => {
  if (!navigator.geolocation) {
    setError("Geolocation not supported");
    setLoading(false);
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      setCoords({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      });
    },
    (err) => {
      setError("Unable to retrieve your location");
      setLoading(false);
    }
  );
}, []);

// 3️⃣ Fetch nearby vendors when coords is available
useEffect(() => {
  if (!coords) return;

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const data = await getNearbyVendors(coords.lat, coords.lng, 100000);
      setVendors(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  fetchVendors();
}, [coords]);


  function timeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  for (const unit in intervals) {
    const value = Math.floor(seconds / intervals[unit]);
    if (value >= 1) {
      return `${value} ${unit}${value > 1 ? "s" : ""} ago`;
    }
  }

  return "Just now";
}

const handleAddToCart = () => {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");

  // Check if product already exists
  const existingIndex = cart.findIndex((item) => item.id === product.id);

  if (existingIndex !== -1) {
    // Update quantity
    cart[existingIndex].quantity += quantity;
  } else {
    // Add new product
    cart.push({
      id: product.id,
      name: product.name,
      image: product.image,
      price: product.price,
      quantity: quantity,
    });
  }

  // Save back to localStorage
  localStorage.setItem("cart", JSON.stringify(cart));

  // Show popup modal
  setLastAddedProduct({
    name: product.name,
    image: product.image,
  });

  setShowModal(true);

  // Optional auto-close
  setTimeout(() => setShowModal(false), 2000);
};


  return (
    <><div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/products/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Products</span>


          </button>
        </div>
      </div>

      {/* Product Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div>

            <div className="sticky top-24">

              {/* Main Image */}
              <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-4">
                <ImageWithFallback
                  src={Array.isArray(xtraData?.gallery_images) && xtraData.gallery_images.length > 0
                    ? [xtraData.featured_img, ...xtraData.gallery_images][selectedImage] || xtraData.featured_img
                    : xtraData.featured_img}
                  alt={product_item?.name ?? 'Product'}
                  className="w-full h-full object-cover" />
              </div>

              {/* Thumbnails */}
              <div className="grid grid-cols-4 gap-4">
                {Array.isArray(xtraData?.gallery_images) ? (
                  [xtraData.featured_img, ...xtraData.gallery_images].map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`aspect-square rounded-xl overflow-hidden border-2 ${selectedImage === idx ? 'border-blue-600' : 'border-gray-200'}`}
                    >
                      <ImageWithFallback
                        src={img || ''}
                        alt={`${product_item?.name ?? 'Product'} ${idx + 1}`}
                        className="w-full h-full object-cover" />
                    </button>
                  ))
                ) : (
                  <p className="text-gray-500 col-span-4 text-center">No images available</p>
                )}
              </div>
            </div>

          </div>

          {/* Product Info */}
          <div>
            {/* Vendor Badge */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-gray-600">Sold by</span>
              <button
                onClick={() => navigate(`/vendor/${product.vendorSlug}`)}
                className="text-blue-600 hover:text-blue-700 hover:underline"
              >
                {product_item.vendor}
              </button>
              <Badge variant="outline" className="ml-2">Verified Seller</Badge>
            </div>

            {/* Title */}
            <h1 className="text-4xl text-gray-900 mb-4">{product_item.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${i < Math.floor(xtraData.average_rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'fill-none text-gray-300'}`} />
                ))}
              </div>
              <span className="text-gray-600 text-sm">
                {xtraData.average_rating} ({product.xtraData} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="mb-8">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-4xl text-gray-900">${product_item.price.toFixed(2)}</span>
                {product_item.originalPrice && product_item.originalPrice > 0 && product_item.originalPrice > product_item.price && (
                  <>
                    <span className="text-xl text-gray-500 line-through">
                      ${product_item.originalPrice.toFixed(2)}
                    </span>
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                      Save {Math.round(((product_item.originalPrice - product_item.price) / product_item.originalPrice) * 100)}%
                    </Badge>
                  </>
                )}
              </div>
              {/* <p className="text-gray-600">Minimum order: 10 units</p> */}
            </div>

            {/* Stock Status */}
            {product_item.stock > 0 ?
              <div className="flex items-center gap-2 mb-8 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span>In Stock - Ready to Ship</span>
              </div> : null}


            {/* Quantity */}
            <div className="mb-8">
              <label className="block text-gray-900 mb-3">Quantity</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 text-center border-x-2 border-gray-200 py-3" />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    +
                  </button>
                </div>
                <span className="text-gray-600">Available: {product_item.stock} units</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 mb-8">
              <Button
                size="lg"
                className="flex-1 bg-blue-600 hover:bg-blue-700 rounded-xl"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-xl"
              >
                <Heart className="w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-xl"
              >
                <Share2 className="w-5 h-5" />
              </Button>
            </div>

            {/* Accordion - Product Information */}
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="features">
                <AccordionTrigger className="text-gray-900 hover:text-gray-900">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-blue-600" />
                    <span>Product Features</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-2">
                    <div className="flex items-start gap-3">
                      <Truck className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-gray-900">Free Shipping</p>
                        <p className="text-sm text-gray-600">On orders over $500</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-gray-900">Buyer Protection</p>
                        <p className="text-sm text-gray-600">Secure payments & refunds</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Package className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-gray-900">Fast Fulfillment</p>
                        <p className="text-sm text-gray-600">Ships within 2-3 business days</p>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="shipping">
                <AccordionTrigger className="text-gray-900 hover:text-gray-900">
                  <div className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-blue-600" />
                    <span>Shipping Information</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-2 text-gray-600">
                    <p>This product ships from the seller's warehouse in California, USA.</p>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between">
                        <span>Processing Time:</span>
                        <span className="text-gray-900">2-3 business days</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Standard Shipping:</span>
                        <span className="text-gray-900">5-7 business days ($15)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Express Shipping:</span>
                        <span className="text-gray-900">2-3 business days ($35)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Free Shipping:</span>
                        <span className="text-gray-900">Orders over $500</span>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="reviews">
                <AccordionTrigger className="text-gray-900 hover:text-gray-900">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-blue-600" />
                    <span>Customer Reviews ({xtraData.review_count})</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-6 pt-2">
                    {xtraData.reviews?.map((review) => (
                      <div key={review.id} className="border-b border-gray-200 pb-4 last:border-0">
                        <div className="flex items-center gap-2 mb-2">

                          {/* ⭐ Dynamic Star Rating */}
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} />
                            ))}
                          </div>

                          {/* Name */}
                          <span className="text-gray-900">{review.author}</span>

                          {/* Time Ago */}
                          <span className="text-gray-500">• {timeAgo(review.date)}</span>
                        </div>

                        {/* Review Content */}
                        <p className="text-gray-600 text-sm">{review.content}</p>
                      </div>
                    ))}

                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
              <TabsTrigger
                value="description"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent px-6 py-4"
              >
                Description
              </TabsTrigger>
              <TabsTrigger
                value="specifications"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent px-6 py-4"
              >
                Specifications
              </TabsTrigger>
              <TabsTrigger
                value="warranty"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent px-6 py-4"
              >
                Warranty & Returns
              </TabsTrigger>
              <TabsTrigger
                value="care"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent px-6 py-4"
              >
                Care Instructions
              </TabsTrigger>
              <TabsTrigger
                value="local"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent px-6 py-4"
              >
                Also Available Locally
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="py-8">
              <div className="prose max-w-none">
                {xtraData.description || 'No Description'}
              </div>
            </TabsContent>

            <TabsContent value="specifications" className="py-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left column */}
                <div className="space-y-3">
                  {[
                    { label: "Category", value: product_item.category || "Uncategorized" },
                    { label: "Brand", value: product_item.brand || "Unknown Brand" },
                    { label: "SKU/UPC", value: product_item.upc || "N/A" },
                    { label: "Stock", value: product_item.stock ?? "N/A" },
                  ].map((item, idx) => (
                    <div key={idx} className="flex justify-between py-3 border-b border-gray-200">
                      <span className="text-gray-600">{item.label}:</span>
                      <span className="text-gray-900">{item.value}</span>
                    </div>
                  ))}
                </div>

                {/* Right column */}
                <div className="space-y-3">
                  {[
                    { label: "Vendor", value: product_item.vendor || "Default Vendor" },
                    { label: "Price", value: `$${product_item.price}` },
                    { label: "Original Price", value: product_item.originalPrice ? `$${product_item.originalPrice}` : "-" },
                    { label: "Accepts Offers", value: product_item.acceptsOffers ? "Yes" : "No" },
                  ].map((item, idx) => (
                    <div key={idx} className="flex justify-between py-3 border-b border-gray-200">
                      <span className="text-gray-600">{item.label}:</span>
                      <span className="text-gray-900">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>


            <TabsContent value="warranty" className="py-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl text-gray-900 mb-3 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-600" />
                    Warranty Coverage
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-6 space-y-3 text-gray-600">
                    <p>This product comes with a comprehensive 1-year manufacturer warranty covering:</p>
                    <ul className="space-y-2 ml-4">
                      <li>• Manufacturing defects</li>
                      <li>• Material quality issues</li>
                      <li>• Workmanship problems</li>
                    </ul>
                    <p className="text-sm pt-2">Warranty does not cover normal wear and tear or damage from misuse.</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl text-gray-900 mb-3 flex items-center gap-2">
                    <Award className="w-5 h-5 text-blue-600" />
                    Return Policy
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-6 space-y-3 text-gray-600">
                    <p>We offer a 30-day return policy for this product. Returns are accepted if:</p>
                    <ul className="space-y-2 ml-4">
                      <li>• Product is unused and in original condition</li>
                      <li>• Original packaging is intact</li>
                      <li>• All accessories and documentation are included</li>
                    </ul>
                    <p className="text-sm pt-2">Return shipping costs may apply. Contact seller for return authorization.</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="care" className="py-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl text-gray-900 mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Care & Maintenance
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="space-y-4 text-gray-600">
                      <div>
                        <p className="text-gray-900 mb-2">Cleaning Instructions:</p>
                        <ul className="space-y-1 ml-4">
                          <li>• Spot clean with mild soap and water</li>
                          <li>• Do not use harsh chemicals or bleach</li>
                          <li>• Air dry only - do not machine dry</li>
                        </ul>
                      </div>
                      <div>
                        <p className="text-gray-900 mb-2">Storage:</p>
                        <ul className="space-y-1 ml-4">
                          <li>• Store in a cool, dry place</li>
                          <li>• Keep away from direct sunlight</li>
                          <li>• Avoid extreme temperatures</li>
                        </ul>
                      </div>
                      <div>
                        <p className="text-gray-900 mb-2">Usage Tips:</p>
                        <ul className="space-y-1 ml-4">
                          <li>• Follow all safety guidelines included with product</li>
                          <li>• Inspect regularly for wear and tear</li>
                          <li>• Keep out of reach of children if applicable</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="local" className="py-8">
              <div className="space-y-6">
                <div className="bg-sky-50 border border-sky-200 rounded-xl p-6 mb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-sky-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg text-gray-900 mb-2">Shop Local, Support Your Community</h3>
                      <p className="text-gray-600 mb-3">
                        This product is also available at authorized local retailers near you. Support local businesses while getting the same quality product!
                      </p>
                      <button
                        onClick={() => navigate('/vendors/')}
                        className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors inline-flex items-center gap-2"
                      >
                        <Navigation className="w-4 h-4" />
                        Find Local Stores
                      </button>
                    </div>
                  </div>
                </div>

                <h3 className="text-xl text-gray-900 mb-4">Nearby Authorized Retailers</h3>
                <div className="space-y-4">
                  {vendors.map((store, index) => {
                    const addressObj = store.address || {};
                    const address = `${addressObj.street_1 || ''}${addressObj.street_2 ? ', ' + addressObj.street_2 : ''}, ${addressObj.city || ''}${addressObj.state ? ', ' + addressObj.state : ''}${addressObj.zip ? ', ' + addressObj.zip : ''}${addressObj.country ? ', ' + addressObj.country : ''}`;

                    // Weekly opening hours
                    const storeTime = store.store_nfi?.dokan_store_time || {};
                    const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                    const weeklyHours = weekdays.map(day => {
                      const dayInfo = storeTime[day];
                      if (!dayInfo || dayInfo.status !== 'open') return `${day.charAt(0).toUpperCase() + day.slice(1)}: Closed`;
                      return `${day.charAt(0).toUpperCase() + day.slice(1)}: ${dayInfo.opening_time.join(', ')} - ${dayInfo.closing_time.join(', ')}`;
                    }).join(' | '); // you can change separator

                    return (
                      <div
                        key={index}
                        className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-sky-500 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="text-lg text-gray-900">{store.store_name}</h4>
                              <Badge className="bg-green-100 text-green-800 border-green-300">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                {store.status || 'Authorized'}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                              <MapPin className="w-4 h-4" />
                              <span>{address}</span>
                            </div>
                            <div className="text-sm text-gray-600">{store.phone}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sky-600 mb-1">{store.distance_miles.toFixed(1)} miles</div>
                            <div className="text-sm text-gray-600 ">{weeklyHours}</div>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <Button
                            size="sm"
                            className="bg-sky-600 hover:bg-sky-700 rounded-lg"
                            onClick={() => navigate(`/vendor-detail/${store.store_name.toLowerCase().replace(/\s+/g, '-')}/`)}
                          >
                            View Store
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-lg"
                            onClick={() => window.open(
                              `https://www.google.com/maps/search/?api=1&query=${store.store_nfi.latitude},${store.store_nfi.longitude}`,
                              "_blank"
                            )}
                          >
                            <Navigation className="w-4 h-4 mr-2" />
                            Get Directions
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>


                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mt-6">
                  <h4 className="text-gray-900 mb-3">Why Shop Locally?</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Support your local community and small businesses</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Get personalized service and expert advice</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Try before you buy with in-store availability</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Same authorized brands, local relationships</span>
                    </li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        <div className="mt-20">
          <h2 className="text-3xl text-gray-900 mb-8">More from this Seller</h2>
          <div className="grid grid-cols-4 gap-4">
            {xtraData?.related_products?.slice(0, 4).map((relatedProduct) => (
              <button
                key={relatedProduct.id}
                onClick={() => navigate(`/product/${relatedProduct.id}`)}
                className="group text-left"
              >
                <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 mb-3">
                  <ImageWithFallback
                    src={relatedProduct.image}
                    alt={relatedProduct.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <h3 className="text-gray-900 mb-1 group-hover:text-blue-600">
                  {relatedProduct.name}
                </h3>
                <p className="text-gray-600">${relatedProduct.price}</p>
              </button>
            ))}
          </div>
        </div>

      </div>

    </div><AddToCartModal
        show={showModal}
        onClose={() => setShowModal(false)}
        productName={lastAddedProduct.name}
        productImage={lastAddedProduct.image} /></>
    
  );
}