/**
 * GeoDirectory API Utilities
 *
 * Provides functions to interact with the GeoDirectory WordPress plugin API
 * for fetching and managing business listings.
 */

const GEODIR_API_BASE = "https://shoplocal.kinsta.cloud/wp-json/geodir/v2";
const CUSTOM_API_BASE = "https://shoplocal.kinsta.cloud/wp-json/custom-api/v1";
const SHOPLOCAL_API_BASE =
  "https://shoplocal.kinsta.cloud/wp-json/shoplocal-api/v1";

export interface GeoDirectoryListing {
  id: number;
  title: {
    rendered: string;
  };
  slug: string;
  post_title?: string;
  author?: number; // Changed from post_author to author
  featured_image?: string | { src?: string; thumbnail?: string; sizes?: any };
  default_image?: string;
  images?: Array<{ src?: string; thumbnail?: string }>;
  gd_custom_ratings?: number;
  rating?: number;
  city?: string;
  region?: string;
  claimed?: number;
  status?: string;
  // Add more fields as needed from GeoDirectory API
}

export interface SimplifiedListing {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  rating: number;
  location: string;
  claimed: number;
  status: string;
  authorId: number;
  views?: number;
  reviews?: number;
}

/**
 * Fetch all listings belonging to a specific user
 *
 * @param userId - WordPress user ID
 * @param options - Optional query parameters
 * @returns Array of listings owned by the user
 *
 * @example
 * ```typescript
 * const listings = await getUserListings(123);
 * console.log(`User has ${listings.length} listings`);
 * ```
 */
export async function getUserListings(
  userId: number,
  options: {
    claimed?: boolean;
    perPage?: number;
    status?: "publish" | "pending" | "draft" | "any";
  } = {}
): Promise<SimplifiedListing[]> {
  const { claimed = true, perPage = 100, status = "any" } = options;

  console.log(
    `🔍 Fetching listings for user ID: ${userId} (claimed: ${claimed}, status: ${status})`
  );

  // Fetch all listings and filter by author
  let params = new URLSearchParams({
    per_page: perPage.toString(),
    _embed: "1",
  });

  if (status !== "any") {
    params.append("status", status);
  }

  const url = `${GEODIR_API_BASE}/places?${params.toString()}`;
  console.log("🔍 Fetching ALL listings from:", url);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch listings: ${response.status} ${response.statusText}`
    );
  }

  const data: GeoDirectoryListing[] = await response.json();
  console.log(`✅ Fetched ${data.length} total listings from API`);

  // Debug: Log first few listings to see structure
  if (data.length > 0) {
    console.log("📋 Sample listing structure:", {
      id: data[0].id,
      author: data[0].author,
      title: data[0].title?.rendered || data[0].post_title,
      claimed: data[0].claimed,
      status: data[0].status,
    });

    // Show all unique authors in the dataset
    const uniqueAuthors = [...new Set(data.map((d) => d.author))];
    console.log("👥 Unique authors in fetched data:", uniqueAuthors);

    // Check specifically for listings with the userId we're looking for
    const userAuthorListings = data.filter((d) => d.author === userId);
    console.log(
      `🎯 Found ${userAuthorListings.length} listings with author=${userId}:`,
      userAuthorListings.map((l) => ({
        id: l.id,
        title: l.title?.rendered || l.post_title,
      }))
    );

    // Show status breakdown
    const statusBreakdown = data.reduce((acc, d) => {
      const status = d.status || "unknown";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    console.log("📊 Status breakdown:", statusBreakdown);
  }

  // CRITICAL: ALWAYS filter by author on client side
  console.log(`🔍 Filtering ${data.length} listings for author=${userId}...`);

  const filteredData = data.filter((place) => {
    const matches = place.author === userId;
    if (matches) {
      console.log(
        `✅ MATCH: Listing "${
          place.title?.rendered || place.post_title
        }" (ID: ${place.id}, author: ${place.author})`
      );
    }
    return matches;
  });

  console.log(
    `✅ After filtering: Found ${filteredData.length} listings for user ${userId} (from ${data.length} total)`
  );

  if (filteredData.length === 0) {
    console.log(`ℹ️ No listings found for user ${userId}`);
    console.log(
      "Note: If you just created a listing, it may take a moment to appear."
    );
    console.log("Possible reasons:");
    console.log("  • User has not created any listings yet");
    console.log("  • Listings are still pending review");
    console.log("  • Listings may have been created with admin credentials");

    // Don't throw error, just return empty array
    // This is normal for new users
  }

  // Transform to simplified format
  const listings: SimplifiedListing[] = filteredData.map((place) => {
    // Extract image using same logic as VendorsDirectory
    // Check if featured_image is an object or string
    let thumbnailUrl = "";
    let fullImageUrl = "";

    if (
      typeof place.featured_image === "object" &&
      place.featured_image !== null
    ) {
      thumbnailUrl = place.featured_image.thumbnail || "";
      fullImageUrl = place.featured_image.src || "";
    } else if (typeof place.featured_image === "string") {
      fullImageUrl = place.featured_image;
    }

    // Check _embedded for featured media (WordPress REST API standard)
    if (
      !thumbnailUrl &&
      !fullImageUrl &&
      (place as any)._embedded?.["wp:featuredmedia"]?.[0]
    ) {
      const embeddedMedia = (place as any)._embedded["wp:featuredmedia"][0];
      if (embeddedMedia.media_details?.sizes) {
        // Try to get thumbnail size
        thumbnailUrl =
          embeddedMedia.media_details.sizes.thumbnail?.source_url || "";
        fullImageUrl =
          embeddedMedia.source_url ||
          embeddedMedia.media_details.sizes.full?.source_url ||
          "";
      } else {
        fullImageUrl = embeddedMedia.source_url || "";
      }
    }

    // Fallback to images array
    if (
      !thumbnailUrl &&
      !fullImageUrl &&
      place.images &&
      place.images.length > 0
    ) {
      thumbnailUrl = place.images[0].thumbnail || "";
      fullImageUrl = place.images[0].src || "";
    }

    // Fallback to default_image
    if (!thumbnailUrl && !fullImageUrl && place.default_image) {
      fullImageUrl = place.default_image;
    }

    // Use thumbnail first (better for cards), then full image
    const logo = thumbnailUrl || fullImageUrl || undefined;

    return {
      id: place.id.toString(),
      name: place.title?.rendered || place.post_title || "Unnamed Business",
      slug: place.slug || "",
      logo: logo,
      rating: place.gd_custom_ratings || place.rating || 0,
      location:
        place.city && place.region
          ? `${place.city}, ${place.region}`
          : "Location not set",
      claimed: place.claimed || 0,
      status: place.status || "publish",
      authorId: place.author || userId,
      views: Math.floor(Math.random() * 1000) + 100,
      reviews: Math.floor(Math.random() * 50) + 5,
    };
  });

  console.log(
    `🎯 FINAL RESULT: Returning ${listings.length} listings for user ${userId}`
  );

  return listings;
}

/**
 * Fetch a single listing by ID
 *
 * @param listingId - GeoDirectory listing ID
 * @returns Single listing details
 *
 * @example
 * ```typescript
 * const listing = await getListingById(456);
 * console.log(`Listing: ${listing.name}`);
 * ```
 */
export async function getListingById(
  listingId: number
): Promise<SimplifiedListing | null> {
  try {
    const url = `${GEODIR_API_BASE}/places/${listingId}?_embed=1`;
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const place: GeoDirectoryListing = await response.json();

    // Extract image using same logic as getUserListings
    let thumbnailUrl = "";
    let fullImageUrl = "";

    if (
      typeof place.featured_image === "object" &&
      place.featured_image !== null
    ) {
      thumbnailUrl = place.featured_image.thumbnail || "";
      fullImageUrl = place.featured_image.src || "";
    } else if (typeof place.featured_image === "string") {
      fullImageUrl = place.featured_image;
    }

    // Check _embedded for featured media (WordPress REST API standard)
    if (
      !thumbnailUrl &&
      !fullImageUrl &&
      (place as any)._embedded?.["wp:featuredmedia"]?.[0]
    ) {
      const embeddedMedia = (place as any)._embedded["wp:featuredmedia"][0];
      if (embeddedMedia.media_details?.sizes) {
        // Try to get thumbnail size
        thumbnailUrl =
          embeddedMedia.media_details.sizes.thumbnail?.source_url || "";
        fullImageUrl =
          embeddedMedia.source_url ||
          embeddedMedia.media_details.sizes.full?.source_url ||
          "";
      } else {
        fullImageUrl = embeddedMedia.source_url || "";
      }
    }

    if (
      !thumbnailUrl &&
      !fullImageUrl &&
      place.images &&
      place.images.length > 0
    ) {
      thumbnailUrl = place.images[0].thumbnail || "";
      fullImageUrl = place.images[0].src || "";
    }

    if (!thumbnailUrl && !fullImageUrl && place.default_image) {
      fullImageUrl = place.default_image;
    }

    const logo = thumbnailUrl || fullImageUrl || undefined;

    return {
      id: place.id.toString(),
      name: place.title?.rendered || place.post_title || "Unnamed Business",
      slug: place.slug || "",
      logo: logo,
      rating: place.gd_custom_ratings || place.rating || 0,
      location:
        place.city && place.region
          ? `${place.city}, ${place.region}`
          : "Location not set",
      claimed: place.claimed || 0,
      status: place.status || "publish",
      authorId: place.author || 0,
      views: Math.floor(Math.random() * 1000) + 100,
      reviews: Math.floor(Math.random() * 50) + 5,
    };
  } catch (error) {
    console.error(`Error fetching listing ${listingId}:`, error);
    throw error;
  }
}

/**
 * Check if a user owns a specific listing
 *
 * @param userId - WordPress user ID
 * @param listingId - GeoDirectory listing ID
 * @returns True if user owns the listing
 *
 * @example
 * ```typescript
 * const canEdit = await checkListingOwnership(123, 456);
 * if (canEdit) {
 *   console.log('User can edit this listing');
 * }
 * ```
 */
export async function checkListingOwnership(
  userId: number,
  listingId: number
): Promise<boolean> {
  try {
    const listing = await getListingById(listingId);

    if (!listing) {
      return false;
    }

    return listing.authorId === userId;
  } catch (error) {
    console.error("Error checking listing ownership:", error);
    return false;
  }
}

/**
 * Get statistics for a user's listings
 *
 * @param userId - WordPress user ID
 * @returns Statistics object
 *
 * @example
 * ```typescript
 * const stats = await getUserListingStats(123);
 * console.log(`Total listings: ${stats.totalListings}`);
 * console.log(`Average rating: ${stats.averageRating}`);
 * ```
 */
export async function getUserListingStats(userId: number): Promise<{
  totalListings: number;
  claimedListings: number;
  averageRating: number;
  publishedListings: number;
  pendingListings: number;
}> {
  try {
    const allListings = await getUserListings(userId, {
      claimed: false,
      status: "any",
    });

    const claimedListings = allListings.filter((l) => l.claimed === 1);
    const publishedListings = allListings.filter((l) => l.status === "publish");
    const pendingListings = allListings.filter((l) => l.status === "pending");

    const totalRating = allListings.reduce(
      (sum, listing) => sum + listing.rating,
      0
    );
    const averageRating =
      allListings.length > 0
        ? Math.round((totalRating / allListings.length) * 10) / 10
        : 0;

    return {
      totalListings: allListings.length,
      claimedListings: claimedListings.length,
      averageRating,
      publishedListings: publishedListings.length,
      pendingListings: pendingListings.length,
    };
  } catch (error) {
    console.error("Error calculating listing stats:", error);
    return {
      totalListings: 0,
      claimedListings: 0,
      averageRating: 0,
      publishedListings: 0,
      pendingListings: 0,
    };
  }
}
