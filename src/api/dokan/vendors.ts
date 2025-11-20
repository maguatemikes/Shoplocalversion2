import axios from "axios";


// Base URL for public WooCommerce store API
const BASE_URL = "https://shoplocal.kinsta.cloud/wp-json/custom-api/v1";

// ------------------- Products -------------------
// ------------------- Nearby Vendors -------------------

export const getNearbyVendors = async (lat, lng, radius) => {
    console.log('entered detching vendorsdd');
  try {
    const response = await axios.get(`${BASE_URL}/vendors-nearby`, {
      params: { lat, lng, radius,}, // t=Date.now() to bust cache
      headers: { "Content-Type": "application/json" },
      maxBodyLength: Infinity,
    });

    return response.data;

  } catch (error) {
    console.error("Failed to fetch nearby vendors:", error);
    throw error;
  }
};