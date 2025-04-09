/* eslint-disable react/prop-types */
import { axiosFathom1k } from "@/services/api";
import { VALIDATE_COUPON_CODE } from "@/services/url";
import { useState } from "react";
import Confetti from "react-confetti";
import { useParams } from "react-router-dom";
import SkeletonLoader from "@/components/common/loaders/SkeletonLoader";

const CouponComponent = ({
  totalAmount,
  setCouponId,
  setDiscountedAmount,
  taxes,
  discountedAmount,
  applicationCharge,
}) => {
  const [couponCode, setCouponCode] = useState();
  const [isValidate, setIsValidate] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);

  const { activityId } = useParams();

  const validateCouponCode = async () => {
    try {
      setIsValidate(true);
      setError("");
      setSuccessMessage("");
      setShowConfetti(false); // Reset confetti before validating
      if (!couponCode?.trim()) setError("Please enter promo code.");

      if (couponCode?.trim()) {
        const res = await axiosFathom1k.post(VALIDATE_COUPON_CODE, {
          coupon_code: couponCode?.trim(),
          item_id: activityId,
        });
        const details = res?.data?.data?.date;

        if (res?.data?.data?.status) {
          const totalDiscount =
            details?.rate_type === 0
              ? ((totalAmount + taxes + applicationCharge) * details?.rate) /
                100
              : details?.rate;
          setCouponCode("");
          setCouponId(details?.coupon_id);
          setDiscountedAmount(totalDiscount);
          setSuccessMessage(
            `Yay! You have saved $${totalDiscount?.toFixed(2)}`
          );

          if (totalDiscount > 0) {
            setShowConfetti(true); // Trigger confetti animation
          }
          setTimeout(() => setShowConfetti(false), 3000); // Stop confetti after 5 sec
        }
      }
    } catch (err) {
      setError(err?.response?.data?.message);
    } finally {
      setIsValidate(false);
    }
  };

  return (
    <div className="coupon-box p-3 border rounded position-relative">
      {showConfetti && (
        <Confetti width={600} height={120} gravity={1} recycle={false} />
      )}

      <h5>Promo Code</h5>
      <hr />
      {isValidate ? (
        <SkeletonLoader width="100%" height="40px" />
      ) : discountedAmount > 0 ? (
        <div className=" success-msg ">
          <span>{successMessage}</span>
          <i
            className="fa fa-times pointer"
            aria-hidden="true"
            onClick={() => {
              setSuccessMessage("");
              setDiscountedAmount(0);
            }}
          ></i>
        </div>
      ) : (
        <div className="coupon-div">
          <input
            type="text"
            className="form-control me-2"
            placeholder="Enter Promo Code"
            onChange={(e) => {
              setCouponCode(e.target.value);
              setError("");
              setSuccessMessage(""); // Reset messages
            }}
            value={couponCode}
          />
          <span
            className="apply-btn"
            onClick={validateCouponCode}
            disabled={isValidate}
          >
            APPLY
          </span>
        </div>
      )}
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};

export default CouponComponent;
