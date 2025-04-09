import { priceEnum } from "@/conf/conf";
import moment from "moment";

// export const convertToUTC = (dateString) => {
//   const localDate = new Date(dateString); // Parse the input date in local timezone

//   // Extract year, month, and day from the local date
//   const year = localDate.getFullYear();
//   const month = localDate.getMonth(); // getMonth() returns 0-based index
//   const day = localDate.getDate();

//   // Create a new Date object in UTC
//   const utcDate = new Date(Date.UTC(year, month, day, 0, 0, 0));

//   return utcDate.toISOString(); // Convert to ISO string
// };

export const convertToUTC = (dateString, timeString) => {
  const localDate = new Date(dateString); // Convert input date to local timezone

  // Extract year, month, and day from the local date
  const year = localDate.getFullYear();
  const month = localDate.getMonth();
  const day = localDate.getDate();

  // Append the provided time (already in UTC) to the date
  const utcDateTime = `${year}-${String(month + 1).padStart(2, "0")}-${String(
    day
  ).padStart(2, "0")}T${timeString}.000Z`;

  return utcDateTime;
};

export const convertTo12HourFormat = (time) => {
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours, 10);
  const period = hour >= 12 ? "PM" : "AM";
  const formattedHour = hour % 12 || 12; // Convert 0 to 12 for midnight
  return `${formattedHour}:${minutes} ${period}`;
};

export const getPersonPrices = (selectedDate, selectedDetails) => {
  const selectedDateString = moment(selectedDate).format("YYYY-MM-DD");

  let adultPrice = null;
  let childrenPrice = null;

  if (selectedDetails?.Item_Prices?.length > 0) {
    const itemPrices = selectedDetails?.Item_Prices;

    adultPrice =
      itemPrices
        ?.filter((price) => price?.person_type === 0)
        .map((price) => price?.price)
        .find((price) => price !== null && price !== 0) || 0;

    childrenPrice =
      itemPrices
        ?.filter((price) => price?.person_type === 1)
        .map((price) => price?.price)
        .find((price) => price !== null && price !== 0) || 0;
  } else {
    const itemPrices = selectedDetails?.Item?.Item_Prices;

    const filteredPrices = itemPrices?.filter((price) => {
      if (price?.type === 1 && price?.custom_date_or_day) {
        const customDates = JSON.parse(price?.custom_date_or_day);
        return (
          customDates?.includes(selectedDateString) ||
          customDates?.includes(
            moment(selectedDate).format("dddd").toLowerCase()
          )
        );
      }
      return false;
    });

    // If filteredPrices found, use them, otherwise fallback to master prices (type = 0)
    if (filteredPrices?.length > 0) {
      adultPrice =
        filteredPrices?.find((price) => price.person_type === 0)?.price || 0;
      childrenPrice =
        filteredPrices?.find((price) => price.person_type === 1)?.price || 0;
    } else {
      adultPrice =
        itemPrices
          ?.filter((price) => price?.type === 0 && price?.person_type === 0)
          .map((price) => price?.price)
          .find((price) => price !== null && price !== 0) || 0;

      childrenPrice =
        itemPrices
          ?.filter((price) => price?.type === 0 && price?.person_type === 1)
          .map((price) => price?.price)
          .find((price) => price !== null && price !== 0) || 0;
    }
  }
  return { adultPrice, childrenPrice };
};

export const getDisplayPrice = (itemPrices = []) => {
  // Get today's date and day
  const todayDate = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD
  const todayDay = new Date()
    .toLocaleString("en-US", { weekday: "long" })
    .toLowerCase(); // Format: monday, tuesday, etc.

  // Find day-wise price first
  const dayWisePrice = itemPrices?.find((price) => {
    if (price?.type === priceEnum.dayWisePrice && price?.person_type === 0) {
      if (price?.custom_date_or_day) {
        const customDatesOrDays = JSON.parse(price?.custom_date_or_day);
        return (
          customDatesOrDays.includes(todayDate) ||
          customDatesOrDays.includes(todayDay)
        );
      }
    }
    return false;
  });

  // If no valid day-wise price, fallback to master price
  const masterPrice =
    itemPrices
      ?.filter(
        (price) =>
          price?.type === priceEnum.masterPrice && price?.person_type === 0
      )
      .map((price) => price?.price)
      .find((price) => price !== null && price !== 0) || 0;

  // Determine the final price
  return dayWisePrice?.price ?? masterPrice ?? "0";
};

export const filterPersonsByPriority = (persons, selectedDate) => {
  const selectedDay = moment(selectedDate).format("dddd").toLowerCase(); // Get the day from the selected date in lowercase
  const selectedDateStr = moment(selectedDate).format("YYYY-MM-DD"); // Convert to "YYYY-MM-DD"

  const filteredPersons = [];
  const addedPersonTypes = new Set(); // Track person_types to avoid duplicates

  for (const priority of [2, 3, 1, 0]) {
    let priorityFound = false; // Flag to check if the current priority has been found

    for (const person of persons) {
      if (!addedPersonTypes?.has(person.person_type)) {
        if (
          (priority === 2 && person.type === 2) ||
          (priority === 3 &&
            person.type === 3 &&
            person.custom_date_or_day &&
            JSON.parse(person.custom_date_or_day).includes(selectedDateStr)) ||
          (priority === 1 &&
            person.type === 1 &&
            person.custom_date_or_day &&
            JSON.parse(person.custom_date_or_day)
              .map((day) => day.toLowerCase()) // Convert all days to lowercase
              .includes(selectedDay)) ||
          (priority === 0 && person.type === 0)
        ) {
          filteredPersons?.push(person);
          addedPersonTypes?.add(person.person_type); // Mark person_type as added
          priorityFound = true; // Mark priority as found
        }
      }
    }

    // If any person is found for the current priority, break the outer loop
    if (priorityFound) {
      break;
    }
  }

  return filteredPersons;
};

export const logToScreen = (message) => {
  const div = document.createElement("div");
  div.textContent = message;
  div.style.fontSize = "12px";
  div.style.padding = "4px";
  div.style.color = "#fff";
  div.style.background = "#000";
  document.body.appendChild(div);
};
