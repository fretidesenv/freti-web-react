import { useState } from 'react';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import InputMask from 'react-input-mask';

import { Box, Card, Dialog, DialogContentText, DialogTitle, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup } from '@mui/material';
import ImageZoom from '../imageZoom';
require('firebase/auth')


export default function OriginDialog({open, handleClose, handleFormChangeSave}) {
  
    const [canhotoDelivery, setCanhotoDelivery] = useState('');

    const [formFields, setFormFields] = useState([
        { 
            ordenacao: '', 
            type: '', 
            cep: '', 
            address: '', 
            number: '', 
            city: '', 
            state: '', 
            responsible: '', 
            phone: '', 
            numberColeta: '', 
            dataColeta: '', 
            horacoleta: '' 
        },
      ])


    async function save(){
        console.log("Entrando no salvar")

        console.log(formFields)

        handleFormChangeSave(formFields);

    }

    function buscarCNPJ(input) {
        if(input.length < 14) { 
            return;
        } else {   

            
                fetch('https://brasilapi.com.br/api/cnpj/v1/'+input, {mode: 'cors'})
                .then((res) => res.json())
                .then((data) => {
                    if (data.hasOwnProperty("erro")) {
                        alert('CNPJ não existente');
                    } else {                        

                        // setPayingCustomer(data?.razao_social)
                        // setCnpjPayingCustomer(data?.cnpj)
                        // setAddressPaying(data?.logradouro  + ' - ' + data?.complemento + ', ' + data?.numero)
                        // setCityPaying(data?.municipio)
                        // setPayingStateInitial(data?.uf)
                        // setCepPaying(data?.cep)
                    }
                })
                .catch(err => console.log(err));
        }
    }

       //Função para consultar CEP
       function buscarCepPaying(input) {
        
        input.replace("-","");

        if(input.length < 8) { 
            return;
        } else {
            
                fetch('https://brasilapi.com.br/api/cep/v2/'+input, {mode: 'cors'})
                .then((res) => res.json())
                .then((data) => {
                    if (data.hasOwnProperty("erro")) {
                        alert('Cep não existente');
                    } else {
                        // setAddressPaying(data.street + ' - ' + data.neighborhood)
                        // setCityPaying(data.city)
                        // setPayingStateInitial(data.state)
                        // setTypeLocationPaying(data.location.type)
                        // setLongitudePaying(data.location.coordinates.longitude)
                        // setLatitudePaying(data.location.coordinates.latitude)
                    }
                })
                .catch(err => console.log(err));
        } 
    }



      const handleFormChange = (event, index) => {
        let data = [...formFields];
        data[index][event.target.name] = event.target.value;
        setFormFields(data);
      }

      const submit = (e) => {
        e.preventDefault();
        console.log(formFields)
      }

      const addFields = () => {
        let object = {
            ordenacao: '', 
            type: '', 
            cep: '', 
            address: '', 
            number: '', 
            city: '', 
            state: '', 
            responsible: '', 
            phone: '', 
            numberColeta: '', 
            dataColeta: '', 
            horacoleta: '' 
        }
    
        setFormFields([...formFields, object])
      }

      const removeFields = (index) => {
        let data = [...formFields];
        data.splice(index, 1)
        setFormFields(data)
      }

  return (
    <div>

      <Dialog open={open} 
        onClose={handleClose}
        fullWidth={"lg"}
        maxWidth={"lg"}
        >
        <DialogTitle>Pontos de paradas</DialogTitle>
        <DialogContent>
            <div className="mb-4">
            <DialogContentText>
                Adicione pontos de paradas informando o tipo Carga ou Descarga
            </DialogContentText>
            </div>

            <div className="form-signin mx-auto mb-4 mb-lg-6">
                        
                {
                    formFields.map((form, index) => {
                        return (
                            <Box
                            component="span"
                            sx={{ display: 'inline-block', mx: '1px', transform: 'scale(0.9)' }}
                          >
                            <Card sx={{ padding: 2 }} style={{background: '#ffffff'}}>

                                <div className="row mb-5">

                                
                                    <div className="row">
                                        <div className="col-1 mb-4">
                                            <label htmlFor="ordenacaoLabel"  className="form-label">Ordenação</label>
                                            <input type="number" 
                                                    name='ordenacao'
                                                    min={1}
                                                    onChange={event => handleFormChange(event, index)}
                                                // onChange={(e)=> {
                                                //         setCepOrigin(e.target.value)
                                                //         buscarCepCustomer(e.target.value)
                                                //     }} 
                                                value={form.ordenacao && form.ordenacao} 
                                                size={"small"}
                                                maxLength={10} className="form-control" id="ordenacao" placeholder=""/>
                                        </div>

                                        <div className="col-1 mb-4">
                                        </div>

                                        <div className="col-4 mb-3">
                                            <FormControl>
                                                <FormLabel id="demo-row-radio-buttons-group-label">Tipo de Parada</FormLabel>
                                                <RadioGroup
                                                    row
                                                    aria-labelledby="demo-row-radio-buttons-group-label"
                                                    name="row-radio-buttons-group"
                                                >
                                                    <FormControlLabel 
                                                        value="Carga"
                                                        name='type'
                                                        onChange={event => handleFormChange(event, index)} 
                                                        // value={form.type && form.type}
                                                        control={<Radio />} 
                                                        label="Carga" />
                                                        
                                                    <FormControlLabel 
                                                        value="Descarga"
                                                        name='type'
                                                        onChange={event => handleFormChange(event, index)} 
                                                        control={<Radio />} 
                                                        label="Descarga" />
                                                </RadioGroup>
                                            </FormControl>     
                                        </div>
                                    </div>
                                    <div className="row">

                                        <div className="col-2">
                                            <label htmlFor="cepLabel"  className="form-label">CEP</label>
                                            <input type="text" 
                                                name='cep'
                                                onChange={event => handleFormChange(event, index)}
                                                // onChange={(e)=> {
                                                //         setCepOrigin(e.target.value)
                                                //         buscarCepCustomer(e.target.value)
                                                //     }} 
                                                value={form.cep && form.cep} 
                                                maxLength={10} className="form-control" id="cep" placeholder="" />
                                        </div>
                                        
                                        <div className="col-md-4">
                                            <label htmlFor="addressLabel" className="form-label">Endereço</label>
                                            <input type="text" 
                                            name='address'
                                            onChange={event => handleFormChange(event, index)}
                                            value={form.address && form.address} 
                                            className="form-control" id="address" />
                                        </div>

                                        <div className="col-md-1">
                                            <label htmlFor="numberLabel" className="form-label">N.º</label>
                                            <input type="text"  
                                            name='number'
                                            onChange={event => handleFormChange(event, index)}
                                            value={form.number && form.number}  
                                            className="form-control" id="numberAddress" />
                                        </div>

                                        <div className="col-2">
                                            <label htmlFor="city" className="form-label">Cidade</label>
                                            <input type="text"
                                            name='city'  
                                            onChange={event => handleFormChange(event, index)}
                                            value={form.city && form.city}  
                                            className="form-control" id="city" placeholder=""/>
                                        </div>
                                        <div className="col-md-1">
                                            <label htmlFor="stateInitialLabel" className="form-label">Estado</label>
                                            <input type="text"  
                                            name='state'
                                            onChange={event => handleFormChange(event, index)}
                                            value={form.state && form.state}  
                                            className="form-control" id="stateInitial"/>
                                        </div>

                                    </div>

                                    <div className="row">

                                        <div className="col-md-3">
                                            <label htmlFor="responsibleLabel" className="form-label">Responsável</label>
                                            <input type="text" 
                                            name='responsible'
                                            onChange={event => handleFormChange(event, index)}
                                            value={form.responsible && form.responsible} 
                                            className="form-control" id="responsible"/>
                                        </div>
                                        <div className="col-3">
                                            <label htmlFor="phoneRespLabel" className="form-label">Telefone Responsável</label>
                                            <InputMask mask="(99) 99999-9999" id="phoneResp" className="form-control" 
                                            name='phone'
                                            onChange={event => handleFormChange(event, index)}
                                            value={form.phone && form.phone} 
                                            placeholder="(99) 99999-9999"/>

                                        </div>

                                        <div className="col-md-2">
                                            <label htmlFor="numberColetaLabel" className="form-label">Número da coleta</label>
                                                <input type="text" 
                                                onChange={event => handleFormChange(event, index)}
                                                name='numberColeta'
                                                value={form.numberColeta && form.numberColeta} 
                                                className="form-control" id="numbercoleta"/>
                                        </div>
                                        
                                        <div className="col-md-2 mb-4">
                                            <label htmlFor="datacoletaLabel" className="form-label">Data da Coleta</label>
                                            <input type="date"
                                            name='dataColeta'
                                            onChange={event => handleFormChange(event, index)}
                                            value={form.dataColeta && form.dataColeta} 
                                            className="form-control" id="datacoleta"/>
                                        </div>
    
                                        <div className="col-md-2 mb-4">
                                            <label htmlFor="horacoletaLabel" className="form-label">Hora da Coleta</label>
                                            <input type="text"
                                            name='horacoleta' 
                                            onChange={event => handleFormChange(event, index)}
                                            value={form.horacoleta && form.horacoleta} 
                                            className="form-control" id="horacoleta"/>
                                        </div>
                                    
                                    </div>

                                    <div className="row">
                                        <div className="col-md-2 ">

                                            {
                                                canhotoDelivery ?
                                                <>
                                                    <div className="row">
                                                        <div className="col-md-2">
                                                            <ImageZoom 
                                                                title=""
                                                                name='canhotoDelivery'
                                                                source={canhotoDelivery && canhotoDelivery}
                                                                height="100"
                                                                width="100"
                                                            /> 
                                                            <Button variant="outlined" 
                                                                // onClick={(e) => {
                                                                //     handleClickOpen();
                                                                //     setOrigem("Canhoto");
                                                                // }}
                                                                    >
                                                                Editar
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </>
                                                : 
                                                <Button variant="outlined" 
                                                    // onClick={(e) => {
                                                    //     handleClickOpen();
                                                    //     setOrigem("Canhoto");
                                                    // }}
                                                    >
                                                    Importar Canhoto
                                                </Button>
                                            }

                                        </div>
                                        {/* <div className="col-md-3">
                                        </div> */}

                                        {/* <div className="col-md-2">
                                            <button onClick={addFields}>Add More..</button>
                                        </div> */}

                                    </div>


                                    {/* <div className="row">
                                        <div className="col-md-2 ">

                                        <form onSubmit={submit}>
                                            {
                                            formFields.map((form, index) => {
                                                return (
                                                    <div key={index}>
                                                        <input
                                                            name='name'
                                                            placeholder='Name'
                                                            onChange={event => handleFormChange(event, index)}
                                                            value={form.name}
                                                        />
                                                        <input
                                                            name='age'
                                                            placeholder='Age'
                                                            onChange={event => handleFormChange(event, index)}
                                                            value={form.age}
                                                        />
                                                        <button onClick={() => removeFields(index)}>Remove</button>
                                                    </div>
                                                )
                                                })
                                            }
                                        </form>
                                        <button onClick={addFields}>Add More..</button>
                                        <br />
                                        <button onClick={submit}>Submit</button>
                                        </div>

                                    </div> */}
                                </div>
                                </Card>

                            </Box>
                        )
                    })
                }
            </div>


            </DialogContent>
            <DialogActions>
            <Button onClick={addFields}> + pontos de paradas</Button>
            <Button onClick={save}>Salvar</Button>
            </DialogActions>
        </Dialog>
    </div>
  );
}


