// import { useEffect, useState } from "react";
import SkeletonLoader from "./SkeletonLoader";

const Loader = () => {
  // const [loading, setLoading] = useState(false);

  // useEffect(() => {
  //   setLoading(true);
  // }, []);

  return (
    <div className="p-24">
      <SkeletonLoader width="100%" height="100vh" borderRadius={10} />
    </div>
  );
};

export default Loader;
