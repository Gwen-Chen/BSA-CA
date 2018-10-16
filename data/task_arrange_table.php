-- <?php /* This SQL file is named as PHP to avoid accidental web access.

CREATE TABLE IF NOT EXISTS task_arrange (
        id INT PRIMARY KEY AUTO_INCREMENT,
        class_id INT,
          FOREIGN KEY (class_id) REFERENCES classes(id),
        task_id MEDIUMINT,
          FOREIGN KEY (task_id) REFERENCES tasks(id),
        start_half_term TINYINT,
        report_half_term TINYINT);
ALTER TABLE `task_arrange` ADD UNIQUE `unique_index`(`class_id`, `task_id`);
-- */ ?>
