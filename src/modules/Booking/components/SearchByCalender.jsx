import { Link, useNavigate } from "react-router-dom";
import CalenderComponent from "./CalenderComponent";
import routesConstants from "@/routes/routesConstants";
import { useState } from "react";
import SkeletonLoader from "@/components/common/loaders/SkeletonLoader";

const SearchByCalender = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const loading = false;

  const activities = [
    {
      title: "Whale Watching-Private Charter",
      price: "$950",
      timeSlots: [
        { time: "09:00 AM", seats: "3 Seats are Available" },
        { time: "12:00 PM", seats: "1 Seats are Available" },
      ],
      description:
        "Experience the thrill of soaring 1,200 feet above Maui's stunning Kaʻanapali Beach on an unforgettable parasailing adventure! Suitable for ages 5 and up, this exciting excursion lets you enjoy breathtaking views while flying solo or alongside up to two others, depending on weather and weight conditions. Flight times range from 8–17 minutes, with the total excursion duration varying based on the number of participants. Perfect for adventurers of all ages, this is a must-do experience for those seeking a unique way to take in Maui's beauty.",
    },
  ];

  const handleBooking = () => {
    navigate(`/client/235/${routesConstants.BOOKING}/1`);
  };
  return (
    <div className="row">
      <div className="col-lg-6 mb-lg-0 mb-4 position_sticky_top mobile_padding">
        {loading ? (
          <SkeletonLoader width="100%" height="500px" />
        ) : (
          <CalenderComponent
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            bookedDates={["2025-02-15", "2025-02-18", "2025-02-22"]}
          />
        )}
      </div>

      <div className="col-lg-6 search_calender  d-flex flex-column gap-4 mb-4 mb-lg-0">
        {loading ? (
          <SkeletonLoader width="100%" height="500px" />
        ) : (
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="activity_details">
              <div className="activity_heading">
                <h3>{activities[0].title}</h3>
                <p>{activities[0].price}</p>
              </div>
              <div className="activity_time_slot_main">
                {activities[0].timeSlots.map((slot, idx) => (
                  <div key={idx} className="activity_time_slot">
                    <p>
                      {slot.time}{" "}
                      <span className="available_seats text_red">
                        {slot.seats}
                      </span>
                    </p>
                    <button className="book-btn" onClick={handleBooking}>
                      Book Now
                    </button>
                  </div>
                ))}
              </div>
              <p className="description_text">{activities[0].description}</p>
              <div className="read_more_link">
                <Link
                  to={`/client/123/${routesConstants.ACTIVITY}/${index + 1}`}
                >
                  Read More...
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SearchByCalender;
