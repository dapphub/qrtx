var qr = new (require("qrcode-reader"))()
var ethtx = require("ethereumjs-tx")
var b64 = require("base64-js").toByteArray

var chains = {
  1: "Mainnet",
  3: "Ropsten",
  4: "Rinkeby",
  42: "Kovan",
}

var txHex
var tx

qr.callback = function (err, result) {
  if (result) {
    var raw = new Buffer(b64(result.result))
    txHex = "0x" + raw.toString("hex")
    tx = new ethtx(raw)
    function hex (s) { return tx[s].toString("hex") }
    function int (s) { return parseInt(hex(s), 16) }
    var data = {
      from: hex("from"),
      to: hex("to"),
      nonce: int("nonce"),
      value: int("value"),
      data: hex("data"),
      gasLimit: int("gasLimit"),
      gasPrice: int("gasPrice"),
      chain: tx.getChainId(),
    }
    showTx(data)
  }
  else {
    alert("QR code didn't scan. Try again!")
    location.reload()
  }
}

upload.onchange = function () {
  var reader = new FileReader()
    reader.onload = function () {
    qr.decode(reader.result)
  }
  reader.readAsDataURL(this.files[0])
}

function showTx (data) {
  txFrom.innerHTML =
    '<a href="https://etherscan.io/address/0x' + data.from + '">' +
       data.from.substr(0, 16) + "..." + "</a>"
  txTo.innerHTML =
    '<a href="https://etherscan.io/address/0x' + data.to + '">' +
       data.to.substr(0, 16) + "..." + "</a>"
  txChain.innerText = chains[data.chain] || "(unknown chain " + data.chain + ")"
  txNonce.innerText = data.nonce
  txValue.innerText = data.value
  txData.innerText = data.data || "(no data)"
  txGasLimit.innerText = data.gasLimit
  txGasPrice.innerText = data.gasPrice
  document.body.className = "step2"
}

window.broadcast = function () {
  document.body.className = "step3"
  if (tx.getChainId() != 1) {
    alert("Only mainnet transactions supported.")
    location.reload()
  }

  var xhr = new XMLHttpRequest();
  xhr.open("POST", "https://api.etherscan.io/api", true);
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  xhr.onreadystatechange = function () {
    if (xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
      var result = JSON.parse(xhr.responseText)
      console.log(result)
      if (result.error) {
        waiting.innerText = result.error.message
      } else {
        var link = document.createElement("A")
        link.setAttribute("href", "https://etherscan.io/tx/" + result.result)
        link.innerText = result.result.substr(0, 16) + "..."
        waiting.innerHTML = ""
        waiting.appendChild(link)
      }
    }
  }
  xhr.send("module=proxy&action=eth_sendRawTransaction&hex=" + txHex)
}