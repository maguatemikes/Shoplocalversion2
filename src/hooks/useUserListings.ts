/**
 * useUserListings Hook
 *
 * React hook for fetching and managing user's GeoDirectory listings
 * Provides loading states, error handling, and automatic refetching
 */

import { useState, useEffect, useCallback } from "react";
import {
  getUserListings,
  getUserListingStats,
  SimplifiedListing,
} from "../lib/geodirectory-api";
import { useAuth } from "../contexts/AuthContext";

interface UseUserListingsReturn {
  listings: SimplifiedListing[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  stats: {
    totalListings: number;
    claimedListings: number;
    averageRating: number;
    publishedListings: number;
    pendingListings: number;
  } | null;
}

interface UseUserListingsOptions {
  claimed?: boolean;
  status?: "publish" | "pending" | "draft" | "any";
  autoFetch?: boolean;
  includeStats?: boolean;
}

/**
 * Hook to fetch and manage user's listings
 *
 * @param options - Configuration options
 * @returns Listings data, loading state, error, and refetch function
 *
 * @example
 * ```typescript
 * function MyListingsPage() {
 *   const { listings, loading, error, refetch } = useUserListings({
 *     claimed: true,
 *     includeStats: true
 *   });
 *
 *   if (loading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error}</div>;
 *
 *   return (
 *     <div>
 *       <h1>My Listings ({listings.length})</h1>
 *       {listings.map(listing => (
 *         <div key={listing.id}>{listing.name}</div>
 *       ))}
 *       <button onClick={refetch}>Refresh</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useUserListings(
  options: UseUserListingsOptions = {}
): UseUserListingsReturn {
  const {
    claimed = true,
    status = "any",
    autoFetch = true,
    includeStats = false,
  } = options;

  const { user } = useAuth();
  const [listings, setListings] = useState<SimplifiedListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<UseUserListingsReturn["stats"]>(null);

  const fetchListings = useCallback(async () => {
    if (!user || !user.id) {
      setLoading(false);
      setError(null); // Don't show error if no user
      setListings([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log(`🔍 Fetching listings for user ${user.id}...`);

      // Fetch listings
      const userListings = await getUserListings(user.id, {
        claimed,
        status,
        perPage: 100,
      });

      setListings(userListings);
      console.log(`✅ Loaded ${userListings.length} listings`);

      // Fetch stats if requested
      if (includeStats) {
        console.log("📊 Calculating statistics...");
        const userStats = await getUserListingStats(user.id);
        setStats(userStats);
      }

      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch listings";
      console.error("❌ Error fetching user listings:", err);
      setError(errorMessage);
      setListings([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [user, claimed, status, includeStats]);

  // Auto-fetch on mount and when dependencies change
  useEffect(() => {
    if (autoFetch) {
      fetchListings();
    }
  }, [autoFetch, fetchListings]);

  return {
    listings,
    loading,
    error,
    refetch: fetchListings,
    stats,
  };
}

/**
 * Hook to fetch a single listing by ID
 *
 * @example
 * ```typescript
 * function ListingDetailPage({ listingId }: { listingId: number }) {
 *   const { listing, loading, error } = useListingById(listingId);
 *
 *   if (loading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error}</div>;
 *   if (!listing) return <div>Listing not found</div>;
 *
 *   return <h1>{listing.name}</h1>;
 * }
 * ```
 */
export function useListingById(listingId: number | null) {
  const [listing, setListing] = useState<SimplifiedListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!listingId) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchListing = async () => {
      setLoading(true);
      setError(null);

      try {
        const { getListingById } = await import("../lib/geodirectory-api");
        const data = await getListingById(listingId);

        if (isMounted) {
          setListing(data);
        }
      } catch (err) {
        if (isMounted) {
          const errorMessage =
            err instanceof Error ? err.message : "Failed to fetch listing";
          setError(errorMessage);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchListing();

    return () => {
      isMounted = false;
    };
  }, [listingId]);

  return { listing, loading, error };
}
