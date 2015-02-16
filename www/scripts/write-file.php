<?
  $dir = "/tmp/ast-web-viz"; // TODO Session based $dir

  $filepath = $dir . "/" . $_REQUEST["filename"];
  $dirname = pathinfo($filepath, PATHINFO_DIRNAME);
  if (!file_exists($dirname)) mkdir($dirname, 0777, true);

  $file = fopen($filepath, "w") or die("Unable to open file!");
  fwrite($file, $_REQUEST["content"]);
  fclose($file);

  echo $filepath;
?>
