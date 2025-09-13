import { useState } from 'react'
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import '../uploadFile/upload.css'
import { MdCloudUpload, MdDelete } from 'react-icons/md'
import { AiFillFileImage } from "react-icons/ai";
import { ReadCertificate } from '../ReaderPFX/ReaderPFX';
import CryptoJS from 'crypto-js';

export default function AlertDialog({ handleClose, open, origem, handleUpload }) {

    const [image, setImage] = useState(null);
    const [imageUrl, setImageUrl] = useState(null);
    const [fileName, setFileName] = useState("No selected file");
    const [uploading, setUploading] = useState(false);

    const [file, setFile] = useState(null);
    const [fileUrl, setFileUrl] = useState(null);

    const [passwordCertificate, setPasswordCertificate] = useState("");
    const [passwordCertificateHash, setPasswordCertificateHash] = useState("");

    const SECRET_KEY = "eebc77e16c9519d7c3d6a8986a839bd2c0a05690e83b43b1fd5053485a3acff6";

    const [openErrorDialog, setOpenErrorDialog] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');


    const handleImageChange = ({ target: { files } }) => {
        const file = files[0];
        if (file) {
            setFileName(file.name);
            setImage(URL.createObjectURL(file));
            setImageUrl(file);
        }
    };

    const handleFileChange = ({ target: { files } }) => {
        const selectedFile = files[0];
        if (selectedFile) {
            setFileName(selectedFile.name);
            setFileUrl(URL.createObjectURL(selectedFile));
            setFile(selectedFile);
        }
    };

    const handleUploadClick = async () => {
        setUploading(true);
        try {

            if(origem === "documentCertificate") {
                const certInfo = await ReadCertificate(file, passwordCertificate);
                debugger;
                await handleUpload(file, passwordCertificateHash, certInfo);
            }else {
                await handleUpload(file);
            }
            // console.log("Certificado lido com sucesso:", certInfo);
            // console.log("Upload concluído:", file.name)
            setUploading(false);

            setFileName("Nenhum arquivo selecionado");
            setFile(null);
            setFileUrl(null);
            setPasswordCertificate("");
            setPasswordCertificateHash("");
        } catch (error) {
            console.error("Erro ao fazer upload:", error);
            setErrorMessage("Senha inválida ou certificado corrompido");
            setOpenErrorDialog(true);
        }
        finally {
            setUploading(false);
        }
    };

    function handlePasswordCrypt(e) {
        const password = e.target.value;
        setPasswordCertificate(password);

        const hash = CryptoJS.AES.encrypt(password, SECRET_KEY).toString();

        setPasswordCertificateHash(password);
    };

    const isImage = file && file.type.startsWith("image/");
    const isPDF = file && file.type === "application/pdf";

    return (
        <>
            <div>
                <Dialog
                    open={open}
                    onClose={handleClose}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">
                        { "Importar documento do(a) " + origem }
                    </DialogTitle>
                    <DialogContent>
                        <main>
                            <form
                                onClick={() =>
                                    document.querySelector(".input-field").click()
                                }
                            >
                                <input
                                    type="file"
                                    accept="image/*,application/pdf,.pfx,.p12,.cer,.crt,.pem"
                                    className="input-field"
                                    hidden
                                    onChange={handleFileChange}
                                />
                                {isImage && (
                                    <img
                                        src={fileUrl}
                                        alt={fileName}
                                        style={{
                                            maxWidth: "498px",
                                            maxHeight: "300px",
                                            width: "auto",
                                            height: "auto",
                                            display: "block",
                                            margin: "0 auto",
                                        }}
                                    />
                                )}
                                {isPDF && (
                                    <iframe
                                        src={fileUrl}
                                        alt={fileName}
                                        title="PDF Preview"
                                        style={{
                                            width: "100%",
                                            height: "300px",
                                            border: "none",
                                        }}
                                    />
                                )}
                                {!file && (
                                    <>
                                        <MdCloudUpload color="#1475cf" size={60} />
                                        <p>
                                            {uploading
                                                ? "Aguardando upload..."
                                                : "Escolha um arquivo para upload"}
                                        </p>
                                    </>
                                )}
                            </form>
                            <section className="uploaded-row">
                                {file && (
                                    <>
                                        <span>{fileName}</span>
                                        <MdDelete
                                            onClick={() => {
                                                setFileName(
                                                    "Nenhum arquivo selecionado"
                                                );
                                                setFile(null);
                                                setFileUrl(null);
                                            }}
                                            style={{
                                                cursor: "pointer",
                                                marginLeft: "10px",
                                            }}
                                        />
                                    </>
                                )}
                            </section>
                            { origem === "documentCertificate" && (
                                <div className="col-md-2"  style={{ display: 'flex' }}>
                                    <label style={{ whiteSpace: 'nowrap', marginRight: '10px', fontWeight: 'bold', display: 'inline-block' }} htmlFor="passwordCertificate" className="form-label">Senha do certificado <span  style={{ color: 'red' }}> * </span> </label>
                                    <input type="password"
                                        style={{ width: '150px' }} 
                                        onChange={handlePasswordCrypt}
                                        value={passwordCertificate && passwordCertificate} 
                                        className="form-control" id="passwordCertificate"/>
                                </div>
                            )}
                        </main>
                    </DialogContent>

                    <DialogActions>
                        <Button
                            onClick={handleUploadClick}
                            disabled={!file || uploading || (origem === "documentCertificate" && !passwordCertificate)}
                        >
                            Importar
                        </Button>
                        <Button
                            onClick={() => {
                                handleClose();
                                setFileName("Nenhum arquivo selecionado");
                                setFile(null);
                                setFileUrl(null);
                            }}
                            color="error"
                            autoFocus
                        >
                            Cancelar
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
            <div>
                <Dialog open={openErrorDialog} onClose={() => setOpenErrorDialog(false)}>
                <DialogTitle>Erro ao processar o certificado</DialogTitle>
                <DialogContent>
                    <p>{errorMessage}</p>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenErrorDialog(false)}>Fechar</Button>
                </DialogActions>
                </Dialog>
            </div>
        </>
    );
}