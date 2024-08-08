import axios from "axios";

export default axios.create({
  // baseURL: 'https://be.talentsage.com/',
//   baseURL: 'https://uatbe.talentsage.com/',
  // baseURL: 'https://betest.gcm3.com/',
  baseURL: 'http://ec2-52-194-187-214.ap-northeast-1.compute.amazonaws.com/admin-api',
});