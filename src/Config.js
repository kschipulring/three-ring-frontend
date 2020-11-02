export default class Config{
  static base_url = process.env.REACT_APP_BASE_URL;
  static blog_url = process.env.REACT_APP_BLOG_URL;
  static base_api_url = process.env.REACT_APP_BASE_API_URL;

  static ep_nav = process.env.REACT_APP_EP_NAV;
  static ep_pages = process.env.REACT_APP_EP_PAGES;
  static ep_portfolio = process.env.REACT_APP_EP_PORTFOLIOS;

  static cloud_base_url = process.env.REACT_APP_CLOUD_BASE_URL;
  static cloud_uploads_url = process.env.REACT_APP_CLOUD_UPLOADS_URL;
}
