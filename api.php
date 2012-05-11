<?
include("config.php");
mysql_connect($CONFIG['host'], $CONFIG['username'], $CONFIG['password']);
mysql_select_db($CONFIG['database']);
mysql_query("SET NAMES 'utf8'");

function sql($query) {
  $result = mysql_query($query);
  
  if(@mysql_num_rows($result) > 0) {
    $output = array();

    $row = mysql_fetch_assoc($result);
    while($row != NULL) {
      $output[] = $row;
      $row = mysql_fetch_assoc($result);
    }

    return (count($output) > 1 ? $output : $output[0]);
  }

  return NULL;
}

function esc($str) {
  return '"'.mysql_real_escape_string($str).'"';
}



if($_REQUEST["action"] == "load") {
  $result = sql("SELECT * FROM documents WHERE `key` = ".esc($_REQUEST["key"])." LIMIT 1");
  echo $result["text"];
}
else if($_REQUEST["action"] == "save") {
  sql("REPLACE INTO documents (`key`, `text`) VALUES(".esc($_REQUEST["key"]).", ".esc($_REQUEST["text"]).")");
}
?>
