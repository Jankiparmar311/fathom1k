import { useNavigate, useParams } from "react-router-dom";

const _404 = () => {
  const navigate = useNavigate();
  const { companyId } = useParams();

  const handleBack = () => {
    if (!companyId) navigate("/");
    navigate(`/company/${companyId}`); // Redirect to company's home page
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>404 - Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <button className="save-btn" onClick={handleBack}>
        Go Back to Home
      </button>
    </div>
  );
};

export default _404;
