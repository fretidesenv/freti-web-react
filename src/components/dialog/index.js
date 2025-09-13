import { useState } from 'react'
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import '../uploadFile/upload.css'
import { MdCloudUpload, MdDelete } from 'react-icons/md'
import { AiFillFileImage } from "react-icons/ai";

export default function AlertDialog({ handleClose, open, origem, handleUpload }) {
    const [image, setImage] = useState(null);
    const [imageUrl, setImageUrl] = useState(null);
    const [fileName, setFileName] = useState("No selected file");
    const [uploading, setUploading] = useState(false);

    const [file, setFile] = useState(null);
    const [fileUrl, setFileUrl] = useState(null);

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
            await handleUpload(file);
            console.log("Upload concluído:", file.name)
            setUploading(false);

            setFileName("Nenhum arquivo selecionado");
            setFile(null);
            setFileUrl(null);
        } catch (error) {
            console.error("Erro ao fazer upload:", error);
            setUploading(false);
        }
    };

    const isImage = file && file.type.startsWith("image/");
    const isPDF = file && file.type === "application/pdf";

    return (
        <div>
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Importar documento do(a) " + origem}
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
                    </main>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleUploadClick}
                        disabled={!file || uploading}
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
    );
}
