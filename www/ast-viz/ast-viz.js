
var editor = ace.edit("editor");
editor.setTheme("ace/theme/cloud");
editor.getSession().setMode("ace/mode/c_cpp");

// Change file via browsing button
function load_file(e) {
  var file = e.target.files[0];

  if (file) {
    var reader = new FileReader();
    reader.onload = function  (e) {
      editor.setValue(e.target.result);
    };
    reader.readAsText(file);
    var basename = file.name.split('/').pop();
    var cut_basename = basename.split('.');
    var extension = cut_basename.pop();
    document.getElementById("file-name").value = cut_basename.join(".");
    document.getElementById("file-type").value = extension;
  }
}
document.getElementById('file-load').addEventListener('change', load_file, false);

// Click on "Save on Server"
function save_file() {
  var filename = document.getElementById("file-dir").value + "/" + document.getElementById("file-name").value + "." + document.getElementById("file-type").value;
  writeFile(filename, editor.getValue(), function (filepath) {});
}
document.getElementById("file-save").addEventListener("click", save_file);

// Click on "Generate"
function generate() {
  var filename = document.getElementById("file-dir").value + "/" + document.getElementById("file-name").value + "." + document.getElementById("file-type").value;
  writeFile(filename, editor.getValue(), function (filepath) {
    makeViz(
      document.getElementById("viz-traversal").value,
      filename,
      document.getElementById("viz-format").value,
      document.getElementById("file-dir").value + "/viz",
      document.getElementById("options").value,
      function (filepath) {
        dumpFile(filepath, function (content) {
          document.getElementById("debug").value = document.getElementById("debug").value + "\n" +
            "generate::[makeViz]::[dumpFile]:\n\n" +
            "  filepath: " + filepath + "\n" +
            "  format:   " + document.getElementById("viz-format").value + "\n" +
            "  content:\n" + content + "\n" +
            "\n------------------------\n";
          if (document.getElementById("viz-format").value == "json")
            renderAST_JSON(content, "viz");
          else if (document.getElementById("viz-format").value == "graphviz")
            render_GraphViz(content, "viz");
        });
      }
    );
  });
}
document.getElementById("viz-generate").addEventListener("click", generate);

