import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import MapContainer from "../../components/maps";
import PersistentDrawerLeft from "../../components/navMenu/NavMenu";
import firebase from '../../config/firebase';
import MapWithDirections from "../../components/Map-test/map-test";

require('firebase/auth')

function MapsFollowing(){

    const {id} = useParams();
    var userLogado = useSelector(state => state.usuarioLogado);

    
    const [carregando, setCarregando] = useState(1);
    const [nameClientOrigin, setNameClientOrigin ] = useState('');
    const [addressClientOrigin, setAddressClientOrigin ] = useState('');
    const [nameClientDelivery, setNameClientDelivery ] = useState('');
    const [addressClientDelivery, setAddressClientDelivery ] = useState('');
    
    useEffect(()=>{



        const db = firebase.firestore();


        if(userLogado > 0) {
            db.collection('freight').doc(id).get().then(result => {

                var freight = result.data();

                console.log(freight) 

                var clientOrigin = freight.firstDelivery;
                var clientDelivery = freight.lastDelivery;

                setNameClientOrigin(clientOrigin.name)
                setAddressClientOrigin(clientOrigin.address + ', ' + clientOrigin.city + ', ' + clientOrigin.uf)
                setNameClientDelivery(clientDelivery.name)
                setAddressClientDelivery(clientDelivery.address + ', ' + clientDelivery.city + ', ' + clientDelivery.uf)
                
                setCarregando(0)
            }).catch(error => {
                setCarregando(0)
                console.log(error)
            });
        }
        
    },[carregando]);
    
    return (

        <>
            <PersistentDrawerLeft divOpen={  
                    // <div className="row" style={{width: 900, height: 900}}> 
                    //     <MapWithDirections />
                    // </div>
                    <MapContainer  
                        idFreight={id}
                        key={nameClientDelivery}
                        clientOrigin={nameClientOrigin}
                        origin={addressClientOrigin} 
                        clientDestination={nameClientDelivery}
                        destination={addressClientDelivery}
                    />        
            }/>
        </>

    )

}

export default MapsFollowing;


