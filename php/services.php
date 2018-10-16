<?php
include_once 'config.php';
include_once 'class_prefs.php';
include_once 'tables.php';
include_once 'permission.php';

$response = null;

if (empty($_SESSION["user"])) {
  echo '{"error": "login needed"}';
  exit();
} else {
  $user = unserialize($_SESSION["user"]);
}

$student_id = $user->id;

function get_class_info($classId) {
  global $user;
  $classInfo = null;
  if ($classId == $user->classId) {
    $classInfo = $user->classInfo;
  } else {
    $classes = get_classes(["id" => $classId]);
    if (!empty($classes)) {
      $classInfo = $classes[$classId];
    }
  }
  return $classInfo;
}

function canReadClass($classInfo) {
  global $user;
  return canRead($user, $classInfo);
}

function canWriteClass($user, $classId) {
  $classInfo = get_classes(["id" => $classId])[$classId];
  if (!classInfo) return false;

  return canWrite($user, $classInfo);
}

/// Whether [$user] can report task for [$task_user_id].
function canWriteUser($user, $targetUser) {
  if ($user == $targetUser || $user->id == $targetUser) return true;

  if (!($targetUser instanceof User)) {
    $targetUser = get_users(null, null, $targetUser)[$targetUser];
    if (!$targetUser) return false;
  }
  return canWrite($user, $targetUser->classInfo);
}

/// Whether the current [$user] has permission to read [$another] or not.
function canReadUser($another) {
  global $user;

  return canRead($user, $another->classInfo);
}

/// Whether [$another] is at the same class year of the current [$user].
function isSameYear($another) {
  global $user;

  $classId = $another["classId"];
  $classes = get_classes(["id" => $classId]);
  return $classes[$classId]["start_year"] == $user->classInfo["start_year"];
}

/// Whether [$another] is in the same country of the current [$user].
/// System admins are considered to be everywhere.
function isSameCountry($another) {
  return true;
//  global $user;

//  if (isSysAdmin($user)) return true;
//  $country = is_array($another) ? $another["country"] : $another->country;
//  return $country == $user->country;
}

function checkPermission($role) {
  global $user;

  if (($user->permission & $role) == $role) return;
  
  $response = permision_denied_error();
  echo json_encode($response);
  exit();
}

if ($_SERVER ["REQUEST_METHOD"] == "GET" && isset ( $_GET ["rid"] )) {
  $resource_id = $_GET["rid"];
  $classId = empty($_GET["classId"]) ? $user->classId : $_GET["classId"];

  if ($resource_id == "departments") {
    $response = get_departments();
  } elseif ($resource_id == "classes") {
    $classes = [];
    if (!empty($_GET["classId"])) {
      $response = array_filter(get_classes(["id" => $classId]), "canReadClass");
    } elseif (!empty($_GET["department_id"])) {
      $filters = ["department_id" => $_GET["department_id"]];
      $response = array_filter(get_classes($filters), "canReadClass");
    } else {
      $response = array_filter(get_classes(), "canReadClass");
    }
  } elseif ($resource_id == "class_candidates") {
    $response = get_class_candidates($user);
  } elseif ($resource_id == "course_groups") {
    $response = get_course_groups($_GET["detailed"]);
  } elseif ($resource_id == "tasks") {
    if (isset($_GET["department_id"])) {
      $response = get_tasks($_GET["department_id"]);
    } else {
      $response = get_tasks(null);
    }
  } elseif ($resource_id == "task_records") {
    $response = get_last_task_record($student_id, $_GET["task_id"],
        isset($_GET["sub_index"]) ? $_GET["sub_index"] : null);
  } elseif ($resource_id == "task_history") {
    $user_id = isAdmin($user) && isset($_GET["user_id"]) ? 
        $_GET["user_id"] : $student_id; 
    $response = get_task_history($user_id, $_GET["task_id"]);
  } elseif ($resource_id == "courses") {
    $response = get_courses($_GET["group_id"]);
  } elseif ($resource_id == "users") {
    $email = empty($_GET["email"]) ? null : $_GET["email"];
    $classId = empty($_GET["classId"]) ? null : $_GET["classId"];
    $sn = empty($_GET["sn"]) ? null : $_GET["sn"];

    if ($classId) {
      $classInfo = get_class_info($classId);

      if ($classInfo && canRead($user, $classInfo)) {
        $response = array_filter(get_users(null, $classId), "isSameCountry");
      }
    } elseif ($email || $sn) {
      $response = current($email ?
          get_users($email) : get_users(null, null, null, $sn));
      if ($response && !canReadUser($response)) {
        $response = null;
      }
    } else {
      $user = current(get_users($user->email));
      $user->is_teacher = is_teacher($user->id);
      // Refresh the session user data every time the user access the home page.
      $_SESSION["user"] = serialize($user);
      $response = $user;
    }
  } elseif ($resource_id == "learning_records" && !empty($_GET["classId"])) {
    $whose = $_GET["records"];
    if ($whose == "class") {
      $classInfo = get_class_info($_GET["classId"]);
      if (!canRead($user, $classInfo)) {
        $response = permision_denied_error();
      }
    }
    if (!$response) {
      $response = get_schedules($_GET["classId"], $_GET["term"], $whose,
          $user->id);
    }
  } elseif ($resource_id == "search") {
    if (isYearLeader($user)) {
      $response = search($_GET["prefix"]);
      if (!empty($response) && !isCountryAdmin($user)) {
        // For year leaders they can only see students of the same year.
        $response = array_filter($response, "isSameYear");
      } else {
        $response = array_filter($response, "isSameCountry");
      }
    }
  } elseif ($resource_id == "user_label") {
    $response = isAdmin($user) 
        ? ["label" => getUserLabel($_GET["id"])] 
        : permision_denied_error();
  } elseif ($resource_id == "search_name") {
    $response = isAdmin($user) 
        ? array_filter(searchByName($_GET["name"]), "isSameCountry") 
        : permision_denied_error();
  } elseif ($resource_id == "task_stats") {
    $startTime =
        empty($_GET["start_time"]) ? null : intval($_GET["start_time"]);
    $endTime = empty($_GET["end_time"]) ? null : intval($_GET["end_time"]);
    $isIndex = empty($_GET["is_index"]) ? null : intval($_GET["is_index"]);

    $response = get_class_task_stats($classId, $_GET["task_id"], $startTime,
        $endTime, $isIndex);
  } elseif ($resource_id == "state_stats") {
    if (!isCountryAdmin($user) || $_GET["country"] != $user->country) return;
    $response = get_state_stats($_GET["country"]);
  } elseif ($resource_id == "state_users") {
    if (!isCountryAdmin($user) || $_GET["country"] != $user->country) return;
    $response = get_state_users($_GET["country"], $_GET["state"]);
  } elseif ($resource_id == "class_prefs") {
    if (isYearLeader($user) || isCountryAdmin($user)) {
      $response = get_class_prefs(
          isset($_GET["department_id"]) ? null : $user->id,
          isset($_GET["department_id"]) ? $_GET["department_id"] : null);
    } else {
      $response = get_class_prefs($user->id, null);
    }
  }
} else if ($_SERVER ["REQUEST_METHOD"] == "POST" && isset ( $_POST ["rid"] )) {
  $resource_id = $_POST["rid"];

  if ($resource_id == "tasks") {
    $task_id = $_POST["task_id"];
    $task_user_id = 
        empty($_POST["student_id"]) ? $student_id : $_POST["student_id"];
    $duration = empty($_POST["duration"]) ? null : intval($_POST["duration"]);
    if (canWriteUser($user, $task_user_id)) {
      report_task($task_user_id, $task_id, $_POST["sub_index"], $_POST["count"],
          $duration);
      $response = get_last_task_record($task_user_id, $task_id, null);
    } else {
      $response = permision_denied_error();
    }
  } elseif ($resource_id == "task") {
    if (!isSysAdmin($user)) return;
    error_log($user->email. " UPDATES ". $resource_id. ":". 
        (empty($_POST["id"]) ? "" : $_POST["id"]));
    $response = ["updated" => update_task($_POST)];
  } elseif ($resource_id == "schedule_tasks") {
    $task_user_id = 
        empty($_POST["student_id"]) ? $student_id : $_POST["student_id"];
    $response = canWriteUser($user, $task_user_id)
        ? ["updated" => report_schedule_task($task_user_id, $_POST)]
        : permision_denied_error();
  } elseif ($resource_id == "schedule") {
    $response = isAdmin($user) 
      ? ["updated" => update_schedule($_POST)] 
      : permision_denied_error();
  }  elseif ($resource_id == "schedule_group") {
    error_log($user->email. " UPDATES ". $resource_id. ":". 
        (empty($_POST["id"]) ? "" : $_POST["id"]));
    $response = canWriteClass($user, $_POST["classId"]) 
        ? ["updated" => update_schedule_group($_POST)]
        : permision_denied_error();
  } elseif ($resource_id == "class") {
    if (empty($_POST["id"]) && isYearLeader($user) ||
        canWriteClass($user, $_POST["id"])) {
      if (empty($_POST["id"])) {
        $_POST["country"] = $user->country;
      }
      $response = ["updated" => update_class($_POST)];
    } else {
      $response = permision_denied_error();
    }
  } elseif ($resource_id == "course_group") {
    if (!isYearLeader($user)) return;
    error_log($user->email. " UPDATES ". $resource_id. ":". 
        (empty($_POST["id"]) ? "" : $_POST["id"]));
    $response = ["group" => update_course_group($_POST)];
  } elseif ($resource_id == "department") {
    if (!isSysAdmin($user)) return;
    error_log($user->email. " UPDATES ". $resource_id. ":". 
        (empty($_POST["id"]) ? "" : $_POST["id"]));
    $response = ["updated" => update_department($_POST)];
  } elseif ($resource_id == "course") {
    if (!isYearLeader($user)) return;
    error_log($user->email. " UPDATES ". $resource_id. ":". 
        (empty($_POST["id"]) ? "" : $_POST["id"]));
    $response = update_course($_POST); 
  } elseif ($resource_id == "user") {
    if (!isset($_POST["id"])) {
      $response = ["error" => "User id is not set"];
      echo json_encode($response);
      exit();
    }
    $targetUser = intval($_POST["id"]);
    if ($targetUser != $user->id) {
      $targetUser = get_users(null, null, $targetUser)[$targetUser];
    } else {
      $targetUser = $user;
    }

    if (!canWriteUser($user, $targetUser)) {
      $response = permision_denied_error();
    }
    
    if (isset($_POST["permission"]) &&
        (!canGrant($user, $targetUser->permission) || 
        !canGrant($user, intval($_POST["permission"])))) {
      $response = permision_denied_error();
    }
    
    if (!$response) {
    	// Country is set when registering and can't be changed later.
      unset($_POST["country"]);
      $result = update_user($_POST);
      if ($result && $result->id == $user->id) {
        $user = $result;
        $_SESSION['user'] = serialize($user);
      }
  
      $response = ["updated" => ($result ? 1 : 0)];
      if (!$result) {
        $response["error"] = get_db_error();
      }
    }
  } elseif ($resource_id == "class_prefs") {
    update_class_pref($user->id, $_POST);
  } elseif ($resource_id == "clone_user") {
    error_log($user->email. " DELETE learning records of ". $_POST["user_id"]);
    $response = canWriteUser($user, $_POST["user_id"])
        ? ["updated" => clone_user($_POST["user_id"])] 
        : permision_denied_error();
  }
} elseif ($_SERVER ["REQUEST_METHOD"] == "DELETE" &&
    isset ( $_REQUEST["rid"] )) {

  $resource_id = $_REQUEST["rid"];

  if ($resource_id == "course_group") {
    checkPermission(Roles::SYS_ADMIN);
    error_log($user->email. " DELETES ". $resource_id. ":". 
        (empty($_POST["id"]) ? "" : $_POST["id"]));
    $response = ["deleted" => remove_course_group($_REQUEST["id"])];
  } elseif ($resource_id == "schedule_group") {
    checkPermission(Roles::YEAR_LEADER);
    $response = ["deleted" => remove_schedule_group($_REQUEST["id"])];
  } elseif ($resource_id == "course") {
    checkPermission(Roles::SYS_ADMIN);
    $response = ["deleted" => remove_course($_REQUEST["id"])];
  } elseif ($resource_id == "schedule") {
    checkPermission(Roles::CLASS_LEADER);
    $response = ["deleted" => remove_schedule($_REQUEST["id"])];
  } elseif ($resource_id == "class") {
    checkPermission(Roles::COUNTRY_ADMIN);
    error_log($user->email. " DELETES ". $resource_id. ":". 
        (empty($_POST["id"]) ? "" : $_POST["id"]));
    $response = ["deleted" => remove_class($_REQUEST["id"])];
  } elseif ($resource_id == "task") {
    checkPermission(Roles::SYS_ADMIN);
    error_log($user->email. " DELETES ". $resource_id. ":". 
        (empty($_POST["id"]) ? "" : $_POST["id"]));
    $response = ["deleted" => remove_task($_REQUEST["id"])];
  } elseif ($resource_id == "task_records") {
    $record = get_task_record($_REQUEST["id"]);
    if (!isAdmin($user) &&
        (empty($record) || $record["student_id"] != $student_id)) {
        $response = permision_denied_error();
    } else {
      error_log($user->email. " DELETES ". $resource_id. ":". 
          (empty($_POST["id"]) ? "" : $_POST["id"]));
      $response = [
        "deleted" => remove_task_record($_REQUEST["id"]), 
        "last" => get_last_task_record($student_id, $record["task_id"], 
            $record["sub_index"])
      ];
    }
  } elseif ($resource_id == "user") {
    checkPermission(Roles::COUNTRY_ADMIN);
    $userId = $_REQUEST["id"];

    $userToDelete = get_user_by_id($userId);
    error_log($user->email. " DELETE ". $userToDelete["email"]. " " . $userId);
    error_log(json_encode($userToDelete));

    $response = ["deleted" => remove_user($userId)];
  } elseif ($resource_id == "department") {
    checkPermission(Roles::SYS_ADMIN);
    error_log($user->email. " DELETES ". $resource_id. ":". 
        (empty($_POST["id"]) ? "" : $_POST["id"]));
    $response = ["deleted" => remove_department($_REQUEST["id"])];
  }
}

if (is_array($response) && empty($response)) {
  echo '[]';
  return;
}

if ($response) {
  if (is_array($response) && isset($response["updated"]) &&
      intval($response["updated"]) == 0) {
    $response["error"] = get_db_error();
  }

  echo json_encode($response);
}
?>
