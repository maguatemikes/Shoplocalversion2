import {
  MapPin,
  DollarSign,
  FileText,
  Upload,
  Building,
  Phone,
  Mail,
  Globe,
  AlertCircle,
  CheckCircle2,
  Clock,
  Shield,
  Store,
  Users,
  ArrowRight,
  Settings,
  Award,
  Search,
  Building2,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { config } from "../lib/config";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { LoginModal } from "../components/auth/LoginModal";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Checkbox } from "../components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { motion } from "motion/react";

export function BecomeSeller() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const [currentStep, setCurrentStep] = useState<
    "search" | "verify" | "setup" | "confirm"
  >("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [isNewListing, setIsNewListing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdListingId, setCreatedListingId] = useState<string | null>(null);

  // API state
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    businessName: "",
    businessType: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "United States",
    phone: "",
    email: user?.email || "", // Pre-populate with logged-in user email
    website: "",
    contactName: user?.displayName || user?.name || "", // Pre-populate with user name
    contactRole: "",
    brandPartnerships: "",
    description: "",
    storeSetup: false,
    storeName: "",
    storeProducts: "",
    estimatedProducts: "",
  });
  const [proofDocument, setProofDocument] = useState<File | null>(null);
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [featuredImagePreview, setFeaturedImagePreview] = useState<
    string | null
  >(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ref to track the current axios cancel token
  const cancelTokenRef = useRef<any>(null);

  // Handle featured image upload
  const handleFeaturedImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setFeaturedImage(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setFeaturedImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Auto-populate user email and name when logged in
  useEffect(() => {
    if (user && user.email) {
      setFormData((prev) => ({
        ...prev,
        email: user.email || prev.email,
        contactName: user.displayName || user.name || prev.contactName,
      }));
      console.log("✅ Auto-populated email:", user.email);
      console.log(
        "✅ Auto-populated contact name:",
        user.displayName || user.name
      );
    }
  }, [user]);

  // Search businesses from API
  const searchBusinesses = useCallback(async (query: string) => {
    // Cancel previous request if it exists
    if (cancelTokenRef.current) {
      cancelTokenRef.current.cancel("New search initiated");
    }

    if (!query || query.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    // Create new cancel token
    cancelTokenRef.current = axios.CancelToken.source();

    try {
      // Fetch from GeoDirectory API
      const response = await axios.get(
        `https://shoplocal.kinsta.cloud/wp-json/geodir/v2/places`,
        {
          params: {
            search: query,
            per_page: 10,
          },
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          timeout: 10000,
          cancelToken: cancelTokenRef.current.token,
        }
      );

      // Fetch claimed status from Custom API
      const customApiResponse = await axios
        .get(`https://shoplocal.kinsta.cloud/wp-json/custom-api/v1/places`, {
          params: {
            page: 1,
            per_page: 100,
            _cache_bust: Date.now(), // Cache busting to get fresh claimed status
          },
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          timeout: 10000,
        })
        .catch(() => ({ data: { data: [] } })); // Graceful fallback

      const customApiData = customApiResponse.data?.data || [];
      console.log(
        "🔍 Custom API claimed status data (first 3):",
        customApiData.slice(0, 3)
      );

      // Map API results to our format
      const businesses = response.data.map((place: any) => {
        const titleString =
          typeof place.title === "string"
            ? place.title
            : place.title?.rendered || "Business";
        const imageUrl =
          place.featured_image?.src || place.images?.[0]?.src || "";

        let address = "";
        if (place.street) address = place.street;
        if (place.city) address += (address ? ", " : "") + place.city;
        if (place.region) address += (address ? ", " : "") + place.region;
        if (place.zip) address += " " + place.zip;

        let category = "General";
        if (place.post_category) {
          if (typeof place.post_category === "string") {
            category = place.post_category;
          } else if (Array.isArray(place.post_category)) {
            category = place.post_category
              .map((cat: any) => cat.name)
              .join(", ");
          } else if (typeof place.post_category === "object") {
            category = place.post_category.name;
          }
        }

        // Get claimed status from Custom API
        const customData = customApiData.find(
          (r: any) => String(r.ID) === String(place.id)
        );
        const isClaimed =
          customData?.claimed === 1 ||
          customData?.claimed === "1" ||
          customData?.claimed === true;

        console.log(
          `🔍 Listing "${titleString}" (ID: ${place.id}): claimed=${customData?.claimed}, isClaimed=${isClaimed}`
        );

        return {
          id: place.id,
          name: titleString,
          address: address || "Address not available",
          category: category,
          verified: isClaimed,
          image: imageUrl || "https://via.placeholder.com/200",
        };
      });

      setSearchResults(businesses);
    } catch (error) {
      if (axios.isCancel(error)) {
        // Request was cancelled, do nothing
        return;
      }
      console.error("Error searching businesses:", error);
      setSearchError("Unable to search businesses. Please try again.");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      searchBusinesses(searchQuery);
    }, 600);

    return () => {
      clearTimeout(timer);
    };
  }, [searchQuery, searchBusinesses]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cancelTokenRef.current) {
        cancelTokenRef.current.cancel("Component unmounted");
      }
    };
  }, []);

  // Set GeoDirectory categories on mount
  // Note: Using predefined categories that match GeoDirectory setup
  // If you need to fetch from API, update the taxonomy name in your WordPress GeoDirectory settings
  useEffect(() => {
    // Set categories directly (API endpoints not available yet)
    setCategories([
      { id: 1, name: "Retail Store (Products)", slug: "retail" },
      { id: 2, name: "Restaurant / Food Service", slug: "restaurant" },
      { id: 3, name: "Professional Services", slug: "professional" },
      { id: 4, name: "Health & Wellness", slug: "wellness" },
      { id: 5, name: "Home Services", slug: "home-services" },
      { id: 6, name: "Automotive", slug: "automotive" },
      { id: 7, name: "Beauty & Spa", slug: "beauty" },
      { id: 8, name: "Entertainment", slug: "entertainment" },
      { id: 9, name: "Other", slug: "other" },
    ]);
    setIsLoadingCategories(false);
  }, []);

  // Handle claim listing data passed from VendorDetail via navigation state
  useEffect(() => {
    const state = location.state as any;

    console.log("🔍 BecomeSeller - Checking location state:", state);

    if (state?.claimListing) {
      const listingData = state.claimListing;

      console.log("✅ BecomeSeller - Found claimListing data:", listingData);

      // Set the listing as selected
      setSelectedListing(listingData);
      setIsNewListing(false);

      // Pre-fill form with listing data
      setFormData((prev) => ({
        ...prev,
        businessName: listingData.name || "",
        businessType: listingData.category || "",
        address: listingData.address || "",
        city: listingData.city || "",
        state: listingData.state || "",
        zip: listingData.zip || "",
      }));

      // Move to verify step
      setCurrentStep("verify");

      console.log("📝 BecomeSeller - Pre-filled form and moved to verify step");

      // Clear the state to prevent re-triggering
      window.history.replaceState({}, document.title);
    } else {
      console.log(
        "❌ BecomeSeller - No claimListing data found in location state"
      );
    }
  }, [location.state]);

  const handleSelectListing = (listing: any) => {
    // CHECK AUTHENTICATION FIRST
    if (!isAuthenticated) {
      // Redirect to login with return URL and listing data
      navigate("/login", {
        state: {
          from: "/sell",
          claimListing: listing,
        },
      });
      return;
    }

    // If authenticated, proceed with claim
    setSelectedListing(listing);
    setIsNewListing(false);

    // Pre-fill form with listing data including category
    setFormData({
      ...formData,
      businessName: listing.name || "",
      businessType: listing.category || "",
      address: listing.address || "",
      city: listing.city || "",
      state: listing.state || "",
      zip: listing.zip || "",
    });

    setCurrentStep("verify");
  };

  const handleCreateNew = () => {
    setIsNewListing(true);
    setCurrentStep("verify");
  };

  // Handle form submission
  const handleSubmitClaim = async () => {
    console.log("🚀 ============================================");
    console.log("🚀 SUBMIT BUTTON CLICKED");
    console.log("🚀 ============================================");

    // 🔐 STEP 1: Validate user authentication
    console.log("🔐 Step 1: Checking authentication...");
    console.log("🔐 isAuthenticated:", isAuthenticated);
    console.log("🔐 user:", user);

    if (!isAuthenticated || !user) {
      console.error("❌ Authentication check failed");
      toast.error("You must be logged in to submit a claim");
      navigate("/login", { state: { from: "/sell" } });
      return;
    }
    console.log("✅ Authentication OK");

    // Validate required fields
    console.log("📋 Step 2: Validating form fields...");
    console.log("📋 Form Data:", formData);

    const missingFields = [];

    // Helper function to check if field has value
    const hasValue = (value: any) => {
      return (
        value !== null && value !== undefined && String(value).trim() !== ""
      );
    };

    if (!hasValue(formData.businessName)) missingFields.push("Business Name");
    if (!hasValue(formData.businessType)) missingFields.push("Business Type");
    if (!hasValue(formData.address)) missingFields.push("Address");
    if (!hasValue(formData.city)) missingFields.push("City");
    if (!hasValue(formData.state)) missingFields.push("State");
    if (!hasValue(formData.zip)) missingFields.push("ZIP");
    if (!hasValue(formData.phone)) missingFields.push("Phone");
    if (!hasValue(formData.email)) {
      console.log("❌ Email is missing! Value:", formData.email);
      missingFields.push("Email");
    }
    if (!hasValue(formData.contactName)) missingFields.push("Contact Name");
    if (!hasValue(formData.description)) {
      console.log("❌ Description is missing! Value:", formData.description);
      missingFields.push("Description");
    }

    if (missingFields.length > 0) {
      console.error("❌ Missing required fields:", missingFields);
      toast.error(
        `Please fill in all required fields: ${missingFields.join(", ")}`
      );
      return;
    }
    console.log("✅ All required fields present");

    console.log("📄 Step 3: Checking proof document...");
    console.log("📄 Proof Document:", proofDocument);

    if (!proofDocument) {
      console.error("❌ Proof document missing");
      toast.error("Please upload proof of authorization");
      return;
    }
    console.log("✅ Proof document OK");

    console.log("🎯 All validations passed! Starting submission...");
    setIsSubmitting(true);

    try {
      // Get authentication token from localStorage
      const token = localStorage.getItem("authToken");
      const wpCredentials = localStorage.getItem("wpCredentials");
      const loginMethod = localStorage.getItem("loginMethod");

      if (!token) {
        toast.error("You must be logged in to submit a claim");
        navigate("/login", { state: { from: "/sell" } });
        return;
      }

      // 🔐 STEP 2: Log claim context for audit trail
      console.log("🔐 CLAIM CONTEXT:", {
        claimant_user_id: user.id,
        claimant_email: user.email,
        claimant_name: user.name || user.email,
        listing_id: selectedListing?.id,
        listing_name: selectedListing?.name,
        is_claiming_existing: !isNewListing && !!selectedListing,
        timestamp: new Date().toISOString(),
      });

      // Note: If user doesn't have WP credentials, we'll use admin fallback below
      console.log("🔑 Auth Token Type:", {
        hasToken: !!token,
        hasWpCredentials: !!wpCredentials,
        loginMethod: loginMethod,
        tokenPrefix: token?.substring(0, 10) + "...",
      });

      // Choose correct API endpoint based on action type
      const isClaimingExisting = !isNewListing && selectedListing;

      // 🔐 STEP 3: Validate claim context
      if (isClaimingExisting && !selectedListing?.id) {
        console.error(
          "❌ CRITICAL: Attempting to claim without a valid listing"
        );
        toast.error("Invalid claim: No listing selected");
        setIsSubmitting(false);
        return;
      }

      // DEBUG: Log state to help identify the issue
      console.log("🐛 DEBUG - Submit State:", {
        isNewListing,
        selectedListing: selectedListing
          ? { id: selectedListing.id, name: selectedListing.name }
          : null,
        isClaimingExisting,
        formData: formData.businessName,
        user: { id: user.id, email: user.email },
      });

      // Determine the correct endpoint
      // Try rest_base first (if WordPress plugin set rest_base => 'claims')
      // Fallback to post type name if rest_base doesn't work
      const claimsEndpoints = [
        "https://shoplocal.kinsta.cloud/wp-json/wp/v2/claims", // rest_base (preferred)
        "https://shoplocal.kinsta.cloud/wp-json/wp/v2/shoplocal_claim", // post type name (fallback)
      ];

      const url = isClaimingExisting
        ? claimsEndpoints[0] // ✅ Try rest_base first
        : "https://shoplocal.kinsta.cloud/wp-json/geodir/v2/places"; // GeoDirectory API - Creates new listing

      console.log(
        `📍 Endpoint: ${
          isClaimingExisting
            ? "🏪 CLAIMS API (creates claim record, NOT new listing)"
            : "✨ GEODIR API (creates new listing)"
        }`,
        url
      );

      if (isClaimingExisting) {
        console.log("🔍 Endpoints to try:", claimsEndpoints);
      }

      // Determine authentication method
      let authHeader: string;
      let authMethod: string;

      console.log("🔍 Credential Check:", {
        hasWpCredentials: !!wpCredentials,
        wpCredentialsLength: wpCredentials?.length,
        wpCredentialsPreview: wpCredentials?.substring(0, 20) + "...",
        loginMethod: loginMethod,
        willUseUserCreds: !!(wpCredentials && loginMethod === "password"),
      });

      // 🔐 ALWAYS USE ADMIN CREDENTIALS FOR CLAIMS & MEDIA UPLOADS
      // This ensures consistent authentication regardless of how the user logged in
      // User accounts are tracked via the claimant_user_id field in the claim metadata
      authHeader = `Basic ${config.auth.basicAuth}`;
      authMethod = "Admin Application Password";
      console.log("🔑 Using admin application password");
      console.log("🔑 Username:", config.auth.username);
      console.log("🔑 Password:", config.auth.appPassword);
      console.log("🔑 Base64 Auth Header:", config.auth.basicAuth);
      console.log("🔑 Full Auth Header:", authHeader);
      console.log(
        "ℹ️ Using admin credentials for claim submission (user tracked via claimant_user_id)"
      );

      // 🧪 TEST: Verify admin credentials work
      try {
        console.log("🧪 Testing admin credentials...");
        const testResponse = await fetch(
          "https://shoplocal.kinsta.cloud/wp-json/wp/v2/users/me",
          {
            method: "GET",
            headers: {
              Authorization: authHeader,
            },
          }
        );

        if (testResponse.ok) {
          const testData = await testResponse.json();
          console.log(
            "✅ Admin credentials verified:",
            testData.name,
            "(ID:",
            testData.id,
            ")"
          );
        } else {
          const testError = await testResponse.json();
          console.error("❌ Admin credentials test failed:", testError);
          toast.error("Authentication error: Please contact support");
          setIsSubmitting(false);
          return;
        }
      } catch (testError) {
        console.error("❌ Error testing admin credentials:", testError);
        toast.error("Authentication error: Please contact support");
        setIsSubmitting(false);
        return;
      }

      let response;
      let data;

      console.log("📋 Submission Details:", {
        authMethod,
        hasWpCredentials: !!wpCredentials,
        loginMethod,
        isClaimingExisting,
        endpoint: url,
      });

      if (isClaimingExisting) {
        // ===== CLAIMING EXISTING LISTING =====
        console.log("🏪 ============================================");
        console.log("🏪 CLAIMING EXISTING LISTING (NOT CREATING NEW)");
        console.log("🏪 ============================================");
        console.log("🏪 Listing ID:", selectedListing.id);
        console.log("🏪 Listing Name:", selectedListing.name);
        console.log("🏪 Claimed By User:", user.email, "(ID:", user.id + ")");
        console.log("🏪 Action: Creating CLAIM record in WordPress");
        console.log("🏪 Endpoint: /wp/v2/shoplocal_claim (Custom Post Type)");
        console.log("🏪 ============================================");

        // Step 1: Upload proof document first (REQUIRED)
        let proofDocumentId = null;
        if (proofDocument) {
          try {
            const docFormData = new FormData();
            docFormData.append("file", proofDocument);
            docFormData.append(
              "title",
              `${formData.businessName} - Proof of Authorization`
            );

            console.log("📤 Uploading proof document...");
            console.log(
              "🔑 Using auth header:",
              authHeader.substring(0, 20) + "..."
            );

            const docResponse = await fetch(
              "https://shoplocal.kinsta.cloud/wp-json/wp/v2/media",
              {
                method: "POST",
                headers: {
                  Authorization: authHeader,
                },
                body: docFormData,
              }
            );

            if (docResponse.ok) {
              const docData = await docResponse.json();
              proofDocumentId = docData.id;
              console.log("✅ Proof document uploaded, ID:", proofDocumentId);
            } else {
              const docError = await docResponse.json();
              console.error("❌ Failed to upload proof document:", docError);
              console.error("❌ Response status:", docResponse.status);
              console.error("❌ Auth method used:", authMethod);
              throw new Error(
                `Failed to upload proof document: ${
                  docError.message || "Unknown error"
                }`
              );
            }
          } catch (docError) {
            console.error("❌ Error uploading proof document:", docError);
            toast.error("Failed to upload proof document. Please try again.");
            setIsSubmitting(false);
            return;
          }
        }

        // Step 2: Upload featured image if provided
        let featuredImageId = null;
        if (featuredImage) {
          try {
            const imgFormData = new FormData();
            imgFormData.append("file", featuredImage);
            imgFormData.append(
              "title",
              `${formData.businessName} - Featured Image`
            );

            console.log("📤 Uploading featured image...");

            const imgResponse = await fetch(
              "https://shoplocal.kinsta.cloud/wp-json/wp/v2/media",
              {
                method: "POST",
                headers: {
                  Authorization: authHeader,
                },
                body: imgFormData,
              }
            );

            if (imgResponse.ok) {
              const imgData = await imgResponse.json();
              featuredImageId = imgData.id;
              console.log("✅ Featured image uploaded, ID:", featuredImageId);
            }
          } catch (imgError) {
            console.error(
              "⚠️ Error uploading featured image (non-critical):",
              imgError
            );
            // Don't fail the entire submission if featured image fails
          }
        }

        // Step 3: Create the claim with all data + user context
        // ✅ Fields registered via register_rest_field() go at TOP LEVEL, not under 'meta'
        const claimData = {
          title: formData.businessName,
          status: "publish",

          // ⚡ CRITICAL: Set author to logged-in user, NOT admin
          // WordPress REST API respects the 'author' field if provided
          author: user?.id || 0,

          // Business Information (TOP LEVEL - matches register_rest_field() in plugin)
          business_type: formData.businessType,
          business_address: formData.address,
          business_city: formData.city,
          business_state: formData.state,
          business_zip: formData.zip,
          business_country: formData.country,
          business_phone: formData.phone,
          business_email: formData.email,
          website_url: formData.website || "",
          contact_name: formData.contactName,
          contact_role: formData.contactRole,
          brand_partnerships: formData.brandPartnerships || "",
          business_description: formData.description,

          // Claim Linkage - CRITICAL FIELDS
          listing_id: selectedListing.id.toString(),
          claim_status: "pending",

          // Uploaded Documents (attachment IDs)
          proof_document: proofDocumentId || 0,
          featured_image: featuredImageId || 0,
        };

        console.log("📤 ============================================");
        console.log("📤 SUBMITTING CLAIM (NOT NEW LISTING)");
        console.log("📤 ============================================");
        console.log("📤 POST to:", url);
        console.log("📤 👤 Logged-in User:", {
          id: user?.id,
          email: user?.email,
          displayName: user?.displayName,
          username: user?.username,
        });
        console.log("📤 👤 Author will be set to User ID:", user?.id);
        console.log("📤 Claim Data:", claimData);
        console.log(
          "📤 Claim Data (JSON):",
          JSON.stringify(claimData, null, 2)
        );
        console.log("📤 Form Data State:", formData);
        console.log("📤 This will create a shoplocal_claim post");
        console.log("📤 This will NOT create a new GeoDirectory listing");
        console.log(
          "📤 Existing listing #" + selectedListing.id + " remains unchanged"
        );
        console.log("📤 Admin will review and approve to transfer ownership");
        console.log("📤 ============================================");

        // 🔍 DETAILED REQUEST LOGGING
        const requestBody = JSON.stringify(claimData);
        console.log("🔍 REQUEST DETAILS:");
        console.log("🔍 URL:", url);
        console.log("🔍 Method: POST");
        console.log("🔍 Headers:", {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: authHeader.substring(0, 20) + "...",
        });
        console.log("🔍 Body Length:", requestBody.length, "characters");
        console.log("🔍 Body Preview:", requestBody.substring(0, 200) + "...");
        console.log("🔍 ============================================");

        // 📋 POSTMAN COMPARISON - Copy this exact payload to Postman
        console.log("📋 ============================================");
        console.log("📋 COPY THIS TO POSTMAN FOR COMPARISON:");
        console.log("📋 ============================================");
        console.log("📋 Endpoint:", url);
        console.log("📋 Method: POST");
        console.log("📋 Body (RAW JSON):");
        console.log(requestBody);
        console.log("📋 ============================================");

        // 🔬 FIELD-BY-FIELD COMPARISON
        console.log("🔬 ============================================");
        console.log("🔬 FIELD-BY-FIELD ANALYSIS:");
        console.log("🔬 ============================================");
        Object.keys(claimData).forEach((key) => {
          const value = claimData[key];
          const type = typeof value;
          const isEmpty = !value || value === "" || value === 0;
          console.log(
            `🔬 ${key}:`,
            value,
            `(${type})`,
            isEmpty ? "⚠️ EMPTY/FALSY" : "✅"
          );
        });
        console.log("🔬 ============================================");

        // Try the first endpoint
        response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: authHeader,
          },
          body: requestBody,
        });

        // Get response text first to handle both JSON and non-JSON responses
        const responseText = await response.text();
        console.log("📥 Raw Response Text:", responseText);

        // Try to parse as JSON
        try {
          data = JSON.parse(responseText);
        } catch (e) {
          console.error("⚠️ Response is not valid JSON:", e);
          data = { error: "Invalid JSON response", responseText };
        }

        console.log("📥 ============================================");
        console.log("📥 CLAIM API RESPONSE (Attempt 1: rest_base)");
        console.log("📥 ============================================");
        console.log("📥 Endpoint:", url);
        console.log("📥 Status:", response.status);
        console.log("📥 Status Text:", response.statusText);
        console.log("📥 Success:", response.ok);
        console.log(
          "📥 Response Headers:",
          Object.fromEntries(response.headers.entries())
        );
        console.log("📥 Response Data (parsed):", data);
        console.log(
          "📥 Response Data (stringified):",
          JSON.stringify(data, null, 2)
        );
        console.log("📥 ============================================");

        // If 404, try fallback endpoint
        if (response.status === 404 && claimsEndpoints[1]) {
          console.log("⚠️ First endpoint failed (404), trying fallback...");
          console.log("🔄 Fallback endpoint:", claimsEndpoints[1]);

          response = await fetch(claimsEndpoints[1], {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: authHeader,
            },
            body: JSON.stringify(claimData),
          });

          data = await response.json();

          console.log("📥 ============================================");
          console.log("📥 CLAIM API RESPONSE (Attempt 2: post_type)");
          console.log("📥 ============================================");
          console.log("📥 Endpoint:", claimsEndpoints[1]);
          console.log("📥 Status:", response.status);
          console.log("📥 Success:", response.ok);
          console.log("📥 Response Data:", data);
          console.log("📥 ============================================");
        }
      } else {
        // ===== CREATING NEW LISTING =====
        console.log("✨ Creating new listing");

        const geoData: Record<string, any> = {
          title: formData.businessName,
          content: formData.description,
          street: formData.address,
          country: formData.country,
          region: formData.state,
          city: formData.city,
          zip: formData.zip,
          phone: formData.phone,
          status: "pending",

          // ⚡ CRITICAL: Set author to logged-in user, NOT admin
          author: user?.id || 0,
        };

        if (formData.email && formData.email.includes("@")) {
          geoData.email = formData.email;
        }

        if (formData.website) {
          geoData.website = formData.website;
        }

        if (formData.brandPartnerships) {
          geoData.post_tags = formData.brandPartnerships;
        }

        console.log("🔄 ============================================");
        console.log("🔄 SUBMITTING NEW LISTING");
        console.log("🔄 ============================================");
        console.log("🔄 👤 Logged-in User:", {
          id: user?.id,
          email: user?.email,
          displayName: user?.displayName,
        });
        console.log("🔄 👤 Author will be set to User ID:", user?.id);
        console.log("🔄 Listing Data:", geoData);
        console.log("🔄 ============================================");

        response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: authHeader,
          },
          body: JSON.stringify(geoData),
        });

        data = await response.json();
      }

      // Handle response
      if (response.ok) {
        console.log(
          `✅ ${
            isClaimingExisting ? "Claim" : "Listing"
          } submitted successfully:`,
          data
        );

        // For NEW listings (not claims), upload featured image
        if (!isClaimingExisting && featuredImage && data.id) {
          try {
            const imageFormData = new FormData();
            imageFormData.append("file", featuredImage);
            imageFormData.append(
              "title",
              `${formData.businessName} - Featured Image`
            );

            const imageResponse = await fetch(
              "https://shoplocal.kinsta.cloud/wp-json/wp/v2/media",
              {
                method: "POST",
                headers: {
                  Authorization: authHeader,
                },
                body: imageFormData,
              }
            );

            if (imageResponse.ok) {
              const imageData = await imageResponse.json();
              console.log("✅ Featured image uploaded:", imageData);

              // Update listing with featured image
              await fetch(`${url}/${data.id}`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/x-www-form-urlencoded",
                  Accept: "application/json",
                  Authorization: authHeader,
                },
                body: new URLSearchParams({
                  featured_image: imageData.id.toString(),
                }),
              });
            }
          } catch (imageError) {
            console.error("Error uploading featured image:", imageError);
            // Don't fail the entire submission if image upload fails
          }
        }

        toast.success(
          `${
            isClaimingExisting ? "Claim" : "Listing"
          } submitted successfully! Your submission is pending review.`
        );
        setCurrentStep("confirm");
        setCreatedListingId(data.id);
        setShowSuccessModal(true);
      } else {
        console.error("❌ ============================================");
        console.error("❌ API ERROR");
        console.error("❌ ============================================");
        console.error("❌ Status:", response.status);
        console.error("❌ URL:", url);
        console.error("❌ Response:", data);
        console.error("❌ Is Claiming:", isClaimingExisting);
        console.error("❌ Auth Method:", authMethod);
        console.error("❌ ============================================");

        // Handle specific error codes
        if (response.status === 401) {
          console.error(
            "🔒 Authentication failed - credentials invalid or insufficient permissions"
          );
          toast.error(
            "Authentication failed. Please log in again with WordPress credentials."
          );

          // Clear invalid credentials
          localStorage.removeItem("authToken");
          localStorage.removeItem("wpCredentials");

          navigate("/login", { state: { from: "/sell" } });
          return;
        } else if (response.status === 403) {
          console.error("🔒 Forbidden - user does not have permission");
          toast.error(
            "You do not have permission to create listings. Please contact support."
          );
        } else if (response.status === 404) {
          console.error("🔍 Not Found - endpoint does not exist");
          console.error(
            "🔍 This likely means the WordPress plugin is not installed or activated"
          );
          console.error("🔍 Expected endpoint:", url);
          toast.error("Claims system not configured. Please contact support.");
        } else {
          throw new Error(
            data.message ||
              `Failed to ${
                isClaimingExisting ? "submit claim" : "create listing"
              }`
          );
        }
      }
    } catch (error: any) {
      console.error("❌ Error submitting:", error);

      // Check for authentication errors
      if (error.message && error.message.includes("not allowed to create")) {
        toast.error(
          "Authentication error. Please log in with valid WordPress credentials."
        );
        localStorage.removeItem("authToken");
        localStorage.removeItem("wpCredentials");
        navigate("/login", {
          state: {
            from: "/sell",
            message: "WordPress authentication required to submit listings",
          },
        });
      } else if (error.response?.status === 401 || error.status === 401) {
        toast.error("Your session has expired. Please login again.");
        localStorage.removeItem("authToken");
        localStorage.removeItem("wpCredentials");
        navigate("/login", { state: { from: "/sell" } });
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("Failed to submit. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-sky-600 to-sky-700 text-white py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full mb-4 sm:mb-6">
            <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm text-white">
              Join 250+ Authorized Local Sellers & Premium Brands
            </span>
          </div>
          <h1 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-4 sm:mb-6 px-4">
            Become an Authorized Seller on ShopLocal
          </h1>
          <p className="text-base sm:text-lg md:text-xl mb-3 sm:mb-4 text-sky-50 max-w-3xl mx-auto px-4">
            Get visibility alongside premium national brands and reach customers
            who value quality and community.
          </p>
          <p className="text-sm sm:text-base md:text-lg mb-6 sm:mb-8 text-sky-100 max-w-2xl mx-auto px-4">
            Whether you sell products or offer services (restaurants, lawyers,
            doctors, wellness), we'll promote you as an authorized local seller.
          </p>

          {/* Dual Positioning Highlight */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto mt-6 sm:mt-10 px-4">
            <div className="bg-white/10 backdrop-blur-md border border-white/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-left">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-400/20 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                <Store className="w-5 h-5 sm:w-6 sm:h-6 text-green-300" />
              </div>
              <h3 className="text-lg sm:text-xl text-white mb-2">
                Sell Brand-Name Products
              </h3>
              <p className="text-sky-100 text-xs sm:text-sm">
                Authorized to sell premium brands? We'll verify and badge you,
                giving customers confidence and boosting your sales.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-left">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-400/20 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-purple-300" />
              </div>
              <h3 className="text-lg sm:text-xl text-white mb-2">
                Offer Local Services
              </h3>
              <p className="text-sky-100 text-xs sm:text-sm">
                Restaurants, professionals, wellness—get listed and promoted to
                local customers actively searching for quality services.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Progress Steps */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex items-center justify-between">
            {[
              { step: "search", label: "Find or Create", icon: Search },
              { step: "verify", label: "Verify & Setup", icon: CheckCircle },
              { step: "setup", label: "Store Details", icon: Settings },
              { step: "confirm", label: "Launch", icon: Award },
            ].map((item, index) => {
              const Icon = item.icon;
              const isActive = currentStep === item.step;
              const isCompleted =
                ["search", "verify", "setup"].indexOf(currentStep) >
                ["search", "verify", "setup"].indexOf(item.step as any);

              return (
                <div key={item.step} className="flex-1 flex items-center">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                        isCompleted
                          ? "bg-green-500 border-green-500 text-white"
                          : isActive
                          ? "bg-sky-600 border-sky-600 text-white"
                          : "bg-white border-gray-300 text-gray-400"
                      }`}
                    >
                      <Icon className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                    </div>
                    <span
                      className={`text-[10px] sm:text-xs mt-1 sm:mt-2 hidden sm:block ${
                        isActive ? "text-gray-900" : "text-gray-500"
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>
                  {index < 3 && (
                    <div
                      className={`h-0.5 flex-1 ${
                        isCompleted ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 sm:py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* STEP 1: Search for Existing Business or Create New */}
          {currentStep === "search" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white border-2 border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl md:text-3xl text-gray-900 mb-3 sm:mb-4">
                  Step 1: Find Your Business
                </h2>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                  First, let's check if your business already exists on
                  ShopLocal. If it does, you can claim it. If not, you'll create
                  a new listing.
                </p>

                {/* Search Box */}
                <div className="relative mb-6 sm:mb-8">
                  <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by business name or address..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 border-2 border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:border-sky-500 text-sm sm:text-base md:text-lg"
                  />
                </div>

                {/* Search Results */}
                {searchQuery && (
                  <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                    {isSearching && (
                      <div className="text-center py-6 sm:py-8">
                        <div className="inline-block w-6 h-6 sm:w-8 sm:h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-2 sm:mb-3"></div>
                        <p className="text-xs sm:text-sm text-gray-600">
                          Searching businesses...
                        </p>
                      </div>
                    )}

                    {!isSearching && searchError && (
                      <div className="bg-red-50 border border-red-200 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center">
                        <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 mx-auto mb-2" />
                        <p className="text-xs sm:text-sm text-red-800">
                          {searchError}
                        </p>
                      </div>
                    )}

                    {!isSearching &&
                      !searchError &&
                      searchResults.length > 0 && (
                        <>
                          <h3 className="text-xs sm:text-sm text-gray-600">
                            Found {searchResults.length} matching businesses
                          </h3>
                          {searchResults.map((listing) => (
                            <div
                              key={listing.id}
                              className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border-2 rounded-lg sm:rounded-xl transition-colors ${
                                listing.verified
                                  ? "border-amber-200 bg-amber-50/50 cursor-not-allowed opacity-75 pointer-events-none"
                                  : "border-gray-200 hover:border-sky-500 cursor-pointer"
                              }`}
                              onClick={() => {
                                if (listing.verified) {
                                  toast.warning(
                                    "This listing has already been claimed by another seller"
                                  );
                                  return;
                                }
                                handleSelectListing(listing);
                              }}
                            >
                              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                <ImageWithFallback
                                  src={listing.image}
                                  alt={listing.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm sm:text-base text-gray-900 mb-0.5 sm:mb-1 truncate">
                                  {listing.name}
                                </h4>
                                <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600">
                                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                  <span className="truncate">
                                    {listing.address}
                                  </span>
                                </div>
                                <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1 truncate">
                                  {listing.category}
                                </div>
                              </div>
                              {listing.verified ? (
                                <>
                                  <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm flex-shrink-0">
                                    <Shield className="w-4 h-4" />
                                    Already Claimed
                                  </div>
                                  <Shield className="w-5 h-5 sm:hidden text-amber-600 flex-shrink-0" />
                                </>
                              ) : (
                                <>
                                  <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-sky-50 text-sky-700 rounded-full text-sm flex-shrink-0">
                                    <CheckCircle className="w-4 h-4" />
                                    Claim This
                                  </div>
                                  <CheckCircle className="w-5 h-5 sm:hidden text-sky-600 flex-shrink-0" />
                                </>
                              )}
                            </div>
                          ))}
                        </>
                      )}

                    {!isSearching &&
                      !searchError &&
                      searchResults.length === 0 && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl p-6 sm:p-8 text-center">
                          <Building2 className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-2 sm:mb-3" />
                          <p className="text-sm sm:text-base text-gray-600 mb-1 sm:mb-2">
                            No businesses found matching "{searchQuery}"
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500">
                            Try a different search or create a new listing below
                          </p>
                        </div>
                      )}
                  </div>
                )}

                {/* Create New Button */}
                <div className="border-t border-gray-200 pt-4 sm:pt-6">
                  <div className="bg-gradient-to-br from-sky-50 to-blue-50 border-2 border-sky-200 rounded-lg sm:rounded-xl p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-sky-600 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-base sm:text-lg text-gray-900 mb-1 sm:mb-2">
                          Don't see your business?
                        </h4>
                        <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
                          No problem! You can create a new listing and we'll
                          help you get set up as an authorized seller.
                        </p>
                        <button
                          onClick={() => navigate("/create-listing")}
                          className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 bg-sky-600 hover:bg-sky-700 text-white text-sm sm:text-base rounded-lg transition-colors inline-flex items-center justify-center gap-2"
                        >
                          Create New Listing
                          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Benefits Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                <div className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-4 sm:p-6">
                  <Users className="w-7 h-7 sm:w-8 sm:h-8 text-sky-600 mb-2 sm:mb-3" />
                  <h3 className="text-base sm:text-lg text-gray-900 mb-1 sm:mb-2">
                    Premium Positioning
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Showcase alongside exclusive brands and reach engaged
                    customers
                  </p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-4 sm:p-6">
                  <Shield className="w-7 h-7 sm:w-8 sm:h-8 text-sky-600 mb-2 sm:mb-3" />
                  <h3 className="text-base sm:text-lg text-gray-900 mb-1 sm:mb-2">
                    Verified Badge
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Get official verification for brand authorization and
                    credibility
                  </p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-4 sm:p-6 sm:col-span-2 md:col-span-1">
                  <DollarSign className="w-7 h-7 sm:w-8 sm:h-8 text-sky-600 mb-2 sm:mb-3" />
                  <h3 className="text-base sm:text-lg text-gray-900 mb-1 sm:mb-2">
                    Community Support
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    "Shop Local" badges drive community-focused customers to you
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Verify Ownership & Business Info */}
          {currentStep === "verify" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white border-2 border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8">
                <h2 className="text-xl sm:text-2xl md:text-3xl text-gray-900 mb-3 sm:mb-4">
                  {isNewListing
                    ? "Step 2: Create Your Business Profile"
                    : "Step 2: Verify Business Ownership"}
                </h2>
                <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
                  {isNewListing
                    ? "Tell us about your business so we can create your listing and verify your authorization."
                    : "Verify that you are authorized to represent this business and manage its listing."}
                </p>

                {/* Claim Context - WHO is claiming WHAT */}
                {!isNewListing && selectedListing && user && (
                  <div className="bg-gradient-to-r from-sky-50 to-blue-50 border-2 border-sky-300 rounded-xl p-4 sm:p-6 mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Shield className="w-5 h-5 text-sky-600" />
                      <h3 className="font-semibold text-gray-900">
                        Claim Verification Details
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Who is claiming */}
                      <div className="bg-white rounded-lg p-3 border border-sky-200">
                        <p className="text-xs text-gray-500 mb-1">
                          CLAIMING AS
                        </p>
                        <p className="font-medium text-gray-900">
                          {user.name || user.email}
                        </p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <p className="text-xs text-sky-600 mt-1">
                          User ID: {user.id}
                        </p>
                      </div>

                      {/* What is being claimed */}
                      <div className="bg-white rounded-lg p-3 border border-sky-200">
                        <p className="text-xs text-gray-500 mb-1">
                          LISTING TO CLAIM
                        </p>
                        <p className="font-medium text-gray-900">
                          {selectedListing.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {selectedListing.address}
                        </p>
                        <p className="text-xs text-sky-600 mt-1">
                          Listing ID: {selectedListing.id}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-start gap-2 p-2 bg-white/50 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-gray-700">
                        Upon approval, listing{" "}
                        <strong>#{selectedListing.id}</strong> will be
                        transferred to your account and you'll have full
                        management access.
                      </p>
                    </div>
                  </div>
                )}

                {/* Authentication Notice */}
                {(!localStorage.getItem("wpCredentials") ||
                  localStorage.getItem("loginMethod") !== "password") && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-6 sm:mb-8">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-xs sm:text-sm text-blue-800">
                        <p className="mb-1">
                          <strong>Note:</strong> Your form will be saved locally
                          for review. For immediate WordPress integration,
                          please log in with WordPress credentials.
                        </p>
                        <p className="text-xs text-blue-700">
                          Don't have WordPress credentials? No problem! Your
                          submission will still be processed manually.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Selected Business (if claiming) */}
                {!isNewListing && selectedListing && (
                  <div className="bg-sky-50 border border-sky-200 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-6 sm:mb-8">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-lg overflow-hidden flex-shrink-0">
                        <ImageWithFallback
                          src={selectedListing.image}
                          alt={selectedListing.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm sm:text-base text-gray-900 mb-0.5 sm:mb-1 truncate">
                          {selectedListing.name}
                        </h4>
                        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600">
                          <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="truncate">
                            {selectedListing.address}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Form */}
                <div className="space-y-4 sm:space-y-6">
                  {/* Business Name */}
                  <div>
                    <Label>Business Name *</Label>
                    <Input
                      placeholder="e.g., Fleet Feet Sports Boston"
                      className="mt-1 sm:mt-2"
                      value={formData.businessName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          businessName: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* Business Type */}
                  <div>
                    <Label>Business Type *</Label>
                    <select
                      className="w-full mt-1 sm:mt-2 px-3 sm:px-4 py-2 text-sm sm:text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:border-sky-500"
                      value={formData.businessType}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          businessType: e.target.value,
                        })
                      }
                      disabled={isLoadingCategories}
                    >
                      <option value="">
                        {isLoadingCategories
                          ? "Loading categories..."
                          : "Select type..."}
                      </option>
                      {categories.map((category) => (
                        <option
                          key={category.id || category.slug}
                          value={category.slug || category.name}
                        >
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Address */}
                  <div>
                    <Label>Business Address *</Label>
                    <Input
                      placeholder="123 Main Street"
                      className="mt-1 sm:mt-2 mb-3"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                    />
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <Label className="text-xs sm:text-sm">City *</Label>
                        <Input
                          placeholder="City"
                          className="mt-1"
                          value={formData.city}
                          onChange={(e) =>
                            setFormData({ ...formData, city: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label className="text-xs sm:text-sm">State *</Label>
                        <select
                          className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:border-sky-500 mt-1"
                          value={formData.state}
                          onChange={(e) =>
                            setFormData({ ...formData, state: e.target.value })
                          }
                        >
                          <option value="">Select State</option>
                          <option value="AL">Alabama</option>
                          <option value="AK">Alaska</option>
                          <option value="AZ">Arizona</option>
                          <option value="AR">Arkansas</option>
                          <option value="CA">California</option>
                          <option value="CO">Colorado</option>
                          <option value="CT">Connecticut</option>
                          <option value="DE">Delaware</option>
                          <option value="FL">Florida</option>
                          <option value="GA">Georgia</option>
                          <option value="HI">Hawaii</option>
                          <option value="ID">Idaho</option>
                          <option value="IL">Illinois</option>
                          <option value="IN">Indiana</option>
                          <option value="IA">Iowa</option>
                          <option value="KS">Kansas</option>
                          <option value="KY">Kentucky</option>
                          <option value="LA">Louisiana</option>
                          <option value="ME">Maine</option>
                          <option value="MD">Maryland</option>
                          <option value="MA">Massachusetts</option>
                          <option value="MI">Michigan</option>
                          <option value="MN">Minnesota</option>
                          <option value="MS">Mississippi</option>
                          <option value="MO">Missouri</option>
                          <option value="MT">Montana</option>
                          <option value="NE">Nebraska</option>
                          <option value="NV">Nevada</option>
                          <option value="NH">New Hampshire</option>
                          <option value="NJ">New Jersey</option>
                          <option value="NM">New Mexico</option>
                          <option value="NY">New York</option>
                          <option value="NC">North Carolina</option>
                          <option value="ND">North Dakota</option>
                          <option value="OH">Ohio</option>
                          <option value="OK">Oklahoma</option>
                          <option value="OR">Oregon</option>
                          <option value="PA">Pennsylvania</option>
                          <option value="RI">Rhode Island</option>
                          <option value="SC">South Carolina</option>
                          <option value="SD">South Dakota</option>
                          <option value="TN">Tennessee</option>
                          <option value="TX">Texas</option>
                          <option value="UT">Utah</option>
                          <option value="VT">Vermont</option>
                          <option value="VA">Virginia</option>
                          <option value="WA">Washington</option>
                          <option value="WV">West Virginia</option>
                          <option value="WI">Wisconsin</option>
                          <option value="WY">Wyoming</option>
                          <option value="DC">Washington DC</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-3">
                      <div>
                        <Label className="text-xs sm:text-sm">ZIP Code *</Label>
                        <Input
                          placeholder="ZIP/Postal Code"
                          className="mt-1"
                          value={formData.zip}
                          onChange={(e) =>
                            setFormData({ ...formData, zip: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label className="text-xs sm:text-sm">Country</Label>
                        <select
                          className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:border-sky-500 mt-1"
                          value={formData.country}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              country: e.target.value,
                            })
                          }
                        >
                          <option value="United States">United States</option>
                          <option value="Canada">Canada</option>
                          <option value="United Kingdom">United Kingdom</option>
                          <option value="Australia">Australia</option>
                          <option value="Germany">Germany</option>
                          <option value="France">France</option>
                          <option value="Italy">Italy</option>
                          <option value="Spain">Spain</option>
                          <option value="Mexico">Mexico</option>
                          <option value="Brazil">Brazil</option>
                          <option value="Argentina">Argentina</option>
                          <option value="Japan">Japan</option>
                          <option value="China">China</option>
                          <option value="India">India</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <Label>Business Phone *</Label>
                      <Input
                        placeholder="(617) 555-0123"
                        className="mt-1 sm:mt-2"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label>Business Email *</Label>
                      <Input
                        type="email"
                        placeholder="info@business.com"
                        className="mt-1 sm:mt-2"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  {/* Website */}
                  <div>
                    <Label>Business Website (Optional)</Label>
                    <Input
                      placeholder="https://www.yourbusiness.com"
                      className="mt-1 sm:mt-2"
                      value={formData.website}
                      onChange={(e) =>
                        setFormData({ ...formData, website: e.target.value })
                      }
                    />
                  </div>

                  {/* Your Role */}
                  <div>
                    <Label>Contact Information *</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-1 sm:mt-2">
                      <Input
                        placeholder="Your Full Name *"
                        value={formData.contactName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            contactName: e.target.value,
                          })
                        }
                        required
                      />
                      <Input
                        placeholder="Your Title (Optional - Owner, Manager, etc.)"
                        value={formData.contactRole}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            contactRole: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  {/* Brand Partnerships */}
                  <div>
                    <Label>Authorized Brand Partnerships (Optional)</Label>
                    <Input
                      placeholder="e.g., Nike, New Balance, Apple"
                      className="mt-1 sm:mt-2"
                      value={formData.brandPartnerships}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          brandPartnerships: e.target.value,
                        })
                      }
                    />
                    <p className="text-xs sm:text-sm text-gray-500 mt-1.5 sm:mt-2">
                      List brands you're authorized to sell. We'll verify these
                      separately and add verified badges.
                    </p>
                  </div>

                  {/* Business Description */}
                  <div>
                    <Label>Business Description *</Label>
                    <Textarea
                      placeholder="Tell customers about your business, what makes you special, and what you offer..."
                      className="mt-1 sm:mt-2"
                      rows={4}
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* Featured Image Upload */}
                  <div>
                    <Label>Featured Image (Optional)</Label>
                    <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
                      Upload a high-quality photo of your business, storefront,
                      or logo
                    </p>
                    <div
                      className="border-2 border-dashed border-gray-300 rounded-lg sm:rounded-xl p-6 sm:p-8 text-center hover:border-sky-500 transition-colors cursor-pointer"
                      onClick={() =>
                        document.getElementById("featured-image")?.click()
                      }
                    >
                      {featuredImagePreview ? (
                        <div className="relative">
                          <img
                            src={featuredImagePreview}
                            alt="Preview"
                            className="max-h-48 mx-auto rounded-lg mb-3"
                          />
                          <p className="text-sm text-gray-600">
                            {featuredImage?.name}
                          </p>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFeaturedImage(null);
                              setFeaturedImagePreview(null);
                            }}
                            className="mt-2 text-sm text-red-600 hover:text-red-700"
                          >
                            Remove Image
                          </button>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                          <p className="text-sm sm:text-base text-gray-600 mb-1 sm:mb-2">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500">
                            JPG, PNG (Max 5MB)
                          </p>
                        </>
                      )}
                      <input
                        type="file"
                        id="featured-image"
                        className="hidden"
                        accept="image/jpeg, image/png, image/jpg"
                        onChange={handleFeaturedImageChange}
                      />
                    </div>
                  </div>

                  {/* Proof Upload */}
                  <div>
                    <Label>Proof of Authorization *</Label>
                    <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
                      Upload documentation proving your authorization (business
                      license, partnership agreement, utility bill, etc.)
                    </p>
                    <div
                      className="border-2 border-dashed border-gray-300 rounded-lg sm:rounded-xl p-6 sm:p-8 text-center hover:border-sky-500 transition-colors cursor-pointer"
                      onClick={() =>
                        document.getElementById("proof-document")?.click()
                      }
                    >
                      {proofDocument ? (
                        <div>
                          <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-sky-600 mx-auto mb-3 sm:mb-4" />
                          <p className="text-sm sm:text-base text-gray-600 mb-1">
                            {proofDocument.name}
                          </p>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setProofDocument(null);
                            }}
                            className="mt-2 text-sm text-red-600 hover:text-red-700"
                          >
                            Remove Document
                          </button>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                          <p className="text-sm sm:text-base text-gray-600 mb-1 sm:mb-2">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500">
                            PDF, JPG, PNG (Max 10MB)
                          </p>
                        </>
                      )}
                      <input
                        type="file"
                        id="proof-document"
                        className="hidden"
                        accept="application/pdf, image/jpeg, image/png"
                        onChange={(e) =>
                          setProofDocument(e.target.files?.[0] || null)
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Alert */}
                <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-amber-50 border border-amber-200 rounded-lg sm:rounded-xl mt-6 sm:mt-8">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs sm:text-sm text-amber-800">
                    <p className="mb-1">
                      We'll review your submission within 3-5 business days.
                    </p>
                    <p>
                      You'll receive an email notification once your listing is
                      verified and approved.
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8">
                  <button
                    onClick={() => setCurrentStep("search")}
                    className="px-5 sm:px-6 py-2.5 sm:py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 text-sm sm:text-base rounded-lg transition-colors order-2 sm:order-1"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      handleSubmitClaim();
                    }}
                    disabled={isSubmitting}
                    className="flex-1 px-5 sm:px-6 py-2.5 sm:py-3 bg-sky-600 hover:bg-sky-700 text-white text-sm sm:text-base rounded-lg transition-colors flex items-center justify-center gap-2 order-1 sm:order-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit
                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Online Store Setup (Optional) */}
          {currentStep === "setup" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-8">
                <h2 className="text-3xl text-gray-900 mb-4">
                  Step 3: Online Store Setup (Optional)
                </h2>
                <p className="text-gray-600 mb-8">
                  Want to sell online in addition to your local listing? Set up
                  your vendor store.
                </p>

                {/* Benefits */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  <div className="bg-sky-50 border border-sky-200 rounded-xl p-4">
                    <CheckCircle className="w-6 h-6 text-sky-600 mb-2" />
                    <h4 className="text-gray-900 mb-1">Unified Profile</h4>
                    <p className="text-sm text-gray-600">
                      Your local listing and online store in one place
                    </p>
                  </div>
                  <div className="bg-sky-50 border border-sky-200 rounded-xl p-4">
                    <CheckCircle className="w-6 h-6 text-sky-600 mb-2" />
                    <h4 className="text-gray-900 mb-1">Dual Visibility</h4>
                    <p className="text-sm text-gray-600">
                      Show up in local searches AND product listings
                    </p>
                  </div>
                  <div className="bg-sky-50 border border-sky-200 rounded-xl p-4">
                    <CheckCircle className="w-6 h-6 text-sky-600 mb-2" />
                    <h4 className="text-gray-900 mb-1">National Reach</h4>
                    <p className="text-sm text-gray-600">
                      Sell to customers nationwide, not just locally
                    </p>
                  </div>
                  <div className="bg-sky-50 border border-sky-200 rounded-xl p-4">
                    <CheckCircle className="w-6 h-6 text-sky-600 mb-2" />
                    <h4 className="text-gray-900 mb-1">Easy Management</h4>
                    <p className="text-sm text-gray-600">
                      One dashboard to manage listings and products
                    </p>
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-4 mb-8">
                  <div className="border-2 border-sky-500 bg-sky-50 rounded-xl p-6 cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-sky-600 rounded-xl flex items-center justify-center">
                        <Store className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-gray-900 mb-1">
                          ✅ Yes, Set Up My Online Store
                        </h4>
                        <p className="text-sm text-gray-600">
                          I want to sell products online in addition to my local
                          presence
                        </p>
                      </div>
                    </div>

                    {/* Store Setup Fields */}
                    <div className="mt-6 space-y-4 pl-16">
                      <div>
                        <Label>Store Name / URL Slug *</Label>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-gray-500">
                            shoplocal.com/store/
                          </span>
                          <Input
                            placeholder="your-store-name"
                            className="flex-1"
                            value={formData.storeName}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                storeName: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>

                      <div>
                        <Label>What will you sell? *</Label>
                        <Textarea
                          placeholder="Describe your product categories (e.g., running shoes, athletic apparel, sports equipment)"
                          rows={3}
                          value={formData.storeProducts}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              storeProducts: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div>
                        <Label>Estimated Number of Products</Label>
                        <select
                          className="w-full mt-2 px-4 py-2 border-2 border-gray-300 rounded-lg"
                          value={formData.estimatedProducts}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              estimatedProducts: e.target.value,
                            })
                          }
                        >
                          <option>1-10 products</option>
                          <option>11-50 products</option>
                          <option>51-100 products</option>
                          <option>100+ products</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-colors cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-gray-900 mb-1">
                          No Thanks, Local Listing Only
                        </h4>
                        <p className="text-sm text-gray-600">
                          I only want a local business listing
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                  <button
                    onClick={() => setCurrentStep("verify")}
                    className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setCurrentStep("confirm")}
                    className="flex-1 px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    Complete Application
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Confirmation */}
          {currentStep === "confirm" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>

                <h2 className="text-4xl text-gray-900 mb-4">
                  Application Submitted! 🎉
                </h2>
                <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                  Your seller application has been submitted successfully. Our
                  team will review your information and verify your
                  authorization within 3-5 business days.
                </p>

                {/* What's Next */}
                <div className="bg-sky-50 border border-sky-200 rounded-xl p-6 mb-8 text-left max-w-2xl mx-auto">
                  <h3 className="text-lg text-gray-900 mb-4 text-center">
                    What happens next?
                  </h3>
                  <ol className="space-y-3 text-sm text-gray-700">
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-sky-600 text-white rounded-full flex items-center justify-center text-xs">
                        1
                      </span>
                      <span>
                        Our verification team reviews your business information
                        and documentation
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-sky-600 text-white rounded-full flex items-center justify-center text-xs">
                        2
                      </span>
                      <span>
                        We verify your brand authorization partnerships (if
                        applicable)
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-sky-600 text-white rounded-full flex items-center justify-center text-xs">
                        3
                      </span>
                      <span>
                        Your business listing goes live with verified badges
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-sky-600 text-white rounded-full flex items-center justify-center text-xs">
                        4
                      </span>
                      <span>
                        You'll receive your dashboard login credentials via
                        email
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-sky-600 text-white rounded-full flex items-center justify-center text-xs">
                        5
                      </span>
                      <span>
                        Start managing your profile and (if applicable)
                        uploading products
                      </span>
                    </li>
                  </ol>
                </div>

                {/* Next Steps */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <FileText className="w-8 h-8 text-sky-600 mx-auto mb-2" />
                    <h4 className="text-sm text-gray-900 mb-1">
                      Check Your Email
                    </h4>
                    <p className="text-xs text-gray-600">
                      We've sent a confirmation to your email
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <Award className="w-8 h-8 text-sky-600 mx-auto mb-2" />
                    <h4 className="text-sm text-gray-900 mb-1">
                      Prepare Assets
                    </h4>
                    <p className="text-xs text-gray-600">
                      Get your product photos and descriptions ready
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <Settings className="w-8 h-8 text-sky-600 mx-auto mb-2" />
                    <h4 className="text-sm text-gray-900 mb-1">
                      Review Seller Guide
                    </h4>
                    <p className="text-xs text-gray-600">
                      Learn best practices for success
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => navigate("/")}
                    className="px-8 py-4 bg-sky-600 hover:bg-sky-700 text-white rounded-xl transition-all"
                  >
                    Return to Homepage
                  </button>
                  <button
                    onClick={() => navigate("/vendors")}
                    className="px-8 py-4 bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-300 rounded-xl transition-all"
                  >
                    Browse Sellers
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* FAQ Section (Visible on Step 1 only) */}
      {currentStep === "search" && (
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl text-gray-900 mb-8 text-center">
              Frequently Asked Questions
            </h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>
                  What types of businesses can join?
                </AccordionTrigger>
                <AccordionContent>
                  We welcome both product retailers and service providers. This
                  includes authorized brand retailers, restaurants, professional
                  services (lawyers, doctors), wellness providers, and more. As
                  long as you're a legitimate local business or authorized
                  seller, you're welcome to apply.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>
                  Do I need to be authorized by brands to join?
                </AccordionTrigger>
                <AccordionContent>
                  Not necessarily! While having brand authorization gives you
                  verified badges and premium positioning, you can still join as
                  a local business without specific brand partnerships. However,
                  if you claim to sell certain brands, we will verify your
                  authorization.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>
                  What's the difference between a local listing and online
                  store?
                </AccordionTrigger>
                <AccordionContent>
                  A local listing shows your business location, hours, and
                  contact info—great for local visibility. An online store lets
                  you sell products nationwide through ecommerce. You can have
                  both for maximum visibility!
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger>Are there any fees?</AccordionTrigger>
                <AccordionContent>
                  Local business listings are free. If you set up an online
                  store, we charge a small commission on sales (typically 5-15%
                  depending on your plan). No upfront costs or monthly fees. You
                  only pay when you make sales.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5">
                <AccordionTrigger>
                  How long does verification take?
                </AccordionTrigger>
                <AccordionContent>
                  Typically 3-5 business days. We manually review each
                  application to ensure quality and authenticity. Brand
                  authorization verification may take slightly longer if we need
                  to contact brand representatives.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowSuccessModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Success Icon */}
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </motion.div>
            </div>

            {/* Content */}
            <div className="text-center">
              <h2 className="text-2xl text-gray-900 mb-3">
                {isNewListing
                  ? "🎉 Listing Created Successfully!"
                  : "✅ Claim Submitted Successfully!"}
              </h2>
              <p className="text-gray-600 mb-6">
                {isNewListing
                  ? "Your business listing has been submitted and is now pending review. We will notify you via email once it is approved."
                  : "Your claim has been submitted for review. We will verify your authorization and notify you via email once approved."}
              </p>

              {/* Details */}
              <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 mb-6 text-left">
                <h3 className="text-sm text-gray-900 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  What's Next?
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-sky-600 mt-0.5 flex-shrink-0" />
                    <span>Review process: 3-5 business days</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-sky-600 mt-0.5 flex-shrink-0" />
                    <span>Email confirmation sent</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-sky-600 mt-0.5 flex-shrink-0" />
                    <span>
                      {isNewListing
                        ? "Dashboard access after approval"
                        : "Listing ownership transfer after approval"}
                    </span>
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    navigate("/vendors");
                  }}
                  className="w-full px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl transition-colors"
                >
                  Browse Marketplace
                </button>
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    navigate("/");
                  }}
                  className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl transition-colors"
                >
                  Return to Homepage
                </button>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

export default BecomeSeller;
