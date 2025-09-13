import { useState, useEffect } from 'react'
import {
  Box,
  Flex
} from '@chakra-ui/react'

import {
  useJsApiLoader,
  GoogleMap,
  Marker,
  DirectionsRenderer,
} from '@react-google-maps/api'
import { Grid, Skeleton } from '@mui/material'
import RecipeReviewCard from '../card-map'
import freightService from '../../service/freight.service'

const center = { lat: -12.9828075, lng: -38.4569062 }



function MapContainer({idFreight, clientOrigin, origin, clientDestination, destination}) {
  
  var id = idFreight;

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyAds1TwGzvflRvD8KHrbRHrnF3DvATFM1k", //process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  })
  
  const [map, setMap] = useState(/** @type google.maps.Map */ (null))
  const [directionsResponse, setDirectionsResponse] = useState(null)
  const [distance, setDistance] = useState('')
  const [duration, setDuration] = useState('')
  const [longitude, setLongitude] = useState();
  const [latitude, setLatitude] = useState();

  
  useEffect(()=>{
    let interval
    
    searchCurrentWay(id)

    interval = setInterval(() => {
      console.log("Atualizando rota...")
      searchCurrentWay(id)
    }, 60000)

    return () => {
      // Clear the interval when component is unmounted
      clearInterval(interval)
    }

  },[]);

  if (!isLoaded) {
    return <Skeleton />
  }


  async function searchCurrentWay(idFreight){

      let lat;
      let long;

      await freightService.searchCurrentWay(idFreight)
          .then(async item => {

            item.docs.forEach(async doc => {
              let data = doc.data();
              lat = data.latitude;
              long = data.longitude;
            })


          }).catch(error => {
            console.log(error)
          });
          
          calculateRoute(clientOrigin, origin, clientDestination, destination, lat, long)

  }

  async function calculateRoute(clientOrigin, origin, clientDestination, destination, lat, long) {
    var waypts = [];

    setLatitude(lat)
    setLongitude(long)

    console.log(lat, long)
      
    waypts.push({
        location: new window.google.maps.LatLng(lat, long), // -8.0700237 -34.92977 -11.380311, -38.310679 -8.023962972959465, -34.942775488156464
        stopover: true
    });

    console.log(waypts)

    const directionsService = new window.google.maps.DirectionsService();

    const results = await directionsService.route({
      origin: origin,
      destination: destination,
      waypoints: waypts,
      optimizeWaypoints: true,
      travelMode: window.google.maps.TravelMode.DRIVING,
      
    })

    setDirectionsResponse(results)
    setDistance(results.routes[0].legs[0].distance.text)
    setDuration(results.routes[0].legs[0].duration.text)
    
  }

  const centerDirect = { lat: latitude, lng: longitude }

  return (

    <Grid container spacing={2}>
      <Grid item xs={8}>
        <Flex
          position='relative'
          flexDirection='column'
          alignItems='center'
          h='80vw'
          w='60vw'
        >

        <Box position='absolute' left={0} top={0} h='100%' w='100%'>
          <GoogleMap
            center={center}
            zoom={10}
            mapContainerStyle={{ width: '100%', height: '100%' }}
            // options={{
            //   markerOptions: {
            //     icon: {
            //       url:
            //         "https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png",
            //       size: new window.google.maps.Size(20, 50),
            //       origin: new window.google.maps.Point(0, 0),
            //       anchor: new window.google.maps.Point(0, 32)
            //     }
            //   }
            // }}
            onLoad={map => setMap(map)}
          >

            {/* <Marker position={centerDirect} 
              options={{
                  markerOptions: {
                    icon: {
                      url:
                      (require('./../../assets/images/vue.jpg')), 
                      size: new window.google.maps.Size(20, 50),
                      origin: new window.google.maps.Point(0, 0),
                      anchor: new window.google.maps.Point(0, 32)
                    }
                  }
                }}
            /> */}

              {directionsResponse && (
                <DirectionsRenderer directions={directionsResponse}  
                  options={{
                    markerOptions: {
                      icon: {
                        url:
                          // (require('./../../assets/images/angular.jpg')),
                          "https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png",
                        size: new window.google.maps.Size(20, 50),
                        origin: new window.google.maps.Point(0, 0),
                        anchor: new window.google.maps.Point(0, 32)
                      }
                    }
                  }} 
                  suppressMarker={true}
                  polylineOptions={"strokeOpacity"}
                  /> 
              )}
          </GoogleMap>
        </Box>
        

      </Flex> 

      </Grid>
      <Grid item xs={4}>
      <Box
          p={4}
          borderRadius='lg'
          m={4}
          bgColor='white'
          shadow='base'
          minW='container.md'
          zIndex='1'
        >

          {/* <RecipeReviewCard 
            clientOrigin={clientOrigin} 
            addrresOrigin={origin}
            clientDestination={clientDestination}
            addrresDestination={destination}
            distance={distance}
            duration={duration}

            />  */}
        
        </Box>
      </Grid>
    </Grid>



      )
}

export default MapContainer
























// import { GoogleMap, LoadScript, Marker, useLoadScript } from "@react-google-maps/api";
// import { useMemo } from "react";


// export default function MapContainer(){ 

//   const center = useMemo(() => ({lat: 44, lng: -80}), []);

//   const containerStyle = {
//     width: '900px',
//     height: '900px'
//   };

//   return (
//     <LoadScript
//       googleMapsApiKey="AIzaSyAds1TwGzvflRvD8KHrbRHrnF3DvATFM1k"
//     >
//       <GoogleMap
//         mapContainerStyle={containerStyle}
//         center={center}
//         zoom={10}
//       >
        
//         <Marker position={center} /> 

//       </GoogleMap>
//     </LoadScript>
//   );

// }






// import React, { Component } from 'react';
// import { GoogleMap, LoadScript } from '@react-google-maps/api';

// const containerStyle = {
//   width: '1080px',
//   height: '1000px'
// };

// const position = {
//   lat: 40,
//   lng: -80
// };

// class MapContainer extends Component {
//   render() {
//     return (
//       <LoadScript
//         googleMapsApiKey="AIzaSyAds1TwGzvflRvD8KHrbRHrnF3DvATFM1k"
//       >
//         <GoogleMap
//           mapContainerStyle={containerStyle}
//           center={position}
//           zoom={10}
//         >
//           { /* Child components, such as markers, info windows, etc. */ }
//           <></>
//         </GoogleMap>
//       </LoadScript>
//     )
//   }
// }

// export default React.memo(MapContainer)