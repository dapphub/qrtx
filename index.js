var qr = new (require("qrcode-reader"))()
var ethtx = require("ethereumjs-tx")
var b64 = require("base64-js").toByteArray

qr.callback = function (err, result) {
  if (result) {
    var raw = new Buffer(b64(result.result))
    var tx = new ethtx(raw)
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
    }
    showTx(data)
  }
  else
    console.error(err)
}

upload.onchange = function () {
  var reader = new FileReader()
    reader.onload = function () {
    qr.decode(reader.result)
  }
  reader.readAsDataURL(this.files[0])
}

function showTx (tx) {
  txFrom.innerHTML =
    '<a href="https://etherscan.io/address/0x' + tx.from + '">' +
       tx.from.substr(0, 16) + "..." + "</a>"
  txTo.innerHTML =
    '<a href="https://etherscan.io/address/0x' + tx.to + '">' +
       tx.to.substr(0, 16) + "..." + "</a>"
  txNonce.innerText = tx.nonce
  txValue.innerText = tx.value
  txData.innerText = tx.data || "(no data)"
  txGasLimit.innerText = tx.gasLimit
  txGasPrice.innerText = tx.gasPrice
  document.body.className = "step2"
}