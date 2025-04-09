import { Provider, useDispatch, useSelector } from "react-redux";
import store from "./store";
import Routes from "./routes";
import "react-slideshow-image/dist/styles.css";
import { useEffect } from "react";
import { getGlobalConfiguration } from "./modules/Booking/slice";
import { useLocation } from "react-router-dom";

const AppWrapper = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const pathParts = location.pathname.split("/");
  const companyId = pathParts[2];

  const { globalConfigs } = useSelector((state) => state.booking);

  function getReadableTextColor(bgColor) {
    const temp = document.createElement("div");
    temp.style.color = bgColor;
    document.body.appendChild(temp);
    const computed = getComputedStyle(temp).color;
    document.body.removeChild(temp);

    const rgb = computed.match(/\d+/g).map(Number);
    const [r, g, b] = rgb.map(c => c / 255);

    const luminance = [r, g, b].map(c =>
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    );
    const L = 0.2126 * luminance[0] + 0.7152 * luminance[1] + 0.0722 * luminance[2];

    return L > 0.179 ? "#000000" : "#ffffff";
  }


  useEffect(() => {
    dispatch(getGlobalConfiguration(companyId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, location]);

  useEffect(() => {
    if (globalConfigs) {
      const availableFontColor = getReadableTextColor(globalConfigs?.calendar_available_date_circle_color);
      const selectedFontColor = getReadableTextColor(globalConfigs?.calendar_selected_date_circle_color);
      const bookedFontColor = getReadableTextColor(globalConfigs?.calendar_full_booked_date_circle_color);

      document.documentElement.style.setProperty(
        "--theme-color",
        globalConfigs?.theme_color || "#4a748a"
      );
      document.documentElement.style.setProperty(
        "--font-color",
        globalConfigs?.font_color || "#ffffff"
      );
      document.documentElement.style.setProperty(
        "--calendar_available_date_circle_color",
        globalConfigs?.calendar_available_date_circle_color ||
        "rgba(233, 238, 240, 0.88)"
      );
      document.documentElement.style.setProperty(
        "--calendar_selected_date_circle_color",
        globalConfigs?.calendar_selected_date_circle_color ||
        "#ffffff"
      );
      document.documentElement.style.setProperty(
        "--calendar_full_booked_date_circle_color",
        globalConfigs?.calendar_full_booked_date_circle_color ||
        "rgba(233, 238, 240, 0.88)"
      );

      //  Font color set
      document.documentElement.style.setProperty(
        "--available-font-color",
        availableFontColor || "#000000"
      );
      document.documentElement.style.setProperty(
        "--booked-font-color",
        bookedFontColor || "#000000"
      );
      document.documentElement.style.setProperty(
        "--selected-font-color",
        selectedFontColor || "#000000"
      );
    }
  }, [location, globalConfigs]);

  return <Routes />;
};

const App = () => {
  return (
    <Provider store={store}>
      <AppWrapper />
    </Provider>
  );
};

export default App;
