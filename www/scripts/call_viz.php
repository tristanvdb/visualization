<?
  chdir("/tmp/");

  $dotpos = strrpos($_REQUEST["file"], '.');
  $filename  = substr($_REQUEST["file"], 0, $dotpos);
  $extension = substr($_REQUEST["file"], $dotpos+1);

  $myfile = fopen($filename.".".$extension, "w") or die("Unable to open file!");
  fwrite($myfile, $_REQUEST["content"]);
  fclose($myfile);

  $set_ld_path="LD_LIBRARY_PATH=/usr/lib/jvm/java-7-openjdk-amd64/jre/lib/amd64/server/:/media/ssd/boost/install/1_45_0/lib/:/media/ssd/projects/currents/RoseACC-workspace/install_dir/lib/:/media/ssd/projects/currents/ast-to-graphviz/lib";
  $command="/media/ssd/projects/currents/ast-to-graphviz/src/" . $_REQUEST["traversal"] . "-viz";
  $args=" -prefix " . $_REQUEST["traversal"] . "_ " . $_REQUEST["options"] . " " . $filename.".".$extension;
  exec($set_ld_path . "  " . $command . " " . $args, $viz_output);
  exec("cat " . $_REQUEST["traversal"] . "_" . $filename . ".dot", $cat_output);
  if (empty($cat_output)) {
    echo $filename . "\n";
    echo $extension . "\n";
    echo $_REQUEST["traversal"] . "-viz" . $args . "\n";
    echo implode("\n", $viz_output) . "\n";
  }
  echo implode("\n", $cat_output);

  exec("rm " . $filename . "." . $extension);
  exec("rm " . $_REQUEST["traversal"] . "_" . $filename . ".dot");
?>
