<?php
/// 分班用的各种函数。
include_once "datatype.php";
include_once "connection.php";
include_once "util.php";

$medoo = get_medoo();

function create_class_pref_table() {
  global $medoo;

  $name = "class_prefs";
  if (table_exists($medoo, $name)) return;
  
  $result = $medoo->query("CREATE TABLE ". $name. "(
  		user_id INT,
      FOREIGN KEY (user_id) REFERENCES users(id),
  		pref1 INT,
      FOREIGN KEY (pref1) REFERENCES classes(id),
  		pref2 INT,
      FOREIGN KEY (pref2) REFERENCES classes(id),
  		department_id TINYINT,
  		ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  		)");
  if (empty($result)) {
  	error_log($medoo->error());
  }
}

function trim_old_class_prefs() {
	global $medoo;
	
	$medoo->query("DELETE FROM class_prefs WHERE `ts`". 
			" < DATE_SUB(NOW(), INTERVAL 1 YEAR)");
}

function get_class_prefs($user_id, $department_id) {
	global $medoo;

	create_class_pref_table();
	$results = $medoo->select("class_prefs", 
			["user_id", "pref1", "pref2"], 
			$user_id ? ["user_id" => $user_id] : 
					["department_id" => intval($department_id)]);
	if (empty($results)) return [];

	$response = [];
	foreach ($results as $result) {
		$response[$result["user_id"]] = [
				"pref1" => intval($result["pref1"]),
				"pref2" => intval($result["pref2"]),				
		];
	}
	return $response;
}

function update_class_pref($user_id, $prefs) {
	global $medoo;

	create_class_pref_table();
	trim_old_class_prefs();

	$data = [];
	foreach (["pref1", "pref2", "department_id"] as $field) {
		if (isset($prefs[$field]))$data[$field] = $prefs[$field];
	}
	$where = ["user_id" => $user_id];

	$rows = $medoo->update("class_prefs", $data, $where);
	if ($rows) return $rows;
	
	return $medoo->insert("class_prefs", array_merge($data, $where));
}

function get_class_candidates($user) {
	global $medoo;

	$start_year = $user->classInfo["start_year"];

	$undeleted = ["deleted[!]" => 1, "deleted" => NULL];
	$where = ["start_year" => $start_year, "id[!]" => 1, "OR" => $undeleted];
	
	if ($user->classId == 1) {
		// For new students, give their first year candidates.
		$where = array_merge($where, ["department_id" => 1]);
	} else {
		// For first year students, give their second year candidates.
		$where = array_merge($where, ["department_id" => [2, 3, 4]]);
	}
	return keyed_by_id($medoo->select("classes", 
			["id", "department_id", "name", "weekday", "time"], ["AND" => $where]));
}
?>
