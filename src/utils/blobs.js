import axios from "axios";
import assert from "node:assert";

import {
  BLOBS_TX_ENDPOINT,
  BLOBS_BLOB_ENDPOINT,
  SEQUENCER_ADDRESS,
} from "./constants.js";

export async function getBlob(blobHash) {
  const hexWithoutPrefix = blobHash.startsWith("0x")
    ? blobHash.slice(2)
    : blobHash;

  const bytes = [];
  for (let i = 0; i < hexWithoutPrefix.length; i += 2) {
    bytes.push(parseInt(hexWithoutPrefix.substr(i, 2), 16));
  }

  const stringRepresentation = bytes
    .filter((char) => char !== 0)
    .map((char) => String.fromCharCode(char))
    .join("");

  const data = JSON.parse(stringRepresentation);

  return data;
}

export async function getEip4844Tx(txid) {
  try {
    const data = (await axios.get(`${BLOBS_TX_ENDPOINT}/${txid}`))?.data;
    const { from, to, blobs } = data;

    assert.equal(to === SEQUENCER_ADDRESS, true);
    assert.equal(blobs.length === 1, true);
    // TODO: assert for amount sent (sequencer fee)
    console.log({ from, blobs });
    return { from, blobs };
  } catch (error) {
    console.log(error);
    return {};
  }
}

export async function fetchBlobData(blobHash) {
  try {
    const { versionedHash, commitment, proof, data } = (
      await axios.get(`${BLOBS_BLOB_ENDPOINT}/${blobHash}`)
    )?.data;
    return { versionedHash, commitment, proof, data };
  } catch (error) {
    console.log(error);
    return {};
  }
}
