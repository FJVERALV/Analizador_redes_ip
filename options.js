var ipListElement = document.getElementById("ipList");
var addButton = document.getElementById("addButton");
var importButton = document.getElementById("importButton");
var deleteAllButton = document.getElementById("deleteAllButton");

function refreshList() {
  chrome.storage.local.get("ipList", function(items) {
    var ipList = items.ipList || [];
    ipListElement.innerHTML = "";
    for (var i = 0; i < ipList.length; i++) {
      var name = ipList[i].name;
      var ip = ipList[i].ip;
      var mask = ipList[i].mask;
      var li = document.createElement("li");
      li.innerHTML = name + " (" + ip + "/" + mask + ")";

      // Botón de eliminar para cada red
      var deleteButton = document.createElement("button");
      deleteButton.innerHTML = "Eliminar";
      deleteButton.setAttribute("data-index", i);
      deleteButton.addEventListener("click", function() {
        var index = this.getAttribute("data-index");
        chrome.storage.local.get("ipList", function(items) {
          var ipList = items.ipList || [];
          ipList.splice(index, 1);
          chrome.storage.local.set({ipList: ipList}, function() {
            refreshList();
          });
        });
      });
      li.appendChild(deleteButton);

      ipListElement.appendChild(li);
    }
  });
}

refreshList();

addButton.addEventListener("click", function() {
  var name = prompt("Introduce el nombre de la red:");
  if (!name) {
    return;
  }
  var ip = prompt("Introduce la dirección IP:");
  if (!ip) {
    return;
  }
  var mask = prompt("Introduce la máscara de red:");
  if (!mask) {
    return;
  }
  chrome.storage.local.get("ipList", function(items) {
    var ipList = items.ipList || [];
    ipList.push({name: name, ip: ip, mask: mask});
    chrome.storage.local.set({ipList: ipList}, function() {
      refreshList();
    });
  });
});

importButton.addEventListener("click", function() {
  var fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = ".csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  fileInput.addEventListener("change", function() {
    var reader = new FileReader();
    reader.onload = function(event) {
      var csvData = event.target.result;
      var lines = csvData.split(/\r\n|\n/);
      var ipList = [];
      for (var i = 0; i < lines.length; i++) {
        var fields = lines[i].split(",");
        if (fields.length !== 3) {
          continue;
        }
        var name = fields[0];
        var ip = fields[1];
        var mask = fields[2];
        ipList.push({name: name, ip: ip, mask: mask});
      }
      chrome.storage.local.set({ipList: ipList}, function() {
        refreshList();
      });
    };
    reader.readAsText(fileInput.files[0]);
  });
  fileInput.click();
});

// Botón para eliminar todas las redes
deleteAllButton.addEventListener("click", function() {
  if (confirm("¿Estás seguro de que deseas eliminar todas las redes?")) {
    chrome.storage.local.remove("ipList", function() {
      refreshList();
    });
  }
});

// Obtener las reglas guardadas
chrome.storage.local.get("ipList", function(items) {
  var ipList = items.ipList || [];

  // Contar la cantidad de reglas y mostrarla en el elemento HTML
  var ruleCountElement = document.getElementById("rule-count");
  ruleCountElement.innerHTML = "Hay " + ipList.length + " reglas";

  // Mostrar las reglas en la tabla
  var ruleTableBody = document.getElementById("rule-table-body");
  ruleTableBody.innerHTML = "";
  for (var i = 0; i < ipList.length; i++) {
    var rule = ipList[i];
    var row = document.createElement("tr");
    row.innerHTML = "<td>" + (i+1) + "</td>" +
                    "<td>" + rule.name + "</td>" +
                    "<td>" + rule.ip + "</td>" +
                    "<td>" + rule.mask + "</td>" +
                    "<td><button class='delete-rule' data-index='" + i + "'>Eliminar</button></td>";
    ruleTableBody.appendChild(row);
  }

  // Agregar el evento click al botón eliminar
  var deleteButtons = document.getElementsByClassName("delete-rule");
  for (var i = 0; i < deleteButtons.length; i++) {
    deleteButtons[i].addEventListener("click", function(event) {
      var index = event.target.getAttribute("data-index");
      ipList.splice(index, 1);
      chrome.storage.local.set({ipList: ipList}, function() {
        // Actualizar la tabla y la cantidad de reglas
        renderRules();
      });
    });
  }
});

aboutButton.addEventListener("click", function() {
  var message = "Extensión creada por FJVERALV.\nVersión: 1.0\nAnalizador de Redes Ip." ;
	alert("" + message);
});
