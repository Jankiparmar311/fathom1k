import { Navigate, useParams } from "react-router-dom";
import DefaultRoute from "./DefaultRoute";

const DefaultRedirect = () => {
  const { companyId } = useParams();

  if (!companyId) {
    return <DefaultRoute />;
  }

  return <Navigate to={`/company/${companyId}`} replace />;
};

export default DefaultRedirect;
