import axios from 'axios';

export const getFetcher = async <T>(url: string) => {
  return await axios.get<T>(url).then((res) => {
    return res.data;
  });
};
