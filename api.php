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



if($_REQUEST["action"] == "load" || $_REQUEST["action"] == "export") {
  $result = sql("SELECT * FROM documents WHERE `key` = ".esc($_REQUEST["key"])." LIMIT 1");
  header("Content-Type: text/plain; charset=utf-8");
  if($_REQUEST["action"] == "export") header("Content-disposition: attachment; filename=".$_REQUEST["key"].".txt"); 
  echo $result["text"];
}
else if($_REQUEST["action"] == "save") {
  sql("REPLACE INTO documents (`key`, `text`, `last_modified`) VALUES(".esc($_REQUEST["key"]).", ".esc($_REQUEST["text"]).", ".esc($_REQUEST["last_modified"]).")");
}
?>
