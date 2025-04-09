/* eslint-disable react/prop-types */
import { LeftArrow, PlaceHolderImg, RightArrow } from "@/constants/images";
import routesConstants from "@/routes/routesConstants";
import { useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

const BookingCard = ({ data }) => {
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();
  const swiperRef = useRef(null);
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  const { companyId } = useParams();
  const displayPrice = data?.Item_Prices;

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

  const handleNavigate = (event) => {
    if (
      event.target.closest(".interactive") ||
      ["BUTTON", "A", "LI"].includes(event.target.tagName) ||
      event.target.closest(".slide-button")
    ) {
      return;
    }
    localStorage.clear();
    navigate(
      `/company/${companyId}/${routesConstants.ACTIVITY}/${data?.item_id}`
    );
  };

  return (
    <div className="booking-card pointer" onClick={handleNavigate}>
      {/* Swiper Slideshow */}
      <div className="slideshow-container">
        <Swiper
          ref={swiperRef}
          modules={[Navigation, Autoplay]}
          autoplay={
            data?.Item_Medias?.length > 1 && isAutoPlay
              ? { delay: 5000 }
              : false
          }
          loop={data?.Item_Medias?.length > 1}
          className="swiper-container"
          onSlideChange={handleSlideChange}
          navigation={{
            prevEl: prevRef?.current,
            nextEl: nextRef?.current,
          }}
          onSwiper={(swiper) => {
            // Fix for navigation buttons not working
            setTimeout(() => {
              if (swiper.params.navigation) {
                swiper.params.navigation.prevEl = prevRef?.current;
                swiper.params.navigation.nextEl = nextRef?.current;
                swiper.navigation?.init();
                swiper.navigation?.update();
              }
            });
          }}
        >
          {data?.Item_Medias?.length > 0 ? (
            data?.Item_Medias?.map((item, index) => (
              <SwiperSlide key={index}>
                <div className="each-slide-effect">
                  {item?.type === 0 ? (
                    <img
                      src={item?.type_url}
                      onError={(e) => (e.currentTarget.src = PlaceHolderImg)}
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
        {data?.Item_Medias?.length > 1 && (
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

      {/* Activity Details */}
      <div className="activity_details">
        {data?.Item_Medias?.length > 1 && (
          <ul className="activity_img_dot">
            {data?.Item_Medias?.map((_, index) => (
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
          <h3>{data?.name}</h3>
          <p>
            $
            {displayPrice?.length > 0 &&
              Math.max(...displayPrice.map((item) => item.price))}
          </p>
        </div>
        <p className="description_text">{data?.description}</p>
        <div className="read_more_link">
          <Link
            to={`/company/${companyId}/${routesConstants.ACTIVITY}/${data?.item_id}`}
            onClick={() => localStorage.clear()}
          >
            Read More...
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingCard;
