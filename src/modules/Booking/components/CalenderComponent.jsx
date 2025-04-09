/* eslint-disable react/prop-types */
import { localStorageKeys } from "@/conf/conf";
import moment from "moment";
import { useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const CalenderComponent = ({
  selectedDate,
  setSelectedDate,
  bookedDates,
  onMonthChange = () => {},
  isOpen = false,
  isCallToBook,
  isOnlineBookable,
}) => {
  const today = new Date();

  // Function to handle date change
  const handleDateChange = (date) => {
    setSelectedDate(date);
    if (!isOpen) {
      localStorage.setItem(localStorageKeys.SELECTED_DATE, date);
    }
  };

  // Load selected date from localStorage when the component mounts
  useEffect(() => {
    const storedDate = localStorage.getItem(localStorageKeys.SELECTED_DATE);
    if (storedDate) {
      setSelectedDate(new Date(storedDate));
    }
  }, [setSelectedDate]);

  // Function to add class to booked and available dates
  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const dateStr = moment(date).format("YYYY-MM-DD");
      const todayStr = moment().format("YYYY-MM-DD");
      const matchingSlots = bookedDates?.[dateStr] || [];

      if (moment(dateStr).isBefore(todayStr)) {
        return ""; // Prevent adding any class for past dates
      }

      if (matchingSlots.length > 0) {
        let availableSlots = matchingSlots.filter(
          (slot) => +slot.total_capacity !== +slot.total_occupied
        );

        if (isCallToBook === 1 && isOnlineBookable === 0) {
          availableSlots = availableSlots.filter((slot) => slot.status !== 0);
        } else if (isOnlineBookable === 1 && isCallToBook === 0) {
          availableSlots = availableSlots.filter((slot) => slot.status === 0);
        }

        const allSlotsBooked = matchingSlots.every(
          (slot) => slot.total_capacity === slot.total_occupied
        );

        if (allSlotsBooked) {
          return "booked-date";
        }

        if (availableSlots.length > 0) {
          return "available-date"; // Only applies if date is today or future
        }
      }
    }
    return "";
  };

  // Function to disable dates except booked and available dates
  const tileDisabled = ({ date, view }) => {
    if (view === "month") {
      const dateStr = moment(date).format("YYYY-MM-DD");
      const matchingSlots = bookedDates?.[dateStr] || [];

      // Disable the date if it's not in bookedDates
      if (matchingSlots.length === 0) {
        return true;
      }

      // Check if the date is fully booked
      const isFullyBooked = matchingSlots.every(
        (slot) => +slot.total_capacity === +slot.total_occupied
      );

      // Check if the date has available slots
      const hasAvailableSlots = matchingSlots.some(
        (slot) => +slot.total_capacity !== +slot.total_occupied
      );

      // Enable fully booked dates and available dates, disable everything else
      return !(isFullyBooked || hasAvailableSlots);
    }
    return false;
  };

  return (
    <div className="calender-container">
      <div className="calendar">
        <Calendar
          onChange={handleDateChange}
          value={selectedDate}
          tileClassName={tileClassName}
          tileDisabled={tileDisabled} // Disable all unbooked dates
          minDate={today}
          onActiveStartDateChange={onMonthChange}
        />

        <div className="legend">
          <div className="legend-title">
            <span className="legend-item available"></span>
            <span className="legend-text">Available</span>
          </div>
          <div className="legend-title">
            <span className="legend-item booked"></span>
            <span className="legend-text">Full Booked</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalenderComponent;
