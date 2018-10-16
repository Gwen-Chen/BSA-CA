<?php
include_once 'config.php';
include_once "connection.php";
include_once "datatype.php";
include_once 'permission.php';
include_once "util.php";
include_once "tables.php";

$medoo = get_medoo();

function ensure_table() {
  global $medoo;

  if (!table_exists($medoo, "task_arrange")) {
    run_sql_file("../data/task_arrange_table.php", $medoo);
  }
}


function canWriteClass($user, $classId) {
  $classInfo = get_classes(["id" => $classId])[$classId];
  if (!classInfo) return false;
    
  return canWrite($user, $classInfo);
}

function get_task_arrange($classId) {
  global $medoo;

  ensure_table();
  return keyed_by_id($medoo->select("task_arrange", "*",
      ["class_id" => $classId]), "task_id");  
}

function update_task_arrange($classId, $taskId, 
    $start_half_term, $report_half_term) {
  global $medoo;
  
  ensure_table();
  $where = ["class_id" => $classId, "task_id" => $taskId];
  $data = [
      "start_half_term" => $start_half_term,
      "report_half_term" => $report_half_term
  ];
  
  $updated = $medoo->update("task_arrange", $data, ["AND" => $where]);
  if ($updated) return $updated;

  return $medoo->insert("task_arrange", array_merge($data, $where));
}

function delete_task_arrange($classId) {
  global $medoo;
    
  ensure_table();
  return $medoo->delete("task_arrange", ["class_id" => $classId]);
}

$response = null;

if (empty($_SESSION["user"])) {
  echo '{"error": "login needed"}';
  exit();
} else {
  $user = unserialize($_SESSION["user"]);
}

if ($_SERVER ["REQUEST_METHOD"] == "GET") {
  $classId = empty($_GET["class_id"]) ? $user->classId : $_GET["class_id"]; 
  $response = get_task_arrange($classId);
} elseif ($_SERVER ["REQUEST_METHOD"] == "POST") {
  $classId = empty($_POST["class_id"]) ? $user->classId : $_POST["class_id"];
  $response = canWriteClass($user, $classId) ?
      ["updated" => update_task_arrange($classId, $_POST["task_id"], 
          $_POST["start_half_term"], $_POST["report_half_term"])] :
      permision_denied_error();
} elseif ($_SERVER ["REQUEST_METHOD"] == "DELETE") {
  $response = canWriteClass($user, $classId) ?
      ["deleted" => delete_task_arrange($classId)] : permision_denied_error();
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
