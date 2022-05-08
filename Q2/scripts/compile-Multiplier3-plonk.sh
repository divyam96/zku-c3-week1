#!/bin/bash

cd contracts/circuits

mkdir plonk_Multiplier3

if [ -f ./powersOfTau28_hez_final_10.ptau ]; then
    echo "powersOfTau28_hez_final_10.ptau already exists. Skipping."
else
    echo 'Downloading powersOfTau28_hez_final_10.ptau'
    wget https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_10.ptau
fi

echo "Compiling Multiplier3.circom..."

# compile circuit

circom Multiplier3.circom --r1cs --wasm --sym -o plonk_Multiplier3
snarkjs r1cs info plonk_Multiplier3/Multiplier3.r1cs

# Start a new zkey and make a contribution

snarkjs plonk setup plonk_Multiplier3/Multiplier3.r1cs powersOfTau28_hez_final_10.ptau plonk_Multiplier3/circuit_final.zkey
snarkjs zkey export verificationkey plonk_Multiplier3/circuit_final.zkey plonk_Multiplier3/verification_key.json

# generate solidity contract
snarkjs zkey export solidityverifier plonk_Multiplier3/circuit_final.zkey ../plonk_Multiplier3Verifier.sol

cd ../..
