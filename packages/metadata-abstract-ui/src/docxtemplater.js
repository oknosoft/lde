export default function ({wsql, utils}) {

  /**
   * ### Врзвращает объект Docxtemplater из blob
   * blob может быть получен из вложения DataObj
   *
   * @method docxtemplater
   * @for Utils
   * @param blob {Blob} - двоичные данные шаблона
   * @return {Docxtemplater} - объект open-xml-docx
   * @async
   */
  utils.docxtemplater = function (blob) {

    let docx;
    if('Docxtemplater' in window) {
      docx = Promise.resolve();
    }
    else {
      docx = ('JSZip' in window ? Promise.resolve() : utils.load_script('/dist/jszip.min.js', 'script'))
        .then(() => utils.load_script('/dist/docxtemplater.min.js', 'script'))
        .then(() => utils.load_script('/dist/docxtemplater-image-module.min.js', 'script'));
    }

    return docx.then(function () {
      if(!Docxtemplater.prototype.saveAs) {
        Docxtemplater.prototype.saveAs = function (name) {
          const out = this.getZip().generate({type: 'blob', mimeType: utils.mime_lookup('docx')});
          wsql.alasql.utils.saveAs(out, name);
        };
      }
      return utils.blob_as_text(blob, 'array');
    })
      .then((buffer) => new Docxtemplater().loadZip(new JSZip(buffer)));
  };

  utils.xlsx = function () {
    if('XLSX' in window) {
      return Promise.resolve();
    }
    // xlsx@0.18.5 - с другими версиями глючит
    return ('JSZip' in window ? Promise.resolve() : utils.load_script('/dist/jszip.min.js', 'script'))
      .then(() => utils.load_script('/dist/xlsx.full.min.js', 'script'));
  };
}
