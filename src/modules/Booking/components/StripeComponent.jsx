/* eslint-disable react/prop-types */
import { BillingInfo } from "@/constants/images";
import routesConstants from "@/routes/routesConstants";
import { axiosFathom1k } from "@/services/api";
import { CHECKOUT_DUE_BOOKING } from "@/services/url";
import {
  CardCvcElement,
  CardExpiryElement,
  CardNumberElement,
  Elements,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const stripePromise = loadStripe(
  import.meta.env.VITE_REACT_APP_STRIPE_PUBLISHABLE_KEY
);

const CheckoutForm = ({ companyId, totalUnpaidAmount, bookingFees }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { bookingId } = useParams();

  const [cardError, setCardError] = useState("");
  const [expiryError, setExpiryError] = useState("");
  const [cvcError, setCvcError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleStripeError = (event, fieldName, setError) => {
    if (event.error) {
      setError(event.error.message); // Set only Stripe validation error
    } else {
      setError(""); // Clear previous errors on valid input
    }
  };

  const handlePayment = async () => {
    setLoading(true);

    if (!stripe || !elements) {
      setLoading(false);
      return;
    }

    try {
      const { token, error } = await stripe.createToken(
        elements.getElement(CardNumberElement)
      );

      if (error) {
        if (error.code === "incorrect_number") {
          setCardError(error.message);
        } else if (error.code.includes("expiry")) {
          setExpiryError(error.message);
        } else if (error.code.includes("cvc")) {
          setCvcError(error.message);
        } else {
          setCardError(error.message);
        }
        setLoading(false);
        return;
      }

      if (token) {
        setCardError("");
        setExpiryError("");
        setCvcError("");
        if (totalUnpaidAmount > 0) {
          // If any due amount is there for paid after payment
          const res = await axiosFathom1k.post(CHECKOUT_DUE_BOOKING, {
            booking_id: bookingId,
            total_amount: Number(totalUnpaidAmount),
            stripe_card_token: token?.id,
            total_booking_charge: bookingFees,
          });
          if (res) {
            navigate(
              `/company/${companyId}/${routesConstants.BOOKING_SUCCESS}`,
              {
                state: res?.data?.data?.booking_ref_id,
              }
            );
            setLoading(false);
            elements?.getElement(CardNumberElement)?.clear();
            elements?.getElement(CardExpiryElement)?.clear();
            elements?.getElement(CardCvcElement)?.clear();
          }
        }
      }
    } catch (err) {
      setCardError("An error occurred while processing the payment.");
      setLoading(false);
    }
  };

  return (
    <div className="mb-4 mt-4 billing_info_card">
      <div className="billing_heading_main w-100 d-flex align-items-center justify-content-between">
        <div className="billing_heading">
          <img src={BillingInfo} alt="" />
          <h4 className="m-0">Billing Info</h4>
        </div>
      </div>
      <div className="payment-form">
        <div className="row billing_info">
          <div className="col-12 info_field">
            <label>Card Number</label>
            <div className="card-input">
              <CardNumberElement
                className="stripe-input"
                onChange={(event) =>
                  handleStripeError(event, "Card number", setCardError)
                }
              />
            </div>
            {cardError && <p className="error-message mb-0">{cardError}</p>}
          </div>
          <div className="col-sm-6 info_field">
            <label>Expiration Date</label>
            <div className="card-input">
              <CardExpiryElement
                className="stripe-input"
                onChange={(event) =>
                  handleStripeError(event, "Expiration date", setExpiryError)
                }
              />
            </div>
            {expiryError && <p className="error-message">{expiryError}</p>}
          </div>
          <div className="col-sm-6 info_field">
            <label>Security Code</label>
            <div className="card-input">
              <CardCvcElement
                className="stripe-input"
                onChange={(event) =>
                  handleStripeError(event, "Security code", setCvcError)
                }
              />
            </div>
            {cvcError && <p className="error-message">{cvcError}</p>}
          </div>
        </div>
      </div>
      <div className="d-flex justify-content-center mt-3">
        <button className="pay-btn" onClick={handlePayment} disabled={loading}>
          {loading ? "Processing..." : "Pay Now"}
        </button>
      </div>
    </div>
  );
};

const StripeComponent = ({ companyId, totalUnpaidAmount, bookingFees }) => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm
        companyId={companyId}
        totalUnpaidAmount={totalUnpaidAmount}
        bookingFees={bookingFees}
      />
    </Elements>
  );
};
export default StripeComponent;
