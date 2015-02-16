<?
  $dir = "/tmp/ast-web-viz"; // TODO Session based $dir

  $filepath = $dir . "/" . $_REQUEST["file"];

  echo file_get_contents($filepath);
?>
