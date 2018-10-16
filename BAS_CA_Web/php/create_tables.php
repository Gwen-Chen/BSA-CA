-- <?php /* This SQL file is named as PHP to avoid accidental web access.

drop database if exists buddcourses;
CREATE DATABASE buddcourses;
USE buddcourses;

-- deparment 1: 基础班
-- deparment 2: 入行论班
-- deparment 3: 加行班
-- deparment 4: 净土班
CREATE TABLE departments (
                          id TINYINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                          name VARCHAR(32)
                          );
INSERT INTO departments(name) VALUES ("基础班");
INSERT INTO departments(name) VALUES ("入行论班");
INSERT INTO departments(name) VALUES ("加行班");
INSERT INTO departments(name) VALUES ("净土班");
INSERT INTO departments(name) VALUES ("密法班");
INSERT INTO departments(name) VALUES ("五论班");
INSERT INTO departments(name) VALUES ("念佛堂");

CREATE TABLE tasks (
                    id MEDIUMINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                    department_id TINYINT,
              INDEX department_id_idx(department_id),
              FOREIGN KEY (department_id)
                REFERENCES departments(id),
                    name VARCHAR(32),
                    max INT
                      );
INSERT INTO tasks(department_id, name) VALUES (2, "观修");
INSERT INTO tasks(department_id, name) VALUES (2, "观音心咒");
INSERT INTO tasks(department_id, name, max) VALUES (3, "顶礼", 100000);
INSERT INTO tasks(department_id, name) VALUES (3, "观修");
INSERT INTO tasks(department_id, name) VALUES (3, "念诵《开显解脱道》");
INSERT INTO tasks(department_id, name, max) VALUES (3, "金刚萨埵心咒", 100000);
INSERT INTO tasks(department_id, name) VALUES (4, "阿弥陀佛圣号");
INSERT INTO tasks(department_id, name) VALUES (4, "阿弥陀佛圣号（藏文）");

-- perm_level: 0 everyone 1 leader 2 teacher 3 admin
CREATE TABLE classes (
                    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                    department_id TINYINT,
              INDEX department_id_idx(department_id),
              FOREIGN KEY (department_id)
                REFERENCES departments(id),
                      name VARCHAR(32),
                      email VARCHAR(32),
                      class_room VARCHAR(16),
            teacher_id INT,
            start_year MEDIUMINT,
            perm_level INT DEFAULT 3
                      );

-- id: 1. unassigned students are put temporarily here.
INSERT INTO classes(department_id, name, class_room, email, start_year, perm_level) VALUES (1, "未分班学员", "", "", 0, 0); -- 1
INSERT INTO classes(department_id, name, class_room, email, start_year, perm_level) VALUES (2, "1506周四入行论", "99343758", "", 2015, 2); -- 2
INSERT INTO classes(department_id, name, class_room, email, start_year, perm_level) VALUES (2, "1506周日入行论", "99343758", "", 2015, 2); -- 3
INSERT INTO classes(department_id, name, class_room, email, start_year, perm_level) VALUES (3, "1506周二加行", "99343758", "", 2015, 2); -- 4
INSERT INTO classes(department_id, name, class_room, email, start_year, perm_level) VALUES (3, "1506周四加行", "99343758", "", 2015, 2); -- 5
INSERT INTO classes(department_id, name, class_room, email, start_year, perm_level) VALUES (3, "1506周六加行", "99343758", "", 2015, 2); -- 6
INSERT INTO classes(department_id, name, class_room, email, start_year, perm_level) VALUES (4, "1506周一净土", "99343758", "", 2015, 2); -- 7
INSERT INTO classes(department_id, name, class_room, email, start_year, perm_level) VALUES (2, "1506微信入行论班", "99343758", "", 2015, 2);  -- 8
INSERT INTO classes(department_id, name, class_room, email, start_year, perm_level) VALUES (3, "1506微信加行班", "99343758", "", 2015, 2);  -- 9
INSERT INTO classes(department_id, name, class_room, email, start_year, perm_level) VALUES (4, "1506微信净土班", "99343758", "", 2015, 2);  -- 10

INSERT INTO classes(department_id, name, class_room, email, start_year, perm_level) VALUES (2, "1406入行论", "99343758", "", 2014, 2); -- 11
INSERT INTO classes(department_id, name, class_room, email, start_year, perm_level) VALUES (3, "1406加行", "99343758", "", 2014, 2); -- 12
INSERT INTO classes(department_id, name, class_room, email, start_year, perm_level) VALUES (3, "1406西雅圖加行", "99343758", "", 2014, 2); -- 13

INSERT INTO classes(department_id, name, class_room, email, start_year, perm_level) VALUES (3, "1312加行", "99343758", "", 2013, 2); -- 14
INSERT INTO classes(department_id, name, class_room, email, start_year, perm_level) VALUES (2, "1312入行论", "99343758", "", 2013, 2); -- 15
INSERT INTO classes(department_id, name, class_room, email, start_year, perm_level) VALUES (2, "1306入行论", "99343758", "", 2013, 2); -- 16
INSERT INTO classes(department_id, name, class_room, email, start_year, perm_level) VALUES (3, "1306加行", "99343758", "", 2013, 2); -- 17
INSERT INTO classes(department_id, name, class_room, email, start_year, perm_level) VALUES (4, "1306淨土", "99343758", "", 2013, 2);  -- 18

INSERT INTO classes(department_id, name, class_room, email, start_year, perm_level) VALUES (3, "1212加行", "99343758", "", 2012, 2); -- 19
INSERT INTO classes(department_id, name, class_room, email, start_year, perm_level) VALUES (2, "1206地方入行论", "99343758", "", 2012, 2); -- 20
INSERT INTO classes(department_id, name, class_room, email, start_year, perm_level) VALUES (2, "1206入行论", "99343758", "", 2012, 2); -- 21
INSERT INTO classes(department_id, name, class_room, email, start_year, perm_level) VALUES (3, "1206加行", "99343758", "", 2012, 2); -- 22

CREATE TABLE course_groups(
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      department_id TINYINT,
              INDEX department_id_idx(department_id),
              FOREIGN KEY (department_id)
                REFERENCES departments(id),
      name VARCHAR(64),
      url VARCHAR(512)
);
INSERT INTO course_groups(department_id, name, url) VALUES(2, "入行论", "http://www.zhibeifw.com/cmsc/list.php?fid=77");
INSERT INTO course_groups(department_id, name, url) VALUES(3, "前行广释", "http://www.zhibeifw.com/cmsc/list.php?fid=70");
INSERT INTO course_groups(department_id, name, url) VALUES(4, "佛说阿弥陀经释+普贤行愿品释+亲友书讲记", "");
INSERT INTO course_groups(department_id, name, url) VALUES(1, "离幸福很近", "");

CREATE TABLE courses (
                      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                      group_id INT,
                      name VARCHAR(64),
                      video_url VARCHAR(512),
                      text_url VARCHAR(512)
                      );

-- 1 ~ 23
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(1, "入行论广解1-2课", "", "");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(1, "入行论广解3-4课", "", "");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(1, "入行论广解5-6课", "", "");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(1, "入行论广解7-8课", "", "");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(1, "入行论广解9-10课", "", "");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(1, "入行论广解11-12课", "", "");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(1, "入行论广解13-14课", "", "");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(1, "入行论广解15-16课", "", "");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(1, "入行论广解17-18课", "", "");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(1, "入行论广解19-20课", "", "");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(1, "入行论广解21-22课", "", "");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(1, "入行论广解23-24课", "", "");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(1, "入行论广解25-26课", "", "");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(1, "入行论广解27-28课", "", "");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(1, "入行论广解29-30课", "", "");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(1, "入行论广解31-22课", "", "");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(1, "入行论广解33-24课", "", "");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(1, "入行论广解35-36课", "", "");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(1, "入行论广解37-38课", "", "");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(1, "入行论广解39-40课", "", "");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(1, "入行论广解41-42课", "", "");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(1, "入行论广解43-44课", "", "");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(1, "入行论广解45-46课", "", "");

-- 24 ~ 46
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(2, "前行之重要性", "http://www.zhibeifw.com/sskc/sskcmv.php?fid=756&id=770", "http://www.zhibeifw.com/down/videodymqx/qxzzyx.doc");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(2, "《上师瑜伽速赐加持》讲记", "http://www.zhibeifw.com/sskc/sskcmv.php?fid=132&id=725", "http://www.zhibeifw.com/down/doc/201101110003.doc");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(2, "前行广释第1课", "http://www.zhibeifw.com/sskc/sskcmv.php?fid=756&id=957", "http://www.zhibeifw.com/down/videodymqx/dymqxgs001.doc");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(2, "前行广释第2课", "http://www.zhibeifw.com/sskc/sskcmv.php?fid=756&id=2", "http://www.zhibeifw.com/down/videodymqx/dymqxgs002.doc");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(2, "前行广释第3课", "http://www.zhibeifw.com/sskc/sskcmv.php?fid=114&id=3", "http://www.zhibeifw.com/down/videodymqx/dymqxgs003.doc");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(2, "前行广释第4课", "http://www.zhibeifw.com/sskc/sskcmv.php?fid=114&id=4", "http://www.zhibeifw.com/down/videodymqx/dymqxgs004.doc");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(2, "前行广释第5课", "http://www.zhibeifw.com/sskc/sskcmv.php?fid=114&id=5", "http://www.zhibeifw.com/down/videodymqx/dymqxgs005.doc");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(2, "前行广释第6课", "http://www.zhibeifw.com/sskc/sskcmv.php?fid=114&id=6", "http://www.zhibeifw.com/down/videodymqx/dymqxgs006.doc");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(2, "前行广释第7课", "http://www.zhibeifw.com/sskc/sskcmv.php?fid=114&id=7", "http://www.zhibeifw.com/down/videodymqx/dymqxgs007.doc");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(2, "前行广释第8课", "", "");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(2, "前行广释第9课", "", "");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(2, "前行广释第10课", "", "");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(2, "前行广释第11课", "", "");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(2, "前行广释第12课", "", "");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(2, "前行广释第13课", "", "");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(2, "前行广释第14课", "", "");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(2, "前行广释第15课", "", "");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(2, "前行广释第16课", "", "");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(2, "前行广释第17课", "", "");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(2, "前行广释第18课", "", "");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(2, "前行广释第19课", "", "");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(2, "前行广释第20课", "", "");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(2, "前行广释第21课", "", "");

-- 47 ~ 69
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(3, "佛说阿弥陀经释第1课", "", "");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(3, "佛说阿弥陀经释第2课", "", "");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(3, "佛说阿弥陀经释第3课", "", "");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(3, "佛说阿弥陀经释第4课", "", "");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(3, "普贤行愿品释第1课", "", "");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(3, "普贤行愿品释第2课", "", "");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(3, "普贤行愿品释第3课", "", "");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(3, "普贤行愿品释第4课", "", "");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(3, "普贤行愿品释第5课", "", "");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(3, "普贤行愿品释第6课", "", "");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(3, "普贤行愿品释第7课", "", "");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(3, "普贤行愿品释第8课", "", "");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(3, "普贤行愿品释第9课", "", "");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(3, "普贤行愿品释第10课", "", "");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(3, "普贤行愿品释第11课", "", "");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(3, "普贤行愿品释第12课", "", "");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(3, "亲友书讲记第1课", "", "");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(3, "亲友书讲记第2课", "", "");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(3, "亲友书讲记第3课", "", "");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(3, "亲友书讲记第4课", "", "");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(3, "亲友书讲记第5课", "", "");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(3, "亲友书讲记第6课", "", "");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(3, "亲友书讲记第7课", "", "");

-- 70 ~ 92
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(4, "怎样面对痛苦", "", "");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(4, "金钱，到底有多值钱", "", "");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(4, "问佛陀情为何物", "", "");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(4, "幸福的根本是心", "", "");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(4, "科技发达时代的佛法教育", "", "");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(4, "佛法的生命科学观", "", "");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(4, "来世生命及往生净土", "", "");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(4, "信心是最好的财富", "", "");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(4, "初学者不应视师如佛", "", "");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(4, "有十种事情不能做", "", "");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(4, "略说忏罪", "", "");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(4, "让你重新认识佛教", "", "");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(4, "怎么样学佛", "", "");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(4, "佛教的未来需要你我", "", "");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(4, "如何寻找大乘的方向", "", "");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(4, "三殊胜", "", "");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(4, "再谈放生", "", "");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(4, "为临终者献爱心", "", "");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(4, "以佛法利益亡者", "", "");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(4, "观音心咒之功德", "", "");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(4, "什么是密宗  ", "", "");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(4, "胜利道歌讲记第1课", "", "");
INSERT INTO courses(group_id, name, video_url, text_url) VALUES(4, "胜利道歌讲记第2课", "", "");

CREATE TABLE users(
            id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            sex BOOLEAN,
            education TINYINT,
            volunteer TINYINT,
            channel TINYINT,
            enroll_tasks TINYINT,
            conversion YEAR,

            classId INT NOT NULL,
              INDEX classId_idx(classId),
              FOREIGN KEY (classId)
                REFERENCES classes(id),
            permission INT,
            birthday DATETIME,

            email VARCHAR(40) NOT NULL,
            UNIQUE KEY email_idx(email),
            password VARCHAR(32),

            internal_id VARCHAR(8),
            name VARCHAR(20),
            nickname VARCHAR(8),

            im VARCHAR(16),
            phone VARCHAR(16),
            city VARCHAR(32),
            state VARCHAR(8),
            country VARCHAR(16),

            occupation VARCHAR(20),
            skills VARCHAR(16),

            comments VARCHAR(16));

CREATE TABLE schedule_groups (
                      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                      classId INT,
                INDEX classId_idx(classId),
                FOREIGN KEY (classId)
                  REFERENCES classes(id),
                      course_group INT,
                      name VARCHAR(64),
                      start_time DATETIME,
                      end_time DATETIME                      
                      );
INSERT INTO schedule_groups(classId, course_group, name, start_time, end_time) VALUES (2, 1, "2015届入行论周四班2016年春季学期", "2015-12-04 02:00:00", "2016-05-31 22:00:00");
INSERT INTO schedule_groups(classId, course_group, name, start_time, end_time) VALUES (3, 1, "2015届入行论周日班2016年春季学期", "2015-12-06 14:30:00", "2016-05-31 22:00:00");
INSERT INTO schedule_groups(classId, course_group, name, start_time, end_time) VALUES (4, 2, "2015届加行周二班2016年春季学期", "2015-12-02 03:00:00", "2016-05-31 22:00:00");
INSERT INTO schedule_groups(classId, course_group, name, start_time, end_time) VALUES (5, 2, "2015届加行周四班2016年春季学期", "2015-12-04 02:00:00", "2016-05-31 22:00:00");
INSERT INTO schedule_groups(classId, course_group, name, start_time, end_time) VALUES (6, 2, "2015届加行周六班2016年春季学期", "2015-12-05 19:00:00", "2016-05-31 22:00:00");
INSERT INTO schedule_groups(classId, course_group, name, start_time, end_time) VALUES (7, 3, "2015届净土班2016年春季学期", "2015-12-01 02:30:00", "2016-05-31 22:00:00");
INSERT INTO schedule_groups(classId, course_group, name) VALUES (1, 4, "基础班第一学期");
                      
CREATE TABLE schedules (
             id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
             group_id INT,
                INDEX group_id_idx(group_id),
                FOREIGN KEY (group_id)
                  REFERENCES schedule_groups(id),
             course_id INT,
             open INT,
             review INT
                      );
INSERT INTO schedules(group_id, course_id, open, review) VALUES (1, 1, 2, 0);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (1, 2, 9, 5);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (1, 3, 3, 7);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (1, 0, 0, 0);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (1, 4, 10, 1);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (1, 5, 5, 19);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (1, 6, 7, 6);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (1, 7, 1, 15);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (1, 8, 19, 11);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (1, 9, 6, 18);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (1, 0, 0, 0);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (1, 10, 11, 16);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (1, 11, 18, 13);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (1, 12, 8, 17);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (1, 13, 16, 12);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (1, 14, 13, 9);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (1, 15, 17, 14);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (1, 16, 12, 10);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (1, 17, 9, 2);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (1, 18, 14, 7);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (1, 19, 10, 3);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (1, 20, 2, 19);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (1, 21, 7, 5);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (1, 22, 3, 15);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (1, 23, 19, 1);

INSERT INTO schedules(group_id, course_id, open, review) VALUES (2, 1, 2, 0);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (2, 2, 9, 5);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (2, 3, 3, 7);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (2, 0, 0, 0);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (2, 4, 10, 1);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (2, 5, 5, 19);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (2, 6, 7, 6);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (2, 7, 1, 15);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (2, 8, 19, 11);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (2, 9, 6, 18);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (2, 0, 0, 0);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (2, 10, 11, 16);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (2, 11, 18, 13);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (2, 12, 8, 17);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (2, 13, 16, 12);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (2, 14, 13, 9);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (2, 15, 17, 14);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (2, 16, 12, 10);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (2, 17, 9, 2);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (2, 18, 14, 7);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (2, 19, 10, 3);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (2, 20, 2, 19);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (2, 21, 7, 5);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (2, 22, 3, 15);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (2, 23, 19, 1);

INSERT INTO schedules(group_id, course_id, open, review) VALUES (3, 24, 2, 0);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (3, 25, 9, 5);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (3, 26, 3, 7);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (3, 0, 0, 0);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (3, 27, 10, 1);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (3, 28, 5, 19);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (3, 29, 7, 6);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (3, 30, 1, 15);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (3, 31, 19, 11);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (3, 32, 6, 18);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (3, 0, 0, 0);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (3, 33, 11, 16);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (3, 34, 18, 13);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (3, 35, 8, 17);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (3, 36, 16, 12);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (3, 37, 13, 9);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (3, 38, 17, 14);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (3, 39, 12, 10);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (3, 40, 9, 2);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (3, 41, 14, 7);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (3, 42, 10, 3);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (3, 43, 2, 19);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (3, 44, 7, 5);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (3, 45, 3, 15);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (3, 46, 19, 1);

INSERT INTO schedules(group_id, course_id, open, review) VALUES (4, 24, 2, 0);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (4, 25, 9, 5);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (4, 26, 3, 7);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (4, 0, 0, 0);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (4, 27, 10, 1);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (4, 28, 5, 19);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (4, 29, 7, 6);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (4, 30, 1, 15);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (4, 31, 19, 11);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (4, 32, 6, 18);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (4, 0, 0, 0);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (4, 33, 11, 16);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (4, 34, 18, 13);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (4, 35, 8, 17);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (4, 36, 16, 12);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (4, 37, 13, 9);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (4, 38, 17, 14);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (4, 39, 12, 10);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (4, 40, 9, 2);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (4, 41, 14, 7);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (4, 42, 10, 3);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (4, 43, 2, 19);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (4, 44, 7, 5);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (4, 45, 3, 15);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (4, 46, 19, 1);

INSERT INTO schedules(group_id, course_id, open, review) VALUES (5, 24, 2, 0);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (5, 25, 9, 5);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (5, 26, 3, 7);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (5, 0, 0, 0);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (5, 27, 10, 1);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (5, 28, 5, 19);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (5, 29, 7, 6);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (5, 30, 1, 15);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (5, 31, 19, 11);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (5, 32, 6, 18);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (5, 0, 0, 0);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (5, 33, 11, 16);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (5, 34, 18, 13);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (5, 35, 8, 17);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (5, 36, 16, 12);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (5, 37, 13, 9);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (5, 38, 17, 14);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (5, 39, 12, 10);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (5, 40, 9, 2);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (5, 41, 14, 7);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (5, 42, 10, 3);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (5, 43, 2, 19);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (5, 44, 7, 5);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (5, 45, 3, 15);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (5, 46, 19, 1);

INSERT INTO schedules(group_id, course_id, open, review) VALUES (6, 47, 2, 0);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (6, 48, 9, 5);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (6, 49, 3, 7);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (6, 0, 0, 0);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (6, 50, 10, 1);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (6, 51, 5, 19);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (6, 52, 7, 6);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (6, 53, 1, 15);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (6, 54, 19, 11);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (6, 55, 6, 18);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (6, 0, 0, 0);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (6, 56, 11, 16);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (6, 57, 18, 13);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (6, 58, 8, 17);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (6, 59, 16, 12);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (6, 60, 13, 9);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (6, 61, 17, 14);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (6, 62, 12, 10);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (6, 63, 9, 2);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (6, 64, 14, 7);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (6, 65, 10, 3);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (6, 66, 2, 19);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (6, 67, 7, 5);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (6, 68, 3, 15);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (6, 69, 19, 1);

INSERT INTO schedules(group_id, course_id, open, review) VALUES (7, 70, 2, 0);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (7, 71, 9, 5);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (7, 72, 3, 7);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (7, 73, 10, 1);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (7, 74, 5, 19);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (7, 75, 7, 6);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (7, 76, 1, 15);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (7, 77, 19, 11);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (7, 78, 6, 18);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (7, 79, 11, 16);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (7, 80, 18, 13);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (7, 81, 8, 17);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (7, 82, 16, 12);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (7, 83, 13, 9);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (7, 84, 17, 14);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (7, 85, 12, 10);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (7, 86, 9, 2);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (7, 0, 0, 0);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (7, 87, 14, 7);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (7, 88, 10, 3);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (7, 89, 2, 19);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (7, 90, 7, 5);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (7, 91, 3, 15);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (7, 0, 0, 0);
INSERT INTO schedules(group_id, course_id, open, review) VALUES (7, 92, 19, 1);

CREATE TABLE task_records (
                 id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                 student_id INT not null,
              INDEX student_id_idx(student_id),
              FOREIGN KEY (student_id)
                REFERENCES users(id),
                 task_id MEDIUMINT,
              INDEX task_id_idx(task_id),
              FOREIGN KEY (task_id)
                REFERENCES tasks(id),
                 count MEDIUMINT,
                 sum INT,
                 ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                 );

-- attended: 0 absent, 1 present, 2 vacation
CREATE TABLE schedule_records (
                 student_id INT not null,
              INDEX student_id_idx(student_id),
              FOREIGN KEY (student_id)
                REFERENCES users(id),
                 course_id INT,
              INDEX course_id_idx(course_id),
                 attended TINYINT,
                 video BOOLEAN, 
                 text BOOLEAN, 
                 ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                 );

-- */ ?>
