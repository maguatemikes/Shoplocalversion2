import axios from "axios";

// Base URL for public WooCommerce store API
const BASE_URL = "https://shoplocal.kinsta.cloud/wp-json/custom-api/v1";

// ------------------- Products -------------------
// ------------------- Nearby Vendors -------------------

export const getNearbyVendors = async (lat, lng, radius) => {
  console.log("entered detching vendorsdd");
  try {
    const response = await axios.get(`${BASE_URL}/vendors-nearby`, {
      params: { lat, lng, radius }, // t=Date.now() to bust cache
      headers: { "Content-Type": "application/json" },
      maxBodyLength: Infinity,
    });

    return response.data;
  } catch (error) {
    console.error("Failed to fetch nearby vendors:", error);
    throw error;
  }
};

export const getVendorDetail = async (slug) => {
  try {
    const response = await axios.get(`${BASE_URL}/vendor-by-username/${slug}?ddddd22d`, {
      headers: { "Content-Type": "application/json" },
      maxBodyLength: Infinity,
    });

    console.log("vendor", response.data);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch product detail:", error);
    throw error;
  }
};

export const getVendorDetailAndRecordVisit = async (vendorIdOrSlug) => {
  try {
    // 1️⃣ Record the visit (POST)
    await axios.post(
      `${BASE_URL}/visit/${vendorIdOrSlug}`,
      {},
      {
        headers: { "Content-Type": "application/json" },
        maxBodyLength: Infinity,
      }
    );
  } catch (error) {
    console.error("Failed to fetch vendor detail or record visit:", error);
    throw error;
  }
};
