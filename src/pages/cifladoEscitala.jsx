import { useState, useRef } from 'react';
import { FloatLabel } from 'primereact/floatlabel';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { MySidebar } from "../components/MySidebar.jsx";
import '../css/cifrado.css';

export const CifradoEscitala = () => {
    const [mensajeCifrado, setMensajeCifrado] = useState('');
    const [claveCifrado, setClaveCifrado] = useState('');
    const [resultadoCifrado, setResultadoCifrado] = useState('');
    const [mensajeDescifrado, setMensajeDescifrado] = useState('');
    const [claveDescifrado, setClaveDescifrado] = useState('');
    const [resultadoDescifrado, setResultadoDescifrado] = useState('');
    const [mensajeCopiadoCifrado, setMensajeCopiadoCifrado] = useState('');
    const [mensajeCopiadoDescifrado, setMensajeCopiadoDescifrado] = useState('');
    const [visible, setVisible] = useState(false);
    const toastRef = useRef(null); // Referencia para el Toast

    // Función para cifrar el mensaje utilizando el cifrado de Escítala
    const cifrarEscitala = (texto, clave) => {
        const longitudClave = parseInt(clave);
        if (isNaN(longitudClave) || longitudClave <= 0) return texto;

        // Asegúrate de que el texto no tenga espacios ni caracteres especiales
        const textoLimpio = texto.replace(/[^a-zA-Z0-9]/g, '');
        let resultado = '';

        // Si la longitud de la clave es mayor que la longitud del texto
        if (longitudClave >= textoLimpio.length) {
            return textoLimpio; // No se requiere cifrado
        }

        const filas = Math.ceil(textoLimpio.length / longitudClave);

        // Rellenar el texto con espacios para completar la última fila si es necesario
        const textoRellenado = textoLimpio.padEnd(filas * longitudClave, ' ');

        for (let col = 0; col < longitudClave; col++) {
            for (let fila = 0; fila < filas; fila++) {
                resultado += textoRellenado[fila * longitudClave + col];
            }
        }
        return resultado.trim(); // Retorna sin espacios en blanco al final
    };

    // Función para descifrar el mensaje utilizando el cifrado de Escítala
    const descifrarEscitala = (texto, clave) => {
        const longitudClave = parseInt(clave);
        if (isNaN(longitudClave) || longitudClave <= 0) return texto;

        const filas = Math.ceil(texto.length / longitudClave);
        let resultado = '';

        for (let fila = 0; fila < filas; fila++) {
            for (let col = 0; col < longitudClave; col++) {
                const index = fila + col * filas;
                if (index < texto.length) {
                    resultado += texto[index];
                }
            }
        }
        return resultado.trim(); // Retorna sin espacios en blanco al final
    };

    // Función para manejar el clic en el botón "Cifrar"
    const manejarCifrado = () => {
        const textoCifrado = cifrarEscitala(mensajeCifrado, claveCifrado);
        if (textoCifrado !== mensajeCifrado) {
            setResultadoCifrado(textoCifrado);
            setMensajeCopiadoCifrado('Texto cifrado copiado al portapapeles');
            setTimeout(() => setMensajeCopiadoCifrado(''), 3000);
            toastRef.current.show({ severity: 'success', summary: 'Cifrado Exitoso', detail: 'El mensaje ha sido cifrado.', life: 3000 });
        } else {
            toastRef.current.show({ severity: 'error', summary: 'Error', detail: 'Error en el cifrado. Asegúrate de que la clave sea válida.', life: 3000 });
        }
    };

    // Función para manejar el clic en el botón "Descifrar"
    const manejarDescifrado = () => {
        const textoDescifrado = descifrarEscitala(mensajeDescifrado, claveDescifrado);
        if (textoDescifrado !== mensajeDescifrado) {
            setResultadoDescifrado(textoDescifrado);
            setMensajeCopiadoDescifrado('Texto descifrado copiado al portapapeles');
            setTimeout(() => setMensajeCopiadoDescifrado(''), 3000);
            toastRef.current.show({ severity: 'success', summary: 'Descifrado Exitoso', detail: 'El mensaje ha sido descifrado.', life: 3000 });
        } else {
            toastRef.current.show({ severity: 'error', summary: 'Error', detail: 'Error en el descifrado. Asegúrate de que la clave sea válida.', life: 3000 });
        }
    };

    // Función para copiar al portapapeles
    const copiarAlPortapapeles = (texto, esCifrado) => {
        navigator.clipboard.writeText(texto).then(() => {
            if (esCifrado) {
                setMensajeCopiadoCifrado('Texto cifrado copiado al portapapeles');
                setTimeout(() => setMensajeCopiadoCifrado(''), 3000);
            } else {
                setMensajeCopiadoDescifrado('Texto descifrado copiado al portapapeles');
                setTimeout(() => setMensajeCopiadoDescifrado(''), 3000);
            }
        });
    };

    return (
        <div className="app-container">
            <Toast ref={toastRef} />

            <div className="form-container">
                <div className="form-container" style={{ display: 'flex', alignItems: 'flex-start' }}>
                    <MySidebar visible={visible} onHide={() => setVisible(false)} />
                    <Button icon="pi pi-align-left" onClick={() => setVisible(true)} />

                    <div style={{ flex: 1, display: 'flex', justifyContent: 'center', marginLeft: '20px' }}>
                        <h2 style={{ margin: '0' }}>Cifrado y Descifrado Escítala</h2>
                    </div>
                </div>

                <div className="columns-container">
                    <div className="cifrado-container">
                        <h3>Cifrado</h3>
                        <div className="input-group">
                            <FloatLabel>
                                <InputText
                                    id="mensaje-cifrado"
                                    value={mensajeCifrado}
                                    onChange={(e) => setMensajeCifrado(e.target.value)}
                                />
                                <label htmlFor="mensaje-cifrado">Mensaje a cifrar</label>
                            </FloatLabel>
                        </div>
                        <div className="input-group">
                            <FloatLabel>
                                <InputText
                                    id="clave-cifrado"
                                    value={claveCifrado}
                                    onChange={(e) => setClaveCifrado(e.target.value)}
                                />
                                <label htmlFor="clave-cifrado">Clave (número de columnas)</label>
                            </FloatLabel>
                        </div>
                        <Button className="btn-cifrar" label="Cifrar" onClick={manejarCifrado} />

                        <div className="result-container">
                            <h4>Resultado del Cifrado:</h4>
                            <div className="resultado-container">
                                <span className="resultado">{resultadoCifrado}</span>
                                <Button
                                    className="bg-bluegray-600 hover:bg-bluegray-400 border-bluegray-700 btn-icon"
                                    icon="pi pi-bookmark"
                                    onClick={() => copiarAlPortapapeles(resultadoCifrado, true)}
                                />
                            </div>
                            {mensajeCopiadoCifrado && (
                                <Toast severity="success" text={mensajeCopiadoCifrado} style={{ marginTop: '10px' }} />
                            )}
                        </div>
                    </div>

                    <div className="descifrado-container">
                        <h3>Descifrado</h3>
                        <div className="input-group">
                            <FloatLabel>
                                <InputText
                                    id="mensaje-descifrado"
                                    value={mensajeDescifrado}
                                    onChange={(e) => setMensajeDescifrado(e.target.value)}
                                />
                                <label htmlFor="mensaje-descifrado">Mensaje a descifrar</label>
                            </FloatLabel>
                        </div>
                        <div className="input-group">
                            <FloatLabel>
                                <InputText
                                    id="clave-descifrado"
                                    value={claveDescifrado}
                                    onChange={(e) => setClaveDescifrado(e.target.value)}
                                />
                                <label htmlFor="clave-descifrado">Clave (número de columnas)</label>
                            </FloatLabel>
                        </div>
                        <Button className="btn-cifrar" label="Descifrar" onClick={manejarDescifrado} />

                        <div className="result-container">
                            <h4>Resultado del Descifrado:</h4>
                            <div className="resultado-container">
                                <span className="resultado">{resultadoDescifrado}</span>
                                <Button
                                    className="bg-bluegray-600 hover:bg-bluegray-400 border-bluegray-700 btn-icon"
                                    icon="pi pi-bookmark"
                                    onClick={() => copiarAlPortapapeles(resultadoDescifrado, false)}
                                />
                            </div>
                            {mensajeCopiadoDescifrado && (
                                <Toast severity="success" text={mensajeCopiadoDescifrado} style={{ marginTop: '10px' }} />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
