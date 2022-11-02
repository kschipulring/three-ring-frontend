class Prerender {
  static getDoctype(){
    var doctype = 
    '<!DOCTYPE ' + 
    document.doctype.name +
    (document.doctype.publicId?' PUBLIC "' +  document.doctype.publicId + '"':'') +
    (document.doctype.systemId?' "' + document.doctype.systemId + '"':'') + '>';
    return doctype;
  }

  static getHTMLDocument(){
    let [HTMLElem] = document.getElementsByTagName("html");

    let HTMLStr = HTMLElem.outerHTML;

    return HTMLStr;
  }

  static writeHTMLPrerender(){
    const xhttp = new XMLHttpRequest();

    let HTMLStr = Prerender.getDoctype() + "\n" + Prerender.getHTMLDocument();

    let encodedStr = encodeURIComponent( HTMLStr );

    xhttp.open("POST", "/prerender.php");
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("htmlstr="+encodedStr+"&token="+window.c);
  }

}

export default Prerender;