import { useState, useEffect } from "react";
import { Input, Button, Spin } from "antd";
import { useSafeInject } from "../contexts/SafeInjectContext";
import TransactionDetailsModal from "./MultiSig/TransactionDetailsModal";
import { NETWORKS } from "../constants";
import { parseExternalContractTransaction } from "../helpers";

export default function IFrame({ address, loadTransactionData, mainnetProvider, price }) {
  const cachedNetwork = window.localStorage.getItem("network");
  let targetNetwork = NETWORKS[cachedNetwork || "mainnet"];

  const { setAddress, appUrl, setAppUrl, setRpcUrl, iframeRef, newTx, setNewTx } = useSafeInject();

  const [isIFrameLoading, setIsIFrameLoading] = useState(false);
  const [inputAppUrl, setInputAppUrl] = useState();
  const [tx, setTx] = useState();
  const [parsedTransactionData, setParsedTransactionData] = useState();
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    setAddress(address);
    setRpcUrl(targetNetwork.rpcUrl);
  }, []);

  useEffect(() => {
    if (newTx) {
      setTx(newTx);
    }
  }, [newTx]);

  useEffect(() => {
    if (tx) {
      decodeFunctionData();
    }
  }, [tx]);

  const decodeFunctionData = async () => {
    try {
      const parsedTransactionData = await parseExternalContractTransaction(tx.to, tx.data);
      setParsedTransactionData(parsedTransactionData);
      setIsModalVisible(true);
    } catch (error) {
      console.log(error);
      setParsedTransactionData(null);
    }
  };

  const hideModal = () => setIsModalVisible(false);

  const handleOk = () => {
    loadTransactionData({
      to: tx.to,
      value: tx.value,
      data: tx.data,
    });
    setNewTx(false);
  };

  return (
    <div className="flex flex-col items-center">
      <Input
        placeholder="dapp URL"
        style={{
          minWidth: "18rem",
          maxWidth: "20rem",
        }}
        autoFocus={true}
        value={inputAppUrl}
        onChange={e => setInputAppUrl(e.target.value)}
      />
      <Button
        type={"primary"}
        style={{
          marginTop: "1rem",
          maxWidth: "8rem",
        }}
        onClick={() => {
          setAppUrl(inputAppUrl);
          setIsIFrameLoading(true);
        }}
      >
        {isIFrameLoading ? <Spin /> : "Load"}
      </Button>
      {appUrl && (
        <iframe
          title="app"
          src={appUrl}
          width="1000rem"
          height="500rem"
          style={{
            marginTop: "1rem",
          }}
          ref={iframeRef}
          onLoad={() => setIsIFrameLoading(false)}
        />
      )}
      {isModalVisible && (
        <TransactionDetailsModal
          visible={isModalVisible}
          txnInfo={parsedTransactionData}
          handleOk={handleOk}
          handleCancel={hideModal}
          showFooter={true}
          mainnetProvider={mainnetProvider}
          price={price}
          to={tx.to}
          value={tx.value}
          type="IFrame"
        />
      )}
    </div>
  );
}
