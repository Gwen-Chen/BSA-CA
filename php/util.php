<?php
/// Returns true if the [$table] exists in the database.
function table_exists($medoo, $table) {
  $result = $medoo->query("SELECT 1 FROM ". $table. " LIMIT 1");
  return !empty($result);
}

function permision_denied_error() {
  return ["error" => "permission denied"];
}

function get_db_error2($medoo) {
  $errors = $medoo->error();
  return empty($errors) ? '' : $errors[2];
}

function keyed_by_id($rows, $id_key = "id") {
  $result = [];

  if (!is_array($rows) || empty($rows)) return $result;

  foreach ($rows as $row) {
    $result[$row[$id_key]] = $row;
  }

  return $result;
}

function build_update_data($fields, $source) {
  $datas = [];
  foreach ($fields as $field) {
    if (isset($source[$field])) {
      $datas[$field] = $source[$field];
    }
  }
  return $datas;
}

function same_address($order1, $order2) {
  return $order1["zipcode"] == $order2["zipcode"] &&
    $order1["street"] == $order2["street"] &&
    $order1["city"] == $order2["city"] &&
    $order1["state"] == $order2["state"] &&
    $order1["country"] == $order2["country"];
}

function is_uppercase($char) {
  return 'A' <= $char && $char <= 'Z';
}

function is_country_code($countryCode) {
  return strlen($countryCode) == 2 && is_uppercase($countryCode[0]) &&
      is_uppercase($countryCode[1]);
}

function is_email_blocked($email) {
  foreach(["sharklasers", "try-rx"] as $blocked) {
    if (strstr(strtolower($email), $blocked)) return true;
  }
  return false;
}

function get_single_record($medoo, $table, $id) {
  $results = $medoo->select($table, "*", ["id" => $id]);
  return empty($results) ? null : current($results);
}

function send_post_request($url, $data) {
  try {
    $ch = curl_init();

    if (FALSE === $ch) {
      return null;
    }

    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_TIMEOUT, 60);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));

    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_USERAGENT, $_SERVER['HTTP_USER_AGENT']);

    $response = curl_exec($ch);
    curl_close($ch);
    $ch = null;

    return $response;
  } catch(Exception $e) {
    if ($ch) {
      curl_close($ch);
    }
    $message = sprintf("Curl failed with error #%d: %s",
        $e->getCode(), $e->getMessage());
    error_log($message);
    echo "<div>". $message. "</div>\n";
  }
  return null;
}

// Check whether the user input a correct captcha.
function checkCaptcha($captcha) {
  $url = "https://www.google.com/recaptcha/api/siteverify";
  $captchaResponse = send_post_request($url, 
      ["secret" => "6Lf7GyYUAAAAAD3Ccinx7AU-MWBW8gEagp1hOo-L",
      "response" => $captcha]);

  if (!$captchaResponse) return false;

  $result = json_decode($captchaResponse);
  return $result->success;
}

/// Inserts or updates [$table] for the [$record].
///
/// If [$record] has an non-zero "id", the record in [$table] with the id is
/// updated. Otherwise a new record is inserted into the [$table] and a new id
/// is returned.
function insertOrUpdate($medoo, $table, $record) {
  $id = intval($record["id"]);
  if ($id) {
    $medoo->update($table, $record, ["id" => $id]);
    return $id;
  } else {
    return intval($medoo->insert($table, $record));
  }
}

function run_sql_file($file, $medoo) {
  $sqls = file_get_contents($file);
  $medoo->query($sqls);
}
?>
