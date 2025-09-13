import React, { useEffect, useState } from "react";
import { Modal, Button, Input, Form, DatePicker } from "antd";
import IntlCurrencyInput from "react-intl-currency-input";
import './style.css';
import paymentService from "../../service/payment.service";
import DialogDeConfirmação from "../dialog-confirm/dialogDeConfirmação";
import moment from "moment";
import driverService from "../../service/driver.service";
import freightService from "../../service/freight.service";

const PaymentModal = ({ visible, onClose, driverName, dataHistory, type, onUpdate }) => {
  const [form] = Form.useForm();

  const [record, setRecord] = useState('');
  const [dataHistoryy, setDataHistory] = useState('');

  const [idFreight, setIdFreight] = useState('');
  const [idDriver, setIdDriver] = useState('');
  const [driverRecord, setDriverRecord] = useState([]);
  const [freightRecord, setFreightRecord] = useState([]);

  const [openDialog, setOpenDialog] = React.useState(false);
  const [openDialogErro, setOpenDialogErro] = React.useState(false);
  const [erroMessage, setErroMessage] = React.useState("");
  const [message, setMessage] = React.useState("");

  const [formDisabled, setFormDisabled] = useState(false);

  const [btnLoading, setBtnLoading] = useState(false);

  const currencyConfig = {
      locale: "pt-BR",
      formats: {
          number: {
              BRL: {
                  style: "currency",
                  currency: "BRL",
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              },
          },
      },
  };

  useEffect(() => {
    if (driverName) {
      setRecord(driverName);
      setDataHistory(dataHistory);
      // debugger;
    }
  }, [driverName]);
  
  useEffect(() => {
    if (record) {
      // Verifica se 'record' contém 'idFreight', senão tenta pegar de 'driverName'
      setIdFreight(record?.idFreight || driverName?.idFreight || null);
      setIdDriver(driverName?.driverID || null);
      // debugger;
    }
  }, [record, driverName]);

  useEffect(() => {
    if (record) {
      const timestamp = moment(dataHistoryy?.initialDate?.seconds * 1000 + Math.floor(dataHistoryy?.initialDate?.nanoseconds / 1_000_000));
      const timestamp2 = moment(dataHistoryy?.initialDateContrate?.seconds * 1000 + Math.floor(dataHistoryy?.initialDateContrate?.nanoseconds / 1_000_000));
      // const timestamp3 = moment(dataHistoryy.initialDate.seconds * 1000 + Math.floor(dataHistoryy.initialDate.nanoseconds / 1_000_000));
      form.setFieldsValue({
        dataEmissao: timestamp ? moment(timestamp, "DD/MM/YYYY") : timestamp2 ? moment(timestamp2, "DD/MM/YYYY") : "",
        status: record.status || undefined,
        obs: record.obs || "",
        valorAdicional: record.valorAdicional || 0,
        desconto: record.desconto || 0,
        dataVencimento: record.dataValidade ? moment(record.dataValidade, "DD/MM/YYYY") : null,
      });

      setFormDisabled(record.status?.toLowerCase() === 'pago');
    }
  }, [record, form]);

  const onFinish = async (values) => {

    if (!idFreight) {
      console.error("Erro: ID do frete não foi fornecido!");
      return;
    }

    try {
      const formattedDataAtt = values?.dataBaixa ? values.dataBaixa.format("DD/MM/YYYY") : null;
      await paymentService.update({ 
        idFreight,
        // id: record.id || record?.idFreight + record?.value,
        type: record.type,
        status: values?.status,
        obs: values?.obs,
        valueTotal: Number(record.value) + Number(values?.valorAdicional ?? 0) - Number(values?.desconto ?? 0),
        value: record?.value,
        valorAdicional: Number(values?.valorAdicional || 0),
        desconto: Number(values?.desconto || 0),
        dataBaixa: values?.status?.toLowerCase() === "pago" ? formattedDataAtt : record?.dataBaixa ? record.dataBaixa : null,
        dataValidade: values?.dataVencimento ? values.dataVencimento.format("DD/MM/YYYY") : null,
      });
      setOpenDialog(true);
      form.resetFields();
    } catch (error) {
      console.error("Erro ao salvar status:", error);
    }
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setOpenDialogErro(false);
    onUpdate(); // Executa a atualização ao fechar o diálogo
  };

  const valorAdicionalRaw = Form.useWatch('valorAdicional', form);
  const descontoRaw = Form.useWatch('desconto', form);
  const status = Form.useWatch('status', form);
  const valorAdicionall = Number(valorAdicionalRaw) || 0;
  const descontoo = Number(descontoRaw) || 0;  
  const valorTotal = (record?.value || 0) + (valorAdicionall || 0) - (descontoo || 0);

  useEffect(() => {
    if (!record) return;
    if (!form) return;

    if (record?.dataBaixa) {
      form.setFieldsValue({ dataBaixa: moment(record.dataBaixa, "DD/MM/YYYY") });
    // console.log("1");
    } else if (status?.toLowerCase() === "pago") {
      form.setFieldsValue({ dataBaixa: null });
      // console.log("2");
    } else {
      form.setFieldsValue({ dataBaixa: moment() });
      // console.log("3");
    }
  }, [record, status, form]);

  const handleSearchInfo = async (idDriver, idFreight) => {
    let driverData = null;
    let freightData = null;
    
    if (!idDriver || !idFreight) {
      console.error("Erro: ID do motorista ou do frete não foi fornecido!");
      return { driverData, freightData };
    }

    try {
      await driverService.getDriverAvailable(idDriver)
        .then( async (doc) => {
          if (doc.exists) {
            driverData = {
              ...doc.data(),
              driver: doc.data().name || "Motorista não encontrado",
              type: type || "Tipo não definido",
              value: dataHistory?.value || 0,
            };

            const documentsSnapshot = await driverService.getDriverDocuments(idDriver);
            const documents = [];
            documentsSnapshot.forEach((doc) => {
              documents.push({ id: doc.id, ...doc.data() });
            });

            driverData.documents = documents;
            setDriverRecord(driverData);
          } else {
            console.error("Motorista não encontrado");
          }
        });
    }
    catch (error) {
      console.error("Erro ao buscar informações:", error);
    }

    try {
      await freightService.getFreightById(idFreight)
        .then((doc) => {
          if (doc.exists) {
            freightData = { ...doc.data() };
            setFreightRecord(freightData);
          } else {
            console.error("Frete não encontrado");
          }
        });
    }
    catch (error) {
      console.error("Erro ao buscar informações:", error);
    }
    return { driverData, freightData };
  }

  const handleCreateHtml = async (dadoDriver, dataFreight, Subject, obs, valorSolicitado, valorOriginal, valorAdicional, valorDesconto, type) => {
    if (!dadoDriver || !dataFreight) {
      console.error("Erro: Dados insuficientes para criar HTML!");
      return;
    }

    console.log("handleCreateHtml:", dataFreight);


    await paymentService.prepareEmail(
        dadoDriver,  
        dataFreight,
        Subject,
        obs,
        valorSolicitado,
        valorOriginal,
        valorAdicional,
        valorDesconto,
        type,
      );

  }

  useEffect(() => {
    return;
  }, [driverRecord, freightRecord]);

  return (
    <>
    <Modal
      title="Baixa Pagamento - Informação do Frete"
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={() => {onClose()}}>
          Cancelar
        </Button>,
        <Button type="primary" loading={btnLoading} onClick={async () => {
          if (formDisabled) {
            // Reativa os campos
            setFormDisabled(false);
            return;
          }
          
          try {
            const verify2 = record.valorAdicional != form.getFieldValue('valorAdicional') || record.desconto != form.getFieldValue('desconto');
            const verifyValor = record.valorAdicional != form.getFieldValue('valorAdicional') ? "Valor Adicional" : "Desconto";
            const obs = await form.getFieldValue('obs');

            if (verify2 && obs === record.obs) {
              setOpenDialogErro(true);
              setErroMessage("Erro no formulário!");
              setMessage( <> Por favor, insira uma <b>observação</b> para as alterações feitas no <b>{verifyValor}</b>. </> );
              return;
            }

            if (form.getFieldValue('status') === "") {
              setOpenDialogErro(true);
              setErroMessage("Erro no formulário!");
              setMessage(  <> Por favor, selecione um <b>status</b> válido. </>);
              return;
            }

            await form.validateFields();

            const verify = record?.status?.toLowerCase() === "solicitar pagamento" && (record.valorAdicional != form.getFieldValue('valorAdicional') || record.desconto != form.getFieldValue('desconto'));

            try {
              if ( verify && form.getFieldValue('status') === 'solicitar pagamento') {
                setBtnLoading(true);
                const { driverData, freightData } = await handleSearchInfo(idDriver, idFreight);
                await handleCreateHtml(driverData, freightData, "Errata! Solicitação de Pagamento", obs || record.obs , valorTotal, record?.value, form.getFieldValue('valorAdicional'), form.getFieldValue('desconto'), record.type);
              }
              else if (form.getFieldValue('status') === 'solicitar pagamento') {
                setBtnLoading(true);
                const { driverData, freightData } = await handleSearchInfo(idDriver, idFreight);
                await handleCreateHtml(driverData, freightData, "Solicitação de Pagamento", obs || record.obs , valorTotal, record?.value, form.getFieldValue('valorAdicional'), form.getFieldValue('desconto'), record.type);
              }
            }
            finally {
              setBtnLoading(false);
            }

            form.submit();
            onClose();
          } catch (errorInfo) {
            console.log("Erro de validação:", errorInfo);
            setBtnLoading(false);
          }
        }}>
          {formDisabled ? 'Desfazer Baixa' : 'Salvar'}
        </Button>,
      ]}
      width={700}
    >
      <Form form={form} onFinish={onFinish} style={{ paddingLeft: '4%', display: 'flex', alignItems: 'flex-start', border: 'none', cursor: 'default' }}>

        <div className="formMotoType">
          <div className="formMotorista" >
            <Form.Item /* label="Motorista" */>
              {/* <span>{record ? record.driver : "Erro na busca do Motorista"}</span> */}
              <input className="form-control my-2" placeholder={record ? record.driver : "Erro na busca do Motorista"} disabled />
            </Form.Item>
          </div>

          <div class="tipoType">
            <div> <p>Descrição: </p> </div>
            <Form.Item /* label="Tipo" */ style={{ width: '207px' }} disabled>
              {/* <span>{type}</span> */}
              <input className="form-control my-2" placeholder={record.type} disabled />
            </Form.Item>
          </div>
        </div>

        <div className="formValOriStatus" >
          <div className="valorOriginal">
            <Form.Item /* label="Valor Original" */ name="valorOriginal" >
              <div> <p>Valor Original:</p> </div>
              <IntlCurrencyInput
                id="InputDinero"
                currency="BRL"
                config={currencyConfig}
                defaultValue={record?.value ?? 0}
                className="form-control my-2"
                disabled
              />
            </Form.Item>
          </div>

          <div className="formStatus" >
            <Form.Item /* label="Status" */ name="status" >
              <select disabled={formDisabled} className="form-select" >
                <option value="">Selecione o Status</option>
                <option value="bloqueado">Bloqueado</option>
                <option value="pendente">Pendente Liberação</option>
                <option value="solicitar pagamento">Solicitar Pagamento</option>
                <option value="pago">Pago</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </Form.Item>
          </div>
        </div>

        <div class="tipo">
          <div>
            <div> <p>Valor Adicional: </p> </div>
            <Form.Item /* label="Valor Adicional" */ name="valorAdicional">
              <IntlCurrencyInput
                disabled={formDisabled}
                id="InputDinero"
                currency="BRL"
                config={currencyConfig}
                value={form.getFieldValue('valorAdicional') ?? 0}
                className="form-control my-2"
                onChange={(event, value, maskedValue) => {
                  form.setFieldsValue({ valorAdicional: value });
                }}
              />
            </Form.Item>
          </div>

          <div className="formDataAtt">
            <div> <p>Data de Emissão: </p> </div>
            <Form.Item name="dataEmissao" >
              <DatePicker placement="bottomRight" format="DD/MM/YYYY" style={{ width: '100%' }} disabled />
            </Form.Item>
          </div>
        </div>

        <div className="formDescVencimento" >
          <Form.Item /* label="Desconto" */ name="desconto">
            <div>
              <p>Desconto: </p>
            </div>
            <IntlCurrencyInput
              disabled={formDisabled}
              id="InputDinero"
              currency="BRL"
              config={currencyConfig}
              value={form.getFieldValue('desconto') ?? 0}
              className="form-control my-2"
              onChange={(event, value, maskedValue) => {
                form.setFieldsValue({ desconto: value });
              }}
            />
          </Form.Item>

          <div className="formDataVencimento">
            <div> <p>Data de Vencimento: </p> </div>
            <Form.Item name="dataVencimento" >
              <DatePicker disabled={formDisabled} format="DD/MM/YYYY" style={{ width: "208px", marginTop: "10px" }} getPopupContainer={trigger => trigger.parentNode} dropdownClassName="custom-date-picker-popup" />
            </Form.Item>
          </div>
        </div>

        <div class="valorDataBaixa">
          <div>
            <div> <p>Total: </p> </div>
            <Form.Item /* label="Valor" */>
              {/* <span>{record ? `R$ ${record.value}` : "Erro na busca do valor do frete"}</span> */}
              <input style={{ width: "208px" }} className="form-control my-2" placeholder={ Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL' }).format(valorTotal) } disabled />
            </Form.Item>
          </div>

          <div className="formDataBaixa">
            <div> <p>Data da Baixa: </p> </div>
            <Form.Item name="dataBaixa" rules={[{ required: true, message: "Por favor, selecione a data" }]} >
              <DatePicker placement="bottomRight" format="DD/MM/YYYY" style={{ width: '208px', marginTop: "10px" }} disabled={status !== "pago" || formDisabled} getPopupContainer={trigger => trigger.parentNode} dropdownClassName="custom-date-picker-popup" />
            </Form.Item>
          </div>
        </div>

        <div class="tipoObs2">
          <div> <p>Observações: </p> </div>
          <Form.Item name="obs" >
            {/* <Input className="InputTypeText" type="text" placeholder="Digite sua Observação" /> */}
            <Input.TextArea disabled={formDisabled} className="InputTypeText" placeholder={"Digite sua Observação"} style={{ width: '400px' }} />
          </Form.Item>
        </div>
      </Form>
    </Modal>

    <DialogDeConfirmação
      open={openDialog}
      handleClose={handleDialogClose}
      title="Pagamento Confirmado!"
      message="O pagamento foi realizada com sucesso."
      status="success"
    />
    <DialogDeConfirmação
      open={openDialogErro}
      handleClose={handleDialogClose}
      title={erroMessage}
      message={message}
      status="error"
    />
    </>
  );
};

export default PaymentModal;
