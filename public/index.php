<?php
session_start();

$_SESSION['token'] = md5(uniqid(mt_rand(), true));

ob_start();

$template_dir = __DIR__ .  DIRECTORY_SEPARATOR;

$pr_template = $template_dir . "postrender.html";
$template = $pr_template;

if(
  !file_exists($pr_template) ||
  (isset($_GET["no-cache"]) && filter_var($_GET["no-cache"], FILTER_VALIDATE_BOOLEAN))
  )
{
  $template = $template_dir . "prerender.html";
}

include $template;

$output = ob_get_contents();
ob_end_clean();

//solves the problem of prerendered Recaptcha elements creating angry console errors.
$string = preg_replace('/<iframe\s+.*?\s+src=(".*?google.*?").*?<\/iframe>/i','', $output);


if( !file_exists($pr_template) ){
  $token = $_SESSION['token'];

  $js = "<script>window.c=\"{$token}\";</script>\n</head>";
  
  $string = str_replace("</head>", $js, $string);
}

echo $string;
