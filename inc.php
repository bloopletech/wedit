<?
ini_set("display_errors", "0");

include("config.php");
mysql_connect($CONFIG['host'], $CONFIG['username'], $CONFIG['password']);
mysql_select_db($CONFIG['database']);
mysql_query("SET NAMES 'utf8'");

function doSql($query)
{
   $result = mysql_query($query);
   
   if(@mysql_num_rows($result) > 0)
   {
      $output = array();

      $row = mysql_fetch_assoc($result);
      while($row != NULL)
      {
         $output[] = $row;
         $row = mysql_fetch_assoc($result);
      }

      return (count($output) > 1 ? $output : $output[0]);
   }

   return NULL;
}

function esc($str)
{
   return '"'.mysql_real_escape_string($str).'"';
}

function usc($str)
{
   return stripslashes($str);
}

?>
