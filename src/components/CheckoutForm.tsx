import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { CreditCard } from "lucide-react";

interface CheckoutFormProps {
  billing: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  items: { product_id: number; qty: number }[];
  orderTotals: {
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
  };
  cartItems: Array<{
    id: number;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }>;
}

function CheckoutForm({
  billing,
  items,
  orderTotals,
  cartItems,
}: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testMode, setTestMode] = useState(false);

  const handleTestPayment = async () => {
    setIsProcessing(true);
    setError(null);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      // Mock order creation
      const mockOrderId = Math.floor(10000 + Math.random() * 90000);

      console.log("Test Order Created:", {
        orderId: mockOrderId,
        billing,
        items,
        totals: orderTotals,
      });

      // Save order data to sessionStorage for order success page
      sessionStorage.setItem(
        "lastOrder",
        JSON.stringify({
          items: cartItems,
          totals: orderTotals,
        })
      );

      // Clear cart after successful order
      localStorage.removeItem("cart");

      // Dispatch event to update cart count
      window.dispatchEvent(new Event("cartUpdated"));

      // Navigate to order success page
      navigate(`/order-success?orderId=${mockOrderId}`);
    } catch (err) {
      console.error("Test order error:", err);
      setError("Failed to create test order. Please try again.");
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // If test mode is enabled, use test payment
    if (testMode) {
      handleTestPayment();
      return;
    }

    if (!stripe || !elements) return;

    setIsProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setIsProcessing(false);
      return;
    }

    const { error: stripeError, paymentMethod } =
      await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
      });

    if (stripeError) {
      console.log(stripeError);
      setError(stripeError.message || "Payment failed");
      setIsProcessing(false);
      return;
    }

    console.log("Payment Method:", paymentMethod.id);

    try {
      // Send to WooCommerce API
      const res = await fetch(
        "https://shoplocal.kinsta.cloud/wp-json/custom-api/v1/create-order",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            payment_method: "stripe",
            payment_token: paymentMethod.id,
            billing: {
              first_name: billing.firstName,
              last_name: billing.lastName,
              address_1: billing.address,
              address_2: "",
              city: billing.city,
              state: billing.state,
              postcode: billing.zip,
              country: billing.country,
              email: billing.email,
              phone: billing.phone,
            },
            items,
          }),
        }
      );

      const data = await res.json();
      console.log("Order:", data);

      if (data.success || data.order_id) {
        // Save order data to sessionStorage for order success page
        sessionStorage.setItem(
          "lastOrder",
          JSON.stringify({
            items: cartItems,
            totals: orderTotals,
          })
        );

        // Clear cart after successful order
        localStorage.removeItem("cart");

        // Dispatch event to update cart count
        window.dispatchEvent(new Event("cartUpdated"));

        // Navigate to order success page
        navigate(
          `/order-success?orderId=${
            data.order_id ||
            data.id ||
            Math.floor(10000 + Math.random() * 90000)
          }`
        );
      } else {
        setError(data.message || "Failed to create order");
        setIsProcessing(false);
      }
    } catch (err) {
      console.error("Order creation error:", err);
      setError("Failed to create order. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <form id="CardForm" onSubmit={handleSubmit}>
      {/* Test Mode Toggle */}
      <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="testMode"
            checked={testMode}
            onChange={(e) => setTestMode(e.target.checked)}
            className="w-4 h-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
          />
          <label
            htmlFor="testMode"
            className="flex items-center gap-2 cursor-pointer"
          >
            <CreditCard className="w-5 h-5 text-amber-600" />
            <div>
              <span className="text-black">Enable Test Payment Mode</span>
              <p className="text-sm text-gray-600">
                Skip Stripe and simulate payment for testing
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Stripe Card Element (hidden in test mode) */}
      {!testMode && (
        <>
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#424770",
                  "::placeholder": {
                    color: "#aab7c4",
                  },
                },
                invalid: {
                  color: "#9e2146",
                },
              },
            }}
            className="p-3 border border-gray-200 rounded-lg"
          />
          <p className="mt-2 text-sm text-gray-500">
            Test card: 4242 4242 4242 4242 | Any future date | Any 3 digits
          </p>
        </>
      )}

      {/* Test Mode Info */}
      {testMode && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            ✓ Test mode enabled - Click "Place Order" to simulate a successful
            payment
          </p>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {isProcessing && (
        <div className="mt-4 text-center text-sm text-gray-600">
          {testMode
            ? "Processing test payment..."
            : "Processing your payment..."}
        </div>
      )}
    </form>
  );
}

export default CheckoutForm;
