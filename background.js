chrome.contextMenus.create({
  title: "Analizar dirección IP",
  contexts:["selection"],
  onclick: function(info, tab) {
    var ipAddress = info.selectionText;
    chrome.storage.local.get("ipList", function(items) {
      var ipList = items.ipList || [];
      var found = false;
      for (var i = 0; i < ipList.length; i++) {
        var name = ipList[i].name;
        var ip = ipList[i].ip;
        var mask = ipList[i].mask || 32; // establece la máscara por defecto en 32 si no se proporciona ninguna
        if (isInNetwork(ipAddress, ip, mask)) {
          found = true;
          var network = ip + "/" + mask;
          var message = "La dirección IP " + ipAddress + " pertenece a la red " + name + " " + network ;
          alert("" + message);
          break;
        }
      }
      if (!found) {
        alert("No se ha encontrado ninguna red que coincida con la dirección IP " + ipAddress);
      }
    });
  }
});

function isInNetwork(ipAddress, ip, mask) {
  var ipBytes = ipAddress.split(".");
  var networkBytes = ip.split(".");
  var maskBytes = getMaskBytes(mask);
  for (var i = 0; i < 4; i++) {
    if ((ipBytes[i] & maskBytes[i]) != (networkBytes[i] & maskBytes[i])) {
      return false;
    }
  }
  return true;
}

function getMaskBytes(mask) {
  if (mask.indexOf("/") !== -1) {
    mask = parseInt(mask.split("/")[1]);
  }
  var maskBytes = [];
  var fullBytes = Math.floor(mask / 8);
  var partialByte = mask % 8;
  for (var i = 0; i < fullBytes; i++) {
    maskBytes.push(255);
  }
  if (partialByte > 0) {
    maskBytes.push(256 - Math.pow(2, 8 - partialByte));
  }
  for (var i = fullBytes + 1; i < 4; i++) {
    maskBytes.push(0);
  }
  return maskBytes;
}
