<?php
include_once "config.php";
include_once "connection.php";
include_once "tables.php";
include_once "util.php";
include_once 'permission.php';
include_once 'backup.php';

/// Moves a user from a deleted class to the new class 1.
function undelete($user) {
  if (!empty($user->classInfo) && empty($user->classInfo["deleted"])) {
    return $user;
  }

  return update_user(["id" => $user->id, "classId" => 1]);
}

if(!empty($_POST["email"])) {
  $password = 
      empty($_POST["password"]) ? NULL : md5($_POST["password"]);  
  $user = get_user($_POST["email"]);
  
  if ($user) {
    $authenticated = (empty($password) && empty($user->password)) ||
        $password == $user->password;
    if (!$authenticated) {
      echo "<h1>Error</h1>";
      echo "<p>Password does not match.</p>";
      exit();
    }

    $user = undelete($user);
    $user->password = null;
    $user->is_teacher = is_teacher($user->id);
    $_SESSION["user"] = serialize($user);
    
    $page = empty($_POST["redirect-url"]) 
        ? getStartPage($user) 
        : $_POST["redirect-url"];
    $validPages = ["admin.html", "index.html", "local.html", "order.html",
        "order_admin.html", "assignment.html"];
    if (!in_array($page, $validPages)) {
      $page = "index.html";
    }

    header("Location: ../" . $page);
    try_backup();
  } else {
    echo "<h1>Error</h1>";
    echo "<p>Sorry, your account could not be found.".
        "Please <a href=\"../login.html\">click here to try again</a>.</p>";
  }
}
?>
