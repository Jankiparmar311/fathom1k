import _404 from "@/components/common/_404";
import Unauthorized from "@/components/common/Unauthorized";
import {
  Activities,
  ActivityDetail,
  Booking,
  BookingConfirmation,
  BookingSuccessPage,
  Review,
} from "./routeImports";
import routesConstants from "./routesConstants";
import { Outlet } from "react-router-dom";
import DefaultRedirect from "@/components/common/DefaultRedirect";

const routesConfig = {
  common: [
    {
      path: routesConstants.UNAUTHORIZED,
      component: Unauthorized,
    },
    { path: routesConstants._404, component: _404 },
  ],
  private: [
    {
      path: "/",
      component: DefaultRedirect,
    },
    {
      path: "/company/:companyId",
      component: Outlet,
      children: [
        {
          index: true,
          component: Activities,
        },
        {
          path: `${routesConstants.ACTIVITY}/:id`,
          component: ActivityDetail,
        },
        {
          path: `${routesConstants.BOOKING}/:activityId`,
          component: Booking,
        },
        {
          path: routesConstants.BOOKING_SUCCESS,
          component: BookingSuccessPage,
        },
      ],
    },
    {
      path: "/company/:companyId/payment/:bookingId", // Payment route at the base level
      component: BookingConfirmation,
    },
    {
      path: `/company/:companyId/${routesConstants.REVIEW}/:bookingId`, // Payment route at the base level
      component: Review,
    },
  ],
  public: [
    // { path: "login", component: Login }
  ],
};

export default routesConfig;
