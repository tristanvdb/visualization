
function makeAsmViz(filename, callback) {
  $.post("./call-asm-viz.php", { filename: filename }).done(callback);
}

function traverseASM_CG(cg, graph) {
  var rtn_select = document.getElementById("routine");
  while (rtn_select.options.length > 0) rtn_select.remove(0);

  cg.routines.forEach(function (rtn) {
    graph.setNode(rtn.tag, { label: rtn.label });
    if (rtn.type=="idapro" || rtn.type=="ours" || rtn.type=="user") {
      var rtn_opt = document.createElement('option');
      rtn_opt.appendChild( document.createTextNode(rtn.label) );
      rtn_opt.value = rtn.tag;
      rtn_select.appendChild(rtn_opt);
    }
    rtn.callees.forEach(function (callee) {
      graph.setEdge(rtn.tag, callee.tag, {});
    });
  });
  graph.graph().rankSep = 300;
  graph.graph().nodeSep = 100;
}

function traverseASM_CFG(cfg, graph) {
  cfg.blocks.forEach(function (blk) {
    graph.setNode(blk.tag, { label: blk.label });
    if (blk.out_true != "")
      graph.setEdge(blk.tag, blk.out_true, {});
    if (blk.out_false != "")
      graph.setEdge(blk.tag, blk.out_false, {});
  });
  graph.graph().rankSep = 150;
  graph.graph().nodeSep = 50;
}

function load_cg(e) {
  var file = document.getElementById("file").value;

  dumpFile("../../media/ssd/projects/drafts/asm-to-graphs/tests/" + file + "/" + file + ".json", function (content) {
//  document.getElementById("debug").value = document.getElementById("debug").value + "\n\n" + content;
    render_JSON(content, "cgviz", traverseASM_CG);
  });

//var cgviz_nodes = d3.select("#cgviz").select("svg").select("g").select("nodes");
//cgviz_nodes.select("node").on('click', function (d) { console.log("Clicked on node: " + d); });
}
document.getElementById('generate-cg').addEventListener('click', load_cg);

function load_cfg(e) {
  var file = document.getElementById("file").value;
  var routine = document.getElementById("routine").value;

  document.getElementById("debug").value = document.getElementById("debug").value + "\n\n" + "/media/ssd/projects/drafts/asm-to-graphs/tests/" + file + "/" + file + "-" + routine + ".json";

  dumpFile("../../media/ssd/projects/drafts/asm-to-graphs/tests/" + file + "/" + file + "-" + routine + ".json", function (content) {
//  document.getElementById("debug").value = document.getElementById("debug").value + "\n\n" + content;
    render_JSON(content, "cfgviz", traverseASM_CFG);
  });

//var cgviz_nodes = d3.select("#cgviz").select("svg").select("g").select("nodes");
//cgviz_nodes.select("node").on('click', function (d) { console.log("Clicked on node: " + d); });
}
document.getElementById('generate-cfg').addEventListener('click', load_cfg);

