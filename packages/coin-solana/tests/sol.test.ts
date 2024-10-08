import {web3, spl, api, SolWallet} from "../src"
import {PublicKey, ComputeBudgetProgram} from "../src/sdk/web3";
import {TokenStandard, transferNftBuilder, getSignedTransaction} from "../src/sdk/metaplex";
import {base} from "@okxweb3/crypto-lib";
import {ed25519_getRandomPrivateKey} from "@okxweb3/coin-base";
import {TOKEN_2022_PROGRAM_ID} from "../src/sdk/spl";
import {deserializeMessages} from "../src/api";

const privateKey = "037f00373589c700a411382ae702e258b01f30a509a32be2b2c84fb54de4c1e5fd5fd86d7d7b8355492b1517a96a2fbb17e1a374b80a21559bdfee0dfbaa0b32";
const privateKeyBase58 = base.toBase58(base.fromHex(privateKey))
describe("address", () => {
    test('private key', async () => {
        let key = ed25519_getRandomPrivateKey(true, 'hex')
        let key1 = ed25519_getRandomPrivateKey(true, 'base58')
        console.log(key)
        console.log(key1)
    })

    const ps: any[] = [];
    ps.push("");
    ps.push("0x");
    ps.push("124699");
    ps.push("1dfi付");
    ps.push("9000 12");
    ps.push("548yT115QRHH7Mpchg9JJ8YPX9RTKuan=548yT115QRHH7Mpchg9JJ8YPX9RTKuan ");
    ps.push("L1vSc9DuBDeVkbiS79mJ441FNAYArL1vSc9DuBDeVkbiS79mJ441FNAYArL1vSc9DuBDeVkbiS79mJ441FNAYArL1vSc9DuBDeVkbiS79mJ441FNAYAr");
    ps.push("L1v");
    ps.push("0x31342f041c5b54358074b4579231c8a300be65e687dff020bc7779598b428 97a");
    ps.push("0x31342f041c5b54358074b457。、。9231c8a300be65e687dff020bc7779598b428 97a");
    test("edge test", async () => {
        const wallet = new SolWallet();
        let j = 1;
        for (let i = 0; i < ps.length; i++) {
            try {
                await wallet.getNewAddress({privateKey: ps[i]});
            } catch (e) {
                j = j + 1
            }
        }
        expect(j).toEqual(ps.length+1);
    });

    test("validPrivateKey", async () => {
        const wallet = new SolWallet();
        const privateKey = await wallet.getRandomPrivateKey();
        const res = await wallet.validPrivateKey({privateKey:privateKey});
        expect(res.isValid).toEqual(true);
    });

    test("getNewAddress", async () => {
        const address = api.getNewAddress(privateKeyBase58);
        console.info(address);

        const valid = api.validAddress(address);
        console.info(valid);
    });

    test("transfer", async () => {
        const fromAddress = api.getNewAddress(privateKeyBase58);
        const toAddress = "7NRmECq1R4tCtXNvmvDAuXmii3vN1J9DRZWhMCuuUnkM"
        const amount = 1000000000
        const blockHash = "BHgsBbx9VQWsWdASiNC2wLq8aWFhuzJvpuwyKp2Jukk5";
        const rawTransaction = api.createRawTransaction(fromAddress, blockHash)

        // set priority fee
        const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
            units: 1400000 // default: 200000 =0.2 * 10^6
        });

        const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
            microLamports: 10 // 1 = 1*10-6 lamport default: 0
        });
        rawTransaction.add(modifyComputeUnits).add(addPriorityFee);

        await api.appendTransferInstruction(rawTransaction, fromAddress, toAddress, amount)
        const data = await api.signTransaction(rawTransaction, privateKeyBase58)
        console.info(data);
    });

    test("associatedTokenAddress", async () => {
        const wallet = "9F3m9cPLjN4abNCoKPY9MKSc8zbzcoUoFSEiZ9hyU9Hb"
        const mint = "EE5L8cMU4itTsCSuor7NLK6RZx6JhsBe8GGV3oaAHm3P"
        const associatedAddress = await spl.getAssociatedTokenAddress(new web3.PublicKey(mint), new web3.PublicKey(wallet))
        console.info(new web3.PublicKey(associatedAddress).toString());
    });

    test("associatedToken2022Address", async () => {
        const wallet = "9F3m9cPLjN4abNCoKPY9MKSc8zbzcoUoFSEiZ9hyU9Hb"
        const mint = "EE5L8cMU4itTsCSuor7NLK6RZx6JhsBe8GGV3oaAHm3P"
        const associatedAddressToken2022 = await spl.getAssociatedTokenAddress(new web3.PublicKey(mint), new web3.PublicKey(wallet), false, TOKEN_2022_PROGRAM_ID);
        console.info(new web3.PublicKey(associatedAddressToken2022).toString());
    });


    test("tokenTransfer", async () => {
        const fromAddress = api.getNewAddress(privateKeyBase58);
        const toAddress = "8DDy3CyJ8e3aGfAVn8PQPZ1jC5mAuNxNF9XbhbyPaFN4"
        const amount = 1000000
        const blockHash = "G6WMViEhWA2TM8AwFwG5FfcVow2WrfqVN7HsnTEcKgYz";
        const mint = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
        const rawTransaction = api.createRawTransaction(fromAddress, blockHash)
        await api.appendTokenTransferInstruction(rawTransaction, fromAddress, toAddress, mint, amount, true)
        const data = await api.signTransaction(rawTransaction, privateKeyBase58)
        console.info(data);
    });

    test("token2022Transfer", async () => {
        const fromAddress = api.getNewAddress(privateKeyBase58);
        const toAddress = "GbDq1KMiTmSys7SPwNTJVF3oSvnpirihdZyqpNTBnf3R";
        const amount = 1000000000;
        const blockHash = "C7pe2gPQir87kwGGwAV9DunqLn2bMrQshWVxe3f262Vt";
        const mint = "FTDMffVuqMpPPTdfaDTNgMTx7A8xe2jpPQBzMq3D85yi";
        const decimal = 9;
        const rawTransaction = api.createRawTransaction(fromAddress, blockHash);
        // set priority fee
        const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
            units: 1400000 // default: 200000 =0.2 * 10^6
        });

        const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
            microLamports: 10 // 1 = 1*10-6 lamport default: 0
        });
        rawTransaction.add(modifyComputeUnits).add(addPriorityFee);
        await api.appendTokenTransferInstruction(rawTransaction, fromAddress, toAddress, mint, amount, false, true, decimal);
        const data = await api.signTransaction(rawTransaction, privateKeyBase58);
        console.info(data);
    });

    test("token2022MintTo", async () => {
        const feePayerPrivateKey = "548yT115QRHH7Mpchg9JJ8YPX9RTKuan7oeB9ruMULDGhdqBmG18RBSv54Fpv2BvrC1yVpGdjzAPKHNYUwPBePK";
        const mintAuthorityPrivateKey = "548yT115QRHH7Mpchg9JJ8YPX9RTKuan7oeB9ruMULDGhdqBmG18RBSv54Fpv2BvrC1yVpGdjzAPKHNYUwPBePK";
        const payerAddress = api.getNewAddress(feePayerPrivateKey);
        const toAddress = "GbDq1KMiTmSys7SPwNTJVF3oSvnpirihdZyqpNTBnf3R";
        const amount = 10000000000;
        const blockHash = "EceWisnSkrDKzboD7mrs1hNBNKSx6LovpcpNuggbreYc";
        const mint = "FTDMffVuqMpPPTdfaDTNgMTx7A8xe2jpPQBzMq3D85yi";
        // const mintAuthorityAddress = "5Js8oiMNBPeaPXSqzZpSCKpQjN41S9W9WQBR9vVbdS8k";
        const mintAuthorityAddress = "J44uzihE3Ty2YBdMsLwCE3hV5uf2q2hRJQMnW2NGqPfo";
        const rawTransaction = api.createRawTransaction(payerAddress, blockHash);
        await api.appendTokenMintToInstruction(rawTransaction, payerAddress, toAddress, mint, mintAuthorityAddress, amount, false, true);
        const data = await api.signTransaction(rawTransaction, feePayerPrivateKey, mintAuthorityPrivateKey);
        console.info(data);
    });

    test("token2022Burn", async () => {
        const feePayerPrivateKey = "548yT115QRHH7Mpchg9JJ8YPX9RTKuan7oeB9ruMULDGhdqBmG18RBSv54Fpv2BvrC1yVpGdjzAPKHNYUwPBePK";
        const tokenAccountOwnerPrivateKey = "548yT115QRHH7Mpchg9JJ8YPX9RTKuan7oeB9ruMULDGhdqBmG18RBSv54Fpv2BvrC1yVpGdjzAPKHNYUwPBePK";
        const feePayerAddress = api.getNewAddress(feePayerPrivateKey);
        const targetTokenAccountAddress = "A8rUSaopsdtH7cDRc6JatsVuJv6PWwKsYrgcAD3kmgYG";
        const tokenAccountOwnerAddress = api.getNewAddress(tokenAccountOwnerPrivateKey);
        const amount = 1000000000;
        const blockHash = "asY4EYLXn1fTLkVvJ5X3SvbjQD6jTKEqdA3b6aFHxsm";
        const mint = "FTDMffVuqMpPPTdfaDTNgMTx7A8xe2jpPQBzMq3D85yi";
        const rawTransaction = api.createRawTransaction(feePayerAddress, blockHash);
        await api.appendTokenBurnInstruction(rawTransaction, tokenAccountOwnerAddress, targetTokenAccountAddress, mint, amount, true);
        const data = await api.signTransaction(rawTransaction, feePayerPrivateKey, tokenAccountOwnerPrivateKey);
        console.info(data);
    });

    test("message", async () => {
        const fromAddress = api.getNewAddress(privateKeyBase58);
        const toAddress = "8DDy3CyJ8e3aGfAVn8PQPZ1jC5mAuNxNF9XbhbyPaFN4"
        const amount = 1000000
        const blockHash = "G6WMViEhWA2TM8AwFwG5FfcVow2WrfqVN7HsnTEcKgYz";
        const mint = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"

        const t = api.createRawTransaction(fromAddress, blockHash)
        await api.appendTokenTransferInstruction(t, fromAddress, toAddress, mint, amount, true)

        const message = t.serialize({requireAllSignatures: false, verifySignatures: false})
        const data = await api.signMessage(base.toBase58(message), privateKeyBase58)

        console.info(data);
    });

    test("deserializeMessages", async () => {
        const messages = ["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"];
        let wallet = new SolWallet()
        let param = {
            data: messages
        }
        let res = await wallet.deserializeMessages(param);
        console.log(res);
    });

    test("pNftTransfer", async () => {
        const privateKey = "548yT115QRHH7Mpchg9JJ8YPX9RTKuan7oeB9ruMULDGhdqBmG18RBSv54Fpv2BvrC1yVpGdjzAPKHNYUwPBePKc";
        const from = api.getNewAddress(privateKey);
        const to = "9qinWp4oc3TvBocbwAvYZAZWfSswub2qM49Pn6rkCQ9q";
        const nft = {
            tokenStandard: TokenStandard.ProgrammableNonFungible,
            address: new PublicKey("DberpiNB1sttkWdd66amQV5hrnMGacBeDeMbcEFMVBiR"),
        };

        const authority = {
            publicKey: new PublicKey(from),
            secretKey: base.fromBase58(privateKey),
        };

        // set priority fee
        const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
            units: 1400000 // default: 200000 =0.2 * 10^6
        });

        const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
            microLamports: 10 // 1 = 1*10-6 lamport default: 0
        });

        const builder = transferNftBuilder({
            nftOrSft: nft,
            authority,
            fromOwner: new PublicKey(from),
            toOwner: new PublicKey(to),
        }, authority);


        builder.add({instruction: modifyComputeUnits, signers: []});
        builder.add({instruction: addPriorityFee, signers: []});

        const signedTx = getSignedTransaction(builder, undefined, {
            blockhash: "8MnQifmv14ELwdkK5NJso9cofN8iNpHy6n6Nnxy7pn8v",
            lastValidBlockHeight: 181854107,
        });
        console.log(signedTx);
    });

    test("mplTransfer", async () => {
        let wallet = new SolWallet()
        let params = {
            privateKey: '5qE6uYyxnPQTkVcQb5ndmCz4TDErkRu6JfTSwpwsYbaNmziwEUuF1UFu37FGHS7WwCVYtwXzu5rGUnKWUXjr5fcU',
            data: {
                "type": "mplTransfer",
                "payer": "CS8ifB68oddKXdW87RAyrxFSoz1DMMcX9WsWeAgbYDCC",
                "blockHash": "Bm1Wrt6Uqwa9d4Qs3SJpBpjbWtxoiWK5mwELsT3HVG5H",
                "from": "CS8ifB68oddKXdW87RAyrxFSoz1DMMcX9WsWeAgbYDCC",
                "to": "9qinWp4oc3TvBocbwAvYZAZWfSswub2qM49Pn6rkCQ9q",
                "amount": 1,
                "computeUnitPrice": "10",
                "computeUnitLimit": "1400000",
                /**
                 * export enum TokenStandard {
                 *   NonFungible,// 0
                 *   FungibleAsset,// 1
                 *   Fungible,// 2
                 *   NonFungibleEdition,// 3
                 *   ProgrammableNonFungible,// 4
                 * }
                 */
                // "tokenStandard": 4,
                "mint": "CBFUFA2QXo7onXqWJGeuqPKGvB9UanQWa6nFddfSHaC7",
                "createAssociatedAddress": true
            }
        }
        let tx = await wallet.signTransaction(params);
        // console.log(tx);
        const expected = `f4rS6meMr7jL34Fjo7AAh9NnZzdyFPBMdMEX6eVdZgHuerMWnk3ZfujRLkzxFHSz39aUKxsrDAcjL8mxiXf6nQGRe3P4bXECCRdaeTxw8UWBTGt9ZsV4ehvWuMVKZpGiPPXWJ8rckg3Roj1tSd4bmTzYi75nNockqGgkb9x89UqVsVpTMHmfTXogP2zGmbUhzeapGc1AtaycoqW2GhZw7tSDUiMBqDQBe81qyp3hPGw4VzfDC9xyRQbs3ZzAJLqq83ebNpcHoAWJ2KZc1hxEtxL5ysjnuTZEW4UMr8vXyzQLMp91raqSxCBesH5PnDn6xSPdPZdCTm3R5x1XEneTRLzSnjYu8NNUSdisQZuBBSNwWpuPsXc7m5rJQDsZYbNhq8sLAM8tzpZ7PrDAq7SWFQAedVd1xPSe7aJPUvYvp7QhKykzjp5vCsiFPqe7EbtTk1bCZtYpynHJECbjEFriLsZv2wDUesLRgNUVaVfUbD5mGtXEdD6sy5dRcqaXhPDjiRbwEViD61KnquAeGTiCtL7vvbcAKoHSEwYQkEVrt2H6Co97WpiBjbCJJ9v91nDFLm3JwSX5ErwKQKDToYcxLXziVAsWVjAkBorJFaQowuqeU3NCruB4GcW2U7bo11yXX5XboXT2KiQRtAeDXnQ3PPHn4jHNUmwVCn1BzDzhCWMMqM3YJmAUtUgvFUsAhrs68Bt3XkCysfDzVU6HgDjFqfe36BZ1WwHs6X7CGkBU6LF9Wqqx8Q9aqtFGTxai4HdBvFvezduVckF6wTjDFX6vHcbtgbkyz1aT5Wk6vQGsTWpqvdkLAAWHMSBtG5NpCE614suSnoW3oHck1nfa2eXs1Q17ERNrmCYc4HSpCYJQSrRZ48XC8XpTouYA2C8FjFdQTJUJppP96cX`;
        expect(tx).toBe(expected)
    });

    test("transfer getSerializedTransaction", async () => {
        let wallet = new SolWallet()
        let params = {
            privateKey: '548yT115QRHH7Mpchg9JJ8YPX9RTKuan7oeB9ruMULDGhdqBmG18RBSv54Fpv2BvrC1yVpGdjzAPKHNYUwPBePKc',
            data: {
                // version: 0,
                type: "transfer",
                payer: "FZNZLT5diWHooSBjcng9qitykwcL9v3RiNrpC3fp9PU1",
                blockHash: "6t1qEvLH5uC9NMmMTPhaE9tAaWdk1qvBjqsKsKNPB7sX",
                from: "FZNZLT5diWHooSBjcng9qitykwcL9v3RiNrpC3fp9PU1",
                to: "7NRmECq1R4tCtXNvmvDAuXmii3vN1J9DRZWhMCuuUnkM",
                amount: 100000000,
                computeUnitLimit: 140000,
                computeUnitPrice: 10,
                needPriorityFee: false
            }
        }
        let tx = await wallet.getSerializedTransaction(params);
        let expected = `3md7BBV9wFjYGnMWcMNyAZcjca2HGfXWZkrU8vvho66z2sJMZFcx6HZdBiAddjo2kzgBv3uZoac3domBRjJJSXkbBvokxTN1jy2dVLvYUXwMDooQzZypN6XL8H86iAaWL7MfHri8ANQ3Cm1oDnXfozNXsULH4svh8D321zZEBTcD3CwM5Mjyx15MD8zcivUbtSzxKce7Lr6oBHrw4mmwPNVR7Sxo67pxCmN6ct2K6fQe97AngFpAVp7Z6dyZ7aPgFCUD3zUTxcNS9dPWx31ejPg6BZKWfK7mQydbD`;
        expect(tx).toBe(expected);
    });

    test("tokenTransfer getSerializedTransaction", async () => {
        let wallet = new SolWallet()
        let param = {
            privateKey: '548yT115QRHH7Mpchg9JJ8YPX9RTKuan7oeB9ruMULDGhdqBmG18RBSv54Fpv2BvrC1yVpGdjzAPKHNYUwPBePKc',
            data: {
                // version: 0,
                type: "tokenTransfer",
                payer: "FZNZLT5diWHooSBjcng9qitykwcL9v3RiNrpC3fp9PU1",
                blockHash: "HwN3QorABLpYftu9FeE1FGrwrBK1aAhhz3cirEVrN3Fn",
                from: "FZNZLT5diWHooSBjcng9qitykwcL9v3RiNrpC3fp9PU1",
                to: "7NRmECq1R4tCtXNvmvDAuXmii3vN1J9DRZWhMCuuUnkM",
                amount: 100000,
                mint: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
                createAssociatedAddress: false,
                token2022: false,
                decimal: 9,
                computeUnitLimit: 140000,
                computeUnitPrice: 10,
                needPriorityFee: false
            }
        }
        let tx = await wallet.getSerializedTransaction(param);
        let expected = `3T4DHUNXqSgNrtRMsDwQr7oG7756JXW4uNJ7x7RKJLTcSJRe6PqyR5fQffnXh4KTHs4MyRrDhR1K3zCeRrWsJBeoXxrw5G79LAb1SBsTUtXnF1XvQ9RhQiwR73XUCNcKukjXw8QTrqAcsnSZJSShmffE5G93PFyvPhG3NRJqfBrCdqWGZAqrtDAqjTJ2qoY6oajcE8xBRs1uqMfHFmUyvoyLWiqGKnTuMSxJ16UCjiw5LfgnnJFDvoGB5KCv9FXzfyRQXckjSaEmLADGgQV5qCEkaSKa8PY5L62pVGBDE8pY6xhW6m154oTaXx8ySMFBRo2Hd2yY7436B9`;
        expect(tx).toBe(expected);
    });

    test("mplTransfer getSerializedTransaction", async () => {
        let wallet = new SolWallet()
        let params = {
            privateKey: '5qE6uYyxnPQTkVcQb5ndmCz4TDErkRu6JfTSwpwsYbaNmziwEUuF1UFu37FGHS7WwCVYtwXzu5rGUnKWUXjr5fcU',
            data: {
                "type": "mplTransfer",
                "payer": "CS8ifB68oddKXdW87RAyrxFSoz1DMMcX9WsWeAgbYDCC",
                "blockHash": "Bm1Wrt6Uqwa9d4Qs3SJpBpjbWtxoiWK5mwELsT3HVG5H",
                "from": "CS8ifB68oddKXdW87RAyrxFSoz1DMMcX9WsWeAgbYDCC",
                "to": "9qinWp4oc3TvBocbwAvYZAZWfSswub2qM49Pn6rkCQ9q",
                "amount": 1,
                "computeUnitPrice": "92280",
                "computeUnitLimit": "100000",
                "mint": "CBFUFA2QXo7onXqWJGeuqPKGvB9UanQWa6nFddfSHaC7",
                "createAssociatedAddress": true,
                "needPriorityFee": false
            }
        }
        let tx = await wallet.getSerializedTransaction(params);
        let expected = `R1skTPrnLQL7Hg9BPsxT1PwcbSD3LPQPWm83qF33iTNZ7dLzH7TA5cdRb92gJRfy94zJqm3xNrJKJGh3rDHHbhiYRmSisjGFTNn6NpMiz4Eb1KB6H9i9LrWZcGaJEkJjcLtoyLvjDi55xX8ruewUbzaHrzTKgrW4yY2iLxaJ1CHzuYZHxRjyNkwmUMmjVZ5CRW7vRVdaVNCA4RokxJaFTC2v2GfsdUc82g5482b6a5zZ8ZuNFrj9v2Z6Pyu7Bvd1eG13pVD27ZbedBeVVY98uFPniZqmkBHwdLRESqv9BSdTpEC4q5RuTRQiMRjY9snNAxKg6mr1Lt6AHnGFvAowrD45wUMn5BXmFr2pyoXvgP3RogGfrF6kQqUJrQTJvTzve2VfGcCatRbhrs44gHwdGKto65ZLrB5JgBnk4ujLGprMvuMmFNFRK5jXETdKULhfhhbMm9qRSzco9pbkMPzM4wP83qJ2U9Wm2GqR2eNcNSMAGXr7ZR4iApMNdRToAPFWMe1NNgTG7BbQDtreq7HyMZGXwrkT6uVxD3BTzRNzg7MYjmPDuUVufThhs3LW6p1TNMRNcmK4FV7X5oaT8XwQFyKJmmmdLXiAGzVrk469R1tB42uHzYC2eRBsPk6VVZ7Yq3i5rKRLkcr6k4MnRqiJaSuRKzycLHSPNEuHABx4WPAi77z7gPppWrM2WqvhVwbyYVWpoAegMST2gDGUWZpsEMmQamygqC9FKggeCyvRENyLuUgL19u54848NFDgmnV2qb5w9L6aDoJddKKd7JtGZz5uuzzDRBu2ThchbTG6NyU5yFP6ipp9zNsidxznhwzA8X11`;
        expect(tx).toBe(expected);
    });
})
