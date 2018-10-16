<?php
include_once 'config.php';
include_once "connection.php";
include_once "datatype.php";
include_once 'permission.php';
include_once "util.php";
include_once "tables.php";

$medoo = get_medoo();

function get_scores($classId) {
  global $medoo;

  $userIds = $medoo->select("users", "id", ["classId" => $classId]);
  return keyed_by_id($medoo->select("scores", 
      ["user_id", "type1", "score1", "type2", "score2"], 
      ["user_id" => $userIds]), "user_id");  
}

function get_score($userId) {
  global $medoo;
  
  $results = $medoo->select("scores", ["type1", "score1", "type2", "score2"],
      ["user_id" => $userId]);
  return empty($results) ? null : current($results);
}

function update_scores($score) {
  global $medoo;

  return $medoo->update("scores", $score, ["user_id" => $score["user_id"]]) ||
      $medoo->insert("scores", $score);
}

$response = null;

if (empty($_SESSION["user"])) {
  echo '{"error": "login needed"}';
  exit();
} else {
  $user = unserialize($_SESSION["user"]);
}

if ($_SERVER ["REQUEST_METHOD"] == "GET" && isset ( $_GET ["rid"] )) {
  $resource_id = $_GET["rid"];
  if ($resource_id == "scores") {
    // Return my score if class_id is not provided.
    if (empty($_GET["class_id"])) {
      $response = get_score($user->id);
    } else {
      $classId = $_GET["class_id"];
      $classes = get_classes(["id" => $classId]);
      if (empty($classes)) return;
  
      $classInfo = $classes[$classId];
      $response = canRead($user, $classInfo) 
          ? get_scores($classId) 
          : permision_denied_error();
    }
  }
} else if ($_SERVER ["REQUEST_METHOD"] == "POST" && isset ( $_POST ["rid"] )) {
  $resource_id = $_POST["rid"];

  if ($resource_id == "scores" && !empty($_POST["user_id"])) {
    $user_id = $_POST["user_id"];
    $users = get_users(null, null, $user_id);
    if (empty($users)) return;
    
    unset($_POST["rid"]);
    $targetUser = current($users);
    $response = canWrite($user, $targetUser->classInfo)
        ? ["updated" => update_scores($_POST)]
        : permision_denied_error();
  }
}

if (is_array($response) && empty($response)) {
  echo '[]';
  return;
}

if ($response) {
  if (is_array($response) && isset($response["updated"]) &&
      intval($response["updated"]) == 0) {
        $response["error"] = get_db_error2($medoo);
      }

  echo json_encode($response);
}
?>
