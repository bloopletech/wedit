<?
include("inc.php");

if($_REQUEST["action"] == "load") {
  $result = doSql("SELECT * FROM documents WHERE `key` = ".esc($_REQUEST["key"]));
  echo $result["text"];
}
else if($_REQUEST["action"] == "save") {
  $result = doSql("REPLACE INTO documents (`key`, `text`) VALUES(".esc($_REQUEST["key"]).", ".esc($_REQUEST["text"]).")");
}
?>
