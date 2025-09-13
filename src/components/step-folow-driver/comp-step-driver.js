import React, { useEffect, useState } from 'react';
import { Steps, Card, Typography, Tag, Divider } from 'antd';
import { CheckCircleOutlined, LoadingOutlined, ClockCircleOutlined } from '@ant-design/icons';

export default function StepPoints({listPoints}) {
  const [hover, setHover] = useState(false);
  
  const { Step } = Steps;
  const { Title, Text } = Typography;

  useEffect(() => {
    console.log(listPoints);
  }, [listPoints]);

  const dateFormat = (date) => {
    if (!date) return "";

    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  };

  return ( 
    
    <Steps direction="vertical" style={{ padding: '20px', backgroundColor: '#fff' }}>
    {listPoints.subcollectionData.map((data, index) => (
      
      <Step
        key={data.id}
        status={data.concluded ? "finish" : "process"}

        icon={data.concluded ? 
          <CheckCircleOutlined style={{ color: 'green' }} />
        :
          <ClockCircleOutlined style={{ color: 'gray' }} />
        } // Ícone customizado

        title={
          <Title level={5} style={{ margin: 0, paddingBottom: '10px' }}>
            Parada {data.stop_order}: {data.name}
          </Title>
        }
        description={
          <Card
            bordered={false}
            style={{
              backgroundColor: '#ffffff',
              padding: '16px',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div style={{ marginBottom: '12px' }}>
              <Text strong>Logradouro:</Text> {data.logradouro}, <Text strong>Número:</Text>{' '}
              {data.number}
            </div>
            <div style={{ marginBottom: '12px' }}>
              <Text strong>Cidade:</Text> {data.city}, <Text strong>UF:</Text> {data.uf}
            </div>
            <div style={{ marginBottom: '12px' }}>
              <Text strong>CEP:</Text> {data.cep}
            </div>
            <div style={{ marginBottom: '12px' }}>
              <Text strong>Data Finalização:</Text> {dateFormat(data?.date_operation) || 'N/A'}
            </div>
            <div style={{ marginBottom: '12px' }}>
              {data.canhoto ? (

                <a 
                  href={data.canhoto} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <img 
                    src={data.canhoto} 
                    alt="Canhoto" 
                    style={{ 
                      width: "150px",
                      height: "150px",
                      borderRadius: "5px",
                      cursor: "pointer",
                      boxShadow: hover
                        ? "0 4px 12px rgba(0,0,0,0.3)" 
                        : "0 2px 6px rgba(0,0,0,0.2)",
                      transform: hover ? "scale(1.05)" : "scale(1)",
                      transition: "all 0.3s ease"
                    }}
                    onMouseEnter={() => setHover(true)}
                    onMouseLeave={() => setHover(false)}
                  />
                </a>
              ) : (
                <Text strong>Canhoto não encontrado!</Text>
              )}
            </div>
            <div style={{ marginBottom: '12px' }}>
              <Text strong>Coordenadas:</Text>{' '}
              <a
                href={`https://www.google.com/maps/dir/${data.latitude},${data.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#1890ff' }}
              >
                {data.latitude}, {data.longitude}
              </a>
            </div>
            <Divider />
            {data?.events?.length > 0 ? (
              <>
                <Title level={5}>Ocorrências</Title>
                <ul style={{ paddingLeft: '20px' }}>
                  {data.events.map((event, idx) => (
                    <li key={idx} style={{ marginBottom: '12px' }}>
                      <Text>
                        <Text strong>Registrado em:</Text>{' '}
                        {event?.created_at && typeof event.created_at.seconds === 'number'
                          ? new Date(event.created_at.seconds * 1000).toLocaleString()
                          : 'Data inválida'}
                      </Text>
                      <br />
                      <Text>
                        <Text strong>Evento:</Text> Código: {event?.event?.cod || ''} -{' '}
                        {event?.event?.desc || ''}
                      </Text>
                      <br />
                      <Text>
                        <Text strong>Descrição:</Text> {event?.description || ''}
                      </Text>
                      <br />
                      {event?.images?.map((img, imgIdx) => (
                        <img
                          key={imgIdx}
                          src={img}
                          alt="Evento"
                          style={{
                            width: '100%',
                            maxWidth: '400px',
                            display: 'block',
                            margin: '10px 0',
                            borderRadius: '8px',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                          }}
                        />
                      ))}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <Tag color="blue">Sem eventos</Tag>
            )}
          </Card>
        }
      />
    ))}
  </Steps>

  );
}
