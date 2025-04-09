import axios from "axios";
import conf from "@/conf/conf";
import CryptoJS from "crypto-js";

const API_URL = `${conf.APIUrl}`;
const SECRET_KEY = import.meta.env.VITE_REACT_APP_SECRET_KEY;

class Axios {
  constructor(baseURL) {
    this.axios = axios.create({
      baseURL,
    });

    this.axios.interceptors.request.use(this.#requestMiddleware);

    this.axios.interceptors.response.use(
      this.#responseMiddleware,
      this.#responseErr
    );
  }

  // Encrypt Secret Key
  encryptData = (data) => {
    return CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
  };

  #requestMiddleware = (req) => {
    const encryptedKey = this.encryptData(SECRET_KEY); // Encrypting the key
    req.headers["x-api-key"] = encryptedKey;
    return req;
  };

  #responseMiddleware = (response) => {
    return response;
  };

  #responseErr = (error) => {
    return Promise.reject(error);
  };
}

const axiosFathom1k = new Axios(API_URL).axios;

export { axiosFathom1k };
