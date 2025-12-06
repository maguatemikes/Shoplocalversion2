import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Lock, Package, MapPin, Mail, Phone, User } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Checkbox } from '../components/ui/checkbox';
import { products } from '../lib/mockData';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { getShippingMethods } from "../api/woo/checkout";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import CheckoutForm from "../components/CheckoutForm";
import axios from 'axios';
const stripePromise = loadStripe("pk_test_51GqW2jEKcy3dIHlqwnpb3jz5ZLGk3wt5JiXmKht8CqdSNHRMRAGhsEQm8Fd8KNcFkGGReHmOrC17nj8yKjj5z5uo00abOdDkUt");
interface CartItem {
  id: number;
  name: string;
  price: number;
  vendor: string;
  image: string;
  quantity: number;
}

export function Checkout() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'shipping' | 'payment'>('shipping');
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [form, setForm] = useState({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  zip: "",
  country: "",
});

  const [shippingMethods, setShipping] = useState([]);
  const selected = shippingMethods.find(m => m.id === shippingMethod);
  const [selectedShipping, setSelectedShipping] = useState(selected);
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = selected? selected.cost : 0;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;
  const [countries,setCountries] = useState([]);
  const [states,setStates] = useState([]);


 

  useEffect(() => {
  const stored = JSON.parse(localStorage.getItem("cart") || "[]");
  setCartItems(stored);
  fetchCountries();
}, []); // <-- empty array ensures this runs only once, on mount

  
      const fetchCountries = async () => {
      try {
        const response = await axios.get(
          "https://api.countrystatecity.in/v1/countries",
          {
            headers: {
              "X-CSCAPI-KEY": "Q21EZTFjYUFVNkdiN0NxYkpIVEZIWlV6eVhBdW92RlVlM2JtUWRHYg==",
            },
          }
        );
        setCountries(response.data);
        console.log(response.data);
      } catch (error) {
        console.error("Error fetching countries:", error);
      }
    };
const handleCountryChange = (e) => {
  const countryCode = e.target.value;
  setForm({ ...form, country: countryCode, state: "", city: "" });
  fetch(`https://api.countrystatecity.in/v1/countries/${countryCode}/states`, {
    headers: { "X-CSCAPI-KEY": 'Q21EZTFjYUFVNkdiN0NxYkpIVEZIWlV6eVhBdW92RlVlM2JtUWRHYg==' }
  })
    .then(res => res.json())
    .then(data => setStates(data));
};

  
const handleChange = (e) => {
  const { id, value } = e.target;

  // Update the form state first
  setForm((prev) => {
    const updatedForm = { ...prev, [id]: value };

    // Run fetchShipping only if city, state, zip, and country are filled
    const { city, state, zip, country } = updatedForm;
    if (city && state && zip && country) {
      fetchShipping(updatedForm); // Pass the updated form if needed
    }

    return updatedForm;
  });
};
 
  const fetchShipping = async () => {
    const payload = {
      country:form.country,
      state:form.state,
      city: "Cebu",
      postcode: "6001",
      items: cartItems.map(item => ({
        product_id: item.id,
        qty: item.quantity,
      })),
    };

    try {
      const data = await getShippingMethods(payload);
      setShipping(data);
    } catch (err) {
      console.error("Error loading shipping:", err);
    }
  };
 
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl text-gray-900">Checkout</h1>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Lock className="w-4 h-4" />
              <span>Secure Checkout</span>
             
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-center gap-4">
            <div className={`flex items-center gap-2 ${step === 'shipping' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'shipping' ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}>
                1
              </div>
              <span>Shipping</span>
            </div>
            <div className="w-16 h-px bg-gray-300" />
            <div className={`flex items-center gap-2 ${step === 'payment' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'payment' ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}>
                2
              </div>
              <span>Payment</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Forms */}
          <div className="lg:col-span-2 space-y-6">
            {step === 'shipping' ? (
              <>
                {/* Shipping Address */}
                <div className="bg-white rounded-2xl p-8 border border-gray-200">
                  <div className="flex items-center gap-3 mb-6">
                    <MapPin className="w-6 h-6 text-blue-600" />
                    <h2 className="text-xl text-gray-900">Shipping Address</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        placeholder="John"
                        className="mt-1 rounded-lg"
                        value={form.firstName}
                        onChange={handleChange}
                      />
                    </div>

                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Doe"
                        className="mt-1 rounded-lg"
                        value={form.lastName}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        className="mt-1 rounded-lg"
                        value={form.email}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="(555) 123-4567"
                        className="mt-1 rounded-lg"
                        value={form.phone}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="address">Street Address</Label>
                      <Input
                        id="address"
                        placeholder="123 Main St"
                        className="mt-1 rounded-lg"
                        value={form.address}
                        onChange={handleChange}
                      />
                    </div>

                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        placeholder="San Francisco"
                        className="mt-1 rounded-lg"
                        value={form.city}
                        onChange={handleChange}
                      />
                    </div>

                    <div>
                      <Label htmlFor="state">State</Label>
                  <select id="state" onChange={handleChange} className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 border px-3 py-1 text-base bg-input-background transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive mt-1 rounded-lg" value={form.state}>
                    <option value="">Select state</option>
                    {states.map(s => <option key={s.iso2} value={s.iso2}>{s.name}</option>)}
                  </select>
                    </div>

                    <div>
                      <Label htmlFor="zip">ZIP Code</Label>
                      <Input
                        id="zip"
                        placeholder="94102"
                        className="mt-1 rounded-lg"
                        value={form.zip}
                        onChange={handleChange}
                      />
                    </div>

                    <div>
                      <Label htmlFor="country">Country</Label>
                     <select id="country" onChange={handleCountryChange}   className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 border px-3 py-1 text-base bg-input-background transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive mt-1 rounded-lg" value={form.country}>
                      <option value="">Select country</option>
                      {countries.map(c => <option key={c.iso2} value={c.iso2}>{c.name}</option>)}
                    </select>

                    </div>
                  </div>
                </div>

                {/* Shipping Method */}
                <div className="bg-white rounded-2xl p-8 border border-gray-200">
                  <div className="flex items-center gap-3 mb-6">
                    <Package className="w-6 h-6 text-blue-600" />
                    <h2 className="text-xl text-gray-900">Shipping Method</h2>
                  </div>

                  <RadioGroup value={shippingMethod} onValueChange={setShippingMethod}>
                  <div className="space-y-3">

                    {shippingMethods.map((method) => (
                      <div
                        key={method.id}
                        className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-blue-600 cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <RadioGroupItem value={method.id} id={method.id} />
                          <Label htmlFor={method.id} className="cursor-pointer">
                            <p className="text-gray-900">{method.title}</p>
                            <p className="text-sm text-gray-600">${method.cost} shipping fee</p>
                          </Label>
                        </div>

                        <span className="text-gray-900">${method.total}</span>
                      </div>
                    ))}

                  </div>
                </RadioGroup>

                </div>

                <Button
                  onClick={() => setStep('payment')}
                  className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl"
                  size="lg"
                >
                  Continue to Payment
                </Button>
              </>
            ) : (
              <>
                {/* Payment Method */}

                <div className="bg-white rounded-2xl p-8 border border-gray-200">
                  <div className="flex items-center gap-3 mb-6">
                    <CreditCard className="w-6 h-6 text-blue-600" />
                    <h2 className="text-xl text-gray-900">Payment Information</h2>
                  </div>

                  <div className="space-y-4">
                  {step === "payment" && (
                    <Elements stripe={stripePromise}>
                      <CheckoutForm
                            billing={{
                            firstName: form.firstName,
                            lastName: form.lastName,
                            email: form.email,
                            phone: form.phone,
                            address: form.address,
                            city: form.city,
                            state: form.state,
                            zip: form.zip,
                            country: form.country,
                          }}
                          items={cartItems.map(item => ({
                            product_id: item.id,
                            qty: item.quantity,
                          }))}
                          shippingMethod={{
                            id: selected.id,
                            cost: selected.cost,
                            tax: selected.tax,
                            title:selected.title,
                            total: selected.total
                          }}
                      
                      />
                    </Elements>
                  )}
                  </div>

                  <div className="mt-6 flex items-start gap-2">
                    <Checkbox id="save-card" />
                    <Label htmlFor="save-card" className="text-sm text-gray-600 cursor-pointer">
                      Save this card for future purchases
                    </Label>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={() => setStep('shipping')}
                    variant="outline"
                    className="flex-1 rounded-xl"
                    size="lg"
                  >
                    Back
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 sticky top-24">
              <h2 className="text-xl text-gray-900 mb-6">Order Summary</h2>

              {/* Items */}
              <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
                {cartItems.map((item, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            <ImageWithFallback
                              src={item.image}
                              alt={item.name}
                            />
                            <p>{item.name}</p>
                            <p>${(item.price * item.quantity).toFixed(2)}</p>

                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 truncate">{item.name}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      <p className="text-sm text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between text-xl mb-6">
                <span className="text-gray-900">Total</span>
                <span className="text-gray-900">${total.toFixed(2)}</span>
              </div>

              {/* Security Notice */}
              <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="w-4 h-4 text-green-600" />
                  <span className="text-gray-900">Secure Checkout</span>
                </div>
                <p>Your payment information is encrypted and secure.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}