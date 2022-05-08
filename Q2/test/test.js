const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require("fs");
const { groth16 } = require("snarkjs");
const { plonk } = require("snarkjs");


function unstringifyBigInts(o) {
    if ((typeof(o) == "string") && (/^[0-9]+$/.test(o) ))  {
        return BigInt(o);
    } else if ((typeof(o) == "string") && (/^0x[0-9a-fA-F]+$/.test(o) ))  {
        return BigInt(o);
    } else if (Array.isArray(o)) {
        return o.map(unstringifyBigInts);
    } else if (typeof o == "object") {
        if (o===null) return null;
        const res = {};
        const keys = Object.keys(o);
        keys.forEach( (k) => {
            res[k] = unstringifyBigInts(o[k]);
        });
        return res;
    } else {
        return o;
    }
}

describe("HelloWorld", function () {
    let Verifier;
    let verifier;

    beforeEach(async function () {
        Verifier = await ethers.getContractFactory("HelloWorldVerifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        //[assignment] Add comments to explain what each line is doing

        /*Invokes the snarkjs groth16 fullprove that takes
         inputs:
              input.json: Input signals for testing('a' and 'b' in our case)
              .wasm file: WASM code of our circuit required to compute witness
              .zkey file of circuit: Final Validation key generated by our
                                     groth16 prover for proof construction

        return:
              proof.json: Proof file for verification
              public.json: Public signals needed for verification process.


        */
        const { proof, publicSignals } = await groth16.fullProve({"a":"1","b":"2"}, "contracts/circuits/HelloWorld/HelloWorld_js/HelloWorld.wasm","contracts/circuits/HelloWorld/circuit_final.zkey");

        //Print test case to console
        console.log('1x2 =',publicSignals[0]);

        // Parse string data in our publicSignals and proof to BigInt
        const editedPublicSignals = unstringifyBigInts(publicSignals);
        const editedProof = unstringifyBigInts(proof);

        //Use proof and public signals to create calldata that will we sent into the HelloWorldVerifier
        const calldata = await groth16.exportSolidityCallData(editedProof, editedPublicSignals);

        //Translate calldata into argument for the verifyProof view function within HelloWorldVerifier
        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());

        //get arguments to pass into the verifyProof function of the HelloWorldVerifier
        const a = [argv[0], argv[1]];
        const b = [[argv[2], argv[3]], [argv[4], argv[5]]];
        const c = [argv[6], argv[7]];
        const Input = argv.slice(8);

        //Check if return value is True
        expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
    });
    it("Should return false for invalid proof", async function () {
        let a = [0, 0];
        let b = [[0, 0], [0, 0]];
        let c = [0, 0];
        let d = [0]
        expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
    });
});


describe("Multiplier3 with Groth16", function () {

    beforeEach(async function () {
        //[assignment] insert your script here
        Verifier = await ethers.getContractFactory("Multiplier3Verifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        //[assignment] insert your script here

        const { proof, publicSignals } = await groth16.fullProve({"a":"1","b":"2","c":"3"}, "contracts/circuits/Multiplier3/Multiplier3_js/Multiplier3.wasm","contracts/circuits/Multiplier3/circuit_final.zkey");

        //Print test case to console
        console.log('1x2x3 =',publicSignals[0]);

        // Parse string data in our publicSignals and proof to BigInt
        const editedPublicSignals = unstringifyBigInts(publicSignals);
        const editedProof = unstringifyBigInts(proof);

        //Use proof and public signals to create calldata that will we sent into the Multiplier3Verifier
        const calldata = await groth16.exportSolidityCallData(editedProof, editedPublicSignals);

        //Translate calldata into argument for the verifyProof view function within Multiplier3Verifier
        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());

        //get arguments to pass into the verifyProof function of the Multiplier3Verifier
        const a = [argv[0], argv[1]];
        const b = [[argv[2], argv[3]], [argv[4], argv[5]]];
        const c = [argv[6], argv[7]];
        const Input = argv.slice(8);

        //Check if return value is True
        expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
    });
    it("Should return false for invalid proof", async function () {
        //[assignment] insert your script here
        let a = [0, 0];
        let b = [[0, 0], [0, 0]];
        let c = [0, 0];
        let d = [0]
        expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
    });
});


describe("Multiplier3 with PLONK", function () {

    beforeEach(async function () {
        //[assignment] insert your script here
        Verifier = await ethers.getContractFactory("PlonkVerifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        //[assignment] insert your script here

        const { proof, publicSignals } = await plonk.fullProve({"a":"1","b":"2","c":"3"}, "contracts/circuits/plonk_Multiplier3/Multiplier3_js/Multiplier3.wasm","contracts/circuits/plonk_Multiplier3/circuit_final.zkey");

        //Print test case to console
        console.log('1x2x3 =',publicSignals[0]);

        // Parse string data in our publicSignals and proof to BigInt
        const editedPublicSignals = unstringifyBigInts(publicSignals);
        const editedProof = unstringifyBigInts(proof);

        //Use proof and public signals to create calldata that will we sent into the Multiplier3Verifier
        const calldata = await plonk.exportSolidityCallData(editedProof, editedPublicSignals);

        //Translate calldata into arguments for the verifyProof view function within Multiplier3Verifier
        const argv = calldata.split(',');

        let proof_arg = argv[0];
        let pubSignals_arg =  eval(argv[1])
        //Check if return value is True
        expect(await verifier.verifyProof(proof_arg, pubSignals_arg)).to.be.true;
    });
    it("Should return false for invalid proof", async function () {
        //[assignment] insert your script here
        //[assignment] insert your script here
        let proof_arg = 0;
        let pubSignals_arg =  [0];
        expect(await verifier.verifyProof(proof_arg, pubSignals_arg)).to.be.false;
    });
});
