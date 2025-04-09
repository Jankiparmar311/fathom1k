/* eslint-disable react-hooks/exhaustive-deps */
import { ContactInfo, EditIcon, PersonIcon } from "@/constants/images";
import { useEffect, useRef, useState } from "react";
import { Modal, ModalHeader, ModalBody } from "reactstrap";
import moment from "moment";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getActivityDetailsById,
  getAvailabilityDetailsByDate,
  getAvailabilityDetailsByMonth,
} from "../slice";
import * as Yup from "yup";
import { useFormik } from "formik";
import { filterPersonsByPriority } from "../utils";
import { axiosFathom1k } from "@/services/api";
import { CHECKOUT_BOOKING } from "@/services/url";
import { toast } from "react-toastify";
import {
  EmailRegex,
  EmailRequired,
  EmailValidation,
  FirstNameRequired,
  LastNameRequired,
  MobileRequired,
} from "@/constants/SchemaValidation";
import CalenderComponent from "../components/CalenderComponent";
import PaymentPage from "../components/CheckoutForm";
import routesConstants from "@/routes/routesConstants";
import { localStorageKeys } from "@/conf/conf";
import SkeletonLoader from "@/components/common/loaders/SkeletonLoader";
import CouponComponent from "../components/CouponComponent";
import AccessoriesComponent from "../components/AccessoriesComponent";
import "react-international-phone/style.css";
import { PhoneInput } from "react-international-phone";
import parsePhoneNumberFromString from "libphonenumber-js";

const initialValues = {
  firstName: "",
  lastName: "",
  mobileNo: "",
  email: "",
};

const PaymentComponent = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableSeats, setAvailableSeats] = useState(0);
  const [selectedDetails, setSelectedDetails] = useState();
  const [totalPrice, setTotalPrice] = useState(0);
  const [personPrices, setPersonPrices] = useState([]);
  const [taxes, setTaxes] = useState();
  const [isFlag, setIsFlag] = useState(false);
  const [stripeToken, setStripeToken] = useState();
  const [loading, setLoading] = useState(false);
  const [couponId, setCouponId] = useState();
  const [accessoryIds, setAccessoryIds] = useState();
  const [discountedAmount, setDiscountedAmount] = useState(0);
  const [totalAcc, setTotalAcc] = useState(0);
  const [taxBreakdown, setTaxBreakdown] = useState({});
  const [applicationCharge, setApplicationCharge] = useState(0);
  const [persons, setPersons] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [isApplePay, setIsApplePay] = useState(false);

  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const errRef = useRef();

  const { activityId, companyId } = useParams();
  const {
    availabilitiesByDate,
    availabilitiesByMonth,
    companyPhoneNo,
    dateLoading,
    activityDetails,
    bookingFees,
  } = useSelector((state) => state.booking);

  const localDate =
    localStorage.getItem(localStorageKeys.SELECTED_DATE) || new Date();
  const availability_id = localStorage.getItem(
    localStorageKeys.AVAILABILITY_ID
  );

  const month =
    localStorage.getItem(localStorageKeys.MONTH) || moment().month() + 1;
  const year = localStorage.getItem(localStorageKeys.YEAR) || moment().year();

  const validationSchema = Yup.object().shape({
    firstName: Yup.string().required(FirstNameRequired).trim(),
    lastName: Yup.string().required(LastNameRequired).trim(),
    email: Yup.string()
      .trim()
      .required(EmailRequired)
      .matches(EmailRegex, EmailValidation),
    mobileNo: Yup.string()
      .required(MobileRequired)
      .matches(
        /^\+\d{1,4}(\s?\(?\d+\)?)*\s?\d+$/,
        "Invalid phone number format"
      )
      .trim(),
  });

  useEffect(() => {
    dispatch(
      getActivityDetailsById({
        company_id: companyId,
        item_id: activityId,
      })
    );
  }, [companyId, activityId]);

  useEffect(() => {
    if (activityDetails?.Item_Prices?.length > 0) {
      setPersons(
        filterPersonsByPriority(activityDetails?.Item_Prices, selectedDate)
      );
    }
  }, [activityDetails]);

  // Reset prices when date changes
  useEffect(() => {
    if (selectedDate && persons?.length > 0 && !isModalOpen) {
      setPersonPrices([
        {
          person_type: persons[0]?.person_type,
          price: persons[0]?.price,
        },
      ]);
    }
  }, [selectedDate, selectedDetails]);

  // Set total price of every person
  useEffect(() => {
    if (personPrices?.length > 0) {
      const total = personPrices.reduce((sum, item) => sum + item.price, 0);
      setTotalPrice(totalAcc > 0 ? total + totalAcc : total);
    } else {
      setTotalPrice(0);
    }
  }, [personPrices, totalAcc]); // Added totalAcc as a dependency

  useEffect(() => {
    if (totalPrice > 0) {
      const taxDetails = selectedDetails?.Item?.taxDetails || [];

      // Object to store individual tax breakdown
      const newTaxBreakdown = {};

      if (Array.isArray(taxDetails) && taxDetails?.length > 0) {
        taxDetails.forEach((tax) => {
          let taxAmount = 0;
          if (tax?.rate_type === 0) {
            taxAmount = (totalPrice * tax.rate) / 100; // Percentage tax
          } else if (tax?.rate_type === 1) {
            taxAmount = tax.rate; // Fixed tax amount
          }

          if (taxAmount > 0) {
            newTaxBreakdown[tax.name] =
              (newTaxBreakdown[tax.name] || 0) + taxAmount;
          }
        });
      }

      // Calculate the total tax from individual breakdowns
      const totalTax = Object.values(newTaxBreakdown).reduce(
        (sum, tax) => sum + tax,
        0
      );

      setTaxes(totalTax); // Store total tax amount
      setTaxBreakdown(newTaxBreakdown); // Store individual tax breakdown
    }
  }, [totalPrice, selectedDetails, accessoryIds]);

  const handleAddPerson = (person, e) => {
    e.preventDefault();
    setPersonPrices((prev) => [...prev, person]);
  };

  const handleRemovePerson = (personTypeId, e) => {
    e.preventDefault();
    setPersonPrices((prev) => {
      const index = prev.findLastIndex((p) => p.person_type === personTypeId);
      return index !== -1 ? prev.filter((_, i) => i !== index) : prev;
    });
  };

  const onSubmit = async () => {
    setIsFlag(true);

    if (!stripeToken) return;
    try {
      setLoading(true);
      const res = await axiosFathom1k.post(CHECKOUT_BOOKING, {
        item_id: activityId,
        booking_datetime:
          moment(selectedDate).format("YYYY-MM-DD") +
          " " +
          selectedDetails?.start_time,
        item_availability_detail_id:
          selectedDetails?.item_availability_detail_id,
        first_name: values?.firstName,
        last_name: values?.lastName,
        phone_no: values?.mobileNo,
        email: values?.email,
        no_of_person: personPrices?.length,
        person_type_with_price: personPrices?.map(({ person_type, price }) => ({
          person_type,
          price,
        })),
        tax_ids: selectedDetails?.Item?.taxDetails?.map((tax) => tax.tax_id),
        total_amount: Math.max(
          0,
          discountedAmount > 0
            ? totalPrice + taxes + applicationCharge - discountedAmount
            : totalPrice + taxes + applicationCharge
        ).toFixed(2),
        total_tax: taxes || 0,
        stripe_card_token: stripeToken,
        accessory_ids: accessoryIds,
        total_accessory_amount: accessoryIds
          ?.reduce((sum, item) => sum + item.total_price, 0)
          ?.toFixed(2),
        coupon_id: couponId,
        total_discounted_amount: discountedAmount,
        total_booking_charge: Number(applicationCharge?.toFixed(2)),
        is_apple_pay: isApplePay,
        payment_method_id_from_frontEnd: isApplePay ? paymentMethod?.id : "",
        payment_method_data: isApplePay ? paymentMethod : "",
      });
      if (res) {
        setIsFlag(false);
        setStripeToken(null);
        setLoading(false);
        resetForm();
        if (res.data?.data?.booking_id) {
          navigate(`/company/${companyId}/${routesConstants.BOOKING_SUCCESS}`, {
            state: res.data?.data?.booking_ref_id,
          });
        } else {
          toast.error(res?.data?.message);
        }
      }
    } catch (err) {
      toast.error(err?.response?.data?.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (stripeToken) {
      onSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stripeToken]);

  const {
    values,
    validateField,
    setFieldValue,
    handleSubmit,
    errors,
    touched,
    resetForm,
  } = useFormik({
    initialValues,
    onSubmit,
    validationSchema,
    validateOnChange: false,
    validateOnMount: false,
    validateOnBlur: false,
  });

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      errRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      setIsFlag(false);
      return;
    }
  }, [errors]);

  // Get selected date from location state and api call for availability
  useEffect(() => {
    if (location?.state?.selectedDate) {
      setSelectedDate(location?.state?.selectedDate);

      dispatch(
        getAvailabilityDetailsByDate({
          date: moment(location?.state?.selectedDate).format("YYYY/MM/DD"),
          item_id: activityId,
        })
      );
      dispatch(
        getAvailabilityDetailsByMonth({
          company_id: companyId,
          year: year,
          month: month,
          item_id: activityId,
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, location]);

  useEffect(() => {
    if (localDate) {
      setSelectedDate(localDate);
    }
  }, [localDate]);

  useEffect(() => {
    if (availability_id) {
      if (availabilitiesByDate?.length > 0) {
        const item = availabilitiesByDate?.find(
          (i) => i.item_availability_detail_id === availability_id
        );
        if (item) {
          setSelectedDetails(item);

          setAvailableSeats(item?.total_capacity - item?.total_occupied);
        }
      }
    } else {
      navigate(
        `/company/${companyId}/${routesConstants.ACTIVITY}/${activityId}`
      );
    }
  }, [availabilitiesByDate, selectedDate]);

  useEffect(() => {
    if (bookingFees > 0) {
      setApplicationCharge((totalPrice * bookingFees) / 100);
    }
  }, [totalPrice, bookingFees]);

  // Function to handle API call when month changes
  const handleMonthChange = ({ activeStartDate }) => {
    if (activeStartDate) {
      const newMonth = moment(activeStartDate).month() + 1; // Get month (1-12)
      const newYear = moment(activeStartDate).year(); // Get year

      // Call API function with the new month & year
      dispatch(
        getAvailabilityDetailsByMonth({
          company_id: companyId,
          year: newYear,
          month: newMonth,
          item_id: activityId,
        })
      );
    }
  };

  const toggleModal = () => {
    // Save the updated date and time
    setIsModalOpen(!isModalOpen);
  };

  const handleSelect = (data) => {
    localStorage.setItem(
      localStorageKeys.AVAILABILITY_ID,
      data?.item_availability_detail_id
    );
    setSelectedDetails({
      ...selectedDetails,
      start_time: data?.start_time,
    });
    setAvailableSeats(data?.total_capacity - data?.total_occupied);
    setIsModalOpen(false);
    localStorage.setItem(localStorageKeys.SELECTED_DATE, selectedDate);
  };

  useEffect(() => {
    if (selectedDate) {
      dispatch(
        getAvailabilityDetailsByDate({
          date: moment(selectedDate).format("YYYY/MM/DD"),
          item_id: activityId,
        })
      );
    }
  }, [selectedDate]);

  return (
    <form onSubmit={handleSubmit}>
      <div className=" payment-details-main w-100 m-0">
        <div className=" position_sticky_top d-flex flex-column gap-4 mb-4 mb-lg-0">
          <div className="activity_heading">
            <h3 className="w-100">{selectedDetails?.Item?.name}</h3>
          </div>
          <div className="selected_date_time w-100 d-flex align-items-center justify-content-between">
            <p className="m-0">
              {selectedDetails?.specific_date &&
                `${moment(selectedDetails.specific_date).format(
                  "dddd, DD MMM, YYYY"
                )} - `}
              {selectedDetails?.start_time &&
                moment(selectedDetails.start_time, "h:mm:ss A").format(
                  "h:mm A"
                )}
            </p>

            <img
              src={EditIcon}
              alt=""
              title="Switch Date"
              className="edit-icon"
              onClick={() => setIsModalOpen(true)}
            />
          </div>

          <div className="person_select_card">
            <div className="person_heading_main w-100 d-flex align-items-center justify-content-between">
              <div className="person_heading">
                <img src={PersonIcon} alt="" />
                <h4 className="m-0">Person</h4>
              </div>
              <p className="m-0">{personPrices?.length} Person</p>
            </div>
            <div className="person_price_add">
              {persons?.map((person) => {
                const personCount = personPrices?.filter(
                  (p) => p.person_type === person?.person_type
                )?.length;

                const totalPersonsAdded = personPrices?.length; // Total persons selected

                return (
                  <div
                    key={person?.person_type}
                    className="person_pricing w-100 d-flex align-items-center justify-content-between"
                  >
                    <p className="m-0">{person?.Customer_Type?.name}</p>
                    <ul>
                      <button
                        className="person_adding"
                        onClick={(e) =>
                          handleRemovePerson(person?.person_type, e)
                        }
                        disabled={personCount === 0 || totalPersonsAdded === 1} // Prevent all from being 0
                      >
                        -
                      </button>
                      <li className="person_total">{personCount}</li>
                      <button
                        className="person_adding"
                        onClick={(e) => handleAddPerson(person, e)}
                        disabled={availableSeats === personPrices?.length}
                      >
                        +
                      </button>
                    </ul>
                  </div>
                );
              })}
            </div>

            <div className="person_note">
              <p>Note:</p>
              <ul>
                {persons?.map((person) => (
                  <li key={person.person_type_id}>
                    {person.Customer_Type?.name} Ticket <b>${person.price}</b>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <Modal
            isOpen={isModalOpen}
            toggle={toggleModal}
            className="calender-modal"
          >
            <ModalHeader toggle={toggleModal}>Change Date and Time</ModalHeader>
            <ModalBody>
              <div>
                <CalenderComponent
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                  bookedDates={availabilitiesByMonth}
                  onMonthChange={handleMonthChange}
                  isOpen={isModalOpen}
                  isCallToBook={activityDetails?.is_call_to_book}
                  isOnlineBookable={activityDetails?.is_online_bookable}
                />
                {/* Time Slots */}
                <div className="activity_details mt-3 mb-3">
                  {dateLoading ? (
                    <div className="activity_time_slot_main">
                      <SkeletonLoader width="100%" height="50px" />
                      <SkeletonLoader width="100%" height="50px" />
                    </div>
                  ) : availabilitiesByDate?.length > 0 ? (
                    (() => {
                      let availableSlots = availabilitiesByDate?.filter(
                        (slot) =>
                          +slot?.total_capacity !== +slot?.total_occupied
                      );

                      if (
                        activityDetails?.is_call_to_book === 1 &&
                        activityDetails?.is_online_bookable === 0
                      ) {
                        availableSlots = availableSlots?.filter(
                          (slot) => slot?.status !== 0
                        );
                      } else if (
                        activityDetails?.is_online_bookable === 1 &&
                        activityDetails?.is_call_to_book === 0
                      ) {
                        availableSlots = availableSlots?.filter(
                          (slot) => slot?.status === 0
                        );
                      }

                      return availableSlots?.length === 0 ? (
                        <div className="no-slots-div">
                          <span className="text-danger">
                            No available slots matching the selected booking
                            type. Please select another date.
                          </span>
                        </div>
                      ) : (
                        <div className="activity_time_slot_main">
                          {availableSlots
                            ?.sort((a, b) =>
                              moment(a.start_time, "h:mm:ss A").diff(
                                moment(b.start_time, "h:mm:ss A")
                              )
                            )
                            ?.map((i, x) => (
                              <div className="activity_time_slot" key={x}>
                                <p className="time">
                                  {moment(i?.start_time, "h:mm:ss A").format(
                                    "h:mm A"
                                  )}
                                  <span className="availability">{`${
                                    i?.total_capacity - i?.total_occupied
                                  } Seats Available`}</span>
                                </p>

                                {i?.status === 0 ? (
                                  <button
                                    className="book-btn"
                                    onClick={() => handleSelect(i)}
                                  >
                                    Book Now
                                  </button>
                                ) : (
                                  <a
                                    href={`tel:${companyPhoneNo}`}
                                    className="call-button"
                                  >
                                    <i className="fa-solid fa-phone"></i> Call
                                    to Book
                                  </a>
                                )}
                              </div>
                            ))}
                        </div>
                      );
                    })()
                  ) : (
                    <div className="no-slots-div">
                      <span>
                        No slots available for this date. Please select another
                        date.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </ModalBody>
          </Modal>
        </div>
        <div className=" d-flex flex-column gap-4 mb-4 mb-lg-0">
          <div className="contact_info_card" ref={errRef}>
            <div className="contact_heading_main w-100 d-flex align-items-center justify-content-between">
              <div className="contact_heading">
                <img src={ContactInfo} alt="" />
                <h4 className="m-0">Contact Info</h4>
              </div>
            </div>
            <div className="row contact_info">
              <div className="col-sm-6 info_field">
                <label htmlFor="">
                  First Name<b>*</b>
                </label>
                <input
                  type="text"
                  placeholder="Enter First Name"
                  name="firstName"
                  id="firstName"
                  onChange={(e) =>
                    setFieldValue("firstName", e.target.value).then(() =>
                      validateField("firstName")
                    )
                  }
                  value={values?.firstName}
                />
                {errors?.firstName && (
                  <span className="error-message">{errors?.firstName}</span>
                )}
              </div>
              <div className="col-sm-6 info_field">
                <label htmlFor="">
                  Last Name<b>*</b>
                </label>
                <input
                  type="text"
                  placeholder="Enter Last Name"
                  name="lastName"
                  onChange={(e) =>
                    setFieldValue("lastName", e.target.value).then(() =>
                      validateField("lastName")
                    )
                  }
                  value={values?.lastName}
                />
                {errors?.lastName && (
                  <span className="error-message">{errors?.lastName}</span>
                )}
              </div>
              <div className="col-sm-6 info_field">
                <label htmlFor="">
                  Email Address<b>*</b>
                </label>
                <input
                  type="text"
                  placeholder="Enter Email Address"
                  name="email"
                  onChange={(e) =>
                    setFieldValue("email", e.target.value).then(() =>
                      validateField("email")
                    )
                  }
                  value={values?.email}
                />
                {errors?.email && (
                  <span className="error-message">{errors?.email}</span>
                )}
              </div>
              <div className="col-sm-6 info_field">
                <label htmlFor="">
                  Mobile Number<b>*</b>
                </label>

                <PhoneInput
                  name="mobileNo"
                  defaultCountry="us"
                  value={values?.mobileNo}
                  onChange={(phone) => {
                    const phoneNumber = parsePhoneNumberFromString(phone);
                    const countryCode = phoneNumber
                      ? phoneNumber.countryCallingCode
                      : "";
                    const mobileNumber = phoneNumber
                      ? phoneNumber.nationalNumber
                      : "";
                    const formattedPhone = `+${countryCode} ${mobileNumber}`;
                    setFieldValue("mobileNo", formattedPhone).then(() =>
                      validateField("mobileNo")
                    );
                  }}
                />

                {touched?.mobileNo && errors?.mobileNo && (
                  <span className="error-message">{errors?.mobileNo}</span>
                )}
              </div>
              {/* <div className="col-12 check_box">
                <input
                  type="checkbox"
                  id="Confirmation"
                  name="Confirmation"
                  value="Bike"
                />
                <label htmlFor="Confirmation">
                  Send me a text confirmation as well
                </label>
              </div> */}
            </div>
          </div>
          {activityDetails?.Item_Accessories?.length > 0 && (
            <AccessoriesComponent
              setAccessoryIds={setAccessoryIds}
              activityDetails={activityDetails}
              setTotalPrice={setTotalPrice}
              setDiscountedAmount={setDiscountedAmount}
              setTotalAcc={setTotalAcc}
            />
          )}
          <CouponComponent
            selectedDate={selectedDate}
            totalAmount={totalPrice || 0}
            setCouponId={setCouponId}
            setDiscountedAmount={setDiscountedAmount}
            taxes={taxes}
            discountedAmount={discountedAmount}
            startTime={selectedDetails?.start_time}
            applicationCharge={applicationCharge}
          />

          <PaymentPage
            totalPrice={totalPrice}
            setStripeToken={setStripeToken}
            isFlag={isFlag}
            setLoading={setLoading}
            loading={loading}
            setIsFlag={setIsFlag}
            discountedAmount={discountedAmount}
            taxes={taxes}
            taxBreakdown={taxBreakdown}
            applicationCharge={applicationCharge}
            setPaymentMethod={setPaymentMethod}
            isApplePay={isApplePay}
            setIsApplePay={setIsApplePay}
          />
        </div>
      </div>
    </form>
  );
};

export default PaymentComponent;
