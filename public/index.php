<?php
ob_start();
include "postrender.html";
$output = ob_get_contents();
ob_end_clean();

//solves the problem of prerendered Recaptcha elements creating angry console errors.
$string = preg_replace('/<iframe\s+.*?\s+src=(".*?google.*?").*?<\/iframe>/i','', $output);

echo $string;

