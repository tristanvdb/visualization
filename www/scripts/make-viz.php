<?
  $dir = "/tmp/ast-web-viz"; // TODO Session based $dir

  $outdir = $dir . "/" . $_REQUEST["outdir"];
  $filepath = $dir . "/" . $_REQUEST["filename"];

  $ld_library_path="LD_LIBRARY_PATH=" . rtrim(file_get_contents("../config/ld-library-path.cfg"), "\n");

  $opts = $_REQUEST["opts"];
  $config="-prefix " . $_REQUEST["viz"] . "_ -format " . $_REQUEST["format"];
  $command=rtrim(file_get_contents("../config/viz-path.cfg"), "\n") . "/" . $_REQUEST["viz"] . "-viz " . $config . " " . $opts . " " . $filepath;

  mkdir($outdir, 0777, true);
  chdir($outdir);

  exec($ld_library_path . " " . $command, $output);

  $filename  = pathinfo($filepath, PATHINFO_FILENAME);

  if ($_REQUEST["format"] == "graphviz") echo $_REQUEST["outdir"] . "/" . $_REQUEST["viz"] . "_" . $filename . ".dot";
  if ($_REQUEST["format"] == "json")     echo $_REQUEST["outdir"] . "/" . $_REQUEST["viz"] . "_" . $filename . ".json";
?>
