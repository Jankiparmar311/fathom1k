// Use lazy loaded pages
import { lazy } from "react";
/* webpackChunkName: "Dashboard" */
export const Activities = lazy(() => import("@/modules/Booking/pages"));

export const ActivityDetail = lazy(() =>
  import("@/modules/Booking/pages/DetailPage")
);

export const Booking = lazy(() =>
  import("@/modules/Booking/pages/PaymentComponent")
);

export const BookingSuccessPage = lazy(() =>
  import("@/modules/Booking/pages/BookingSuccessPage")
);

export const BookingConfirmation = lazy(() =>
  import("@/modules/Booking/pages/BookingConfirmation")
);

export const Review = lazy(() => import("@/modules/Booking/pages/ReviewPage"));
