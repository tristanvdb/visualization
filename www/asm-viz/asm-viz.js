
var editor = ace.edit("editor");
editor.setReadOnly(true);
editor.$blockScrolling = Infinity;

//function makeAsmViz(filename, callback) {
//  $.post("./call-asm-viz.php", { filename: filename }).done(callback);
//}

function traverseASM_CG(cg, graph) {
  var rtn_select = document.getElementById("routine");
  while (rtn_select.options.length > 0) rtn_select.remove(0);

  cg.routines.forEach(function (rtn) {
    if (rtn.type=="idapro" || rtn.type=="ours" || rtn.type=="user") {
      var rtn_opt = document.createElement('option');
      rtn_opt.appendChild( document.createTextNode(rtn.label) );
      rtn_opt.value = rtn.tag;
      rtn_select.appendChild(rtn_opt);
    }
    graph.setNode(rtn.tag, { "label": rtn.label, "class": "is-" + rtn.type});
    rtn.callees.forEach(function (callee) {
      graph.setEdge(rtn.tag, callee.tag, {});
    });
  });
  graph.graph().rankSep = 300;
  graph.graph().nodeSep = 100;
}

function traverseASM_CFG(cfg, graph) {
  cfg.blocks.forEach(function (blk) {

    var start = editor.session.getLength();
    editor.setValue(editor.getValue() + blk.label + ":\n");
    blk.instructions.forEach(function (inst) {
      editor.setValue(editor.getValue() + "    " + inst.str + "\n");
    });
    var stop = editor.session.getLength() - 1;

    graph.setNode(blk.tag, { "label": blk.label, "start": start, "stop": stop });

    if (blk.out_true != "" && blk.out_false != "") {
      graph.setEdge(blk.tag, blk.out_true,  { "style": "stroke: #0F0; fill: none; ", "arrowheadStyle": "fill: #0F0" });
      graph.setEdge(blk.tag, blk.out_false, { "style": "stroke: #F00; fill: none; ", "arrowheadStyle": "fill: #F00" });
    }
    else if (blk.out_true != "")
      graph.setEdge(blk.tag, blk.out_true,  { "style": "stroke: #00F; fill: none; ", "arrowheadStyle": "fill: #00F" });
  });
  graph.graph().rankSep = 150;
  graph.graph().nodeSep = 50;
  graph.graph().rankDir = "LR";
}

function generate_cg(file) {
  d3.select("#cgviz").html("<svg><g></g></svg>");
  d3.select("#cfgviz").html("<svg><g></g></svg>");
  editor.setValue("");

  dumpFile("../../media/ssd/projects/drafts/asm-to-graphs/tests/" + file + "/" + file + "-no-block.json", function (content) {
    var graph = render_JSON(content, "cgviz", traverseASM_CG, set_max_hw_margin);

    var cgviz = d3.select("#cgviz");

    cgviz.selectAll(".is-idapro").on('click', function () {
      generate_cfg(file, d3.select(this).datum());
    }).style("fill", "#00ff00");
    cgviz.selectAll(".is-ours").on('click', function () {
      generate_cfg(file, d3.select(this).datum());
    }).style("fill", "#00ff00");
    cgviz.selectAll(".is-user").on('click', function () {
      generate_cfg(file, d3.select(this).datum());
    }).style("fill", "#00ff00");

    cgviz.selectAll(".is-indirect").style("fill", "#0000ff");
    cgviz.selectAll(".is-library" ).style("fill", "#ff0000");
  });
}

function generate_cfg(file, routine) {
  d3.select("#cfgviz").html("<svg><g></g></svg>");
  editor.setValue("");
  editor.selection.removeListener("changeCursor");

  dumpFile("../../media/ssd/projects/drafts/asm-to-graphs/tests/" + file + "/" + file + "-" + routine + ".json", function (content) {
    var graph = render_JSON(content, "cfgviz", traverseASM_CFG, set_w_margin);

    var cfgviz = d3.select("#cfgviz");

    cfgviz.selectAll(".node").on('click', function () {
      editor.gotoLine(graph.node(d3.select(this).datum()).start, 0, true);
    });

    editor.gotoLine(1);

    editor.selection.on("changeCursor", function () {
      var line = editor.selection.getCursor().row;
  
      cfgviz.selectAll(".node").call(function (n) {
        if (line >= graph.node(n.datum()).start && line <= graph.node(n).stop) 
          n.style("fill", "#FF0000");
      });
    });
  });
}

function generate_cg_(e) {
  var file = document.getElementById("file").value;

  generate_cg(file);
}
document.getElementById('generate-cg').addEventListener('click', generate_cg_);

function generate_cfg_(e) {
  var file = document.getElementById("file").value;
  var routine = document.getElementById("routine").value;

  generate_cfg(file, routine);
}
document.getElementById('generate-cfg').addEventListener('click', generate_cfg_);

