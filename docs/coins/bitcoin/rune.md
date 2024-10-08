# BTC rune

## Rune mint solution

### Serial mint solution

Serial mint diagram
![rune_serial_mint](./images/rune_serial_mint.png)


Transaction signature sample code
```typescript
test("segwit_taproot mul mint rune", async () => {
    let wallet = new TBtcWallet()
    let runeTxParams= {
        type: BtcXrcTypes.RUNEMAIN,
        inputs: [
            {
                txId: "19388357c798902883ede4222cb06ee03955955f47045b051ebab44ea8176ee0",
                vOut: 2,
                amount: 1381968,
                address: "tb1ppfc0mx9j3070zqleu257zt46ch2v9f9n9urkhlg7n7pswcmpqq0qt3pswx",
                data: [{"id": "2584327:44", "amount": "420"}]
            }
        ],
        outputs: [
            { // rune send output
                address: "tb1ppfc0mx9j3070zqleu257zt46ch2v9f9n9urkhlg7n7pswcmpqq0qt3pswx",
                amount: 546,
                data: {"id": "2584327:44", "amount": "420"}
            },
        ],
        address: "tb1ppfc0mx9j3070zqleu257zt46ch2v9f9n9urkhlg7n7pswcmpqq0qt3pswx",
        feePerB: 2,
        runeData: {
            "useDefaultOutput" : false,
            "defaultOutput": 0,
            "serialMint": true,// True if executed serially
            "mint": true,  // must be true
            "mintNum" : 4  // 24> mintNum >2    
        }
    };
    let signParams: SignTxParams = {
        privateKey: "cU9bFFHQ5jwLQ8cByL2NuVtc33vGVF2Q58xjKskpRsRZfSVn3A4g",
        data: runeTxParams
    };
    // let fee = await wallet.estimateFee(signParams)
    
    let tx = await wallet.signTransaction(signParams);
    // console.info(Transaction.fromHex(tx).getId());
    console.info(tx)
    //   [
    //  '02000000000101e06e17a84eb4ba1e055b04475f955539e06eb02c22e4ed83289098c7578338190200000000ffffffff06b80b0000000000002251200a70fd98b28bfcf103f9e2a9e12ebac5d4c2a4b32f076bfd1e9f83076361001e8e030000000000002251200a70fd98b28bfcf103f9e2a9e12ebac5d4c2a4b32f076bfd1e9f83076361001e8e030000000000002251200a70fd98b28bfcf103f9e2a9e12ebac5d4c2a4b32f076bfd1e9f83076361001e8e030000000000002251200a70fd98b28bfcf103f9e2a9e12ebac5d4c2a4b32f076bfd1e9f83076361001e0000000000000000136a5d101487de9d01142c0087de9d012ca4030080fd1400000000002251200a70fd98b28bfcf103f9e2a9e12ebac5d4c2a4b32f076bfd1e9f83076361001e01400fdeb9d9006e62f2391bb06a999d6545b1a14316165d99f0576991f98cef6d6d15ff06ef27440ffa4a65d74f6317a63a9af333f2c5cbddf79bcd70054ec5843500000000',
   //   '0200000000010102d50e3f61fc24ccd9926d973eb72e4c41423c9d3d1b73c4e4b3a70bc57938500100000000ffffffff0222020000000000002251200a70fd98b28bfcf103f9e2a9e12ebac5d4c2a4b32f076bfd1e9f83076361001e0000000000000000136a5d101487de9d01142c0087de9d012ca40300014045aaaa7f02f12b53f7dcfad0ad86c381b6806d17efaf950c7c8f7c6643579e902591ba9136d4115af7f0a5da1a844a2088d2e51429a456d89c78093a27d1bcc100000000',
   //   '0200000000010102d50e3f61fc24ccd9926d973eb72e4c41423c9d3d1b73c4e4b3a70bc57938500200000000ffffffff0222020000000000002251200a70fd98b28bfcf103f9e2a9e12ebac5d4c2a4b32f076bfd1e9f83076361001e0000000000000000136a5d101487de9d01142c0087de9d012ca403000140578f6ff9dd169b15a95820a94e0a2b64da531453c1a21324b4d07b8738b12110909c5514a785638a92e133275f70e32f14944a06f30afc3100bc0e2ee8ff446100000000',
   //   '0200000000010102d50e3f61fc24ccd9926d973eb72e4c41423c9d3d1b73c4e4b3a70bc57938500300000000ffffffff0222020000000000002251200a70fd98b28bfcf103f9e2a9e12ebac5d4c2a4b32f076bfd1e9f83076361001e0000000000000000136a5d101487de9d01142c0087de9d012ca4030001409be4681657827cb5c317b46d05a978f25a15c286105408bc16b9285fef4c109b84cffb4729ba9660c1e776002f864c932405b14d5735b7dfef1ac36ff5a3731c00000000'
   // ]
});
```

transaction example：

[first transaction](https://mempool.space/zh/tx/c22c21e19f6162b98bf61e7cb9fa49e5edb8027e041ac805b4d96161d3ec2bb4)

[second transaction](https://mempool.space/zh/tx/f4ba2f731064059afef8ae05f41538df23b26f444fcd1fba2bd7d64254b45be7#flow=&vin=0)

[third transaction](https://mempool.space/zh/tx/a4525accb3277a4835732153ae64f28996571d33da8f011d880fcd4a26a58fb9#flow=&vin=0)

[fourth transaction](https://mempool.space/zh/tx/a892e9a53df6d66c81e7df9046dcd80be588004c3fa82910b74e40a666dea4aa#flow=&vin=0)

### Parallel mint solution(batchMint solution)
The signature will estimate the fee, thereby controlling each Mint Op-return transaction to be perfectly consumed according to the handling rate initially set by the user, without generating a change transaction (lowering the total cost and reducing fragmentation utxo) and only generating an output pointer with runes assets. Change address.

Schematic diagram of parallel solution

![rune_batch_mint](./images/rune_batch_mint.png)

Parameter Description
1. Added Mint parameter, bool type, permission to execute Mint.
2. Added MintNum parameter, int type, which can specify the number of Mint executions. The default is 1. Once > 1, it will return ["rawTx1", "rawTx2"..] by default, which is used to store the signature results of multiple transactions. At least make sure the first one broadcasts first.
3. To execute mint, you need to accurately know the source of the minted target asset information and the allocation target information, so the data in the utxo you must input contains the information to be mint (for example: data: [{"id": "837557:1234" , "amount": "1000"}] ), even if this UTXO does not have this asset.
4. Execute mint. Since batch mint has complex sub-transactions, it is necessary to avoid the influence of default transfer rules. Therefore, useDefaultOutput= false and defaultOutput= 0 must be set when calling.
6. For the business calling process of batchMint, it should be
7. Assume that certain user inputs are selected, given mint and mintNum, execute estimateFee to return the estimated total [230+1000, 180+546, 180+546] = inputsum (sats)
8. If the total exceeds the total of sats in the given input, you should continue to increase the input and repeat the process of estimateFee
9. Modify the estimateFee method to adapt the Mint and MintNum parameters. Once MintNum>1, it will return [3000,900..] by default. The pure handling fee estimates of the parent transaction and the child transaction will be returned in sequence.

#### Transaction case

##### Single Mint

```typescript
test("segwit_taproot mint rune", async () => {
    // let wallet = new BtcWallet()
    let wallet = new TBtcWallet()
    let runeTxParams= {
        type: BtcXrcTypes.RUNEMAIN,
        inputs: [
            {
                txId: "ecf5fc66a81b096da5201da18ab5fd3fd31b48a31653f86f6dcfa29b8a2a0606",
                vOut: 4,
                amount: 1383332,
                address: "tb1ppfc0mx9j3070zqleu257zt46ch2v9f9n9urkhlg7n7pswcmpqq0qt3pswx",
                data: [{"id": "2584327:44", "amount": "420"}]
            }
        ],
        outputs: [
            { // rune send output
                address: "tb1ppfc0mx9j3070zqleu257zt46ch2v9f9n9urkhlg7n7pswcmpqq0qt3pswx",
                amount: 1000,
                data: {"id": "2584327:44", "amount": "420"}
            },
        ],
        address: "tb1ppfc0mx9j3070zqleu257zt46ch2v9f9n9urkhlg7n7pswcmpqq0qt3pswx",
        feePerB: 2,
        runeData: {
            "etching": null,
            "useDefaultOutput" : false,
            "defaultOutput": 0,
            "burn": false,
            "mint": true,  // must be true
            "mintNum" : 1  //，
        }
    };
    let signParams: SignTxParams = {
        privateKey: "xx",
        data: runeTxParams
    };
    // let fee = await wallet.estimateFee(signParams)
    // expect(fee).toEqual(2730)
    let tx = await wallet.signTransaction(signParams);
    // console.info(Transaction.fromHex(tx).getId());
    console.info(tx)

});
```

##### Batch Mint

```typescript
test("segwit_taproot mul mint rune", async () => {
    let wallet = new TBtcWallet()
    let runeTxParams= {
        type: BtcXrcTypes.RUNEMAIN,
        inputs: [
            {
                txId: "19388357c798902883ede4222cb06ee03955955f47045b051ebab44ea8176ee0",
                vOut: 2,
                amount: 1381968,
                address: "tb1ppfc0mx9j3070zqleu257zt46ch2v9f9n9urkhlg7n7pswcmpqq0qt3pswx",
                data: [{"id": "2584327:44", "amount": "420"}]
            }
        ],
        outputs: [
            { // rune send output
                address: "tb1ppfc0mx9j3070zqleu257zt46ch2v9f9n9urkhlg7n7pswcmpqq0qt3pswx",
                amount: 3000,
                data: {"id": "2584327:44", "amount": "420"}
            },
        ],
        address: "tb1ppfc0mx9j3070zqleu257zt46ch2v9f9n9urkhlg7n7pswcmpqq0qt3pswx",
        feePerB: 2,
        runeData: {
            "etching": null,
            "useDefaultOutput" : false,
            "defaultOutput": 0,
            "burn": false,
            "mint": true,
            "mintNum" : 4
        }
    };
    // "mint": true,
    //     "mintNum":1
    let signParams: SignTxParams = {
        privateKey: "cU9bFFHQ5jwLQ8cByL2NuVtc33vGVF2Q58xjKskpRsRZfSVn3A4g",
        data: runeTxParams
    };
    // let fee = await wallet.estimateFee(signParams)
    
    let tx = await wallet.signTransaction(signParams);
    // console.info(Transaction.fromHex(tx).getId());
    console.info(tx)
    //   [
    //  '02000000000101e06e17a84eb4ba1e055b04475f955539e06eb02c22e4ed83289098c7578338190200000000ffffffff06b80b0000000000002251200a70fd98b28bfcf103f9e2a9e12ebac5d4c2a4b32f076bfd1e9f83076361001e8e030000000000002251200a70fd98b28bfcf103f9e2a9e12ebac5d4c2a4b32f076bfd1e9f83076361001e8e030000000000002251200a70fd98b28bfcf103f9e2a9e12ebac5d4c2a4b32f076bfd1e9f83076361001e8e030000000000002251200a70fd98b28bfcf103f9e2a9e12ebac5d4c2a4b32f076bfd1e9f83076361001e0000000000000000136a5d101487de9d01142c0087de9d012ca4030080fd1400000000002251200a70fd98b28bfcf103f9e2a9e12ebac5d4c2a4b32f076bfd1e9f83076361001e01400fdeb9d9006e62f2391bb06a999d6545b1a14316165d99f0576991f98cef6d6d15ff06ef27440ffa4a65d74f6317a63a9af333f2c5cbddf79bcd70054ec5843500000000',
   //   '0200000000010102d50e3f61fc24ccd9926d973eb72e4c41423c9d3d1b73c4e4b3a70bc57938500100000000ffffffff0222020000000000002251200a70fd98b28bfcf103f9e2a9e12ebac5d4c2a4b32f076bfd1e9f83076361001e0000000000000000136a5d101487de9d01142c0087de9d012ca40300014045aaaa7f02f12b53f7dcfad0ad86c381b6806d17efaf950c7c8f7c6643579e902591ba9136d4115af7f0a5da1a844a2088d2e51429a456d89c78093a27d1bcc100000000',
   //   '0200000000010102d50e3f61fc24ccd9926d973eb72e4c41423c9d3d1b73c4e4b3a70bc57938500200000000ffffffff0222020000000000002251200a70fd98b28bfcf103f9e2a9e12ebac5d4c2a4b32f076bfd1e9f83076361001e0000000000000000136a5d101487de9d01142c0087de9d012ca403000140578f6ff9dd169b15a95820a94e0a2b64da531453c1a21324b4d07b8738b12110909c5514a785638a92e133275f70e32f14944a06f30afc3100bc0e2ee8ff446100000000',
   //   '0200000000010102d50e3f61fc24ccd9926d973eb72e4c41423c9d3d1b73c4e4b3a70bc57938500300000000ffffffff0222020000000000002251200a70fd98b28bfcf103f9e2a9e12ebac5d4c2a4b32f076bfd1e9f83076361001e0000000000000000136a5d101487de9d01142c0087de9d012ca4030001409be4681657827cb5c317b46d05a978f25a15c286105408bc16b9285fef4c109b84cffb4729ba9660c1e776002f864c932405b14d5735b7dfef1ac36ff5a3731c00000000'
   // ]
});
```

##### Transaction results

###### Single Mint results

[single tx](https://mempool.space/testnet/tx/19388357c798902883ede4222cb06ee03955955f47045b051ebab44ea8176ee0#flow=&vout=0)


```shell
{
    "code": 0,
    "msg": "ok",
    "data": {
        "events": [
            {
                "type": "mintRune",
                "id": "2584327:44",
                "rune": "MAGICRUNES",
                "spacedRune": "MAGICRUNES",
                "symbol": "▣",
                "divisibility": 0,
                "spacers": 0,
                "amount": 420
            },
            {
                "type": "mintOutput",
                "vout": 0,
                "outputValue": 1000,
                "address": "tb1ppfc0mx9j3070zqleu257zt46ch2v9f9n9urkhlg7n7pswcmpqq0qt3pswx",
                "mints": [
                    {
                        "id": "2584327:44",
                        "rune": "MAGICRUNES",
                        "spacedRune": "MAGICRUNES",
                        "symbol": "▣",
                        "divisibility": 0,
                        "spacers": 0,
                        "amount": 420
                    }
                ]
            }
        ],
        "txid": "19388357c798902883ede4222cb06ee03955955f47045b051ebab44ea8176ee0"
    }
}
```

###### Batch Mint

[parent transaction](https://mempool.space/testnet/tx/503879c50ba7b3e4c4731b3d9d3c42414c2eb73e976d92d9cc24fc613f0ed502)

transaction results

```shell
{
    "code": 0,
    "msg": "ok",
    "data": {
        "events": [
            {
                "type": "mintRune",
                "id": "2584327:44",
                "rune": "MAGICRUNES",
                "spacedRune": "MAGICRUNES",
                "symbol": "▣",
                "divisibility": 0,
                "spacers": 0,
                "amount": 420
            },
            {
                "type": "mintOutput",
                "vout": 0,
                "outputValue": 3000,
                "address": "tb1ppfc0mx9j3070zqleu257zt46ch2v9f9n9urkhlg7n7pswcmpqq0qt3pswx",
                "mints": [
                    {
                        "id": "2584327:44",
                        "rune": "MAGICRUNES",
                        "spacedRune": "MAGICRUNES",
                        "symbol": "▣",
                        "divisibility": 0,
                        "spacers": 0,
                        "amount": 420
                    }
                ]
            }
        ],
        "txid": "503879c50ba7b3e4c4731b3d9d3c42414c2eb73e976d92d9cc24fc613f0ed502"
    }
}
```

[Sub-transaction1](https://mempool.space/testnet/tx/5190039592bbf10f3481cc627ab6642b0706a24c7f7e72680fdce1165c2bd47b)
[Sub-transaction2](https://mempool.space/testnet/tx/445ce48d1cb1c2760f1e688bd15014d3bd72ebf377ca4d037678952986c84ce8)
[Sub-transaction3](https://mempool.space/testnet/tx/c36a4886758c70ea6ee055b79f2db73401dc6cf7a9264418666e017cf7cf2758)

```shell
{
    "code": 0,
    "msg": "ok",
    "data": {
        "events": [
            {
                "type": "mintRune",
                "id": "2584327:44",
                "rune": "MAGICRUNES",
                "spacedRune": "MAGICRUNES",
                "symbol": "▣",
                "divisibility": 0,
                "spacers": 0,
                "amount": 420
            },
            {
                "type": "mintOutput",
                "vout": 0,
                "outputValue": 546,
                "address": "tb1ppfc0mx9j3070zqleu257zt46ch2v9f9n9urkhlg7n7pswcmpqq0qt3pswx",
                "mints": [
                    {
                        "id": "2584327:44",
                        "rune": "MAGICRUNES",
                        "spacedRune": "MAGICRUNES",
                        "symbol": "▣",
                        "divisibility": 0,
                        "spacers": 0,
                        "amount": 420
                    }
                ]
            }
        ],
        "txid": "c36a4886758c70ea6ee055b79f2db73401dc6cf7a9264418666e017cf7cf2758"
    }
}
```


## Rune transfer

taproot transfer rune example

```typescript
test("segwit_taproot transfer rune", async () => {
    let wallet = new BtcWallet()
    let runeTxParams= {
        type: BtcXrcTypes.RUNEMAIN,
        inputs: [
            {
                txId: "ec5d3b90d3e3d80b0604902b383cdd5f41c3d4c89d6391e7afb93f94b1b110f8",
                vOut: 0,
                amount: 546,
                address: "bc1pq9cztnve7mcs6xnq3sn556v86ys5pevms8ef6saywqcvhxppgdnspn8msm",
                data: [{"id": "840289:2103", "amount": "299999"}]
            },
            {
                txId: "e28740172d21f206582928931c796792e8e5234acfe6273d8de847f522f0131f",
                vOut: 3,
                amount: 340102,
                address: "bc1pq9cztnve7mcs6xnq3sn556v86ys5pevms8ef6saywqcvhxppgdnspn8msm"
            }
        ],
        outputs: [
            { // rune send output
                address: "bc1pq9cztnve7mcs6xnq3sn556v86ys5pevms8ef6saywqcvhxppgdnspn8msm",
                amount: 546,
                data: {"id": "840289:2103", "amount": "219999"}
            },
            { // rune send output
                address: "bc1pq9cztnve7mcs6xnq3sn556v86ys5pevms8ef6saywqcvhxppgdnspn8msm",
                amount: 546,
                data: {"id": "840289:2103", "amount": "80000"}
            },
        ],
        address: "bc1pq9cztnve7mcs6xnq3sn556v86ys5pevms8ef6saywqcvhxppgdnspn8msm",
        feePerB: 16,
        runeData: {
            "etching": null,
            "useDefaultOutput" : false,
            "defaultOutput": 0,
            "burn": false
        }
    };
    let signParams: SignTxParams = {
        privateKey: "KwdkfXMV2wxDVDMPPuFZsio3NeCskAUd4N2U4PriTgpj2MqAGmmc",
        data: runeTxParams
    };
    let fee = await wallet.estimateFee(signParams)
    expect(fee).toEqual(4528)
    let tx = await wallet.signTransaction(signParams);
    // console.info(tx)
    const partial = /^02000000000102f810b1b1943fb9afe791639dc8d4c3415fdd3c382b9004060bd8e3d3903b5dec0000000000ffffffff1f13f022f547e88d3d27e6cf4a23e5e89267791c9328295806f2212d174087e20300000000ffffffff042202000000000000225120017025cd99f6f10d1a608c274a6987d12140e59b81f29d43a47030cb982143672202000000000000225120017025cd99f6f10d1a608c274a6987d12140e59b81f29d43a47030cb982143670000000000000000136a5d1000e1a433b710dfb60d00000080f10401b41c050000000000225120017025cd99f6f10d1a608c274a6987d12140e59b81f29d43a47030cb982143670140.*/
    expect(tx).toMatch(partial)
});
```
