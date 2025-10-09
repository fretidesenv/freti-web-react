import React from "react";
import {  BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from "./view/login";
import NewUser from "./view/new-user";
import store from "./store";
import { Provider } from "react-redux";
import Freight from "./view/frete";
import FreightList from "./view/frete-list";
import DriverList from "./view/driver-list";
import Driver from "./view/driver";
import UserList from "./view/user-list/user-list";
import UploadCsv from "./view/preparingDriver";
import EmbarcadorList from "./view/embarcador-list";
import NewEmbarcador from "./view/embarcador";
import MyDriverList from "./view/my-driver-list";
import MyDriver from "./view/my-driver";
import NewClient from "./view/client";
import ClientList from "./view/client-list";
import ImportXml from "./view/importXml";
import ViwerMaps from "./view/viewerFreights";
import ViewerFreights from "./view/viewerFreightsDetail/viewerFreight";
import NewOcurrence from "./view/ocurrence/insert-ocurrence";
import OcurrenceList from "./view/ocurrence/list-ocurrence";
import PaymentListDetail from "./view/payment/list-payment";
import PaymentList from "./view/payment/listPayment";
import PriceTableList from "./view/priceTable/price-table-list";
import PriceTableICMS from "./view/tableIcms/table-icms";
import DashboardHome from "./view/dashboard-home/dashboard-home";
import MdfeFormTabs from "./view/manifesto/Mdfe/manifest";
import MdfeListView from "./view/manifesto/Mdfe/list-mdf-e";
import GroupListView from "./view/group/list-group";
import NewGroup from "./view/group/insert-group";

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter> 
        <Routes>
          {/* <Route exact path="/" element={<Home/>} /> */}
          <Route exact path="/" element={<DashboardHome/>} />
          <Route exact path="/login" element={<Login/>} />

          <Route exact path="/newUser" element={<NewUser/>} />
          <Route exact path="/newUser/:id" element={<NewUser/>} />
          <Route exact path="/userList" element={<UserList/>} />

          <Route exact path="/freight" element={<Freight />} />
          <Route exact path="/freight/:id" element={<Freight />} />
          <Route exact path="/freightlist" element={<FreightList />} />

          <Route exact path="/driverList" element={<DriverList />} />
          <Route exact path="/driverList/:id" element={<Driver />} />
          <Route exact path="/driver" element={<Driver />} />

          <Route exact path="/prepareDriver" element={<UploadCsv />} />

          <Route exact path="/embarcador" element={<EmbarcadorList />} />
          <Route exact path="/newEmbarcador/:id" element={<NewEmbarcador />} />
          <Route exact path="/newEmbarcador" element={<NewEmbarcador />} />

          {/* <Route exact path="/followLoadList" element={<FollowLoadList />} />
          <Route exact path="/followLoad/:id" element={<MapsFollowing />} /> */}

          <Route exact path="/myDriverList/" element={<MyDriverList />} />
          <Route exact path="/myDriverList/:id" element={<MyDriver />} />
          <Route exact path="/myDriver" element={<MyDriver />} />

          <Route exact path="/clientList/" element={<ClientList />} />
          <Route exact path="/client/:id" element={<NewClient />} />
          <Route exact path="/client" element={<NewClient />} />

          <Route exact path="/freightsDetail" element={<ViwerMaps />} />
          <Route exact path="/freightsDetail/:id/:idDriver" element={<ViewerFreights />} />

          <Route exact path="/importFile" element={<ImportXml />} />

          <Route exact path="/newOcurrence" element={<NewOcurrence />} />
          <Route exact path="/newOcurrence/:id" element={<NewOcurrence />} />
          <Route exact path="/listOcurrence" element={<OcurrenceList />} />

          <Route exact path="/listPayment" element={<PaymentList />} />
          <Route exact path="/listPaymentDetail" element={<PaymentListDetail />} />

          <Route exact path="/tableIcmsList" element={<PriceTableICMS />} />
          <Route exact path="/priceTableList" element={<PriceTableList />} />

          {/* <Route exact path="/insertMdfe" element={<CadastroMdfe />} /> */}
          <Route exact path="/insertMdfe" element={<MdfeFormTabs />} />
          <Route exact path="/insertMdfe/:id" element={<MdfeFormTabs  />} />
          <Route exact path="/listMdfe" element={<MdfeListView />} />

          <Route exact path="/insertGroup/:id" element={<NewGroup  />} />
          <Route exact path="/insertGroup" element={<NewGroup  />} />
          <Route exact path="/listGroup" element={<GroupListView />} />


        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
