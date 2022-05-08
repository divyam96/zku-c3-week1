pragma circom 2.0.0;


template Multiplier2 () {

   // Declaration of signals.
   signal input a;
   signal input b;
   signal output c;

   // Constraints.
   c <== a * b;
}


// [assignment] Modify the circuit below to perform a multiplication of three signals

template Multiplier3 () {

   // Declaration of signals.
   signal input a;
   signal input b;
   signal input c;
   signal output d;
   component mul1 = Multiplier2();
   component mul2 = Multiplier2();

   // Constraints.
   mul1.a <== a;
   mul1.b <== b;
   mul2.a <== mul1.c;
   mul2.b <== c;
   d <== mul2.c;
}

component main = Multiplier3();
