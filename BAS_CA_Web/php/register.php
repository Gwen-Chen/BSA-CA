<?php
include_once 'config.php';
include_once 'connection.php';
include_once 'class_prefs.php';
include_once 'tables.php';
include_once 'util.php';
include_once 'merit_assoc.php';

if (!empty($_POST["id"])) exit();

if(! empty ( $_POST ['email'] ) && ! empty ( $_POST ['name'] )) {
  session_write_close();
  
  if (false && empty($_POST["g-recaptcha-response"]) ||
      false && !checkCaptcha($_POST["g-recaptcha-response"])) {
?>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>注册失败</title>
<script type="text/javascript">
  alert('注册没有成功。请通过验证码测试，确认您不是机器人。\n' + 
      '验证码测试使用Google reCAPTCHA服务，请确保您能访问Google。');
</script>
<body>
  注册没有成功。请通过验证码测试，确认您不是机器人。
  验证码测试使用Google reCAPTCHA服务，请确保您能访问Google。
  <a href="javascript:history.back()">重试</a>
</body>
</html>
<?php    
    exit();
  }
  
  $password = md5 ( $_POST ['password'] );  
  $users = get_users($_POST['email']);
  
  if (sizeof($users) > 0) {
    header('Content-Type: text/html; charset=utf-8');
  	echo "<h1>Error</h1>";
    echo "该地址". $_POST["email"]. "已经注册，请勿重复注册。如忘记密码请联系组长。";
    exit();
  }

  date_default_timezone_set("UTC");

  $_POST['start_year'] = date("Y");
  $user = update_user(set_assoc_only_bit($_POST));

  if (!$user) {
    echo "<h1>Error</h1>";
    echo "<p>Failed to register ".$_POST["email"]. get_db_error();
    exit();
  }
    
  session_start();
  $_SESSION['user'] = serialize($user);

  if (is_merit_assoc_only($_POST) || $_POST["country"] != 'US') {
  	header("Location:../index.html");
  } else {
    $url = sprintf("../registered.html?name=%s&email=%s", $user->name,
        $user->email);
    header("Location: ". $url);
  }
}
?>
