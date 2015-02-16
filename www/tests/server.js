
// Change file via browsing button
function load_file(e) {
  var file = e.target.files[0];

  if (file) {
    var reader = new FileReader();
    reader.onload = function  (e) {
      document.getElementById("editor").value = e.target.result;
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
  writeFile(filename, document.getElementById("editor").value, function (filepath) {});
}
document.getElementById("file-save").addEventListener("click", save_file);

// Click on "Generate"
function generate() {
  var filename = document.getElementById("file-dir").value + "/" + document.getElementById("file-name").value + "." + document.getElementById("file-type").value;
  writeFile(filename, document.getElementById("editor").value, function (filepath) {});
  makeViz(
    document.getElementById("viz-traversal").value,
    filename,
    document.getElementById("viz-format").value,
    document.getElementById("file-dir").value + "/viz",
    document.getElementById("options").value,
    function (filepath) {
      dumpFile(filepath, function (content) {
        document.getElementById("viz").value = content;
      });
    }
  )
}
document.getElementById("viz-generate").addEventListener("click", generate);

