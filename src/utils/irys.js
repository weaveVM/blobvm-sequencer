import Irys from "@irys/sdk"
import 'dotenv/config'

const getIrys = async () => {
	console.log(Irys)
	const network = "devnet";
	const token = "ethereum";
	// Devnet RPC URLs change often, use a recent one from https://chainlist.org/
	const providerUrl = "https://ethereum-sepolia-rpc.publicnode.com";
 
	const irys = new Irys({
		network, // URL of the node you want to connect to
		token, // Token used for payment
		key: process.env.IRYS_WALLET_PK, // EVM private key
		config: { providerUrl }, // Provider URL, only required when using devnet
	});
	return irys;
};

export async function uploadDataToIrys(TxId, Type, Caller, VersionedHash, Proof, Commitment, Data) {
	try {
		const data = {TxId, Type, Caller, VersionedHash, Proof, Commitment, Data};
		const irysConn = await getIrys();
		const tags = [{ name: "Protocol", value: "blobvm-testnet" }, { name: "Content-Type", value: "application/json"}];
		const receipt = await irysConn.upload(JSON.stringify(data), { tags: tags });
		console.log(`irys receipt ${receipt.id}`);
		return receipt.id
	} catch(error){
		console.log(error)
	}
}