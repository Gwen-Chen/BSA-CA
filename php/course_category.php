<?php
function init_course_category_column($medoo) {
  $query = "ALTER TABLE course_groups
      ADD COLUMN category MEDIUMINT DEFAULT 1,
      ADD FOREIGN KEY fk_course_category(category)
  		REFERENCES item_categories(id);";
  $ret = $medoo->query($query);
  if (!$ret) return;
  
  $medoo->update("course_groups", ["category" => 1], ["id" => [4, 11]]);
  $medoo->update("course_groups", ["category" => 2], ["name[~]" => "限制性课程"]);
  $medoo->update("course_groups", ["category" => 3], ["name[~]" => "前行"]);
  $medoo->update("course_groups", ["category" => 3], ["name[~]" => "入行论"]);
  $medoo->update("course_groups", ["category" => 3], ["name[~]" => "藏传净土"]);
}
?>
