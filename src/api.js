import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

import { deployContract } from "./utils/deploy.js";
import { psGetState } from "./utils/planetscale.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(
  bodyParser.urlencoded({
    limit: "200mb",
    extended: false,
  }),
);
app.use(bodyParser.json({ limit: "200mb" }));

app.use(function (req, res, next) {
  req.setTimeout(500000, function () {});
  next();
});

app.use((err, req, res, next) => {
  console.error("An error occurred:", err);
  res.status(500).json({ error: "An internal server error occurred." });
});

app.use(
  cors({
    origin: "*",
  }),
);

app.get("/tx/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = await deployContract(id);
    res.send(data);
  } catch (error) {
    console.log(error);
  }
});

app.get("/state/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = await psGetState(id);
    console.log(typeof data)
    res.json(data);
  } catch (error) {
    console.log(error);
  }
});

app.post("/deploy", async (req, res) => {
  try {
    const { txid } = req.body;

    const tx = await deployContract(txid);

    res.send(tx);
  } catch (error) {
    console.log(error);
  }
});


app.listen(port, () => console.log("Server started"));