import { axiosFathom1k } from "@/services/api";
import {
  GET_ACTIVITY_DETAILS_BY_ID,
  GET_AVAILABILITY_DETAILS_BY_DATE,
  GET_AVAILABILITY_DETAILS_BY_MONTH,
  GET_BOOKING_DETAIL_BY_ID,
  GET_GLOBAL_CONFIGURATION,
  LIST_ALL_ACTIVITIES_URL,
} from "@/services/url";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";

const bookingState = {
  loading: false,
  activities: null,
  activityLoading: false,
  activityDetails: null,
  availabilitiesByDate: null,
  dateLoading: false,
  monthLoading: false,
  detailPageLoading: false,
  availabilitiesByMonth: null,
  bookingDetail: null,
  globalConfigs: null,
  companyPhoneNo: "",
  bookingFees: null,
};

// Get all activities with it details
export const getAllActivities = createAsyncThunk(
  `bookingThunk/getAllActivities`,
  async (payload, thunkAPI) => {
    try {
      const response = await axiosFathom1k.post(
        LIST_ALL_ACTIVITIES_URL,
        payload
      );

      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue(err?.response?.data?.statusCode);
    }
  }
);

// Get single activity details by activity id
export const getActivityDetailsById = createAsyncThunk(
  `bookingThunk/getActivityDetailsById`,
  async (payload, thunkAPI) => {
    try {
      const response = await axiosFathom1k.post(
        GET_ACTIVITY_DETAILS_BY_ID,
        payload
      );
      return response;
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message);
      return thunkAPI.rejectWithValue(err?.response?.data?.statusCode);
    }
  }
);

// Get activity availability details by date
export const getAvailabilityDetailsByDate = createAsyncThunk(
  `bookingThunk/getAvailabilityDetailsByDate`,
  async (payload, thunkAPI) => {
    try {
      const response = await axiosFathom1k.post(
        GET_AVAILABILITY_DETAILS_BY_DATE,
        payload
      );
      return response;
    } catch (err) {
      // toast.error(err?.response?.data?.message || err?.message);
      return thunkAPI.rejectWithValue(err?.response?.data?.statusCode);
    }
  }
);

// Get activity availability details by month
export const getAvailabilityDetailsByMonth = createAsyncThunk(
  `bookingThunk/getAvailabilityDetailsByMonth`,
  async (payload, thunkAPI) => {
    try {
      const response = await axiosFathom1k.post(
        GET_AVAILABILITY_DETAILS_BY_MONTH,
        payload
      );
      return response;
    } catch (err) {
      // toast.error(err?.response?.data?.message || err?.message);
      return thunkAPI.rejectWithValue(err?.response?.data?.statusCode);
    }
  }
);

// Get global configuration like font and theme color
export const getGlobalConfiguration = createAsyncThunk(
  `bookingThunk/getGlobalConfiguration`,
  async (payload, thunkAPI) => {
    try {
      const response = await axiosFathom1k.get(
        `${GET_GLOBAL_CONFIGURATION}/${payload}`
      );
      return response;
    } catch (err) {
      // toast.error(err?.response?.data?.message || err?.message);
      return thunkAPI.rejectWithValue(err?.response?.data?.statusCode);
    }
  }
);

// Get Booking details by id
export const getBookingDetailsById = createAsyncThunk(
  `bookingThunk/getBookingDetailsById`,
  async (payload, thunkAPI) => {
    try {
      const response = await axiosFathom1k.get(
        `${GET_BOOKING_DETAIL_BY_ID}/${payload}`
      );
      return response;
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message);
      return thunkAPI.rejectWithValue(err?.response?.data?.statusCode);
    }
  }
);

const bookingSlice = createSlice({
  name: "booking",
  initialState: bookingState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setAvailabilityDate: (state, action) => {
      state.availabilitiesByDate = action.payload;
    },
    setCompanyPhoneNo: (state, action) => {
      state.companyPhoneNo = action.payload;
    },
  },

  extraReducers: (builder) => {
    /*  Get All Activities By Date */
    builder.addCase(getAllActivities.pending, (state) => {
      state.activityLoading = true;
    });
    builder.addCase(getAllActivities.fulfilled, (state, action) => {
      state.activityLoading = false;
      state.activities = action.payload?.data?.data?.listItems;
    });
    builder.addCase(getAllActivities.rejected, (state) => {
      state.activityLoading = false;
      state.activities = null;
    });

    /*  Get Activity Details By Id */
    builder.addCase(getActivityDetailsById.pending, (state) => {
      state.detailPageLoading = true;
    });
    builder.addCase(getActivityDetailsById.fulfilled, (state, action) => {
      state.detailPageLoading = false;
      state.activityDetails = action.payload?.data?.data;
    });
    builder.addCase(getActivityDetailsById.rejected, (state) => {
      state.detailPageLoading = false;
      state.activityDetails = null;
    });

    /*  Get activity availability details by date */
    builder.addCase(getAvailabilityDetailsByDate.pending, (state) => {
      state.dateLoading = true;
    });
    builder.addCase(getAvailabilityDetailsByDate.fulfilled, (state, action) => {
      state.dateLoading = false;
      state.availabilitiesByDate =
        action.payload?.data?.data?.listItemAvailabilityDetailByDate;
      state.companyPhoneNo = action?.payload?.data?.data?.company_phone_no;
      state.bookingFees = action?.payload?.data?.data?.booking_fees;
    });
    builder.addCase(getAvailabilityDetailsByDate.rejected, (state) => {
      state.dateLoading = false;
      state.availabilitiesByDate = null;
    });

    /*  Get activity availability details by month */
    builder.addCase(getAvailabilityDetailsByMonth.pending, (state) => {
      state.monthLoading = true;
    });
    builder.addCase(
      getAvailabilityDetailsByMonth.fulfilled,
      (state, action) => {
        state.monthLoading = false;
        state.availabilitiesByMonth =
          action.payload?.data?.data?.listItemAvailabilityDetailByMonth;
        state.companyPhoneNo = action?.payload?.data?.data?.company_phone_no;
      }
    );
    builder.addCase(getAvailabilityDetailsByMonth.rejected, (state) => {
      state.monthLoading = false;
      state.availabilitiesByMonth = null;
    });

    /*  Set global configuration of company */
    builder.addCase(getGlobalConfiguration.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getGlobalConfiguration.fulfilled, (state, action) => {
      state.loading = false;
      state.globalConfigs = action.payload?.data?.data;
    });
    builder.addCase(getGlobalConfiguration.rejected, (state) => {
      state.loading = false;
      state.globalConfigs = null;
    });

    /*  Set booking details by booking id  */
    builder.addCase(getBookingDetailsById.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getBookingDetailsById.fulfilled, (state, action) => {
      state.loading = false;
      state.bookingDetail = action.payload?.data?.data;
    });
    builder.addCase(getBookingDetailsById.rejected, (state) => {
      state.loading = false;
      state.bookingDetail = null;
    });
  },
});

export const { setLoading, setAvailabilityDate, setCompanyPhoneNo } =
  bookingSlice.actions;

export default bookingSlice.reducer;
