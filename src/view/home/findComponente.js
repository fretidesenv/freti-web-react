import { useEffect, useState } from "react";
import firebase from '../../config/firebase';

require('firebase/auth')

const useFreightData = (idFreight) => {
    const [freightData, setFreightData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const db = firebase.firestore();

    useEffect(() => {

        console.log(idFreight)

        const fetchFreightData = async () => {
            try {
                const freightDocRef = db.collection("freight").doc(idFreight); 
                const freightDoc = await freightDocRef.get();

                if (!freightDoc.exists) {
                    throw new Error("Document not found");
                }

                const freightData = {
                    id: freightDoc.id,
                    ...freightDoc.data()
                };

                const subcollectionSnapshot = await freightDocRef.collection("stopping_points").get(); 
                const subcollectionData = subcollectionSnapshot.docs.map(subDoc => ({
                    id: subDoc.id,
                    ...subDoc.data()
                }));

                setFreightData({
                    ...freightData,
                    subcollectionData
                });



            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchFreightData();
    }, []);

    return { freightData, loading, error };
};

export default useFreightData;
