export default class Config{
  static blog_url = "http://3ringprototype.com/blog";
  static base_api_url = `${this.blog_url}/wp-json`;

  static ep_nav = "/menus/v1/menus/test-nav-1";
  static ep_pages = "/wp/v2/pages?order=asc&_embed&orderby=include&include=";
}
