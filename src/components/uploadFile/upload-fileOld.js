
import { useState } from 'react'
import './upload.css'
import { MdCloudUpload, MdDelete } from 'react-icons/md'
import { AiFillFileImage } from "react-icons/ai";

function UploadFile({oritemData}) {
    const [image, setImage] = useState(null)
    const [fileName, setFileName] = useState("No selected file")
    // const [origemData, setOrigemData] = useState("");


    return (
        <main>
            <form
            onClick={()=>document.querySelector(".input-field").click()}
            >

            <input type="file" accept="image/*" className='input-field' hidden 
             onChange={
                ({target: {files}}) => {
                    files[0] && setFileName(files[0].name)
                    if(files){
                        setImage(URL.createObjectURL(files[0]))
                    }
                }}
              />
            
            {
                image ? 
                <img src={image} width={260} height={260} alt={fileName} />
                :
                <>
                    <MdCloudUpload color='#1475cf' size={60} />
                    <p>Escolha a imagem para upload</p>
                </>
            }
             
            </form>
            <section className='uploaded-row'>
                <AiFillFileImage color="#1475cf" />
                <span>
                    {fileName} -
                    <MdDelete 
                    onClick={() => {
                        setFileName("Imagem não selecionada")
                        setImage(null)
                    }}
                    />
                </span>
            </section>

        </main>
    )
}

export default UploadFile