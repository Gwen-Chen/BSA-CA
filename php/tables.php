<?php
include_once "datatype.php";
include_once "connection.php";
include_once "course_category.php";
include_once "district.php";
include_once "permission.php";
include_once "util.php";

$medoo = get_medoo();

function convert_int_fields($record, $int_fields) {
  foreach ($int_fields as $field) {
    $record[$field] = intval($record[$field]);
  }

  return $record;
}

function get_departments() {
  global $medoo;

  return keyed_by_id($medoo->select("departments", "*"));
}

function update_department($department) {
  global $medoo;

  $datas = ["name" => $department["name"]];

  $id = intval($department["id"]);
  if ($id == 0) {
    return $medoo->insert("departments", $datas);
  }
  
  return $medoo->update("departments", $datas, ["id" => $id]);
}

function remove_department($id) {
  global $medoo;

  return $medoo->delete("departments", ["id" => $id]);
}

function get_course_groups($detailed) {
  global $medoo;
  
  $groups = $medoo->select("course_groups", "*");
  
  $result = [];
  foreach ($groups as $group) {
    if ($detailed == "true") {
      $group["courses"] =
          $medoo->select("courses", "*", ["group_id" => $group["id"]]);
    }

    $result[$group["id"]] = $group;
  }

  return $result;
}

function update_course_group($group) {
  global $medoo;
  
  $datas = [];
  $fields = ["department_id", "name", "category"];
  foreach ($fields as $field) {
    if (!empty($group[$field])) {
      $datas[$field] = $group[$field];
    }
  }

  init_course_category_column($medoo);
  $id = intval($group["id"]);
  if ($id == 0) {
    $id = $medoo->insert("course_groups", $datas);
    if ($id) {
      $group["id"] = $id;
      return $group;
    }
  } elseif($medoo->update("course_groups", $datas, ["id" => $id])) {
    return $group;
  }

  return null;
}

function remove_course_group($id) {
  global $medoo;
  
  $courses = $medoo->select("courses", "*", ["group_id" => $id]);
  if (!empty($courses) && count(courses) > 0) return false;

  return $medoo->delete("course_groups", ["id" => $id]);
}

function remove_schedule_group($id) {
  global $medoo;

  // This line may return false if there is no schedules in the group.
  $medoo->delete("schedules", ["group_id" => $id]);

  return $medoo->delete("schedule_groups", ["id" => $id]);
}

function remove_class($id) {
  global $medoo;
 
  if (intval($id) == 1) return 0;

  // If there is no reference to this class, it's deleted from the DB.
  $deleted = $medoo->delete("classes", ["id" => $id]);
  if ($deleted) return $deleted;

  // If there are users, cannot mark it as 'deleted'.
  $users = $medoo->count("users", ["classId" => $id]);
  if ($users) return 0;
  
  // Mark it as 'deleted'.
  return $medoo->update("classes", ["deleted" => 1], ["id" => $id]);
}

function remove_task($id) {
  global $medoo;
  
  return $medoo->delete("tasks", ["id" => $id]);
}

function update_course($course) {
  global $medoo;
  
  $datas = [];
  $fields = ["group_id", "name", "video_url", "text_url"];
  foreach ($fields as $field) {
    if (!empty($course[$field])) {
      $datas[$field] = $course[$field];
    }
  }

  $id = intval($course["id"]);
  if ($id == 0) {
    $id = $medoo->insert("courses", $datas);
    if ($id) {
      $course["id"] = $id;
      return $course;
    }
  } elseif($medoo->update("courses", $datas, ["id" => $id])) {
    return $course;
  }

  return null;
}

function remove_course($id) {
  global $medoo;
  
  return $medoo->delete("courses", ["id" => $id]);
}

function remove_schedule($id) {
  global $medoo;
  
  return $medoo->delete("schedules", ["id" => $id]);
}

function get_classes($filters = []) {
  global $medoo;
  
  $int_fields = ["id", "department_id", "teacher_id", "start_year",
      "perm_level", "weekday", "zb_id", "teacher2_id"];
  $undeleted = ["deleted[!]" => 1, "deleted" => NULL];
  $filters = array_merge($filters, ["OR" => $undeleted]);
  $classes = keyed_by_id($medoo->select("classes", "*", ["AND" => $filters]));

  foreach ($classes as $id => $classInfo) {
    $classInfo["self_report"] = isset($classInfo["self_report"])
        && intval($classInfo["self_report"]) == 1;
    $classes[$id] = convert_int_fields($classInfo, $int_fields);
  }
  return $classes;
}

function get_class_id($class_name) {
  global $medoo;
  
  $result = $medoo->select("classes", ["id"], ["name" => $class_name]);
  return empty($result) ? null : $result[0]["id"];
}

function update_class($classInfo) {
  global $medoo;
  
  $datas = [];
  $fields = ["department_id", "name", "class_room", "email", "start_year", 
      "perm_level", "weekday", "time", "zb_id", "teacher_id", "teacher2_id"];

  foreach ($fields as $field) {
    if (isset($classInfo[$field])) {
      $datas[$field] = $classInfo[$field];
    }
  }
  
  if (intval($datas['teacher_id']) == 0) {
    $datas['teacher_id'] = null;
  }
  if (intval($datas['teacher2_id']) == 0) {
    $datas['teacher2_id'] = null;
  }
  
  if (isset($classInfo["self_report"])) {
    $datas["self_report"] = $classInfo["self_report"] == "true" ? 1 : 0;
  }
  
  ensure_country_columns($medoo);
  $id = intval($classInfo["id"]);
  if ($id == 0) {
    return $medoo->insert("classes", 
        array_merge($datas, ["country" => $classInfo["country"]]));
  }

  return $medoo->update("classes", $datas, ["id" => $id]);
}

function update_task($task) {
  global $medoo;
  
  $datas = [];
  $fields = ["department_id", "name", "max", "duration", "sub_tasks",
      "starting_half_term", "report_half_term", "zb_name", "zb_course_id"];
  foreach ($fields as $field) {
    $datas[$field] = $task[$field];
  }
  
  $id = intval($task["id"]);
  if ($id == 0) {
    return $medoo->insert("tasks", $datas);
  }

  return $medoo->update("tasks", $datas, ["id" => $id]);
}

function get_courses($course_group_id) {
  global $medoo;

  return keyed_by_id($medoo->select("courses", "*", 
      ["group_id" => $course_group_id]));
}

function get_user_by_id($id) {
  global $medoo;

  return get_single_record($medoo, "users", $id);
}

function get_user($email) {
  global $medoo;
    
  $result = $medoo->select("users", "*", ["email" => $email]);
  if (empty($result)) return null;
  
  $classes = get_classes(["id" => $result[0]["classId"]]);

  $user = new User($result[0]);
  $user->classInfo = $classes[$user->classId];
  
  return $user;
}

function get_users($email, $classId = null, $user_id = null, $sn = null) {
  global $medoo;

  $result = null;
  if ($classId) {
    $result = $medoo->select("users", "*", ["classId" => $classId]);
  } elseif ($email){
    $result = $medoo->select("users", "*", ["email" => $email]);
  } elseif ($user_id) {
    $result = $medoo->select("users", "*", ["id" => $user_id]);
  } elseif ($sn) {
    $result = $medoo->select("users", "*", ["internal_id" => $sn]);
  }

  if (empty($result)) {
    return [];
  }

  $classes = ($email || $user_id) ? 
      get_classes(["id" => $result[0]["classId"]]) : null;
  $users = array();

  foreach ($result as $index => $row) {
    $user = new User($row);
    $user->password = null;
    $user->classInfo = $classes ? $classes[$user->classId] : null;

    $users[$user->id] = $user;
  }

  return $users;
}

function remove_user($id) {
  global $medoo;

  $medoo->delete("class_prefs", ["user_id" => $id]);
  if ($medoo->delete("users", ["id" => $id])) return 1;

  $deletedClass = current($medoo->select("classes", ["id"],
      ["deleted" => 1, "LIMIT" => 1]));
  update_user(["id" => $id, "classId" => $deletedClass["id"]]);
  return 1;
}


function add_startyear_column($medoo) {
  $query = "ALTER TABLE users ADD start_year YEAR";
  $medoo->query($query);
}

function update_user($user) {
  global $medoo;

  add_startyear_column($medoo);

  $datas = [];
  
  $fields = ["internal_id", "name", "nickname", "email",
      "phone", "street", "city", "country", "zip",
      "im", "occupation", "comments", "skills", "bio", "experience"];

  foreach ($user as $key => $value) {
    if ($key == "password") {
      $datas[$key] = md5($value);
    } elseif (in_array($key, User::$int_fields)) {
      if (is_numeric($value) || is_string($value) && strlen($value)) {
        $datas[$key] = intval($value);
      }
    } elseif (in_array($key, $fields)) {
      if ($key == "email" && is_email_blocked($value)) exit();
      $filter = 
          $key == "email" ? FILTER_SANITIZE_EMAIL : FILTER_SANITIZE_STRING; 
      $datas[$key] = filter_input(INPUT_POST, $key, $filter);
    }
  }

  if (!empty($user["id"]) && intval($user["id"]) > 0) {
    if ($medoo->update("users", $datas, ["id" => intval($user["id"])])) {
      return current(get_users(null, null, intval($user["id"])));
    }
  } else {
    if (empty($datas["classId"]) || intval($datas["classId"]) == 0) {
      $datas["classId"] = 1;
    }

    $datas["permission"] = get_student_permission();
    if ($id = $medoo->insert("users", $datas)) {
      return current(get_users(null, null, intval($id)));
    }
  }

  return null;
}

function clone_user($user_id) {
  global $medoo;
  
  $user = get_single_record($medoo, "users", $user_id);
  if (!user) return 0;

  $email = $user["email"]. ".deleted";
  if (!$medoo->update("users", ["email" => $email], ["id" => $user_id])) {
    return 0;
  }
  
  unset($user["id"]);
  unset($user["internal_id"]);
  $newId = $medoo->insert("users", $user);
  if (!$newId) {
    return 0;
  }

  remove_user($user_id);
  return $newId;
}

function get_db_error() {
  global $medoo;
  
  return get_db_error2($medoo);
}

function get_last_task_record($user_id, $task_id, $sub_index) {
  global $medoo;
  
  $sql = '';
  if ($sub_index == null) {
    $sql = sprintf("SELECT id, count, sub_index, UNIX_TIMESTAMP(ts) uts FROM 
        task_records WHERE student_id=%d AND task_id=%d ORDER BY id DESC 
        LIMIT 1;",
        intval($user_id), intval($task_id));
  } else {
    $sql = sprintf("SELECT id, count, sub_index, UNIX_TIMESTAMP(ts) uts FROM
        task_records WHERE student_id=%d AND task_id=%d AND sub_index=%d 
        ORDER BY id DESC LIMIT 1;",
        intval($user_id), intval($task_id), intval($sub_index));
  }

  $result = $medoo->query($sql)->fetchAll();
  
  if (empty($result)) return null;
  
  $record = current($result);

  $sql = sprintf("SELECT SUM(count), SUM(duration) FROM task_records
      WHERE student_id=%d AND task_id=%d AND sub_index=%d;",
      intval($user_id), intval($task_id), intval($record["sub_index"]));
  $sums = current($medoo->query($sql)->fetchAll());

  return [
      "count" => intval($record["count"]),
      "sub_index" => intval($record["sub_index"]),
      "ts" => $record["uts"],
      "sum" => $sums[0],
      "totalDuration" => $sums[1],
      "id" => intval($record["id"])
  ];
}

function get_tasks($department_id) {
  global $medoo;

  $int_fields = ["duration", "max", "sub_tasks", "starting_half_term",
      "report_half_term", "zb_course_id"];
  $tasks = keyed_by_id($medoo->select("tasks", "*",
      $department_id ? ["department_id" => $department_id] : null));
  foreach ($tasks as $id => $task) {
    $tasks[$id] = convert_int_fields($task, $int_fields);
  }
  return $tasks;
}

function convert_stat_result($result) {
  return ["sub_index" => intval($result["sub_index"]),
      "sum" => intval($result["sum"]),
      "duration" => intval($result["duration"])
  ];
}

function get_class_task_stats($classId, $task_id, $startTime, $endTime,
    $isIndex = FALSE) {

  global $medoo;

  $users = $medoo->select("users", ["id", "name", "zb_id"],
      ["classId" => $classId]);

  $timeFilter = "";
  if (!empty($startTime) && !empty($endTime)) {
    if ($isIndex) {
      $timeFilter = sprintf(" AND sub_index >= %d AND sub_index <= %d",
          intval($startTime - 1), intval($endTime - 1));
    } else {
      $timeFilter = sprintf(" AND ts BETWEEN FROM_UNIXTIME(%d) and " .
          "FROM_UNIXTIME(%d)", intval($startTime), intval($endTime));
    }
  }
  
  foreach ($users as $key => $user) {
    $sql = sprintf("select sub_index, SUM(count) as sum, SUM(duration)".
        " as duration from task_records where task_id=%d and ".
        " student_id=%d %s group by sub_index", intval($task_id), 
        intval($user["id"]),
        $timeFilter);

    $result = $medoo->query($sql)->fetchAll();
    
    $user["stats"] =
        keyed_by_id(array_map("convert_stat_result", $result), "sub_index");
    $users[$key] = $user;
  }
  
  return $users;
}

function report_task($user_id, $task_id, $sub_index, $count, $duration) {
  global $medoo;
  
  if (intval($sub_index) > 0) {
    $updated = $medoo->update("task_records", [
        "count[+]" => intval($count),
        "duration[+]" => $duration
      ], 
      ["AND" => [
        "student_id" => intval($user_id),
        "task_id" => intval($task_id),
        "sub_index" => intval($sub_index)
      ], "LIMIT" => 1        
    ]);
    if ($updated) return $updated;
  }
  return $medoo->insert("task_records", [
    "student_id" => intval($user_id), 
    "task_id" => intval($task_id),
    "sub_index" => intval($sub_index),
    "count" => intval($count),
    "duration" => $duration
  ]);
}

function convert_schedule_record($source, $string_to_int = false) {
  $target = [];
  foreach (["video", "text", "attended"] as $task) {
    if (isset($source[$task])) {
      if ($string_to_int) {
        $target[$task] = $source[$task] == "true" ? 1 : 0;
      } else {
        $target[$task] = $source[$task] == 1 ? true : false;
      }
    }
  }

  return $target;
}

/// Whether all fields in the array are all 0.
function is_empty_data($datas, $fields) {
  foreach ($fields as $field) {
    if (!empty($datas[$field])) return false;
  }

  return true;
}

function report_schedule_task($user_id, $schedule) {
  global $medoo;
  
  $course_id = intval($schedule["course_id"]);
  $datas = convert_schedule_record($schedule, true);

  $table = "schedule_records";

  $where = ["AND" => ["course_id" => $course_id, "student_id" => $user_id]];

  if (is_empty_data($datas, ["video", "text", "attended"])) {
    return $medoo->delete($table, $where);
  }

  $rows = $medoo->update($table, $datas, $where);
  if ($rows) return $rows;

  $datas["student_id"] = $user_id;
  $datas["course_id"] = $course_id;
  $medoo->insert($table, $datas);
  // schedule_records does not have AUTO_INC primary key, 
  // insert always returns 0.
  return 1;
}

function get_schedules($classId, $term, $records, $user_id) {
  global $medoo;
  
  date_default_timezone_set("UTC");
  
  if (intval($term) == 0) {
    $term = $medoo->max("schedule_groups", "term", ["classId" => $classId]);
    if (!$term) return null;
  }

  $schedule_groups =
      keyed_by_id($medoo->select("schedule_groups", "*",
          ["AND" => ["classId" => $classId, "term" => $term]]));

  foreach ($schedule_groups as $group_id => $group) {
    $group["start_time"] = (new DateTime($group["start_time"]))->getTimestamp();
    if (!empty($group["end_time"])) {
      $group["end_time"] = (new DateTime($group["end_time"]))->getTimestamp();
    }
    $group["schedules"] = keyed_by_id($medoo->select("schedules", "*",
        ["group_id" => $group_id]));
    
    $group["courses"] =
        keyed_by_id($medoo->select("courses", ["id", "name"],
            ["group_id" => $group["course_group"]]));
    if (!empty($group["course_group2"])) {
      $group["courses"] = keyed_by_id(array_merge($group["courses"],
          keyed_by_id($medoo->select("courses", ["id", "name"],
              ["group_id" => $group["course_group2"]]))));
    }

    $group["limited_courses"] =
        keyed_by_id($medoo->select("courses", ["id", "name"],
            ["group_id" => $group["limited_course_group"]]));
    $group["term"] = intval($group["term"]);
    $group["mid_week"] = intval($group["mid_week"]);
    $schedule_groups[$group_id] = $group;
  }
  
  $users =
      keyed_by_id($medoo->select("users", ["id", "name", "zb_id"],
          ["classId" => $classId]));
  
  foreach ($users as $id => $user) {
    if ($records == 'none' || $records == 'mine' && $id != $user_id) continue;

    $records =
        keyed_by_id($medoo->select("schedule_records", "*",
            ["student_id" => $id]), "course_id");
      
    $user["records"] = array_map("convert_schedule_record", $records);
    $users[$id] = $user;
  }
      
  return ["groups" => $schedule_groups, "users" => $users ];
}

function update_schedule($schedule) {
  global $medoo;

  $datas = ["course_id" => NULL, "course_id2" => NULL];
  $int_fields = ["course_id", "course_id2", "group_id", "open", "review"];
  foreach ($int_fields as $field) {
    if (isset($schedule[$field])) {
      $datas[$field] = intval($schedule[$field]);
    }
  }
  if (isset($schedule["notes"])) {
    $datas["notes"] = $schedule["notes"];
  }
  if (intval($datas["course_id"]) == 0) {
    $datas["course_id2"] = NULL;
  }
  $id = $schedule["id"];
  if ($id == 0) {
    return $medoo->insert("schedules", $datas);
  }

  if (!empty($schedule["notified"])) {
    $datas["#notified"] = "NOW()";
  }
  return $medoo->update("schedules", $datas, ["id" => $id]);
}

function formatTimestamp($tm) {
  date_default_timezone_set("UTC");

  $dt = new DateTime();
  $dt->setTimestamp($tm);
  return $dt->format("Y-m-d H:i:s");
}

function update_schedule_group($group) {
  global $medoo;

  $datas = [];
  $fields = ["classId", "course_group", "course_group2", "term",
      "limited_course_group", "mid_week"];
  foreach ($fields as $field) {
    if (!empty($group[$field])) {
      $datas[$field] = $group[$field];
    }
  }
  
  if (!empty($group["start_time"])) {
    $datas["start_time"] = formatTimestamp(intval($group["start_time"]));
  }
  if (!empty($group["end_time"])) {
    $datas["end_time"] = formatTimestamp(intval($group["end_time"]));
  }

  $id = $group["id"];
  $schedules = $group["schedules"];

  if ($id == 0) {
    $id = $medoo->insert("schedule_groups", $datas);
    if (!$id) return false;

    if (!empty($schedules)) {
      for ($index = 0; $index < count($schedules); $index++) {
        $schedule = $schedules[$index];
        $schedule["group_id"] = $id;
        update_schedule($schedule);
      }
    }
  } else {
    $medoo->update("schedule_groups", $datas, ["id" => $id]);

    if (!empty($schedules)) {
      foreach ($schedules as $schedule) {
        $schedule["group_id"] = $id;
        update_schedule($schedule);
      }
    }
  }

  return $id;
}

function get_task_history($userId, $task_id) {
  global $medoo;
  
  return $medoo->select('task_records', '*', ["AND" => [
      "student_id" => $userId,
      "task_id" => $task_id
  ]]);
}

function get_task_record($task_id) {
  global $medoo;
  
  $result = $medoo->select('task_records', "*", ["id" => $task_id]);
  if (empty($result)) return null;
  
  return current($result);
}

function remove_task_record($task_id) {
  global $medoo;
  
  return $medoo->delete('task_records', ["id" => $task_id]);
}

function search($prefix) {
  global $medoo;
  
  return $medoo->select("users", ["classId", "name", "email", "country"],
      ["OR" => ["name[~]" => $prefix, "email[~]" => $prefix]]);
}

/// A search returns only id, name and nick name.
function searchByName($name) {
  global $medoo;
  
  return $medoo->select("users", ["id", "name", "nickname", "country"],
      ["OR" => ["name[~]" => $name, "nickname[~]" => $name]]);
}

/// Returns "name(nickname)" for a user identified by [$id].
function getUserLabel($id) {
  global $medoo;

  $users = $medoo->select("users", ["name", "nickname"], ["id" => $id]);
  if (empty($users)) return "";

  $user = current($users);
  $name = $user["name"];
  $nickname = $user["nickname"];
  return $nickname ? sprintf("%s(%s)", $name, $nickname) : $name;
}

/// Returns the distribution of people in each state of the country.
///
/// Returns a map like ["1" => 32, "2" => 48, ..., "8" => 26];
function get_state_stats($countryCode) {
  global $medoo;

  if (!is_country_code($countryCode)) return [];

  $sql = sprintf("SELECT COUNT(id) as sum, state FROM users WHERE country='%s' ".
      " GROUP BY state", $countryCode);
  $result = $medoo->query($sql)->fetchAll();
  
  $states = [];
  foreach ($result as $record) {
    $states[$record["state"]] = $record["sum"];
  }
  return $states;
}

function get_state_users($countryCode, $stateIndex) {
  global $medoo;
  
  $deletedClassIds = $medoo->select("classes", "id", ["deleted" => 1]);
  return $medoo->select("users", "*",
      ["AND" => [
          "country" => $countryCode, 
          "state" => $stateIndex,
          "classId[!]" => $deletedClassIds
      ]]);
}

function is_teacher($id) {
  global $medoo;
  
  return $medoo->count("classes", "id", ["OR" => [
      "teacher_id" => $id,
      "teacher2_id" => $id
  ]]) > 0;
}
?>
