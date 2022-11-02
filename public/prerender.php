<?php
session_start();

$token = htmlspecialchars($_POST["token"]);

if (!isset($_POST["token"]) && !$token || $token !== $_SESSION['token']) {
    // return 405 http status code
    header($_SERVER['SERVER_PROTOCOL'] . ' 405 Method Not Allowed');
    exit;
} else {
    // process the form data
    echo "success...";

    //this file will contain the pre-rendered html content that is called by the index page
    $pr_file = "postrender.html";

    if (!file_exists($pr_file)) {
      touch($pr_file);
    }

    $myfile = fopen($pr_file, "w");

    $htmlstr = $_REQUEST[ "htmlstr" ];
    fwrite($myfile, $htmlstr);
}
