<?php
class User {
  public static $int_fields = ["sex", "permission", "education",
      "conversion", "classId", "volunteer", "channel", "enroll_tasks",
      "entrance", "state", "zb_id", "yy", "birthyear", "start_year"];
  public function __construct($row) {
    foreach ($row as $key => $value) {
      $this->$key = in_array($key, User::$int_fields) ? intval($value) : $value;
    }
  }
}
?>
