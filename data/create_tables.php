-- <?php /* This SQL file is named as PHP to avoid accidental web access.

CREATE TABLE IF NOT EXISTS item_categories(
        id MEDIUMINT PRIMARY KEY AUTO_INCREMENT,
        parent_id MEDIUMINT,
        name VARCHAR(64) COLLATE utf8_unicode_ci NOT NULL
        );
INSERT INTO item_categories (id, name) VALUES(1, "法本");

CREATE TABLE IF NOT EXISTS items (
        id INT PRIMARY KEY AUTO_INCREMENT,
        category MEDIUMINT,
          FOREIGN KEY (category) REFERENCES item_categories(id),
        price DECIMAL(10, 2) NOT NULL,
        shipping DECIMAL(10, 2),
        name VARCHAR(64) COLLATE utf8_unicode_ci NOT NULL,
        image VARCHAR(256) COLLATE utf8_unicode_ci,
        producer VARCHAR(64) COLLATE utf8_unicode_ci,
        description VARCHAR(64) COLLATE utf8_unicode_ci
        );
INSERT INTO items (id, category, price, shipping, name, image, producer) VALUES
(1, 1, 10.8, 26.17, "预科系入行论教材(全10册)", "images/ruxinglun.jpg", "索达吉堪布"),
(2, 1, 8.4, 22.3, "预科系加行教材(全7册)", "images/jiaxing.jpg", "索达吉堪布"),
(3, 1, 8.4, 19.28, "预科系净土教材(全7册)", "images/jingtu.jpg", "索达吉堪布"),
(4, 1, 0.77, 0, "共修与辅导规范手册与共修示范视频", "images/shangshi.jpg", ""),
(5, 1, 0, 0.21, "生死救度", "images/shangshi.jpg", ""),
(6, 1, 0, 0.65, "菩提路灯", "images/shangshi.jpg", ""),
(7, 1, 1.24, 3.46, "離幸福很近", "images/shangshi.jpg", ""),
(8, 1, 0.75, 0.75, "前行实修法", "images/shangshi.jpg", ""),
(9, 1, 0.78, 0.93, "“压力山大”（大学演讲13）", "images/shangshi.jpg", ""),
(10, 1, 0.78, 1.07, "一切从心开始（大学演讲9）", "images/shangshi.jpg", ""),
(11, 1, 0.78, 1.41, "佛教眼中的神秘（大学演讲2)", "images/shangshi.jpg", ""),
(12, 1, 0.78, 1.29, "冲破迷暗的曙光（大学演讲7）", "images/shangshi.jpg", ""),
(13, 1, 0.78, 1.01, "发掘永远的财富（大学演讲11）", "images/shangshi.jpg", ""),
(14, 1, 0.78, 01.55, "只为一颗“心”（大学演讲14）", "images/shangshi.jpg", ""),
(15, 1, 0.78, 0.99, "唤醒深藏的善（大学演讲15）", "images/shangshi.jpg", ""),
(16, 1, 0.72, 0, "寻觅失落的文明（大学演讲17）", "images/shangshi.jpg", ""),
(17, 1, 0.78, 1.24, "寻觅爱的足迹（大学演讲6）", "images/shangshi.jpg", ""),
(18, 1, 0, 0, "年轻人也需要佛教（大学演讲20）", "images/shangshi.jpg", ""),
(19, 1, 0.78, 1.35, "心灵的诺亚方舟（大学演讲1）", "images/shangshi.jpg", ""),
(20, 1, 0.78, 1.52, "心病还须心药医（大学演讲3）", "images/shangshi.jpg", ""),
(21, 1, 0.78, 1.29, "必须面对的真相（大学演讲5）", "images/shangshi.jpg", ""),
(22, 1, 0.78, 1.29, "打开心扉的密钥（大学演讲8）", "images/shangshi.jpg", ""),
(23, 1, 0.78, 1.15, "探寻藏地瑰宝（大学演讲12）", "images/shangshi.jpg", ""),
(24, 1, 0.78, 1.15, "无私带来的喜乐（大学演讲10）", "images/shangshi.jpg", ""),
(25, 1, 0.72, 0, "智慧比金子还贵（大学演讲18）", "images/shangshi.jpg", ""),
(26, 1, 0.72, 0, "点亮一盏心灯（大学演讲16）", "images/shangshi.jpg", ""),
(27, 1, 0.78, 1.32, "红尘中的净土（大学演讲4）", "images/shangshi.jpg", ""),
(28, 1, 0, 0, "走进藏传佛教（大学演讲19）", "images/shangshi.jpg", "");

CREATE TABLE IF NOT EXISTS orders (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT,
        FOREIGN KEY (user_id) REFERENCES users(id),
        status TINYINT NOT NULL DEFAULT 0,
        sub_total DECIMAL(10, 2) NOT NULL DEFAULT 0,
        paid DECIMAL(10, 2),
        shipping DECIMAL(10, 2),
        `name` varchar(20) COLLATE utf8_unicode_ci NOT NULL,
        `phone` varchar(16),
        `street` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
        `city` varchar(32) COLLATE utf8_unicode_ci NOT NULL,
        `state` tinyint(4) NOT NULL,
        `country` char(2) COLLATE utf8_unicode_ci NOT NULL,
        `zip` char(6) COLLATE utf8_unicode_ci NOT NULL,
        shipping_date DATE,
        paid_date DATE,
        created_time timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
  
CREATE TABLE IF NOT EXISTS closed_orders SELECT * FROM orders LIMIT 0;

CREATE TABLE IF NOT EXISTS order_details (
        id INT PRIMARY KEY AUTO_INCREMENT,
        order_id INT,
        FOREIGN KEY (order_id) REFERENCES orders(id),
        item_id INT,
        FOREIGN KEY (item_id) REFERENCES items(id),
        price DECIMAL(10, 2) NOT NULL,
        count MEDIUMINT NOT NULL DEFAULT 1
      );

CREATE TABLE IF NOT EXISTS closed_order_details 
    SELECT * FROM order_details LIMIT 0;

CREATE TABLE book_lists (
  id INT PRIMARY KEY AUTO_INCREMENT,
  department_id TINYINT NOT NULL,
          FOREIGN KEY (department_id) REFERENCES departments(id),
  term TINYINT NOT NULL,
  item_id INT NOT NULL,
          FOREIGN KEY (item_id) REFERENCES items(id)
);

ALTER TABLE classes ADD COLUMN term TINYINT;
-- */ ?>
