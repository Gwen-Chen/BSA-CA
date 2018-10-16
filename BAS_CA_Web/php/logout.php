<?php
include_once 'config.php';

$_SESSION ['user'] = '';

session_destroy();

setcookie("email", "", time()-3600);

header('Location: ../login.html');
?>
