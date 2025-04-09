import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { getBookingDetailsById } from "../slice";
import { useParams } from "react-router-dom";
import SkeletonLoader from "@/components/common/loaders/SkeletonLoader";
import StarRatings from "react-star-ratings";
import * as Yup from "yup";
import { useFormik } from "formik";
import {
  ReviewCountRequired,
  ReviewMessageRequired,
} from "@/constants/SchemaValidation";
import { axiosFathom1k } from "@/services/api";
import { SAVE_FEEDBACK } from "@/services/url";
import { toast } from "react-toastify";

const ReviewPage = () => {
  const [isSubmit, setIsSubmit] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [themeColor, setThemeColor] = useState("#4a748a");

  const dispatch = useDispatch();
  const { bookingId } = useParams();
  const { bookingDetail, loading } = useSelector((state) => state.booking);
  const { globalConfigs } = useSelector((state) => state.booking);

  const initialValues = {
    booking_id: bookingId,
    review_count: 0,
    review_comment: "",
  };

  const validationSchema = Yup.object().shape({
    booking_id: Yup.string(),
    review_count: Yup.number()
      .min(1, ReviewCountRequired)
      .required(ReviewCountRequired),
    review_comment: Yup.string().required(ReviewMessageRequired).trim(),
  });

  useEffect(() => {
    if (globalConfigs?.theme_color) {
      setThemeColor(globalConfigs?.theme_color);
    }
  }, [globalConfigs]);

  useEffect(() => {
    if (bookingId) {
      dispatch(getBookingDetailsById(bookingId));
    }
  }, [dispatch, bookingId]);

  const onSubmit = async () => {
    try {
      setIsSubmit(true);
      const res = await axiosFathom1k.post(SAVE_FEEDBACK, values);
      if (res?.status === 200) {
        setIsSuccess(true);
        resetForm();
        setIsSubmit(false);
      }
    } catch (err) {
      setIsSubmit(false);
      toast.error(err?.response?.data?.message);
    }
  };

  const {
    values,
    validateField,
    setFieldValue,
    handleSubmit,
    errors,
    resetForm,
  } = useFormik({
    initialValues,
    onSubmit,
    validationSchema,
    validateOnChange: false,
    validateOnMount: false,
    validateOnBlur: false,
  });

  return (
    <div className="booking-container">
      {loading && bookingDetail === null ? (
        <SkeletonLoader width="100%" height="100vh" />
      ) : bookingDetail ? (
        <div className="invoice-details">
          <div className="company-details">
            <div className="company-div">
              <h6>COMPANY INFORMATION</h6>
              <h5>{bookingDetail?.company_name}</h5>
              <p>{bookingDetail?.company_address}</p>
              <p>{bookingDetail?.company_phone}</p>
            </div>
          </div>
          <div className="main-div mt-2">
            <div className="activity-details">
              <h6>ACTIVITY INFORMATION</h6>
              <h3>{`${bookingDetail?.activity_start_time} to ${bookingDetail?.activity_end_time}, ${bookingDetail?.activity_week_day}, ${bookingDetail?.activity_date}`}</h3>
              <p>{bookingDetail?.item_name}</p>
            </div>
            <div className="billing-details">
              <h6>BILLING INFORMATION</h6>
              <p>{bookingDetail?.full_name}</p>
              <p>{bookingDetail?.email_to_send}</p>
              <p>{bookingDetail?.user_phone}</p>
            </div>
          </div>
          {!bookingDetail?.is_reviewed && (
            <div className="feedback-box">
              <p>
                {`Thank you for choosing our service! We hope you had an amazing
              experience. We'd love to hear your thoughts—your feedback helps us
              improve and continue providing the best service possible!`}
              </p>
            </div>
          )}
          {!bookingDetail?.is_reviewed && !isSuccess ? (
            <form onSubmit={handleSubmit} className="review-form">
              <h3>Leave a Review</h3>
              <StarRatings
                rating={values?.review_count}
                starRatedColor={themeColor}
                changeRating={(newRating) => {
                  setFieldValue("review_count", newRating).then(() =>
                    validateField("review_count")
                  );
                }}
                numberOfStars={5}
                name="review_count"
                starDimension="45px"
                starSpacing="10px"
                starHoverColor={themeColor}
              />
              {errors?.review_count && (
                <p className="error-message">{errors?.review_count}</p>
              )}
              <textarea
                className="review-textarea mt-4"
                placeholder="Write your review..."
                value={values?.review_comment}
                onChange={(e) => {
                  setFieldValue("review_comment", e.target.value).then(() =>
                    validateField("review_comment")
                  );
                }}
                name="review_comment"
              ></textarea>
              {errors?.review_comment && (
                <p className="error-message mt-0 text-left">
                  {errors?.review_comment}
                </p>
              )}
              <div className="review-btn">
                <button
                  className="submit-button"
                  type="submit"
                  disabled={isSubmit}
                >
                  {isSubmit ? "Submitting" : "Submit Review"}
                </button>
              </div>
            </form>
          ) : !bookingDetail?.is_reviewed && isSuccess ? (
            <div className="thank-you-message">
              <h2>Thank You!</h2>
              <p>
                We truly appreciate your feedback! Your thoughts help us improve
                and serve you better.
              </p>
            </div>
          ) : (
            <div className="thank-you-message">
              <h2>
                You have already submitted your review. Thank you for sharing
                your feedback!
              </h2>
            </div>
          )}
        </div>
      ) : !loading && bookingDetail === null ? (
        <div className="no-detail">No details found</div>
      ) : null}
    </div>
  );
};

export default ReviewPage;
