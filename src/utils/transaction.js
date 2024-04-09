import axios from "axios";
import assert from "node:assert";
import { getBlob, getEip4844Tx, fetchBlobData } from "./blobs.js";
import {
  psDeployContract,
  psLogTransaction,
  psGetContract,
  psUpdateContractState,
} from "./planetscale.js";
import { uploadDataToIrys } from "./irys.js";
import { MEM_SIMULATE_ENDPOINT } from "./constants.js";

export async function evaluateTx(txid) {
  try {
    const { from, blobs } = await getEip4844Tx(txid);

    const { versionedHash } = blobs[0];
    const blobData = await fetchBlobData(versionedHash);

    const decodedBlob = await getBlob(blobData.data);

    assert.equal(decodedBlob.type === 2, true);
    const interaction = JSON.parse(
      decodedBlob.inputs.map((char) => String.fromCharCode(char)).join(""),
    );
    const targetContract = decodedBlob.contract;

    const contract = (await psGetContract(targetContract))?.[0];

    const normalizedString = contract.SourceCode.replace(/\r\n/g, "");

    const normalizedSourceCode = normalizedString.split("").join("");

    const code = `const msg = {}; msg.sender = "${from}"; `.concat(
      normalizedSourceCode,
    );
    const state = contract.LatestState;

    const newState = await testBlobEvaluate(
      code,
      JSON.stringify(JSON.parse(state)),
      JSON.stringify(interaction),
    );
    if (!newState.length) {
      return { result: false };
    }
    const irysTxid = await uploadDataToIrys(
      txid,
      2,
      from,
      versionedHash,
      blobData.proof,
      blobData.commitment,
      blobData.data,
    );
    if (!irysTxid) {
      return { result: false };
    }

    const pslog = await psLogTransaction(txid, 2, irysTxid);

    if (!pslog) {
      return { result: false };
    }

    const updateState = await psUpdateContractState(targetContract, newState);
    if (!updateState) {
      return { result: false };
    }

    if (updateState?.rowsAffected && pslog?.rowsAffected) {
      return { result: true };
    }
    return { result: false };
  } catch (error) {
    return { result: false };
  }
}

async function testBlobEvaluate(sc, state, tx) {
  try {
    const options = {
      contractType: 0,
      initState: state,
      input: tx,
      contractSrc: sc,
    };

    const result = await axios.post(MEM_SIMULATE_ENDPOINT, options);

    return JSON.stringify(result.data.state);
  } catch (error) {
    console.log(error);
    return "";
  }
}
