import { React, useEffect, useState } from "react";


export default function CheckboxTypeVehicle() {    
    
    const [tipoVeiculo, setTipoVeiculo] = useState({
      federal: [
        { name: "TRUCK", selected: false },
        { name: "BI-TRUCK", selected: false },
        { name: "CARRETA S", selected: false },
        { name: "CARRETA LS", selected: false }
      ]
    });
  
    const handleOnChange = (e, type) => {
      const { name, checked } = e.target;
      const newTypeVehicle = [...tipoVeiculo[type]];
      const index = newTypeVehicle.findIndex((h) => h.name === name);
      if (index > -1) {
        newTypeVehicle[index] = { name, selected: checked };
      }
      setTipoVeiculo((h) => ({ ...h, [type]: newTypeVehicle }));
    };
  
  
    const renderCheckboxList = (options, type) =>
      options.map((opt) => (
        <div>
          <label>
            <input
              type="checkbox"
              name={opt.name}
              onChange={(e) => handleOnChange(e, type)}
              checked={opt.selected}
            />
            {opt.name}
          </label>
        </div>
      ));
  
    return (
      <section style={{ display: "flex", justifyContent: "space-around" }}>
        <div>
          <div>
            <fieldset>
              Tipos de veículos
              {renderCheckboxList(tipoVeiculo.federal, "federal")}
            </fieldset>
          </div>
        </div>
        {/* <div>
          State:
          <pre>{JSON.stringify(tipoVeiculo, null, 2)}</pre>
        </div> */}
      </section>
    );
  };
  