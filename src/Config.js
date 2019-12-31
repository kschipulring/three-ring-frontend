export default class Config{
  static base_url = "http://3ringprototype.com";
  static blog_url = `${this.base_url}/blog`;
  static base_api_url = `${this.blog_url}/wp-json`;

  static ep_nav = "/menus/v1/menus/test-nav-1";
  static ep_pages = "/wp/v2/pages?order=asc&_embed&orderby=include&include=";
}
