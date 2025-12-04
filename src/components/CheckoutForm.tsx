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
}

function CheckoutForm({ billing, items }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e: React.FormEvent) => {
  
    e.preventDefault();

    if (!stripe || !elements) return;

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: elements.getElement(CardElement),
    });

    if (error) {
      console.log(error);
      return;
    }

    console.log("Payment Method:", paymentMethod.id);

    // Send to WooCommerce API
    const res = await fetch(
      "https://shoplocal.kinsta.cloud/wp-json/custom-api/v1/create-order",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payment_method: "stripe",
          payment_token: paymentMethod.id,
          billing:{
            first_name: billing.firstName,
            last_name: billing.lastName,
            address_1: billing.address,
            address_2: "",
            city:billing.city,
            state: billing.state,
            postcode: billing.zip,
            country: billing.country,
            email:billing.email,
            phone:billing.phone
            },
            
          items
        }),
      }
    );

    const data = await res.json();
    console.log("Order:", data);
  };

  return (
    <form id="CardForm" onSubmit={handleSubmit}>
      <CardElement />
    </form>
  );
}

export default CheckoutForm;
