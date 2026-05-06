import axios from "axios";
 

const api = axios.create({
  baseURL: "/",
  timeout: 10000,
  withCredentials: true,
});
 
export default api;
 