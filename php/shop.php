<?php
/// 订书模块
include_once 'config.php';
include_once "connection.php";
include_once "datatype.php";
include_once 'permission.php';
include_once "util.php";

$medoo = get_medoo();

abstract class OrderStatus
{
  /// Only new created orders can be cancelled (deleted) by the buyer.
  const CREATED = 0;
  /// Shipped.
  const SHIPPED = 1;
  /// Shipped and paid, no further actions are needed.
  const COMPLETED = 3;
  
  static function fromString($value) {
    $map = ["CREATED" => 0, "SHIPPED" => 1, "COMPLETED" => 3];
    return $map[$value];
  }
}

/// Checks whether we can close an order (shipped and paided).
function _canClose($order) {
  return $order["status"] == OrderStatus::COMPLETED;
}

/// Returns an array of class ID's managed by [$user].
function _getManagedClasses($user) {
  if (isYearLeader($user)) {
    global $medoo;
    return $medoo->select("classes", "id",
        ["start_year" => $user->classInfo["start_year"]]);
  }
  if (isClassLeader($user, $user->classId)) return $user->classId;
  return null;
}

/// Returns department level.
function _getDepartmentLevel($user) {
  global $medoo;
  
  $departments = keyed_by_id($medoo->select("departments", ["id", "level"]));
  $department = $departments[$user->classInfo["department_id"]];
  return $department ? $department["level"] : 0;
}

function get_order($id) {
  global $medoo;
  
  $orders = $medoo->select("orders", "*", ["id" => $id]);
  if (empty($orders)) return null;
  
  $order = current($orders);
  $order["items"] = $medoo->select("order_details", "*", ["order_id" => $id]);
  
  return $order;
}

function get_orders($user_id, $filters, $withItems, $withAddress) {
  global $medoo;
  
  $timeFilter = ["created_time[><]" => [$filters["start"], $filters["end"]]];
  $statusFilter = isset($filters["status"]) && $filters["status"] != ""
      ? ["status" => intval($filters["status"])]
      : [];
  $userFilter = $user_id ? ["user_id" => $user_id] : [];
  $classFilter = [];
  if (empty($userFilter) && !empty($filters["class_id"])) {
    $userIds = $medoo->select("users", "id", 
        ["classId" => $filters["class_id"]]);
    $classFilter = ["user_id" => $userIds];
  }
  
  $fields = ["id", "user_id", "status", "sub_total", "paid", "shipping",
      "int_shipping", "shipping_date", "paid_date", "created_time", "name",
      "paypal_trans_id", "usps_track_id", "class_name"];
  $address_fields = 
      ["phone", "email", "street", "city", "state", "country", "zip"];
  
  if ($withAddress) {
    $fields = array_merge($fields, $address_fields);
  }

  $orders = $medoo->select("orders", $fields, ["AND" => 
      array_merge($userFilter, $statusFilter, $timeFilter, $classFilter)]); 
  if (!$withItems) return $orders;

  foreach ($orders as $index => $order) {
    $order["items"] = $medoo->select("order_details", "*", 
        ["order_id" => $order["id"]]);
    $orders[$index] = $order;
  }
  return $orders;
}

function place_order($order) {
  global $medoo;

  $items = $order["items"];
  unset($order["items"]);

  $order = array_merge($order, sanitize_address());
  $id = $medoo->insert("orders", $order);
  if (!$id || empty($items)) return $id;

  foreach ($items as $item) {
    unset($item["id"]);
    $item["order_id"] = $id;
    $medoo->insert("order_details", $item);
  }
  return $id;
}

function close_order($id) {
  global $medoo;
  
  $order = get_order($id);
  if (!$order || !_canClose($order)) return false;
  
  $sql = sprintf("INSERT INTO closed_order_details SELECT". 
      "  * from order_details WHERE order_id = %d;", intval($id));
  $medoo->query($sql);
  
  $sql = sprintf("INSERT INTO closed_orders SELECT". 
      "  * from orders WHERE id = %d;", intval($id));
  $medoo->query($sql);
  
  $medoo->delete("order_details", ["order_id" => $id]);
  return $medoo->delete("orders", ["id" => $id]);
}

function delete_order($id) {
  global $medoo;
  
  $medoo->delete("order_details", ["order_id" => $id]);
  return $medoo->delete("orders", ["id" => $id]);
}

function validate_order_post() {
  if (isset($_POST["usps_track_id"])) {
    $_POST["usps_track_id"] = filter_input(INPUT_POST, "usps_track_id",
        FILTER_VALIDATE_REGEXP,
        ["options" => ["regexp" => "/\b[\dA-Z]+\b/"]]);
  }
  if (isset($_POST["paid"])) {
    $_POST["paid"] = filter_input(INPUT_POST, "paid", FILTER_VALIDATE_FLOAT);
  }
  if (isset($_POST["paypal_trans_id"])) {
    $_POST["paypal_trans_id"] = filter_input(INPUT_POST, "paypal_trans_id",
        FILTER_VALIDATE_REGEXP,
        ["options" => ["regexp" => "/\b[\dA-Z]{17}\b/"]]);
  }
}

function update_order($order, $is_manager) {
  global $medoo;

  $data = build_update_data(["paid", "paypal_trans_id", "paid_date"], $order);
  if ($is_manager) {
    $data = array_merge($data, build_update_data(["status", "shipping",
        "int_shipping", "sub_total", "usps_track_id"], $order));
  }
  
  if (!empty($data["paid"]) && empty($data["paid_date"])) {
    $data["#paid_date"] = "CURDATE()";
  }

  return $medoo->update("orders", $data, ["id" => $order["id"]]);
}

function sanitize_address() {
  if (!is_country_code($_POST["country"])) return null;

  $data = [];
  foreach (["name", "phone", "street", "city", "zip"] as $key) {
    $data[$key] = filter_input(INPUT_POST, $key, FILTER_SANITIZE_STRING,
        FILTER_REQUIRE_SCALAR);
    if (empty($data[$key])) exit();
  }
  return $data;
}

function get_shop_items($category, $level) {
  global $medoo;

  $filters = null;
  if ($category) {
    $filters = ["category" => $category]; 
  }

  if ($level != 99) {
    $categories = array_keys(get_item_categories($level));
    if ($category) {
      if (!array_search($category, $categories)) return [];
    } else {
      $filters = ["category" => $categories]; 
    }
  }
  
  return keyed_by_id($medoo->select("items", "*", $filters));
}

function get_item_categories($level) {
  global $medoo;

  if ($level == 99) {
    return keyed_by_id($medoo->select("item_categories", "*"));
  }
  return keyed_by_id($medoo->select("item_categories", "*", ["OR" => [
          "level" => $level, 
          "AND" => ["level[<=]" => $level, "shared" => 1]
      ]]));
}

function update_item($item) {
	global $medoo;

  return insertOrUpdate($medoo, "items", $item);
}

function get_order_stats($year) {
  global $medoo;

  $classes = keyed_by_id($medoo->select("classes", ["id", "name"], 
      ["start_year" => $year]));
  
  if (empty($classes)) return [];
  
  foreach ($classes as $classId => $classInfo) {
    $userIdSql = sprintf("SELECT id FROM users WHERE classId=%d",
        intval($classId)); 
    $orderIdSql = sprintf("SELECT id FROM orders WHERE user_id IN (%s)",
        $userIdSql);
    $sql = sprintf("SELECT item_id, price, sum(count) as group_count FROM ".
        "order_details WHERE order_id IN (%s) GROUP BY item_id;", $orderIdSql);
    $stats = $medoo->query($sql)->fetchAll();
    
    if (empty($stats)) {
      unset($classes[$classId]);
    } else {
      $classInfo["stats"] = keyed_by_id($stats, "item_id");
      $classes[$classId] = $classInfo;
    }
  }
  return $classes;
}

function merge_orders($order_ids) {
  global $medoo;

  $orders = $medoo->select("orders", "*", ["id" => $order_ids]);
  if (sizeof($orders) < 2) return;
  
  $first_order = array_shift($orders);
  $id = $first_order["id"];
  $user_id = $first_order["user_id"];
  $status = $first_order["status"];
  
  foreach ($orders as $index => $order) {
    if ($order["user_id"] != $user_id || $order["status"] != $status ||
        !same_address($first_order, $order)) continue;
    
    $first_order["sub_total"] += $order["sub_total"];
    $first_order["paid"] += $order["paid"];
    $first_order["shipping"] += $order["shipping"];
    $first_order["int_shipping"] += $order["int_shipping"];
    
    if ($medoo->update("order_details", ["order_id" => $id], 
        ["order_id" => $order["id"]])) {
      $medoo->delete("orders", ["id" => $order["id"]]);    
    }
  }

  $data = ["sub_total" => $first_order["sub_total"], 
      "paid" => $first_order["paid"], 
      "shipping" => $first_order["shipping"],
      "int_shipping" => $first_order["int_shipping"]
  ];
  return ["updated" => $medoo->update("orders", $data, ["id" => $id])];
}

/// Moves selected items from [$fromOrder] to [$toOrder].
///
/// "id", "sub_total", "int_shipping" of both orders are required.
/// id, price, count, int_shipping of each item are required.  
function move_order_items($fromOrder, $toOrder) {
  global $medoo;

  if (!$fromOrder["id"] || !$toOrder["id"]) return 0;
  
  function selected($item) { return $item["selected"]; }
  $items = array_filter($fromOrder["items"], "selected");
  if (empty($items)) return 0;
  
  $updated = 0;
  function get_id($item) { return $item["id"]; }
  $updated = $medoo->update("order_details", ["order_id" => $toOrder["id"]],
      ["id" => array_map("get_id", $items)]);
  if (!$updated) return 0;
  
  function get_total($total, $item) { 
    $total += intval($item["count"]) * floatval($item["price"]);
    return $total;
  }
  function get_int_shipping($shipping, $item) { 
    $shipping += intval($item["count"]) * floatval($item["int_shipping"]);
    return $shipping;
  }
  $sub_total = array_reduce($items, "get_total", 0.0);
  $int_shipping = array_reduce($items, "get_int_shipping", 0.0);
  
  $fromOrder["sub_total"] = floatval($fromOrder["sub_total"]) - $sub_total;
  $fromOrder["int_shipping"] = 
      floatval($fromOrder["int_shipping"]) - $int_shipping;
  $toOrder["sub_total"] = floatval($toOrder["sub_total"]) + $sub_total;
  $toOrder["int_shipping"] =
      floatval($toOrder["int_shipping"]) + $int_shipping;
  
  $grand = $sub_total + $int_shipping;
  if (floatval($fromOrder["paid"]) >= $grand) {
    $fromOrder["paid"] = floatval($fromOrder["paid"]) - $grand;
    $toOrder["paid"] = floatval($toOrder["paid"]) + $grand;
    $toOrder["paid_date"] = $fromOrder["paid_date"];
  }

  $updated += update_order($fromOrder, TRUE);
  $updated += update_order($toOrder, TRUE);
  return $updated;
}

function delete_order_item($id) {
  global $medoo;
  
  return $medoo->delete("order_details", ["id" => $id]);
}

function get_book_list($dep_id, $term, $classId) {
  global $medoo;

  if (!$dep_id && !$term) {
  	$classes = $medoo->select("classes", "*", ["id" => intval($classId)]);
  	if (empty($classes)) return [];

  	$classInfo = current($classes);
  	$dep_id = $classInfo["department_id"];
  	$term = $classInfo["term"];
  }
  return $medoo->select("book_lists", "item_id", ["AND" =>
      ["department_id" => intval($dep_id), "term" => intval($term)]]);
}

function update_book_list($bookList) {
  global $medoo;
  
  $where = build_update_data(["department_id", "term"], $bookList);

  $updated = $medoo->delete("book_lists", ["AND" => $where]);
  if (empty($bookList["bookIds"])) return $updated;

  foreach ($bookList["bookIds"] as $bookId) {
    $data = array_merge([], $where, ["item_id" => $bookId]);
    $medoo->insert("book_lists", $data);
    $updated++;
  }
  return $updated;
}

function remove_book_list($depId, $term) {
  global $medoo;
  
  return $medoo->delete("book_lists", 
      ["AND" => ["department_id" => $depId, "term" => $term]]);
}

function get_class_book_lists($year) {
  global $medoo;
  
  return keyed_by_id($medoo->select("classes", ["id", "name",
      "department_id", "term"], ["start_year" => $year]));
}

function update_class_term($classInfo) {
  global $medoo;

  return $medoo->update("classes", ["term" => intval($classInfo["term"])],
      ["id" => intval($classInfo["id"])]);
}

function get_requested_level($user, $request) {
  if (!is_numeric($request["level"])) return _getDepartmentLevel($user);

  $requestedLevel = intval($request["level"]);
  return isOrderManager($user)
      ? $requestedLevel
      : min([_getDepartmentLevel($user), $requestedLevel]);
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
  if ($resource_id == "orders") {
    if (isset($_GET["order_id"])) {
      $order = get_order($_GET["order_id"]);
      if (!$order) {
        $response = "{}";
      } elseif (isOrderManager($user) || $order["user_id"] == $user->id) {
        $response = $order;
      } else {
        $response = permision_denied_error();
      }
    } elseif (empty($_GET["student_id"])) {
      if (isOrderManager($user)) {
        $response = get_orders(null, $_GET, $_GET["items"], 
            canReadOrderAddress($user));
      } else {
        $classIds = _getManagedClasses($user);
        $response = $classIds ? get_orders(null, 
            array_merge($_GET, ["class_id" => $classIds]), 
            $_GET["items"],
            TRUE) : permision_denied_error();
      }
    } else {
      $response = $_GET["student_id"] == $user->id
      ? get_orders($user->id, $_GET, $_GET["items"], canReadOrderAddress($user))
      : permision_denied_error();
    }
  } elseif ($resource_id == "items") {
    $level = get_requested_level($user, $_GET);
    $response = get_shop_items($_GET["category"], $level);
  } elseif ($resource_id == "item_categories") {
    $response = get_item_categories(get_requested_level($user, $_GET));
  } elseif ($resource_id == "order_stats") {
    $response = isOrderManager($user) 
        ? get_order_stats($_GET["year"]) 
        : permision_denied_error();
  } elseif ($resource_id == "book_lists") {
    $response = get_book_list($_GET["dep_id"], $_GET["term"], $user->classId); 
  } elseif ($resource_id == "class_book_lists") {
    $response = isOrderManager($user) 
        ? get_class_book_lists($_GET["year"]) 
        : permision_denied_error();
  }
} else if ($_SERVER ["REQUEST_METHOD"] == "POST" && isset ( $_POST ["rid"] )) {
  $resource_id = $_POST["rid"];
  unset($_POST["rid"]);
  
  if ($resource_id == "orders") {
    $order = $_POST;
    validate_order_post();
    if ($order["user_id"] != $user->id && !isOrderManager($user)) {
      $response = permision_denied_error();
    } elseif (empty($order["id"])) {
      if (empty($order["class_name"])) {
        $order["class_name"] = $user->classInfo["name"];
      }
      $response = ["updated" => place_order($order)];
    } else {
      $response = ["updated" => update_order($order, isOrderManager($user))];
    }
  } elseif ($resource_id == "move_items") {
    $response = isOrderManager($user)
      ? ["updated" => 
          move_order_items($_POST["from_order"], $_POST["to_order"])]
      : permision_denied_error();
  } elseif ($resource_id == "book_lists") {
    $response = isOrderManager($user)
      ? ["updated" => update_book_list($_POST)]
      : permision_denied_error();
  } elseif ($resource_id == "class_book_lists") {
    $response = isOrderManager($user)
      ? ["updated" => update_class_term($_POST)]
      : permision_denied_error();
  } elseif ($resource_id == "items") {
    $response = isOrderManager($user)
        ? ["updated" => update_item($_POST)]
        : permision_denied_error();
  }
} elseif ($_SERVER ["REQUEST_METHOD"] == "DELETE" &&
    isset ( $_REQUEST["rid"] )) {

  $resource_id = $_REQUEST["rid"];

  $record = get_single_record($medoo, $resource_id, $_REQUEST["id"]);
  error_log($user->email ." DELETE ". json_encode($record));
  if (!isOrderManager($user)) {
    $response = permision_denied_error();
  } elseif ($resource_id == "orders") {
    if (floatval($record["paid"]) >= 0.01 || 
        !empty($record["paypal_trans_id"]) || 
        !empty($record["usps_track_id"])) {
      $response = ["error" => "order is paid or shipped"];
    } else {
      $response = ["deleted" => delete_order($_REQUEST["id"])];
    }
  } elseif ($resource_id == "order_details") {
    $response = ["deleted" => delete_order_item($_REQUEST["id"])];
  } elseif ($resource_id == "book_lists") {
    $response = 
        ["deleted" => remove_book_list($_REQUEST["dep_id"], $_REQUEST["term"])];
  } elseif ($resource_id == "book_list_details") {
    $response = ["deleted" => remove_list_detail($_REQUEST["id"])];
  } elseif ($resource_id == "class_book_lists") {
    $response = ["deleted" => remove_class_book_list($_REQUEST["id"])];
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
