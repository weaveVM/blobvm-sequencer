<p align="center">
  <a href="https://wvm.dev">
    <img src="https://raw.githubusercontent.com/weaveVM/.github/main/profile/bg.png">
  </a>
</p>

## Build and run

You need to configure the `.env` config file by adding your [Irys](https://irys.xyz) and [Planetscale](https://planetscale.com) params. Check  `.env.example`

```bash
git clone https://github.com/weavevm/blobvm-sequencer.git

cd blobvm-sequencer

npm i && npm run start
```

Also you need to initialize your Planetscale tables with the SQL statements of [init.sql](./init.sql)

## Endpoints

#### Base endpoint: https://blobvm-sequencer-c60bec254262.herokuapp.com

### Contract state

```bash
curl -X GET base_endpoint/state/your_contract_addr
```

### Deploy a contract

```bash
curl -X POST -H "Content-Type: application/json" -d '{"txid": "contract_eip4844_txid"}' base_endpoint/deploy 
```

### Send a transaction

```bash
curl -X POST -H "Content-Type: application/json" -d '{"txid": "eip4844_txid"}' base_endpoint/transactions 
```

## License
This repository is licensed under the [MIT License](./LICENSE)