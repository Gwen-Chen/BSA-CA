-- <?php /* This SQL file is named as PHP to avoid accidental web access.

UPDATE item_categories SET name='基础班教材' where id=1;
INSERT INTO item_categories (id, name) VALUES
(2, '大学演讲'),
(3, '预科系教材'),
(4, '留级用教材'),
(5, '正科系公共教材'),
(6, '密法班教材'),
(7, '研究班教材'),
(8, '念佛堂教材'),
(9, '五论班教材');

ALTER TABLE items MODIFY `name` varchar(64) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL UNIQUE;

INSERT INTO items (name, price, shipping, category, image, producer, dep_mask) VALUES ("《困惑时代的幸福》及《一切并不神秘》(大学系列21、22)合集版",2.46,0.00,2, "images/shangshi.jpg", "索达吉堪布", 0),
("一切并不神秘（大学演讲22）",1.18,0.00,2, "images/shangshi.jpg", "索达吉堪布", 0),
("一切并不神秘（大学演讲22）DVD",0.13,0.00,2, "images/shangshi.jpg", "索达吉堪布", 0),
("困惑时代的幸福（大学演讲21）",1.21,0.00,2, "images/shangshi.jpg", "索达吉堪布", 0),
("困惑时代的幸福（大学演讲21）DVD",0.13,0.00,2, "images/shangshi.jpg", "索达吉堪布", 0),
("寻觅失落的文明（大学演讲17）DVD",0.29,0.00,2, "images/shangshi.jpg", "索达吉堪布", 0),
("智慧比金子还贵（大学演讲18）DVD",0.29,0.00,2, "images/shangshi.jpg", "索达吉堪布", 0),
("点亮一盏心灯（大学演讲16）DVD",0.29,0.00,2, "images/shangshi.jpg", "索达吉堪布", 0),
("《点亮一盏心灯》《寻觅失落的文明》《智慧比金子还贵》(大学系列16-18)合集版",0.29,0.00,2, "images/shangshi.jpg", "索达吉堪布", 0),
("二十一度母赞释",0,0.00,4, "images/shangshi.jpg", "索达吉堪布", 0),
("亲友书讲记",0,0.00,4, "images/shangshi.jpg", "索达吉堪布", 0),
("正科系公共教材",0,0.00,5, "images/shangshi.jpg", "索达吉堪布", 0),
("《定解宝灯论浅释》",1.97,0.00,6, "images/shangshi.jpg", "索达吉堪布", 0),
("《定解宝灯论浅释》 DVD",0,0.00,6, "images/shangshi.jpg", "索达吉堪布", 0),
("《定解宝灯论讲记》（上、下）",6.49,0.00,6, "images/shangshi.jpg", "索达吉堪布", 0),
("《定解宝灯论讲记》（上、下）DVD",0.13,0.00,6, "images/shangshi.jpg", "索达吉堪布", 0),
("三戒要解 DVD (下) 一套",1.02,0.00,6, "images/shangshi.jpg", "索达吉堪布", 0),
("三戒要解(下)",2.82,0.00,6, "images/shangshi.jpg", "索达吉堪布", 0),
("大圆满心性休息大车疏（下）",3.12,0.00,6, "images/shangshi.jpg", "索达吉堪布", 0),
("中观庄严论解说（上中下）",17.44,0.00,7, "images/shangshi.jpg", "索达吉堪布", 0),
("中观庄严论解说（上中下）DVD",3.62,0.00,7, "images/shangshi.jpg", "索达吉堪布", 0),
("中观庄严论解说（上中下）MP4",1.45,0.00,7, "images/shangshi.jpg", "索达吉堪布", 0),
("解义慧剑释",2.99,0.00,7, "images/shangshi.jpg", "索达吉堪布", 0),
("解义慧剑释 DVD",0.87,0.00,7, "images/shangshi.jpg", "索达吉堪布", 0),
("解义慧剑释 MP4",0.29,0.00,7, "images/shangshi.jpg", "索达吉堪布", 0),
("《开启修心门扉释》（上、下）（正科系念佛堂教材4-5册）",0,0.00,8, "images/shangshi.jpg", "索达吉堪布", 0),
("《开启修心门扉释》（上、下）（正科系念佛堂教材4-5册）- DVD",2.7,0.00,8, "images/shangshi.jpg", "索达吉堪布", 0),
("《开启修心门扉释》（上、下）（正科系念佛堂教材4-5册）- MP4",0.9,0.00,8, "images/shangshi.jpg", "索达吉堪布", 0),
("三戒要解（节选）",0,0.00,8, "images/shangshi.jpg", "索达吉堪布", 0),
("三戒要解（节选）DVD",0,0.00,8, "images/shangshi.jpg", "索达吉堪布", 0),
("三戒要解（节选）MP4",0.58,0.00,8, "images/shangshi.jpg", "索达吉堪布", 0),
("佛说无量寿经广释",0,0.00,8, "images/shangshi.jpg", "索达吉堪布", 0),
("佛说无量寿经广释 DVD",0,0.00,8, "images/shangshi.jpg", "索达吉堪布", 0),
("佛说无量寿经广释 MP4",0.58,0.00,8, "images/shangshi.jpg", "索达吉堪布", 0),
("净土三经释",0,0.00,8, "images/shangshi.jpg", "索达吉堪布", 0),
("净土三经释 DVD",0,0.00,8, "images/shangshi.jpg", "索达吉堪布", 0),
("净土三经释 MP4",0.29,0.00,8, "images/shangshi.jpg", "索达吉堪布", 0),
("现观庄严论释（上）",3.87,0.00,9, "images/shangshi.jpg", "索达吉堪布", 0);

ALTER TABLE items ADD `int_shipping` DECIMAL(10, 2) NOT NULL DEFAULT 0.00 AFTER shipping;

UPDATE items SET int_shipping=0.21 WHERE name="生死救度 (Optional)";
UPDATE items SET int_shipping=0.65 WHERE name="菩提路灯 (Optional)";
UPDATE items SET int_shipping=3.46 WHERE name="離幸福很近";
UPDATE items SET int_shipping=1.97 WHERE name="《定解宝灯论浅释》";
UPDATE items SET int_shipping=6.49 WHERE name="《定解宝灯论讲记》（上、下）";
UPDATE items SET int_shipping=0.13 WHERE name="《定解宝灯论讲记》（上、下）DVD";
UPDATE items SET int_shipping=1.02 WHERE name="三戒要解 DVD (下) 一套";
UPDATE items SET int_shipping=2.82 WHERE name="三戒要解(下)";
UPDATE items SET int_shipping=11.64 WHERE name="中观庄严论解说（上中下）";
UPDATE items SET int_shipping=0.75 WHERE name="前行实修法";
UPDATE items SET int_shipping=22.3 WHERE name="加行教材（第1 - 7册）2014版 （套）";
UPDATE items SET int_shipping=1.54 WHERE name="解义慧剑释";
UPDATE items SET int_shipping=3.28 WHERE name="找回最初的你";
UPDATE items SET int_shipping=2.46 WHERE name="《困惑时代的幸福》及《一切并不神秘》(大学系列21、22)合集版";
UPDATE items SET int_shipping=1.18 WHERE name="一切并不神秘（大学演讲22）";
UPDATE items SET int_shipping=0.13 WHERE name="一切并不神秘（大学演讲22）DVD";
UPDATE items SET int_shipping=1.21 WHERE name="困惑时代的幸福（大学演讲21）";
UPDATE items SET int_shipping=0.13 WHERE name="困惑时代的幸福（大学演讲21）DVD";
UPDATE items SET int_shipping=3.12 WHERE name="大圆满心性休息大车疏（下）";
UPDATE items SET int_shipping=2.46 WHERE name="《困惑时代的幸福》及《一切并不神秘》(大学系列21、22)合集版";
UPDATE items SET int_shipping=1.18 WHERE name="一切并不神秘（大学演讲22）";
UPDATE items SET int_shipping=0.13 WHERE name="一切并不神秘（大学演讲22）DVD";
UPDATE items SET int_shipping=1.21 WHERE name="困惑时代的幸福（大学演讲21）";
UPDATE items SET int_shipping=0.13 WHERE name="困惑时代的幸福（大学演讲21）DVD";
UPDATE items SET int_shipping=0.75 WHERE name="前行实修法";
UPDATE items SET int_shipping=22.3 WHERE name="加行教材（第1 - 7册）2014版 （套）";
UPDATE items SET int_shipping=19.28 WHERE name="净土教材（第1 - 7册）2015版 （套）";
UPDATE items SET int_shipping=26.17 WHERE name="入行论教材（2016版） 第1-9册（套）";
UPDATE items SET int_shipping=2.46 WHERE name="《困惑时代的幸福》及《一切并不神秘》(大学系列21、22)合集版";
UPDATE items SET int_shipping=1.18 WHERE name="一切并不神秘（大学演讲22）";
UPDATE items SET int_shipping=0.13 WHERE name="一切并不神秘（大学演讲22）DVD";
UPDATE items SET int_shipping=1.21 WHERE name="困惑时代的幸福（大学演讲21）";
UPDATE items SET int_shipping=0.13 WHERE name="困惑时代的幸福（大学演讲21）DVD";
UPDATE items SET int_shipping=0.21 WHERE name="生死救度 (Optional)";
UPDATE items SET int_shipping=0.65 WHERE name="菩提路灯 (Optional)";
UPDATE items SET int_shipping=3.46 WHERE name="離幸福很近";
UPDATE items SET int_shipping=0.93 WHERE name="“压力山大”（大学演讲13）";
UPDATE items SET int_shipping=1.07 WHERE name="一切从心开始（大学演讲9）";
UPDATE items SET int_shipping=1.41 WHERE name="佛教眼中的神秘（大学演讲2)";
UPDATE items SET int_shipping=1.29 WHERE name="冲破迷暗的曙光（大学演讲7）";
UPDATE items SET int_shipping=1.01 WHERE name="发掘永远的财富（大学演讲11）";
UPDATE items SET int_shipping=1.55 WHERE name="只为一颗“心”（大学演讲14）";
UPDATE items SET int_shipping=0.99 WHERE name="唤醒深藏的善（大学演讲15）";
UPDATE items SET int_shipping=1.24 WHERE name="寻觅爱的足迹（大学演讲6）";
UPDATE items SET int_shipping=1.35 WHERE name="心灵的诺亚方舟（大学演讲1）";
UPDATE items SET int_shipping=1.52 WHERE name="心病还须心药医（大学演讲3）";
UPDATE items SET int_shipping=1.29 WHERE name="必须面对的真相（大学演讲5）";
UPDATE items SET int_shipping=1.29 WHERE name="打开心扉的密钥（大学演讲8）";
UPDATE items SET int_shipping=1.15 WHERE name="探寻藏地瑰宝（大学演讲12）";
UPDATE items SET int_shipping=1.15 WHERE name="无私带来的喜乐（大学演讲10）";
UPDATE items SET int_shipping=1.32 WHERE name="红尘中的净土（大学演讲4）";
UPDATE items SET int_shipping=2.46 WHERE name="《困惑时代的幸福》及《一切并不神秘》(大学系列21、22)合集版";
UPDATE items SET int_shipping=1.97 WHERE name="《定解宝灯论浅释》";
UPDATE items SET int_shipping=6.49 WHERE name="《定解宝灯论讲记》（上、下）";
UPDATE items SET int_shipping=1.18 WHERE name="一切并不神秘（大学演讲22）";
UPDATE items SET int_shipping=0.13 WHERE name="一切并不神秘（大学演讲22）DVD";
UPDATE items SET int_shipping=1.21 WHERE name="困惑时代的幸福（大学演讲21）";
UPDATE items SET int_shipping=0.13 WHERE name="困惑时代的幸福（大学演讲21）DVD";
UPDATE items SET int_shipping=2.46 WHERE name="《困惑时代的幸福》及《一切并不神秘》(大学系列21、22)合集版";
UPDATE items SET int_shipping=1.18 WHERE name="一切并不神秘（大学演讲22）";
UPDATE items SET int_shipping=0.13 WHERE name="一切并不神秘（大学演讲22）DVD";
UPDATE items SET int_shipping=1.21 WHERE name="困惑时代的幸福（大学演讲21）";
UPDATE items SET int_shipping=0.13 WHERE name="困惑时代的幸福（大学演讲21）DVD";
UPDATE items SET int_shipping=3.87 WHERE name="现观庄严论释（上）";

UPDATE items SET price = price - int_shipping;

ALTER TABLE orders ADD `int_shipping` DECIMAL(10, 2) NOT NULL DEFAULT 0.00 AFTER shipping;
UPDATE order_details SET price=(SELECT price from items WHERE items.id=order_details.item_id);
UPDATE orders SET int_shipping=(orders.sub_total - (SELECT SUM(`price` * `count`) FROM order_details WHERE order_id=orders.id));
UPDATE orders SET sub_total = sub_total - int_shipping;

CREATE TABLE IF NOT EXISTS scores (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT,
          FOREIGN KEY (user_id) REFERENCES users(id),
        type1 TINYINT,
        score1 TINYINT,
        type2 TINYINT,
        score2 TINYINT);

        
-- */ ?>
