import { LeftArrow, PlaceHolderImg, RightArrow } from "@/constants/images";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import routesConstants from "@/routes/routesConstants";
import useWindowSize from "@/hooks/useWindowSize";
import { useDispatch, useSelector } from "react-redux";
import {
  getActivityDetailsById,
  getAvailabilityDetailsByDate,
  getAvailabilityDetailsByMonth,
} from "../slice";
import { localStorageKeys } from "@/conf/conf";
import moment from "moment";
import CalenderComponent from "../components/CalenderComponent";
import SkeletonLoader from "@/components/common/loaders/SkeletonLoader";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

const excludedKeys = [
  "email_confirmation_notes",
  "rebook_email_notes",
  "reminder_email_notes",
  "follow_up_email_notes",
];

const DetailPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { width } = useWindowSize();
  const { id, companyId } = useParams();
  const swiperRef = useRef(null);
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  const {
    activityDetails,
    availabilitiesByDate,
    availabilitiesByMonth,
    companyPhoneNo,
    dateLoading,
    detailPageLoading,
  } = useSelector((state) => state.booking);

  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  const displayPrice = activityDetails?.Item_Prices;

  const month =
    localStorage.getItem(localStorageKeys.MONTH) || moment().month() + 1;
  const year = localStorage.getItem(localStorageKeys.YEAR) || moment().year();

  // Handle indicator click
  const handleIndicatorClick = (event, index) => {
    event.stopPropagation();
    setIsAutoPlay(false);
    if (index !== activeIndex) {
      setActiveIndex(index);
      swiperRef.current?.swiper.slideTo(index);
    }
  };

  // Prevent infinite loop by only setting activeIndex when it actually changes
  const handleSlideChange = (swiper) => {
    setActiveIndex(swiper.realIndex);
  };

  const handleBooking = (availabilityId) => {
    localStorage.setItem(localStorageKeys.SELECTED_DATE, selectedDate);
    localStorage.setItem(localStorageKeys.AVAILABILITY_ID, availabilityId);
    navigate(
      `/company/${companyId}/${routesConstants.BOOKING}/${activityDetails.item_id}`,
      {
        state: {
          selectedDate: selectedDate,
          itemAvailabilityId: availabilityId,
        },
      }
    );
  };

  useEffect(() => {
    dispatch(
      getActivityDetailsById({
        company_id: companyId,
        item_id: id,
      })
    );
    dispatch(
      getAvailabilityDetailsByMonth({
        company_id: companyId,
        year: year,
        month: month,
        item_id: id,
      })
    );
  }, [dispatch, id]);

  useEffect(() => {
    if (selectedDate) {
      dispatch(
        getAvailabilityDetailsByDate({
          date: moment(selectedDate).format("YYYY/MM/DD"),
          item_id: id,
        })
      );
    }
  }, [selectedDate]);

  // Function to handle API call when month changes
  const handleMonthChange = ({ activeStartDate }) => {
    if (activeStartDate) {
      const newMonth = moment(activeStartDate).month() + 1; // Get month (1-12)
      const newYear = moment(activeStartDate).year(); // Get year
      localStorage.setItem(localStorageKeys.MONTH, newMonth);
      localStorage.setItem(localStorageKeys.YEAR, newYear);

      // Call API function with the new month & year
      dispatch(
        getAvailabilityDetailsByMonth({
          company_id: companyId,
          year: newYear,
          month: newMonth,
          item_id: id,
        })
      );
      // dispatch(setAvailabilityDate(null));
    }
  };

  return (
    <div className="row p-24 w-100 align-items-start activity_details_main m-0">
      {detailPageLoading ? (
        <>
          {/* Skeleton Loader for Left Column */}
          <div className="col-lg-6">
            <SkeletonLoader width="100%" height="500px" />
          </div>

          {/* Skeleton Loader for Right Column */}
          <div className="col-lg-6">
            <SkeletonLoader width="100%" height="500px" />
          </div>
        </>
      ) : !activityDetails ||
        activityDetails?.length === 0 ||
        (activityDetails?.is_call_to_book === 0 &&
          activityDetails?.is_online_bookable === 0) ? (
        <div className="no-detail">No details found</div>
      ) : (
        <>
          <div className="col-lg-6">
            <div className="booking-card">
              {/* Slideshow */}
              <div className="slideshow-container">
                <Swiper
                  ref={swiperRef}
                  modules={[Navigation, Autoplay]}
                  autoplay={
                    activityDetails?.Item_Medias?.length > 1 && isAutoPlay
                      ? { delay: 5000 }
                      : false
                  }
                  loop={activityDetails?.Item_Medias?.length > 1}
                  className="swiper-container"
                  onSlideChange={handleSlideChange}
                  navigation={{
                    prevEl: prevRef.current,
                    nextEl: nextRef.current,
                  }}
                  onSwiper={(swiper) => {
                    // Fix for navigation buttons not working
                    setTimeout(() => {
                      if (swiper?.params?.navigation) {
                        swiper.params.navigation.prevEl = prevRef?.current;
                        swiper.params.navigation.nextEl = nextRef?.current;
                        swiper.navigation.init();
                        swiper.navigation.update();
                      }
                    });
                  }}
                >
                  {activityDetails?.Item_Medias?.length > 0 ? (
                    activityDetails?.Item_Medias?.map((item, index) => (
                      <SwiperSlide key={index}>
                        <div className="each-slide-effect">
                          {item?.type === 0 ? (
                            <img
                              src={item?.type_url}
                              onError={(e) =>
                                (e.currentTarget.src = PlaceHolderImg)
                              }
                              className="slide-img"
                              alt="Slide"
                            />
                          ) : item?.type === 1 ? (
                            <video width="600" autoPlay loop muted>
                              <source src={item?.type_url} type="video/mp4" />
                              Your browser does not support the video tag.
                            </video>
                          ) : (
                            <img src={PlaceHolderImg} alt="Placeholder" />
                          )}
                        </div>
                      </SwiperSlide>
                    ))
                  ) : (
                    <SwiperSlide>
                      <div className="each-slide-effect">
                        <img src={PlaceHolderImg} alt="Placeholder" />
                      </div>
                    </SwiperSlide>
                  )}
                </Swiper>
                {/* Custom Navigation Arrows */}
                {activityDetails?.Item_Medias?.length > 1 && (
                  <>
                    <button className="slide-button prev-arrow" ref={prevRef}>
                      <img src={LeftArrow} alt="Previous" />
                    </button>
                    <button className="slide-button next-arrow" ref={nextRef}>
                      <img src={RightArrow} alt="Next" />
                    </button>
                  </>
                )}
              </div>

              {/* Activity Details - Positioned slightly above */}
              <div className="activity_details ">
                {/* Custom Indicator Line */}
                {activityDetails?.Item_Medias?.length > 1 && (
                  <ul className="activity_img_dot">
                    {activityDetails?.Item_Medias?.map((_, index) => (
                      <li
                        key={index}
                        className={`indicator-line ${
                          activeIndex === index ? "active" : ""
                        }`}
                        onClick={(e) => handleIndicatorClick(e, index)}
                      ></li>
                    ))}
                  </ul>
                )}

                <div className="activity_heading">
                  <h3>{activityDetails?.name}</h3>
                  <p>
                    ${" "}
                    {displayPrice?.length > 0 &&
                      Math.max(...displayPrice.map((item) => item.price))}
                  </p>
                </div>

                {/* Date Selection */}

                {width < 992 && (
                  <CalenderComponent
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    bookedDates={availabilitiesByMonth}
                    onMonthChange={handleMonthChange}
                    isCallToBook={activityDetails?.is_call_to_book}
                    isOnlineBookable={activityDetails?.is_online_bookable}
                  />
                )}

                {/* Time Slots */}
                {width < 992 && (
                  <div>
                    {dateLoading ? (
                      // Show skeleton loader while data is loading
                      <div className="activity_time_slot_main">
                        <SkeletonLoader width="100%" height="70px" />
                        <SkeletonLoader width="100%" height="70px" />
                      </div>
                    ) : availabilitiesByDate?.length > 0 ? (
                      (() => {
                        let availableSlots = availabilitiesByDate?.filter(
                          (slot) =>
                            +slot?.total_capacity !== +slot?.total_occupied
                        );

                        // Apply filtering based on activityDetails conditions
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
                                moment(a.start_time, "HH:mm:ss").diff(
                                  moment(b.start_time, "HH:mm:ss")
                                )
                              )
                              .map((i, x) => (
                                <div className="activity_time_slot" key={x}>
                                  <p>
                                    {moment(i?.start_time, "HH:mm:ss").format(
                                      "h:mm A"
                                    )}
                                    <span className="available_seats text_blue">
                                      {`${
                                        i?.total_capacity - i?.total_occupied
                                      } Seats Available`}
                                    </span>
                                  </p>
                                  {i?.status === 0 ? (
                                    <button
                                      className="book-btn"
                                      onClick={() =>
                                        handleBooking(
                                          i?.item_availability_detail_id
                                        )
                                      }
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
                          No slots available for this date. Please select
                          another date.
                        </span>
                      </div>
                    )}
                  </div>
                )}
                {/* Description */}
                <p className="description-text">
                  {activityDetails?.description}
                </p>
              </div>

              <div className="d-flex gap-3 flex-column w-100 mt-4">
                <div className="accordion w-100" id="accordionExample">
                  {activityDetails?.Item_Configurations?.filter(
                    (i) =>
                      !excludedKeys.includes(i?.config_key) && i?.config_value
                  ) // Only include items with valid config_value
                    ?.map((i, x) => (
                      <div className="accordion-item mb-2" key={x}>
                        <h2 className="accordion-header" id={`heading${x}`}>
                          <button
                            className={`accordion-button ${
                              x !== 0 ? "collapsed" : ""
                            }`}
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target={`#collapse${x}`}
                            aria-expanded={x === 0 ? "true" : "false"}
                            aria-controls={`collapse${x}`}
                          >
                            {i?.config_key === "duration"
                              ? `${i?.config_label} (In mins)`
                              : i?.config_label}
                          </button>
                        </h2>
                        <div
                          id={`collapse${x}`}
                          className={`accordion-collapse collapse ${
                            x === 0 ? "show" : ""
                          }`}
                          aria-labelledby={`heading${x}`}
                          data-bs-parent="#accordionExample"
                        >
                          <div className="accordion-body">
                            {i?.config_value?.includes("\n") ? (
                              <div className="config-div">
                                {i?.config_value
                                  .split("\n")
                                  .map((sentence, index) => (
                                    <div key={index}>{sentence?.trim()}</div>
                                  ))}
                              </div>
                            ) : (
                              <p>{i?.config_value}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-6 position_sticky_top mobile_hided_details">
            <CalenderComponent
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              bookedDates={availabilitiesByMonth}
              onMonthChange={handleMonthChange}
              isCallToBook={activityDetails?.is_call_to_book}
              isOnlineBookable={activityDetails?.is_online_bookable}
            />

            {dateLoading ? (
              // Show skeleton loader while data is loading
              <div className="time-slots">
                <SkeletonLoader width="100%" height="60px" />
                <SkeletonLoader width="100%" height="60px" />
              </div>
            ) : availabilitiesByDate?.length > 0 ? (
              (() => {
                let availableSlots = availabilitiesByDate?.filter(
                  (slot) => +slot.total_capacity !== +slot.total_occupied
                );

                // Apply filtering based on activityDetails conditions
                if (
                  activityDetails?.is_call_to_book === 1 &&
                  activityDetails?.is_online_bookable === 0
                ) {
                  availableSlots = availableSlots?.filter(
                    (slot) => slot?.status !== 0
                  ); // Only show "Call to Book" slots
                } else if (
                  activityDetails?.is_online_bookable === 1 &&
                  activityDetails?.is_call_to_book === 0
                ) {
                  availableSlots = availableSlots?.filter(
                    (slot) => slot?.status === 0
                  ); // Only show "Book Now" slots
                }

                if (availableSlots?.length === 0) {
                  return (
                    <div className="no-slots-div">
                      <span className="text-danger">
                        No available slots matching the selected booking type.
                        Please select another date.
                      </span>
                    </div>
                  );
                }

                return (
                  <div className="time-slots">
                    {availableSlots
                      ?.sort((a, b) =>
                        moment(a.start_time, "HH:mm:ss").diff(
                          moment(b.start_time, "HH:mm:ss")
                        )
                      )
                      ?.map((i, x) => (
                        <div className="time-slot" key={x}>
                          <p className="time">
                            {moment(i?.start_time, "HH:mm:ss").format("h:mm A")}
                            <span className="availability">{`${
                              i?.total_capacity - i?.total_occupied
                            } Seats Available`}</span>
                          </p>
                          {i?.status === 0 ? (
                            <button
                              className="book-btn"
                              onClick={() =>
                                handleBooking(i?.item_availability_detail_id)
                              }
                            >
                              Book Now
                            </button>
                          ) : (
                            <a
                              href={`tel:${companyPhoneNo}`}
                              className="call-button"
                            >
                              <i className="fa-solid fa-phone"></i> Call to Book
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
                  No slots available for this date. Please select another date.
                </span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default DetailPage;
