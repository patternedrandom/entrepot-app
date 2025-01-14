/* global BigInt */
import React from "react";
import extjs from "./ic/extjs.js";
import Navbar from "./components/Navbar";
import Backdrop from "@material-ui/core/Backdrop";
import CircularProgress from "@material-ui/core/CircularProgress";
import { makeStyles } from "@material-ui/core/styles";
import AlertDialog from "./components/AlertDialog";
import ConfirmDialog from "./components/ConfirmDialog";
import { StoicIdentity } from "ic-stoic-identity";
import { Route, Routes } from "react-router-dom";
import Detail from "./components/Detail";
import Listings from "./components/Listings";
import NFTList from "./components/NFTList";
import Marketplace from "./views/Marketplace";
import Mint from "./views/Mint";
import Create from "./views/Create";
import Home from "./views/Home";
import CardTest from "./views/CardTest";
import Typography from "@material-ui/core/Typography";
import Iconic from "./views/Iconic";
import Sale from "./views/Sale";
import Contact from "./views/Contact";
//import Moonwalkers from "./components/sale/Moonwalkers";
//import DfinityBulls from "./components/sale/DfinityBulls";
//import IC3D from "./components/sale/IC3D";
//import IVC from "./components/sale/IVC";
//import HauntedHamsters from "./components/sale/HauntedHamsters";
//import Poked from "./components/sale/Poked";
//import BlockchainHeroes from "./components/sale/BlockchainHeroes";
import BTCFlower from "./components/sale/BTCFlower";
import ICSnakes from "./components/sale/ICSnakes";
import ICApes from "./components/sale/ICApes";
import ICPets from "./components/sale/ICPets";
import ICKitties from "./components/sale/ICKitties";
import SpaceApes from "./components/sale/SpaceApes";
import Frog from "./components/sale/Frog";
import DfinityDeck from "./components/sale/DfinityDeck";
import Prime from "./components/sale/Prime";
import Yolo from "./components/sale/Yolo";
import Memecake from "./components/sale/Memecake";
import Cyman from "./components/sale/Cyman";
import Sword from "./components/sale/Sword";
import Floki from "./components/sale/Floki";
import ICPics from "./components/sale/ICPics";
import Circle from "./components/sale/Circle";
import Interitus from "./components/sale/Interitus";
import ICAliens from "./components/sale/ICAliens";
import IVC2 from "./components/sale/IVC2";
//import Imagination from "./components/sale/Imagination";
import Tranquillity from "./components/sale/Tranquillity";
import _c from './ic/collections.js';
var collections = _c;
const api = extjs.connect("https://boundary.ic0.app/");
const txfee = 10000;
const txmin = 100000;
const _isCanister = c => {
  return c.length == 27 && c.split("-").length == 5;
};
const useStyles = makeStyles((theme) => ({
  backdrop: {
    zIndex: 1600,
    color: "#fff",
  },
  inner: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  content: {
    flexGrow: 1,
    marginTop: 73,
    paddingBottom:50,

  },
  footer: {
    textAlign: "center",
    bottom: 0,
    height: "100px !important",
    background: "#091216",
    color: "white",
    paddingTop: 30,
    // marginLeft : -24,
    // marginRight : -24,
    // marginBottom : -24,
    // marginTop : 80,
  },
}));
const emptyAlert = {
  title: "",
  message: "",
};
var processingPayments = false;
var collections = collections.filter(a => _isCanister(a.canister));
export default function App() {
  const classes = useStyles();
  const [loaderOpen, setLoaderOpen] = React.useState(false);
  const [loaderText, setLoaderText] = React.useState("");
  const [alertData, setAlertData] = React.useState(emptyAlert);
  const [confirmData, setConfirmData] = React.useState(emptyAlert);
  const [showAlert, setShowAlert] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  //Account
  
  const [identity, setIdentity] = React.useState(false);
  const [loggedIn, setLoggedIn] = React.useState(false);
  const [address, setAddress] = React.useState(false);
  const [balance, setBalance] = React.useState(0);
  const [accounts, setAccounts] = React.useState(false);
  const [currentAccount, setCurrentAccount] = React.useState(0);

  const _updates = async () => {
    await _processPayments();
  };
  const processPayments = async () => {
    loader(true, "Processing payments... (this can take a few minutes)");
    await _processPayments();
    loader(false);
  };
  
  const _processPayments = async () => {
    if (!identity) return;
    if (processingPayments) return;
    processingPayments = true;
    const _api = extjs.connect("https://boundary.ic0.app/", identity);
    for (var j = 0; j < collections.length; j++) {
      var payments = await _api.canister(collections[j].canister).payments();
      if (payments.length === 0) continue;
      if (payments[0].length === 0) continue;
      console.log("Payments found: " + payments[0].length);
      var a, b, c, payment;
      for (var i = 0; i < payments[0].length; i++) {
        payment = payments[0][i];
        a = extjs.toAddress(identity.getPrincipal().toText(), payment);
        b = Number(await api.token().getBalance(a));
        c = Math.round(b * collections[j].commission);
        try {
          var txs = [];
          if (b > txmin) {
            txs.push(
              _api
                .token()
                .transfer(
                  identity.getPrincipal().toText(),
                  payment,
                  address,
                  BigInt(b - (txfee + c)),
                  BigInt(txfee)
                )
            );
            txs.push(
              _api
                .token()
                .transfer(
                  identity.getPrincipal().toText(),
                  payment,
                  collections[j].comaddress,
                  BigInt(c - txfee),
                  BigInt(txfee)
                )
            );
          }
          await Promise.all(txs);
          console.log("Payment extracted successfully");
        } catch (e) {
          console.log(e);
        }
      }
    }
    processingPayments = false;
    return true;
  };
  const logout = async () => {
    localStorage.removeItem("_loginType");
    StoicIdentity.disconnect();
    setIdentity(false);
    setAccounts([]);
    setBalance(0);
  };
  const login = async (t) => {
    loader(true, "Connecting your wallet...");
    try {
      var id;
      switch (t) {
        case "stoic":
          id = await StoicIdentity.connect();
          if (id) {
            setIdentity(id);
            id.accounts().then((accs) => {
              setAccounts(JSON.parse(accs));
            });
            setCurrentAccount(0);
            localStorage.setItem("_loginType", t);
          } else {
            throw new Error("Failed to connect to your wallet");
          }
          break;
        case "plug":
          const result = await window.ic.plug.requestConnect({
            whitelist: collections.map(a => a.canister).concat([
              "xkbqi-2qaaa-aaaah-qbpqq-cai",
              "d3ttm-qaaaa-aaaai-qam4a-cai",
              "4nvhy-3qaaa-aaaah-qcnoq-cai",
              "qcg3w-tyaaa-aaaah-qakea-cai",
              "ryjl3-tyaaa-aaaaa-aaaba-cai",
              "qgsqp-byaaa-aaaah-qbi4q-cai",
            ]),
          });
          if (result) {
            id = await window.ic.plug.agent._identity;
            setIdentity(id);
            setAccounts([
              {
                name: "PlugWallet",
                address: extjs.toAddress(id.getPrincipal().toText(), 0),
              },
            ]);
            setCurrentAccount(0);
            localStorage.setItem("_loginType", t);
          } else {
            throw new Error("Failed to connect to your wallet");
          }
          break;
        default:
          break;
      }
    } catch (e) {
      error(e);
    }
    loader(false);
  };

  //useInterval(_updates, 60 * 1000);
  const alert = (title, message, buttonLabel) => {
    return new Promise(async (resolve, reject) => {
      setAlertData({
        title: title,
        message: message,
        buttonLabel: buttonLabel,
        handler: () => {
          setShowAlert(false);
          resolve(true);
          setTimeout(() => setAlertData(emptyAlert), 100);
        },
      });
      setShowAlert(true);
    });
  };
  const error = (e) => {
    alert("There was an error", e);
  };
  const confirm = (title, message, buttonCancel, buttonConfirm) => {
    return new Promise(async (resolve, reject) => {
      setConfirmData({
        title: title,
        message: message,
        buttonCancel: buttonCancel,
        buttonConfirm: buttonConfirm,
        handler: (v) => {
          setShowConfirm(false);
          resolve(v);
          setTimeout(() => setConfirmData(emptyAlert), 100);
        },
      });
      setShowConfirm(true);
    });
  };
  const loader = (l, t) => {
    setLoaderText(t);
    setLoaderOpen(l);
    if (!l) {
      setLoaderText("");
    }
  };

  React.useEffect(() => {
    var t = localStorage.getItem("_loginType");
    if (t) {
      switch (t) {
        case "stoic":
          StoicIdentity.load().then(async (identity) => {
            if (identity !== false) {
              //ID is a already connected wallet!
              setIdentity(identity);
              identity.accounts().then((accs) => {
                setAccounts(JSON.parse(accs));
              });
            }
          });
          break;
        case "plug":
          (async () => {
            const connected = await window.ic.plug.isConnected();
            if (connected) {
              if (!window.ic.plug.agent) {
                await window.ic.plug.createAgent({
                  whitelist: collections.map(a => a.canister).concat([
                    "xkbqi-2qaaa-aaaah-qbpqq-cai",
                    "d3ttm-qaaaa-aaaai-qam4a-cai",
                    "qcg3w-tyaaa-aaaah-qakea-cai",
                    "4nvhy-3qaaa-aaaah-qcnoq-cai",
                    "ryjl3-tyaaa-aaaaa-aaaba-cai",
                    "qgsqp-byaaa-aaaah-qbi4q-cai",
                  ]),
                });
              }
              var id = await window.ic.plug.agent._identity;
              setIdentity(id);
              setAccounts([
                {
                  name: "PlugWallet",
                  address: extjs.toAddress(id.getPrincipal().toText(), 0),
                },
              ]);
            }
          })();
          break;
        default:
          break;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  React.useEffect(() => {
    if (identity) {
      setLoggedIn(true);
      setAddress(extjs.toAddress(identity.getPrincipal().toText(), 0));
    } else {
      setLoggedIn(false);
      setAddress(false);
      setAccounts(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [identity]);
  const footer = (
  <div className={classes.footer}>
    <Typography variant="body1">
      Developed by ToniqLabs &copy; All rights reserved 2021<br /><a href="https://docs.google.com/document/d/13aj8of_UXdByGoFdMEbbIyltXMn0TXHiUie2jO-qnNk/edit" target="_blank">Terms of Service</a>
    </Typography>
  </div>);
  
  return (
    <>
      <Navbar view={""} processPayments={processPayments} setBalance={setBalance} identity={identity}  account={accounts.length > 0 ? accounts[currentAccount] : false} loader={loader} logout={logout} login={login} collections={collections} collection={false} currentAccount={currentAccount} changeAccount={setCurrentAccount} accounts={accounts} />
      <main className={classes.content}>
        <div className={classes.inner}>
          <Routes>
            <Route path="/marketplace/token/:tokenid" exact element={
              <Detail
                error={error}
                alert={alert}
                confirm={confirm}
                loader={loader}
              />} />
            <Route path="/marketplace/:route" exact element={
              <Listings
                error={error}
                view={"listings"}
                alert={alert}
                confirm={confirm}
                loggedIn={loggedIn} 
                loader={loader} balance={balance} identity={identity}  account={accounts.length > 0 ? accounts[currentAccount] : false} logout={logout} login={login} collections={collections} collection={false} currentAccount={currentAccount} changeAccount={setCurrentAccount} accounts={accounts}
              />} />
            <Route path="/marketplace" exact element={
              <Marketplace
                error={error}
                view={"collections"}
                alert={alert}
                confirm={confirm}
                loader={loader} balance={balance} identity={identity}  account={accounts.length > 0 ? accounts[currentAccount] : false} logout={logout} login={login} collections={collections} collection={false} currentAccount={currentAccount} changeAccount={setCurrentAccount} accounts={accounts}
              />} />
            <Route path="/wallet/:route" exact element={
              <NFTList
                error={error}
                view={"wallet"}
                alert={alert}
                confirm={confirm}
                loggedIn={loggedIn} 
                loader={loader} balance={balance} identity={identity}  account={accounts.length > 0 ? accounts[currentAccount] : false} logout={logout} login={login} collections={collections} collection={false} currentAccount={currentAccount} changeAccount={setCurrentAccount} accounts={accounts}
              />} />
            <Route path="/sale/btcflower" exact element={
              <BTCFlower
                error={error}
                view={"sale"}
                sale={"btcflower"}
                alert={alert}
                confirm={confirm}
                loader={loader} balance={balance} identity={identity}  account={accounts.length > 0 ? accounts[currentAccount] : false} logout={logout} login={login} collections={collections} collection={false} currentAccount={currentAccount} changeAccount={setCurrentAccount} accounts={accounts}
              />} />
            <Route path="/sale/yolo-octopus" exact element={
              <Yolo
                error={error}
                view={"sale"}
                sale={"yolo-octopus"}
                alert={alert}
                confirm={confirm}
                loader={loader} balance={balance} identity={identity}  account={accounts.length > 0 ? accounts[currentAccount] : false} logout={logout} login={login} collections={collections} collection={false} currentAccount={currentAccount} changeAccount={setCurrentAccount} accounts={accounts}
              />} />
            <Route path="/sale/sword" exact element={
              <Sword
                error={error}
                view={"sale"}
                sale={"sword"}
                alert={alert}
                confirm={confirm}
                loader={loader} balance={balance} identity={identity}  account={accounts.length > 0 ? accounts[currentAccount] : false} logout={logout} login={login} collections={collections} collection={false} currentAccount={currentAccount} changeAccount={setCurrentAccount} accounts={accounts}
              />} />
            <Route path="/sale/icpics" exact element={
              <ICPics
                error={error}
                view={"sale"}
                sale={"icpics"}
                alert={alert}
                confirm={confirm}
                loader={loader} balance={balance} identity={identity}  account={accounts.length > 0 ? accounts[currentAccount] : false} logout={logout} login={login} collections={collections} collection={false} currentAccount={currentAccount} changeAccount={setCurrentAccount} accounts={accounts}
              />} />
            <Route path="/sale/interitus" exact element={
              <Interitus
                error={error}
                view={"sale"}
                sale={"interitus"}
                alert={alert}
                confirm={confirm}
                loader={loader} balance={balance} identity={identity}  account={accounts.length > 0 ? accounts[currentAccount] : false} logout={logout} login={login} collections={collections} collection={false} currentAccount={currentAccount} changeAccount={setCurrentAccount} accounts={accounts}
              />} />
            <Route path="/sale/frogvoxel" exact element={
              <Frog
                error={error}
                view={"sale"}
                sale={"frogvoxel"}
                alert={alert}
                confirm={confirm}
                loader={loader} balance={balance} identity={identity}  account={accounts.length > 0 ? accounts[currentAccount] : false} logout={logout} login={login} collections={collections} collection={false} currentAccount={currentAccount} changeAccount={setCurrentAccount} accounts={accounts}
              />} />
            <Route path="/sale/prime8s" exact element={
              <Prime
                error={error}
                view={"sale"}
                sale={"prime8s"}
                alert={alert}
                confirm={confirm}
                loader={loader} balance={balance} identity={identity}  account={accounts.length > 0 ? accounts[currentAccount] : false} logout={logout} login={login} collections={collections} collection={false} currentAccount={currentAccount} changeAccount={setCurrentAccount} accounts={accounts}
              />} />
            <Route path="/sale/ivc2" exact element={
              <IVC2
                error={error}
                view={"sale"}
                sale={"ivc2"}
                alert={alert}
                confirm={confirm}
                loader={loader} balance={balance} identity={identity}  account={accounts.length > 0 ? accounts[currentAccount] : false} logout={logout} login={login} collections={collections} collection={false} currentAccount={currentAccount} changeAccount={setCurrentAccount} accounts={accounts}
              />} />
            <Route path="/sale/Cyman" exact element={
              <Cyman
                error={error}
                view={"sale"}
                sale={"Cyman"}
                alert={alert}
                confirm={confirm}
                loader={loader} balance={balance} identity={identity}  account={accounts.length > 0 ? accounts[currentAccount] : false} logout={logout} login={login} collections={collections} collection={false} currentAccount={currentAccount} changeAccount={setCurrentAccount} accounts={accounts}
              />} />
            <Route path="/sale/dfinitydeck" exact element={
              <DfinityDeck
                error={error}
                view={"sale"}
                sale={"dfinitydeck"}
                alert={alert}
                confirm={confirm}
                loader={loader} balance={balance} identity={identity}  account={accounts.length > 0 ? accounts[currentAccount] : false} logout={logout} login={login} collections={collections} collection={false} currentAccount={currentAccount} changeAccount={setCurrentAccount} accounts={accounts}
              />} />
            <Route path="/sale/ickitties" exact element={
              <ICKitties
                error={error}
                view={"sale"}
                sale={"icpets"}
                alert={alert}
                confirm={confirm}
                loader={loader} balance={balance} identity={identity}  account={accounts.length > 0 ? accounts[currentAccount] : false} logout={logout} login={login} collections={collections} collection={false} currentAccount={currentAccount} changeAccount={setCurrentAccount} accounts={accounts}
              />} />
            <Route path="/sale/floki" exact element={
              <Floki
                error={error}
                view={"sale"}
                sale={"floki"}
                alert={alert}
                confirm={confirm}
                loader={loader} balance={balance} identity={identity}  account={accounts.length > 0 ? accounts[currentAccount] : false} logout={logout} login={login} collections={collections} collection={false} currentAccount={currentAccount} changeAccount={setCurrentAccount} accounts={accounts}
              />} />
            <Route path="/sale/icircle" exact element={
              <Circle
                error={error}
                view={"sale"}
                sale={"icircle"}
                alert={alert}
                confirm={confirm}
                loader={loader} balance={balance} identity={identity}  account={accounts.length > 0 ? accounts[currentAccount] : false} logout={logout} login={login} collections={collections} collection={false} currentAccount={currentAccount} changeAccount={setCurrentAccount} accounts={accounts}
              />} />
            <Route path="/sale/icpets" exact element={
              <ICPets
                error={error}
                view={"sale"}
                sale={"icpets"}
                alert={alert}
                confirm={confirm}
                loader={loader} balance={balance} identity={identity}  account={accounts.length > 0 ? accounts[currentAccount] : false} logout={logout} login={login} collections={collections} collection={false} currentAccount={currentAccount} changeAccount={setCurrentAccount} accounts={accounts}
              />} />
            <Route path="/sale/memecake" exact element={
              <Memecake
                error={error}
                view={"sale"}
                sale={"memecake"}
                alert={alert}
                confirm={confirm}
                loader={loader} balance={balance} identity={identity}  account={accounts.length > 0 ? accounts[currentAccount] : false} logout={logout} login={login} collections={collections} collection={false} currentAccount={currentAccount} changeAccount={setCurrentAccount} accounts={accounts}
              />} />
            <Route path="/sale/tranquillity" exact element={
              <Tranquillity
                error={error}
                view={"sale"}
                sale={"tranquillity"}
                alert={alert}
                confirm={confirm}
                loader={loader} balance={balance} identity={identity}  account={accounts.length > 0 ? accounts[currentAccount] : false} logout={logout} login={login} collections={collections} collection={false} currentAccount={currentAccount} changeAccount={setCurrentAccount} accounts={accounts}
              />} />
            <Route path="/sale/icapes" exact element={
              <ICApes
                error={error}
                view={"sale"}
                sale={"icapes"}
                alert={alert}
                confirm={confirm}
                loader={loader} balance={balance} identity={identity}  account={accounts.length > 0 ? accounts[currentAccount] : false} logout={logout} login={login} collections={collections} collection={false} currentAccount={currentAccount} changeAccount={setCurrentAccount} accounts={accounts}
              />} />
            <Route path="/sale/icaliens" exact element={
              <ICAliens
                error={error}
                view={"sale"}
                sale={"icaliens"}
                alert={alert}
                confirm={confirm}
                loader={loader} balance={balance} identity={identity}  account={accounts.length > 0 ? accounts[currentAccount] : false} logout={logout} login={login} collections={collections} collection={false} currentAccount={currentAccount} changeAccount={setCurrentAccount} accounts={accounts}
              />} />
            <Route path="/sale/icsnakes" exact element={
              <ICSnakes
                error={error}
                view={"sale"}
                sale={"icsnakes"}
                alert={alert}
                confirm={confirm}
                loader={loader} balance={balance} identity={identity}  account={accounts.length > 0 ? accounts[currentAccount] : false} logout={logout} login={login} collections={collections} collection={false} currentAccount={currentAccount} changeAccount={setCurrentAccount} accounts={accounts}
              />} />
            <Route path="/sale/spaceapes" exact element={
              <SpaceApes
                error={error}
                view={"sale"}
                sale={"spaceapes"}
                alert={alert}
                confirm={confirm}
                loader={loader} balance={balance} identity={identity}  account={accounts.length > 0 ? accounts[currentAccount] : false} logout={logout} login={login} collections={collections} collection={false} currentAccount={currentAccount} changeAccount={setCurrentAccount} accounts={accounts}
              />} />
            <Route path="/mint" exact element={
              <Mint
                error={error}
                alert={alert}
                confirm={confirm}
                loader={loader} address={address} balance={balance} identity={identity}  account={accounts.length > 0 ? accounts[currentAccount] : false} logout={logout} login={login} collections={collections} collection={false} currentAccount={currentAccount} changeAccount={setCurrentAccount} accounts={accounts}
              />} />
            <Route path="/create" exact element={
              <Create
                error={error}
                alert={alert}
                confirm={confirm}
                loader={loader} balance={balance} identity={identity}  account={accounts.length > 0 ? accounts[currentAccount] : false} logout={logout} login={login} collections={collections} collection={false} currentAccount={currentAccount} changeAccount={setCurrentAccount} accounts={accounts}
              />} />
            <Route path="/contact" exact element={
              <Contact
                error={error}
                alert={alert}
                confirm={confirm}
                loader={loader} setBalance={setBalance} identity={identity}  account={accounts.length > 0 ? accounts[currentAccount] : false} logout={logout} login={login} collections={collections} collection={false} currentAccount={currentAccount} changeAccount={setCurrentAccount} accounts={accounts}
              />} />
            <Route path="/" exact element={
              <Home error={error} alert={alert} confirm={confirm} loader={loader} />} />
            <Route path="/sale" exact element={
              <Sale error={error} alert={alert} confirm={confirm} loader={loader} />} />
          </Routes>
        </div>
      </main>
      {footer}
      
      <Backdrop className={classes.backdrop} open={loaderOpen}>
        <CircularProgress color="inherit" />
        <h2 style={{ position: "absolute", marginTop: "120px" }}>
          {loaderText ?? "Loading..."}
        </h2>
      </Backdrop>
      <AlertDialog
        open={showAlert}
        title={alertData.title}
        message={alertData.message}
        buttonLabel={alertData.buttonLabel}
        handler={alertData.handler}
      />
      <ConfirmDialog
        open={showConfirm}
        title={confirmData.title}
        message={confirmData.message}
        buttonCancel={confirmData.buttonCancel}
        buttonConfirm={confirmData.buttonConfirm}
        handler={confirmData.handler}
      />
    </>
  );
}
