const ENV = process.env.NEXT_PUBLIC_ENV || 'prod';

const config = {
  local: {
    baseURL: 'http://localhost:5000/api',
  },
  prod: {
    baseURL: 'https://jwellerybackend-production.up.railway.app/api',
  },
};

export const API_BASE_URL = config[ENV].baseURL;
