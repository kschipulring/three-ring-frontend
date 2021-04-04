<?php
ob_start();
$template = isset($_GET["no-cache"]) && filter_var($_GET["no-cache"], FILTER_VALIDATE_BOOLEAN) ? 
  "prerender.html" : "postrender.html";

include $template;

$output = ob_get_contents();
ob_end_clean();

//solves the problem of prerendered Recaptcha elements creating angry console errors.
$string = preg_replace('/<iframe\s+.*?\s+src=(".*?google.*?").*?<\/iframe>/i','', $output);

echo $string;

