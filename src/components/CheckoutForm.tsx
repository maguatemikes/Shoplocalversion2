import { useState } from "react";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";

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
  shippingMethod: { cost: number; id: string; tax: number; title: string; total: number };
}

function CheckoutForm({ billing, items, shippingMethod }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setLoading(true); // Start loader

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: elements.getElement(CardElement),
    });

    if (error) {
      console.log(error);
      setLoading(false);
      return;
    }

    console.log("Payment Method:", paymentMethod.id);

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
          shipping_lines: [
            {
              method_id: shippingMethod.id,
              method_title: shippingMethod.title,
              total: shippingMethod.cost,
            },
          ],
        }),
      }
    );

    const data = await res.json();
    console.log("Order:", data);

    setLoading(false); // Stop loader
  };

  return (
    <>
    {loading && (
      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none" style={{backgroundColor:'#ffffff8c'}} >
        <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" style={{border:'dotted',borderWidth:5}}></div>
      </div>
        )}


      <form id="CardForm" onSubmit={handleSubmit}>
        <CardElement className="mb-4 p-3 border rounded" />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg mt-4 hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? "Processing..." : "Place Order"}
        </button>
      </form>
    </>
  );
}

export default CheckoutForm;
