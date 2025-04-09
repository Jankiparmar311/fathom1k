import { useLocation, useNavigate, useParams } from "react-router-dom";
import { PaymentSuccessImg } from "@/constants/images";

const BookingSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingId = location.state || "N/A";
  const { companyId } = useParams();

  const handleBack = () => {
    localStorage.clear();

    if (!companyId) navigate("/");
    navigate(`/company/${companyId}`); // Redirect to company's home page
  };

  return (
    <div className="booking-success">
      <div className="success-container">
        <img
          src={PaymentSuccessImg}
          alt="Booking Success"
          className="success-image"
        />
        <h2>
          Your booking is confirmed, and a confirmation email has been sent to
          you.
        </h2>
        <p className="booking-id">
          Booking ID: <strong>#{bookingId}</strong>
        </p>
        <button className="back-button" onClick={handleBack}>
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default BookingSuccessPage;
