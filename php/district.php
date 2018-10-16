<?php
function ensure_country_columns($medoo) {
  $query = "ALTER TABLE classes ADD country CHAR(2) NOT NULL DEFAULT 'US'";
  $medoo->query($query);
}
?>
