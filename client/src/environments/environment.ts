export const environment = {
  production: false,
  apiUrl:
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? 'http://localhost:5000/api'
      : 'https://spa-application.onrender.com/api',
};
