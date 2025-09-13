import React, { useEffect, useState } from "react";
import { Modal, Button, Select, Input, Form } from "antd";
import IntlCurrencyInput from "react-intl-currency-input";
import './style.css';
import paymentService from "../../service/payment.service";
import DialogDeConfirmação from "../dialog-confirm/dialogDeConfirmação";
// import { Select, MenuItem } from "@mui/material";

const { Option } = Select;

const PaymentModalDespesas = ({ visible, onClose, driverName, type, onSaveResult }) => {
  const [form] = Form.useForm();

  const [record, setRecord] = useState('');
  const [openDialog, setOpenDialog] = React.useState(false);

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
    }
  }, [driverName]);

  const onFinish = async (values) => {

    try {
      // console.log(record)
      // console.log(values)
      await paymentService.save({
        driver: values.motorista ?? record?.items?.[0]?.driver,
        driverID: record?.items[0].driverID,
        id: record?.items[0].id,
        idFreight: record?.items[0].idFreight,
        order: record?.items[0].order,
        value: parseFloat(values?.valorAdicional),
        status: values?.status,
        obs: values?.obs || "",
        type: values?.tipo,
        addExpenses: true,
      })
      onSaveResult(true);
      setOpenDialog(true);
    } catch (error) {
      console.error("Erro ao salvar status:", error);
    }
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  const drivers = Array.isArray(record.items)
    ? [...new Set(record.items.map(item => item.driver || "Motorista não encontrado"))]
    : [];

  return (
    <>
    <Modal
      title="Adicionar Despesas"
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancelar
        </Button>,
        <Button type="primary" onClick={() => {form.submit() ; onClose() }}>
          Salvar
        </Button>,
      ]}
      width={700}
    >
      <Form form={form} onFinish={onFinish} style={{ paddingLeft: '4%', display: 'flex', alignItems: 'flex-start', border: 'none', cursor: 'default', marginTop: '-5%' }}>
        <div class="tipo">
          <Form.Item className="freteStatus" name="motorista">
              <select className="form-select" style={{ width: "285px" }}>
                <option value="" disabled>
                  Selecione um motorista
                </option>
                <option value={drivers[0]?.nome || drivers[0]?.id}>
                  {drivers[0]?.nome || drivers[0]}
                </option>
                <option value="terceiros">Terceiros</option>
              </select>
          </Form.Item>

          <Form.Item className="freteStatus" >
            {/* <div> <p>Frete:</p> </div>
            <div className="form-control my-2" style={{ width: "220px" }} >
              { record ? record.items[0].order : 'Status Não Encotrado' }
            </div> */}
            <div class="form-control my-2">
              <p>Frete: { record ? record.items[0].order : 'Status Não Encotrado' }</p>
            </div>
          </Form.Item>
        </div>

        <div class="tipo">
          <Form.Item /* label="Valor"  */name="valorAdicional" >
            {/* <Input prefix="R$" type="number" placeholder="0,00" /> */}
            {/* <div className="input-group" style={{ width: "285px" }} >
              <span className="input-group-text">R$</span>
              <input className="form-control my-2" type="number" placeholder="0,00" />
            </div> */}
            <div>
              <p>Valor Adicional: </p>
            </div>
            <IntlCurrencyInput
              id="InputDinero2"
              currency="BRL"
              config={currencyConfig}
              placeholder="00.00"
              className="form-control my-2"
              onChange={(event, value, maskedValue) => {
                form.setFieldsValue({ valorAdicional: value });
              }}
            />
          </Form.Item>
        </div>

        <Form.Item /* label="Status" */ name="status" rules={[{ required: true, message: "Por favor, selecione o status" }]} >
          <div className="formSelectStatusDespesa" >
            <select className="form-select" style={{ width: "285px" }}>
              <option defaultValue="0">Selecione o Status</option>
              <option value="pendente">Pendente Liberação</option>
              <option value="bloqueado">Bloqueado</option>
              <option value="solicitar pagamento">Solicitar Pagamento</option>
              <option value="pago">Pago</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
        </Form.Item>

        <div class="tipo">
            <Form.Item /* label="Tipo" */ name="tipo">
              <select className="form-select" style={{ width: "285px" }}>
                <option defaultValue="0">Selecione o Tipo</option>
                <option value="diaria">Diaria</option>
                <option value="tde">TDE</option>
                <option value="servico chapa">Serciço de Chapa</option>
                <option value="servico lonagem">Serviço de lonagem</option>
              </select>
            </Form.Item>
          <div class="tipoObs">
            <Form.Item /* label="Obs" */ name="obs">
              {/* <Input className="InputTypeText" type="text" placeholder="Digite sua Observação" /> */}
              <Input.TextArea className="InputTypeText" placeholder="Digite sua Observação" style={{ width: '230px' }} />
            </Form.Item>
          </div>
        </div>
      </Form>
    </Modal>

    <DialogDeConfirmação
      open={openDialog}
      handleClose={handleDialogClose}
      title="Pagamento Confirmado!"
      message="A Adicionar Despesas foi realizada com sucesso."
      status="success"
    />
    </>
  );
};

export default PaymentModalDespesas;
