import { useDispatch, useSelector } from "react-redux";
import StripeComponent from "../components/StripeComponent";
import { useEffect, useState } from "react";
import { getBookingDetailsById } from "../slice";
import { useParams } from "react-router-dom";
import SkeletonLoader from "@/components/common/loaders/SkeletonLoader";

const BookingConfirmation = () => {
  const [bookingFees, setBookingFees] = useState();

  const dispatch = useDispatch();
  const { bookingId } = useParams();
  const { bookingDetail, loading } = useSelector((state) => state.booking);

  useEffect(() => {
    if (bookingId) {
      dispatch(getBookingDetailsById(bookingId));
    }
  }, [dispatch, bookingId]);

  useEffect(() => {
    if (bookingDetail?.booking_fees > 0) {
      setBookingFees(
        +(
          (bookingDetail?.total_unpaid_amount * bookingDetail?.booking_fees) /
          100
        ).toFixed(2)
      );
    }
  }, [bookingDetail]);

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
            <div className="invoice-div">
              <h6>INVOICE INFORMATION </h6>
              <h5>{bookingDetail?.payment_id}</h5>
              <p>{bookingDetail?.payment_date} </p>
              <p>{bookingDetail?.payment_time}</p>
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
          <table className="order-summary">
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {bookingDetail?.order_detail?.personDetail?.length > 0 &&
                bookingDetail?.order_detail?.personDetail?.map((i, x) => (
                  <tr key={x}>
                    <td className="heading">{`Number of ${i?.personType}`}</td>
                    <td>{i?.totalPerson}</td>
                    <td>${i?.totalPersonPrice}</td>
                  </tr>
                ))}

              {bookingDetail?.order_detail?.is_accessory && (
                <>
                  <tr className="accessory-header">
                    <td className="heading">Used Accessories</td>
                    <td>
                      {
                        bookingDetail?.order_detail?.accessoryDetail
                          ?.accessoriesData?.length
                      }
                    </td>
                    <td>
                      $
                      {
                        bookingDetail?.order_detail?.accessoryDetail
                          ?.totalAccessoryPrice
                      }
                    </td>
                  </tr>
                  {bookingDetail?.order_detail?.accessoryDetail?.accessoriesData?.map(
                    (i, index) => (
                      <tr key={index} className="sub-item">
                        <td className="heading">— {i?.name}</td>
                        <td>{i?.quantity}</td>
                        <td>${i?.total_price}</td>
                      </tr>
                    )
                  )}
                </>
              )}
            </tbody>
          </table>

          <div className="amount-div">
            <p>
              <span className="text-bold">Subtotal:</span>{" "}
              <span>${bookingDetail?.sub_total?.toFixed(2)}</span>
            </p>

            <p>
              <span className="text-bold">Tax:</span>{" "}
              <span>${bookingDetail?.tax_total}</span>
            </p>

            {bookingDetail?.total_discount_applied > 0 && (
              <p>
                <span className="text-bold">Coupon Discount: (-)</span> $
                <span>{bookingDetail?.total_discount_applied}</span>
              </p>
            )}
            {bookingDetail?.total_unpaid_amount > 0 && (
              <h6 className="text-danger ">
                <span>Due Amount:</span> $
                {bookingDetail?.total_unpaid_amount?.toFixed(2)}
              </h6>
            )}
            {bookingFees > 0 && (
              <p>
                <span className="text-bold">Booking Fees:</span>{" "}
                <span>${bookingFees}</span>
              </p>
            )}
            <p>
              <span className="total-amount">Grand Total (Incl.Tax):</span>{" "}
              <span className="total-amount">
                $
                {/* {bookingDetail?.total_paid_amount > 0
                  ? (
                      bookingDetail?.sub_total +
                      bookingDetail?.tax_total +
                      bookingFees -
                      bookingDetail?.total_discount_applied
                    )?.toFixed(2)
                  : bookingDetail?.grand_total + bookingFees} */}
                {(bookingDetail?.grand_total + bookingFees)?.toFixed(2)}
              </span>
            </p>
          </div>

          {bookingDetail?.total_unpaid_amount > 0 ? (
            <StripeComponent
              companyId={bookingDetail?.company_id}
              totalUnpaidAmount={(
                bookingDetail?.total_unpaid_amount + bookingFees
              )?.toFixed(2)}
              bookingFees={bookingFees}
            />
          ) : (
            <div className="payment-done">
              Your payment has already been completed.{" "}
            </div>
          )}
        </div>
      ) : !loading && bookingDetail === null ? (
        <div className="no-detail">No details found</div>
      ) : null}
    </div>
  );
};

export default BookingConfirmation;
