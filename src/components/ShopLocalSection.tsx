import { Star, ArrowRight, Heart, Navigation, Loader2, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { products } from '../lib/mockData';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { vendors } from '../lib/mockData';
import { calculateDistance, formatDistance } from '../lib/distance';

interface UserLocation {
  lat: number;
  lon: number;
}

interface ProductWithDistance {
  product: typeof products[0];
  distance?: number;
  vendorLocation?: string;
}

export function ShopLocalSection() {
  const navigate = useNavigate();
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [sortedProducts, setSortedProducts] = useState<ProductWithDistance[]>([]);

  // Calculate distances and sort products
  useEffect(() => {
    const localProducts = products.slice(0, 3);
    
    if (userLocation) {
      // Calculate distances for each product based on vendor location
      const productsWithDistance: ProductWithDistance[] = localProducts.map(product => {
        const vendor = vendors.find(v => v.slug === product.vendorSlug);
        
        if (vendor?.latitude && vendor?.longitude) {
          const distance = calculateDistance(
            userLocation.lat,
            userLocation.lon,
            parseFloat(vendor.latitude),
            parseFloat(vendor.longitude)
          );
          
          return {
            product,
            distance,
            vendorLocation: vendor.location
          };
        }
        
        return { product };
      });
      
      // Sort by distance (nearest first)
      const sorted = [...productsWithDistance].sort((a, b) => {
        if (a.distance === undefined) return 1;
        if (b.distance === undefined) return -1;
        return a.distance - b.distance;
      });
      
      setSortedProducts(sorted);
    } else {
      setSortedProducts(localProducts.map(product => ({ product })));
    }
  }, [userLocation]);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }

    setLocationLoading(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };
        setUserLocation(newLocation);
        setLocationLoading(false);
        console.log("📍 User location detected:", newLocation);
      },
      (error) => {
        setLocationLoading(false);
        let errorMessage = "Unable to detect your location.";
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location permission denied. Please enable location access.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
        }
        
        setLocationError(errorMessage);
        console.error("📍 Geolocation error:", errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 border border-[#b8e6fe] rounded-full mb-6">
            <span className="text-sm">🏪 Support Your Community</span>
          </div>
          <h2 className="text-4xl tracking-tight text-gray-900 mb-4">
            Shop Local Marketplace
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-6">
            Discover products from artisans and small businesses in your community. Shop small, shop near.
          </p>
          
          {/* Use My Location Button */}
          <div className="flex justify-center items-center gap-4">
            <Button
              variant="outline"
              onClick={handleUseMyLocation}
              disabled={locationLoading}
              className="rounded-lg"
            >
              {locationLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Getting Location...
                </>
              ) : userLocation ? (
                <>
                  <MapPin className="w-4 h-4 mr-2 text-green-600" />
                  Location Set
                </>
              ) : (
                <>
                  <Navigation className="w-4 h-4 mr-2" />
                  Use My Location
                </>
              )}
            </Button>
            
            {userLocation && (
              <span className="text-sm text-gray-600">
                Showing nearest products
              </span>
            )}
          </div>
          
          {locationError && (
            <div className="mt-4 max-w-md mx-auto bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {locationError}
            </div>
          )}
        </motion.div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {sortedProducts.map((productWithDistance, index) => (
            <motion.div
              key={productWithDistance.product.id}
              className="relative bg-white rounded-2xl border border-gray-100 overflow-hidden group hover:shadow-xl transition-all duration-300 cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onClick={() => handleProductClick(productWithDistance.product.id)}
            >
              {/* Local Badge */}
              <div className="absolute top-4 right-4 z-10 bg-[#0084d1] px-3 py-1 rounded-full shadow-lg">
                <p className="text-white text-xs">❤️ Local</p>
              </div>

              {/* Image */}
              <div className="relative h-64 overflow-hidden bg-gray-50">
                <ImageWithFallback 
                  src={productWithDistance.product.image} 
                  alt={productWithDistance.product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Product Info */}
                <div className="mb-4">
                  <h3 className="text-gray-900 mb-2">{productWithDistance.product.name}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{productWithDistance.product.description}</p>
                </div>

                {/* Rating & Price */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-[#FFB900] stroke-[#FFB900]" />
                    <span className="text-sm text-gray-900">{productWithDistance.product.rating}</span>
                    <span className="text-sm text-gray-500">({productWithDistance.product.reviewCount || 0})</span>
                  </div>
                  <div className="text-gray-900">${productWithDistance.product.price}</div>
                </div>

                {/* Distance - if available */}
                {productWithDistance.distance !== undefined && (
                  <div className="flex items-center gap-1.5 text-xs text-sky-600 mb-3">
                    <Navigation className="w-3.5 h-3.5" />
                    <span>{formatDistance(productWithDistance.distance)}</span>
                  </div>
                )}

                {/* Category Tag */}
                <div className="inline-flex items-center px-3 py-1.5 bg-gray-50 rounded-lg mb-4">
                  <span className="text-xs text-gray-600">{productWithDistance.product.category}</span>
                </div>

                {/* View Details Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProductClick(productWithDistance.product.id);
                  }}
                  className="w-full bg-[#0EA5E9] hover:bg-sky-600 text-white py-2.5 px-4 rounded-lg text-sm transition-colors"
                >
                  View Details
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Browse All Button */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <button
            onClick={() => navigate('/products/')}
            className="inline-flex items-center gap-2 bg-[#0084d1] hover:bg-[#0074b8] text-white px-6 py-3 rounded-lg transition-colors"
          >
            Browse All Local Products
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}