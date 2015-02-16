<?
  $dir = "/tmp/ast-web-viz"; // TODO Session based $dir

  $file = $dir/$_REQUEST["file"];

  unlink($file);
?>
