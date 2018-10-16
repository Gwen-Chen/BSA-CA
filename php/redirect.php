<?php
include_once 'config.php';

if ($_SERVER ["REQUEST_METHOD"] == "GET" && isset ( $_GET ["url"] )) {
  $url = str_replace("zbServiceUrl", $config->zbServiceUrl, $_GET["url"]);
  header("Location: ". $url);
  exit();
}
?>
