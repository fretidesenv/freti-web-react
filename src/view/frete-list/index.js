import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, Navigate } from "react-router-dom";
import PersistentDrawerLeft from "../../components/navMenu/NavMenu";
import firebase from "../../config/firebase";
import DataFreteTable from "../../components/data-frete-table/data-frete-table";
import AddIcon from '@mui/icons-material/Add';
import { Button } from 'antd';
import './frete-list.css';
import NewMiniDrawer from "../../components/navMenu/menu-nav";
require("firebase/auth");

function FreightList() {
  const [freight, setFreight] = useState([]);
  const [carregando, setCarregando] = useState(1);

  let freightList = [];

  var userLogado = useSelector((state) => state.usuarioLogado);

  function loadInitial(loading) {

    if (!loading) {
      //Pesquisando por status da tela
      firebase
        .firestore()
        .collection("freight")
        .orderBy("createData", "desc")
        .get()
        .then(async (result) => {
          result.docs.forEach(async (doc) => {
            freightList.push({
              id: doc.id,
              ...doc.data(),
            });
        });
          setFreight(freightList);
          setCarregando(0);
        })
        .catch((error) => {
          setCarregando(0);
          console.log(error);
        });
    }
  }

  useEffect(() => {
    if (userLogado > 0) {
      loadInitial();
    }
  }, [carregando]);

  return (
    <>
      {useSelector((state) => state.usuarioLogado) > 0 ? (
        <NewMiniDrawer
          divOpen={
            <div className="freight-content">
              <div className="container">
                <div className="row">
                  <div className="col-5">
                    <h3>Listagem de Frete</h3>
                  </div>
                  <div className="col-5"></div>
                  <div className="col-2">
                    <div className="col-md-11 control-label">
                      <Link to={"/freight"}>
                        <Button id="ButtonHover" type="primary" class="btn btn-primary" icon={<AddIcon />}>
                          Novo
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
                <br></br>
                <br></br>
              </div>
              {carregando ? (
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              ) : (
                <DataFreteTable data={freight} />
              )}
            </div>
          }
        />
      ) : (
        <Navigate to="/login" />
      )}
    </>
  );
}

export default FreightList;