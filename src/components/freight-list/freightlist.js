import React from "react";
import { Link } from "react-router-dom";


 function Freightage(list){

    var customer = list.list.customer;
    var client = list.list.client;
    var driver = list.list.driver;
    var freight = list.list.freight;
    var vehicle = list.list.vehicle;
    var status = list.list.status;

    function renderStatusColor(status){
        if(status === "Contratado") {
            return <button type="button" class="btn btn-primary btn-sm">{status}</button>;
        }
        else if(status === "Pendente de Contratação") {
            return <button type="button" class="btn btn-warning btn-sm">{status}</button>;
        }
        else {
            return <button type="button" class="btn btn-danger btn-sm">{status}</button>;
        }
    }

    
    return (
        <>
            
            <tr>
                <td>{customer.dateCollect}</td>
                <td>{customer.originCustomer}</td>
                <td>
                    {customer.originCity} - {customer.originStateInitial}
                </td>
                <td>{client.clientDelivery}</td>
                <td >
                    {client.cityDelivery} - {client.stateInitialDelivery}
                </td>
                <td>
                    De: {driver.valueDriverInitial} Até: {driver.valueDriverFinal}
                </td>
                <td>{freight.weightCargo}</td>
                <td>{vehicle.occupation}</td>
                <td>{freight.product}</td>
                <td>
                    {renderStatusColor(status)}
                </td>
                <td>                
                    <Link to={'/freight/' + list.list.id} >
                        <span class="fa fa-pencil"></span>
                    </Link>
                </td>
            </tr>
             
        </>
    );
}
    
export default Freightage;