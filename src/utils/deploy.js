import axios from "axios";
import assert  from "node:assert"
import { getBlob, getEip4844Tx, fetchBlobData } from "./blobs.js";
import { psDeployContract, psLogTransaction } from "./planetscale.js";
import { uploadDataToIrys } from "./irys.js";

export async function deployContract(txid) {
	try {
		const { from, blobs } = await getEip4844Tx(txid);
		// console.log(from, blobs)
		const {versionedHash} = blobs[0];
		const blobData = await fetchBlobData(versionedHash);
		// console.log(blobData)
		const decodedBlob = await getBlob(blobData.data)
		// console.log(blobData)

		assert.equal(decodedBlob.type === 1, true)
		const initState = JSON.parse(decodedBlob.state.map(char => String.fromCharCode(char)).join(""));
		const sourceCode = decodedBlob.sc.map(char => String.fromCharCode(char)).join("");
		// add the decoded contract data to the Contracts table
		const psdeploy = await psDeployContract(txid, sourceCode, JSON.stringify(initState))
		// log the transaction in Transactions table
		const irysTxid = await uploadDataToIrys(txid, 1, from, versionedHash, blobData.proof, blobData.commitment, blobData.data);

		const pslog = await psLogTransaction(txid, 1, irysTxid)
		if (psdeploy?.rowsAffected && pslog?.rowsAffected) {
			return {result: true}
		}
		return {result: false}
	} catch(error) {
		console.log(error)
		return { result: false}
	}
}