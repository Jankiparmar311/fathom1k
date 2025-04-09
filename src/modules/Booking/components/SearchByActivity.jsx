import { useEffect } from "react";
import BookingCard from "./BookingCard";
import { getAllActivities } from "../slice";
import { useDispatch, useSelector } from "react-redux";
import SkeletonLoader from "@/components/common/loaders/SkeletonLoader";
import { useParams } from "react-router-dom";

const SearchByActivity = () => {
  const dispatch = useDispatch();
  const { companyId } = useParams();
  const { activities, loading, activityLoading } = useSelector(
    (state) => state.booking
  );
  useEffect(() => {
    dispatch(
      getAllActivities({
        company_id: companyId,
        // search: "",
        page_no: 1,
        page_record: 20,
      })
    );
  }, [companyId, dispatch]);
  return (
    <div className="grid-container">
      {loading || activityLoading ? (
        <>
          <SkeletonLoader width="100%" height="350px" />
          <SkeletonLoader width="100%" height="350px" />
          <SkeletonLoader width="100%" height="350px" />
        </>
      ) : activities?.length > 0 ? (
        activities.map((i, x) => <BookingCard key={x} data={i} />)
      ) : !activities && !activityLoading ? (
        <div className="no-activities">
          <h2>No activities found</h2>
        </div>
      ) : null}
    </div>
  );
};

export default SearchByActivity;
