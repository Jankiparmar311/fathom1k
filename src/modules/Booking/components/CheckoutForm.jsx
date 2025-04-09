/* eslint-disable react/prop-types */
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
  PaymentRequestButtonElement,
} from "@stripe/react-stripe-js";
import { useState, useEffect, useCallback } from "react";
import { BillingInfo } from "@/constants/images";
import { toast } from "react-toastify";
import { logToScreen } from "../utils";

// Replace with your actual Stripe Publishable Key
const stripePromise = loadStripe(
  import.meta.env.VITE_REACT_APP_STRIPE_PUBLISHABLE_KEY
);

export const CheckoutForm = ({
  totalPrice,
  setStripeToken,
  isFlag,
  loading,
  setLoading,
  setIsFlag,
  discountedAmount,
  taxes,
  taxBreakdown,
  applicationCharge,
  setPaymentMethod,
  isApplePay,
  setIsApplePay,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [cardError, setCardError] = useState("");
  const [expiryError, setExpiryError] = useState("");
  const [cvcError, setCvcError] = useState("");
  const [paymentRequest, setPaymentRequest] = useState(null);
  const [finalAmount, setFinalAmount] = useState(0);

  const [paymentRequestKey, setPaymentRequestKey] = useState(0);

  const calculateFinalAmount = useCallback(() => {
    let total = totalPrice + taxes + applicationCharge;
    if (discountedAmount > 0) {
      total -= discountedAmount;
    }
    return total;
  }, [totalPrice, taxes, applicationCharge, discountedAmount]);

  useEffect(() => {
    setFinalAmount(calculateFinalAmount());
  }, [calculateFinalAmount]);

  useEffect(() => {
    if (!stripe || finalAmount <= 0) return;
    console.log("finalAmount", finalAmount);
    if (finalAmount > 0) {
      const pr = stripe.paymentRequest({
        country: "US",
        currency: "usd",
        total: {
          label: "Total",
          amount: Math.round(finalAmount * 100), // cents
        },
        requestPayerName: true,
        requestPayerEmail: true,
      });

      pr.canMakePayment().then((result) => {
        if (result) {
          console.log("result", result);
          setIsApplePay(result.applePay);
          setPaymentRequest(pr);
          setPaymentRequestKey((prev) => prev + 1);
        } else {
          setIsApplePay(false);
        }
        // // Attach the event listener only once
        // if (!paymentRequest._paymentMethodHandlerAttached) {
        //   paymentRequest.on("paymentmethod", async (event) => {
        //     console.log("Received payment method:", event.paymentMethod);
        //     toast.success(`Payment Method ID: ${event.paymentMethod.id}`);
        //     setPaymentMethod(event.paymentMethod);
        //     // Process the payment method (e.g., send to backend)
        //     // ...
        //     setIsFlag(true);
        //     // Complete the payment request
        //     event.complete("success"); // or 'fail' based on the outcome
        //   });

        //   paymentRequest._paymentMethodHandlerAttached = true;
        // } else {
        //   setIsFlag(false);
        // }
      });
    }
  }, [stripe, finalAmount]);

  console.log("paymentRequest", paymentRequest);
  useEffect(() => {
    if (isFlag) {
      setToken();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFlag, cardError, expiryError, cvcError]);

  console.log("isApplePay", isApplePay);
  const handleStripeError = (event, fieldName, setError) => {
    if (event.error) {
      setError(event.error.message); // Set only Stripe validation error
    } else {
      setError(""); // Clear previous errors on valid input
    }
  };

  useEffect(() => {
    if (cardError || expiryError || cvcError) {
      setIsFlag(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardError, expiryError, cvcError]);

  const setToken = async () => {
    setLoading(true);

    if (!stripe || !elements) {
      setLoading(false);
      return;
    }

    try {
      const cardElement = elements.getElement(CardNumberElement);
      if (!cardElement) {
        setCardError("Card details are required.");
        setLoading(false);
        return;
      }

      // Create Token
      const { token, error: tokenError } = await stripe.createToken(
        cardElement
      );

      if (tokenError) {
        if (tokenError.code === "incorrect_number") {
          setCardError(tokenError.message);
        } else if (tokenError.code.includes("expiry")) {
          setExpiryError(tokenError.message);
        } else if (tokenError.code.includes("cvc")) {
          setCvcError(tokenError.message);
        } else {
          setCardError(tokenError.message);
        }
        setLoading(false);
        return;
      }

      if (token) {
        setStripeToken(token.id); // Save token ID

        setCardError("");
        setExpiryError("");
        setCvcError("");
      }
    } catch (err) {
      setCardError("An error occurred while processing the payment.");
    } finally {
      setLoading(false);
    }
  };

  // console.log("paymentRequest", paymentRequest);

  return (
    <>
      <div className="billing_info_card">
        <div className="billing_heading_main w-100 d-flex align-items-center justify-content-between">
          <div className="billing_heading">
            <img src={BillingInfo} alt="" />
            <h4 className="m-0">Billing Info</h4>
          </div>
        </div>
        {isApplePay ? (
          <PaymentRequestButtonElement
            options={{ paymentRequest }}
            // key={paymentRequestKey}
          />
        ) : (
          <p>Apple Pay not available</p>
        )}
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
                  options={{
                    placeholder: "Enter Card Number", // 👈 custom placeholder
                  }}
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
      </div>
      <div className="pay_now">
        <div className="payment_number">
          <div className="row subtotal-class">
            <div className="col-6">
              <h4>Subtotal: </h4>
            </div>
            <div className="col-6">
              <h3>${totalPrice?.toFixed(2)}</h3>
            </div>
          </div>
          {taxBreakdown && Object.keys(taxBreakdown).length === 0 && (
            <div className="row subtotal-class">
              <div className="col-6">
                <h4>Taxes: </h4>
              </div>
              <div className="col-6">
                <h3>${taxes?.toFixed(2) || 0}</h3>
              </div>
            </div>
          )}
          {taxBreakdown && Object.keys(taxBreakdown)?.length > 0
            ? Object.entries(taxBreakdown).map(([taxName, amount]) => (
                <div className="row subtotal-class" key={taxName}>
                  <div className="col-6">
                    <h4 className="text-capitalize">{taxName}:</h4>
                  </div>
                  <div className="col-6">
                    <h3>${amount.toFixed(2)}</h3>
                  </div>
                </div>
              ))
            : null}
          <div className="row subtotal-class">
            <div className="col-6">
              <h4>Booking Fees: </h4>
            </div>
            <div className="col-6">
              <h3>${applicationCharge?.toFixed(2) || 0}</h3>
            </div>
          </div>
          {discountedAmount > 0 && (
            <div className="row subtotal-class">
              <div className="col-6">
                <h4>Coupon discount: </h4>
              </div>
              <div className="col-6">
                <h3>(-) ${discountedAmount?.toFixed(2)}</h3>
              </div>
            </div>
          )}
          <div className="row total">
            <div className="col-6">
              <h4>Total: </h4>
            </div>
            <div className="col-6">
              <h3>
                <h3>${finalAmount?.toFixed(2)}</h3>
              </h3>
            </div>
          </div>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Processing..." : "Pay Now"}
        </button>
      </div>
    </>
  );
};

const PaymentPage = ({
  totalPrice,
  setStripeToken,
  isFlag,
  loading,
  setLoading,
  setIsFlag,
  discountedAmount,
  taxes,
  taxBreakdown,
  applicationCharge,
  setPaymentMethod,
  isApplePay,
  setIsApplePay,
}) => (
  <Elements stripe={stripePromise}>
    <CheckoutForm
      totalPrice={totalPrice}
      setStripeToken={setStripeToken}
      isFlag={isFlag}
      setLoading={setLoading}
      loading={loading}
      setIsFlag={setIsFlag}
      discountedAmount={discountedAmount}
      taxes={taxes}
      taxBreakdown={taxBreakdown}
      applicationCharge={applicationCharge}
      setPaymentMethod={setPaymentMethod}
      isApplePay={isApplePay}
      setIsApplePay={setIsApplePay}
    />
  </Elements>
);

export default PaymentPage;

// 👉 Send `clientSecret` from backend (call your API here)
// const res = await axiosFathom1k.post(CREATE_PAYMENT_INTENT, {
//   total_amount: finalAmount?.toFixed(2),
// });
// const { clientSecret } = await res.json();

// const { error: confirmError } = await stripe.confirmCardPayment(
//   clientSecret,
//   {
//     payment_method: event.paymentMethod.id,
//   }
// );

// if (confirmError) {
//   console.error("Payment failed", confirmError.message);
//   event.complete("fail");
// } else {
//   console.log("Payment succeeded");
//   event.complete("success");
// }
