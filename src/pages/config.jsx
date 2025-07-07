import { message, notification } from "antd"; // Import message for notifications

import Default_Background from "../assets/default2.png";
import Default_Logo from "../assets/Default_Icon.ico";

const companyOption = "AIS";
const companyLogo = Default_Logo;
const backgroundImage = Default_Background;

let companyWebsite = "";
let companyName = "";
let companyMoto = "";
companyWebsite = "http://www.yodbusiness.com/";
companyName = "Miraf Teachers' Academy";
companyMoto = "";

const option = 0;
//option    0   for local host,
//          1   for live server machine (andinet)
//          2   for test server  (andinet)
//          3   for cloud server   (YOD Claud server)
const hostname_address =
  option === 0
    ? "localhost"
    : option === 1
    ? "196.188.238.57"
    : option === 2
    ? "196.188.238.57"
    : option === 3
    ? "196.189.188.231"
    : "localhost";

const api_port =
  option === 0
    ? 8000
    : option === 1
    ? 5212
    : option === 2
    ? 5212
    : option === 3
    ? 5212
    : 5212;

const API_BASE_URL = `http://${hostname_address}:${api_port}`;

export {
  API_BASE_URL,
  companyOption,
  companyWebsite,
  companyName,
  companyMoto,
  backgroundImage,
  companyLogo,
};
