import { WebsiteLogo } from "@/constants/images";
import { useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { companyId } = useParams(); // Extract companyId from URL

  const { globalConfigs } = useSelector((state) => state.booking);
  const isPaymentLocation = location?.pathname?.includes("/payment");
  const isReviewLocation = location?.pathname?.includes("/review");

  const handleBack = () => {
    // Prevent navigation beyond the activities list page
    if (
      !location.pathname.includes(`/company/${companyId}`) ||
      location.pathname === `/company/${companyId}`
    ) {
      return;
    }
    navigate(-1);
  };

  return (
    <div
      className={`${
        isPaymentLocation || isReviewLocation ? "header-logo" : "header"
      }`}
    >
      <div className="d-flex align-items-center gap-3">
        {!isPaymentLocation && !isReviewLocation && (
          <button className="btn-back" onClick={handleBack}>
            <i className="fa-solid fa-chevron-left"></i>
          </button>
        )}
        {(isPaymentLocation || isReviewLocation) && (
          <img
            // className={WebsiteLogo ? "website-logo" : "img-logo"}
            className={"website-logo"}
            src={globalConfigs?.logo || WebsiteLogo} // Set default if globalConfigs.logo is null/undefined
            onError={(e) => {
              e.currentTarget.onerror = null; // Prevent infinite loop
              e.currentTarget.src = WebsiteLogo; // Set fallback image
            }}
            alt="logo"
          />
        )}
        {!isPaymentLocation && !isReviewLocation && (
          <span>{globalConfigs?.company_name}</span>
        )}
      </div>
    </div>
  );
};
export default Header;
