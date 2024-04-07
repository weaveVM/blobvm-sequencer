import axios from "axios";
import assert from "node:assert"

import { BLOBS_TX_ENDPOINT, BLOBS_BLOB_ENDPOINT } from "./constants.js";

export async function getBlob(blobHash) {


const hexWithoutPrefix = blobHash.startsWith("0x") ? blobHash.slice(2) : blobHash;

const bytes = [];
for (let i = 0; i < hexWithoutPrefix.length; i += 2) {
    bytes.push(parseInt(hexWithoutPrefix.substr(i, 2), 16));
}


const stringRepresentation = (bytes).filter(char => char !== 0).map((char) => String.fromCharCode(char)).join("")

const data = (JSON.parse(stringRepresentation))

return data;
}



async function testBlobEvaluate() {
  try {

    const sc = await getBlob(hexStringCode, "sc");
    const initState = await getBlob(hexStringState, "state");
    const tx = await getBlob(hexStringTx, "tx");


    const options = {
      contractType: 0,
      initState: initState.replaceAll("\n", ""),
      input: tx.replaceAll("\n", ""),
      contractSrc: sc.replaceAll("\n", "")
    }

    const result = (
    await axios.post("https://mem-testnet-bfdc8ff3530f.herokuapp.com/", options))

    console.log(`\n\nNEW STATE`)
    console.log(result.data.state)
  } catch(error) {
    console.log(error)
  }
}


export async function getEip4844Tx(txid) {
	try {
		const data = (await axios.get(`${BLOBS_TX_ENDPOINT}/${txid}`))?.data;
		const { from, to, blobs } = data

		assert.equal(to === "0x197f818c1313dc58b32d88078ecdfb40ea822614", true);
		assert.equal(blobs.length === 1, true);
		// TODO: assert for amount sent (sequencer fee)
		console.log({from, blobs})
		return {from, blobs}
	} catch(error) {
		console.log(error)
		return {}
	}
}



export async function fetchBlobData(blobHash) {
	try {
		const { versionedHash, commitment, proof, data } = (await axios.get(`${BLOBS_BLOB_ENDPOINT}/${blobHash}`))?.data;
		return { versionedHash, commitment, proof, data }
	} catch(error) {
		console.log(error);
		return {}
	}
}
