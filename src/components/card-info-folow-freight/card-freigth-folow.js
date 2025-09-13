import React from "react";
import { Card, Typography, Row, Col, Tag } from "antd";
import { BarcodeOutlined, DollarOutlined, UserOutlined, CarOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

const { Title, Text } = Typography;

const CardFolowFreigth = ({
  numberSerial,
  product,
  weightCargo,
  valueNF,
  valueFreightage,
  user,
  clientPayment,
  vehicle,
  typeBodywork,
  typeVehicle,
  nameDriver,
}) => {
  const selectedBodywork = typeBodywork.find((item) => item.selected);
  const selectedVehicle = typeVehicle.find((item) => item.selected);

  return (
    <Card
      title={
        <Title level={4} style={{ margin: 0, color: "#595959" }}>
          Informações do Transporte
        </Title>
      }
      bordered={false}
      style={{
        width: 450,
        margin: "5px auto",
        padding: "10px",
      }}
      headStyle={{ backgroundColor: "#fafafa", borderBottom: "1px solid #f0f0f0" }}
    >
      <Row gutter={[0, 16]}>
        {/* Número Serial */}
        <Col span={24}>
          <Text>
            <BarcodeOutlined style={{ color: "#1890ff", marginRight: 8 }} />
            Numero do Frete: 
            <Link to={`/freight/${numberSerial}`} style={{ color: "#1890ff", marginLeft: 8 }}>
              {numberSerial}
            </Link>
          </Text>
        </Col>

        {/* Produto */}
        <Col span={24}>
          <Text>
            <Tag color="blue" style={{ marginRight: 8 }}>Produto</Tag>
            {product}
          </Text>
        </Col>

        {/* Peso da Carga */}
        <Col span={24}>
          <Text>
            <strong>Peso da Carga:</strong> {weightCargo} kg
          </Text>
        </Col>

        <Col span={24}>
          <Text>
            <strong>Nome do Motorista:</strong> {nameDriver}
          </Text>
        </Col>

        {/* Valores */}
        <Col span={24}>
          <Text>
            <DollarOutlined style={{ color: "#52c41a", marginRight: 8 }} />
            <strong>Valor NF:</strong> 

            {(valueNF || 0).toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}

          </Text>
        </Col>
        <Col span={24}>
          <Text>
            <DollarOutlined style={{ color: "#faad14", marginRight: 8 }} />
            <strong>Valor do Frete:</strong> 
            {(valueFreightage || 0).toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}
          </Text>
        </Col>

        {/* Usuário */}
        <Col span={24}>
          <Text>
            <UserOutlined style={{ color: "#722ed1", marginRight: 8 }} />
            <strong>Usuário:</strong> {user?.name}
          </Text>
        </Col>

        {/* Pagamento do Cliente */}
        <Col span={24}>
          <Text>
            <Tag color="gold" style={{ marginRight: 8 }}>Embarcador</Tag>
            {clientPayment?.name}
          </Text>
        </Col>

        {/* Ocupação do Veículo */}
        <Col span={24}>
          <Text>
            <CarOutlined style={{ color: "#13c2c2", marginRight: 8 }} />
            <strong>Ocupação do Veículo:</strong> {vehicle?.occupation}
          </Text>
        </Col>

        {/* Tipo de Carroceria */}
        <Col span={24}>
          <Text>
            <Tag color={selectedBodywork ? "green" : "red"} style={{ marginRight: 8 }}>
              Tipo de Carroceria
            </Tag>
            {selectedBodywork?.name || "Não selecionado"}
          </Text>
        </Col>

        {/* Tipo de Veículo */}
        <Col span={24}>
          <Text>
            <Tag color={selectedVehicle ? "green" : "red"} style={{ marginRight: 8 }}>
              Tipo de Veículo
            </Tag>
            {selectedVehicle?.name || "Não selecionado"}
          </Text>
        </Col>
      </Row>
    </Card>
  );
};

export default CardFolowFreigth;
