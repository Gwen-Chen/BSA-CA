<?php
define("INSPECTOR", 0x57);

function isSysAdmin($user) {
  return ($user->permission & Roles::SYS_ADMIN) == Roles::SYS_ADMIN;
}

function isCountryAdmin($user) {
  return ($user->permission & Roles::COUNTRY_ADMIN) == Roles::COUNTRY_ADMIN;
}

function isInspector($user) {
  return ($user->permission & Roles::INSPECTOR) == Roles::INSPECTOR;
}

function isYearLeader($user) {
  return ($user->permission & Roles::YEAR_LEADER) == Roles::YEAR_LEADER;
}

function isClassLeader($user, $classId) {
  return ($user->permission & Roles::CLASS_LEADER) == Roles::CLASS_LEADER &&
      $user->classId == $classId;
}

function isAdmin($user) {
  return $user->permission > get_student_permission();
}

function isOrderManager($user) {
  return ($user->permission & 0x103) == 0x103;
}

function canGrant($user, $perm) {
  return ($user->permission & $perm) == $perm;
}

function canReadOrderAddress($user) {
  return ($user->permission & 0x303) == 0x303;
}

function get_student_permission() {
  return 3;
}

function sameCountry($user, $classInfo) {
  return true;
  // Class with id 1 is visible to every country, new registered students are
  // put here.
  // return $user->country == $classInfo["country"] || isNewClass($classInfo);
}

function isNewClass($classInfo) {
  return intval($classInfo["id"]) == 1;
}

function is_teacher_of($user, $classInfo) {
  return intval($classInfo["teacher_id"]) == $user->id ||
      intval($classInfo["teacher2_id"]) == $user->id;
}

function canRead($user, $classInfo) {
  $level = $classInfo["perm_level"];
  if (!$level || is_teacher_of($user, $classInfo)) {
    return true;
  }

  $perm = ($user->permission >> (($level - 1) * 2)) & 1;
  if (!$perm) return false;

  return checkClass($user, $classInfo) || checkYear($user, $classInfo) ||
      checkInspector($user, $classInfo) || checkDistrict($user, $classInfo) ||
      isSysAdmin($user);
}

function canWrite($user, $classInfo) {
  $level = $classInfo["perm_level"];
  if (!$level) return true;

  $perm = ($user->permission >> (($level - 1) * 2)) & 2;
  if (!$perm) return false;

  return checkClass($user, $classInfo) || checkYear($user, $classInfo) ||
      checkDistrict($user, $classInfo) || isSysAdmin($user);
}

function checkDistrict($user, $classInfo) {
  return isCountryAdmin($user) && sameCountry($user, $classInfo);
}

function checkClass($user, $classInfo) {
  return isClassLeader($user, $classInfo["id"]);
}

function checkYear($user, $classInfo) {
  return isYearLeader($user) &&
      sameCountry($user, $classInfo) &&
      $user->classInfo["start_year"] == $classInfo["start_year"];
}

function checkInspector($user, $classInfo) {
  return isInspector($user) && sameCountry($user, $classInfo);
}

function getStartPage($user) {
  if (isCountryAdmin($user)) return "admin.html";
  if (isOrderManager($user)) return "order_admin.html";
  if (isAdmin($user)) return "admin.html";
  return "index.html";
}

abstract class Roles {
  const SYS_ADMIN = 0xFFFF;
  const COUNTRY_ADMIN = 0x3FF;
  const INSPECTOR = 0x57;
  const YEAR_LEADER = 0x3F;
  const CLASS_LEADER = 0xF;
}
?>

