import { combineReducers } from "@reduxjs/toolkit";
import bookingReducer from "@/modules/Booking/slice";
const reducer = combineReducers({
  booking: bookingReducer,
});
export default reducer;
