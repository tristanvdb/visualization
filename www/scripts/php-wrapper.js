
function writeFile(filename, content, callback) {
  $.post("../scripts/write-file.php", { filename: filename,
                                        content: content
                                     }).done(callback);
}

function dumpFile(file, callback) {
  $.post("../scripts/dump-file.php", { file: file
                                    }).done(callback);
}

function rmFile(file, callback) {
  $.post("../scripts/rm-file.php", { file: file
                                  }).done(callback);
}

function makeViz(viz, filename, format, outdir, opts, callback) {
  $.post("../scripts/make-viz.php", { viz: viz,
                                      filename: filename,
                                      format: format,
                                      outdir: outdir,
                                      opts: opts
                                   }).done(callback);
}

