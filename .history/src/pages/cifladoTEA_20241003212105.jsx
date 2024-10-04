import { useState } from 'react';

const DELTA = 0x9e3779b9;
const NUM_ROUNDS = 32;
let globalKey = null;

export const CifradoTEA = () => {
  const [name, setName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cvv, setCvv] = useState('');
  const [encryptedName, setEncryptedName] = useState('');
  const [encryptedCard, setEncryptedCard] = useState('');
  const [encryptedCVV, setEncryptedCVV] = useState('');
  const [decryptedText, setDecryptedText] = useState('');

  const teaEncrypt = (v, key) => {
    let [v0, v1] = v;
    let sum = 0;
    for (let i = 0; i < NUM_ROUNDS; i++) {
      sum = (sum + DELTA) >>> 0;
      v0 = (v0 + (((v1 << 4) + key[0]) ^ (v1 + sum) ^ ((v1 >>> 5) + key[1]))) >>> 0;
      v1 = (v1 + (((v0 << 4) + key[2]) ^ (v0 + sum) ^ ((v0 >>> 5) + key[3]))) >>> 0;
    }
    return [v0, v1];
  };

  const teaDecrypt = (v, key) => {
    let [v0, v1] = v;
    let sum = (DELTA * NUM_ROUNDS) >>> 0;
    for (let i = 0; i < NUM_ROUNDS; i++) {
      v1 = (v1 - (((v0 << 4) + key[2]) ^ (v0 + sum) ^ ((v0 >>> 5) + key[3]))) >>> 0;
      v0 = (v0 - (((v1 << 4) + key[0]) ^ (v1 + sum) ^ ((v1 >>> 5) + key[1]))) >>> 0;
      sum = (sum - DELTA) >>> 0;
    }
    return [v0, v1];
  };

  const strToUint32Array = (str) => {
    const blocks = [];
    for (let i = 0; i < str.length; i += 4) {
      let block = str.substr(i, 4).padEnd(4, " ");
      const v0 = block.charCodeAt(0) | (block.charCodeAt(1) << 16);
      const v1 = block.charCodeAt(2) | (block.charCodeAt(3) << 16);
      blocks.push([v0, v1]);
    }
    return blocks;
  };

  const generateTeaKey = () => {
    if (!globalKey) {
      globalKey = new Uint32Array([
        (Math.random() * 0xffffffff) >>> 0,
        (Math.random() * 0xffffffff) >>> 0,
        (Math.random() * 0xffffffff) >>> 0,
        (Math.random() * 0xffffffff) >>> 0,
      ]);
    }
    return globalKey;
  };

  const encryptData = () => {
    const key = generateTeaKey();
    const nameBlocks = strToUint32Array(name);
    const cardBlocks = strToUint32Array(cardNumber);
    const cvvBlocks = strToUint32Array(cvv);

    setEncryptedName(nameBlocks.map(block => bufferToHex(teaEncrypt(block, key))).join(","));
    setEncryptedCard(cardBlocks.map(block => bufferToHex(teaEncrypt(block, key))).join(","));
    setEncryptedCVV(cvvBlocks.map(block => bufferToHex(teaEncrypt(block, key))).join(","));
  };

  const decryptCustomData = (input) => {
    const key = globalKey;
    const inputBlocks = input.split(",").map(hexToBuffer);
    const decryptedBlocks = inputBlocks.map(block => teaDecrypt(block, key));
    setDecryptedText(decryptedBlocks.map(decryptedArray =>
      String.fromCharCode(
        decryptedArray[0] & 0xffff,
        (decryptedArray[0] >> 16) & 0xffff,
        decryptedArray[1] & 0xffff,
        (decryptedArray[1] >> 16) & 0xffff
      ).trim()
    ).join(""));
  };

  const hexToBuffer = (hex) => {
    const buffer = new Uint32Array(2);
    buffer[0] = parseInt(hex.substring(0, 8), 16) || 0;
    buffer[1] = parseInt(hex.substring(8, 16), 16) || 0;
    return buffer;
  };

  const bufferToHex = (buffer) => {
    return buffer.map(v => v.toString(16).padStart(8, "0")).join("");
  };

  const sendData = async () => {
    const data = {
      nombreCompleto: encryptedName,
      NumeroDeTarjeta: encryptedCard,
      CVV: encryptedCVV,
    };

    try {
      const response = await fetch("http://localhost:3000/cifradoSimetrico", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      console.log("Datos enviados:", result);
    } catch (error) {
      console.error("Error al enviar datos:", error);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Texto copiado al portapapeles");
  };

  return (
    <main>
      <div className="container">
        <h2>Formulario de Pago Seguro - TEA -</h2>
        <form onSubmit={e => e.preventDefault()}>
          <div className="form-group">
            <label htmlFor="name">Nombre Completo:</label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="cardNumber">Número de Tarjeta:</label>
            <input
              type="text"
              id="cardNumber"
              name="cardNumber"
              maxLength="16"
              required
              value={cardNumber}
              onChange={e => setCardNumber(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="cvv">CVV:</label>
            <input
              type="text"
              id="cvv"
              name="cvv"
              maxLength="4"
              required
              value={cvv}
              onChange={e => setCvv(e.target.value)}
            />
          </div>

          <div className="button-group">
            <button type="button" className="green-button" onClick={encryptData}>Cifrar Datos</button>
            <button type="button" className="green-button" onClick={() => decryptCustomData(decryptedText)}>
              Desencriptar Datos
            </button>
            <button type="button" className="green-button" onClick={sendData} disabled={!encryptedName || !encryptedCard || !encryptedCVV}>
              Enviar Datos
            </button>
          </div>

          {encryptedName && (
            <div className="encrypted-section">
              <label>Nombre Cifrado:</label>
              <input type="text" value={encryptedName} readOnly />
              <button className="copy-button" onClick={() => copyToClipboard(encryptedName)}>Copiar</button>
            </div>
          )}

          {encryptedCard && (
            <div className="encrypted-section">
              <label>Número de Tarjeta Cifrado:</label>
              <input type="text" value={encryptedCard} readOnly />
              <button className="copy-button" onClick={() => copyToClipboard(encryptedCard)}>Copiar</button>
            </div>
          )}

          {encryptedCVV && (
            <div className="encrypted-section">
              <label>CVV Cifrado:</label>
              <input type="text" value={encryptedCVV} readOnly />
              <button className="copy-button" onClick={() => copyToClipboard(encryptedCVV)}>Copiar</button>
            </div>
          )}

          <div className="form-group" style={{ marginTop: '20px' }}>
            <label htmlFor="inputToDecrypt">Texto a desencriptar:</label>
            <input
              type="text"
              id="inputToDecrypt"
              placeholder="Ingrese texto cifrado"
              value={decryptedText}
              onChange={e => setDecryptedText(e.target.value)}
            />
            {decryptedText && (
              <div style={{ marginTop: '10px' }}>
                Texto desencriptado: {decryptedText}
              </div>
            )}
          </div>
        </form>
      </div>
    </main>
  );
};

export default TeaEncryptionApp;
