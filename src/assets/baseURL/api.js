import axios from "axios";

export default axios.create({
  // baseURL: 'http://ec2-52-194-187-214.ap-northeast-1.compute.amazonaws.com/admin-api',
  baseURL: 'https://api.therelovedmarketplace.com/admin-api',
});