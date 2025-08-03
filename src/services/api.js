import axios from "axios";

const api = axios.create({
  baseURL: "https://secrets-backend-n1f6.onrender.com/api/v1",
});
export default api;
