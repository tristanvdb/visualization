<?
  $dir = "/tmp/ast-web-viz"; // TODO Session based $dir
  $outdir = $dir . "/asm-viz/";

  $filepath = $_REQUEST["filename"];

//$ld_library_path="LD_LIBRARY_PATH=";

  $command="/media/ssd/projects/drafts/asm-to-graphs/src/asm2graphs " . $filepath;

  echo $command;

  mkdir($outdir, 0777, true);
  chdir($outdir);

//exec($ld_library_path . " " . $command, $output);
  exec($command, $output);

  echo join("\n", $output);
?>
