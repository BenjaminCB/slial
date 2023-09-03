#!/usr/bin/env node

function zeros(m,n)
{
  // create an m x n matrix filled with zeros
  let A = new Array(m);
  var i,j;
  for (i=0; i<m; i++)
  {
    A[i] = new Array(n);
    for (j=0; j<n; j++)
    {
      A[i][j] = 0.0;
    }
  }
  return A;
}

function Givens(a,b)
{
  // compute c,s defining the Givens rotation of the vector [a,b]
  // also compute the length of the vector
  let d = Math.sqrt(a*a + b*b);
  let c = a/d;
  let s = b/d;
  return [c,s,d];
}

function apply_Givens(R,d,c,s,i,j)
{
  // compute the product of the Givens rotation
  // and a matrix R
  // Givens rotation only modifies the rows i and j
  // Additionally, we assume that i<j and that the columns
  // k<i contain only zeros at positions i and j (this is true in
  // the QR factorization algorithm)
  var k,n;
  n = R[0].length;

  R[i][i] = d;
  R[j][i] = 0.0;
  for (k=i+1; k<n; k++)
  {
    let Rik = R[i][k];
    let Rjk = R[j][k];
    R[i][k] = c*Rik + s*Rjk;
    R[j][k] =-s*Rik + c*Rjk;
  }
}

function apply_GivensT(Q,d,c,s,i,j)
{
  // compute the product of the matrix Q and the Givens rotation (transposed)
  // only columns i and j of Q get modified
  var k,m;
  m = Q.length;

  for (k=0; k<m; k++)
  {
    let Qki = Q[k][i];
    let Qkj = Q[k][j];
    Q[k][i] = c*Qki + s*Qkj;
    Q[k][j] =-s*Qki + c*Qkj;
  }
}

function QR_Givens(A)
{
  // compute QR factorization using Givens rotations
  // Input: 2D array A
  // Output:  [Q,R], where Q is orthogonal, and R is upper triangular
  //
  // Determine the size of A
  let m = A.length;
  let n = A[0].length;
  // initialize the output arrays
  let R = zeros(m,n);
  let Q = zeros(m,m);
  // copy A to R
  for (i=0; i<m; i++)
  {
    for (j=0; j<n; j++)
    {
      R[i][j] = A[i][j];
    }
  }
  // Initialize Q to the identity matrix
  for (i=0; i<m; i++)
  {
    Q[i][i] = 1.0;
  }
  // go over columns of R, and eliminate all the elements under
  // diagonal using Givens rotations
  var i,j,k;
  for (i=0; i<n; i++)
  {
    for (j=i+1; j<m; j++)
    {
      let a = R[i][i];
      let b = R[j][i];
      if (b != 0.0)
      {
        let dcs = Givens(a,b);
        let c=dcs[0], s=dcs[1], d=dcs[2];
        apply_Givens (R,d,c,s,i,j);
        apply_GivensT(Q,d,c,s,i,j);
      }
    }
  }
  return [Q,R];
}

function matmul(A,B)
{
  // compute the matrix product between A and B
  // size compatibility is not checked
  let m = A.length, n=A[0].length, k=B[0].length;
  let C = zeros(m,k);
  var i,j,l;
  for (i=0; i<m; i++)
  {
    for (j=0; j<k; j++)
    {
      for (l=0; l<n; l++)
      {
        C[i][j] += A[i][l]*B[l][j];
      }
    }
  }
  return C;
}

function transp(A)
{
  // return A transposed
  let m = A.length;
  let n = A[0].length;
  let B = zeros(n,m);
  var i,j;
  for (i=0; i<m; i++)
  {
    for(j=0; j<n; j++)
    {
      B[j][i] = A[i][j];
    }
  }
  return B;
}


// Example from the slides
let A = Array([1,0,0],
              [1,1,0],
              [1,1,1],
              [1,1,1]);

console.log("Original matrix A:");
console.log(A);

let QR = QR_Givens(A);
let Q = QR[0];
let R = QR[1];

console.log("Orthogonal matrix Q:");
console.log(Q);
console.log("Upper triangular matrix R:");
console.log(R);

// check that A ~ QR
let A1 = matmul(Q,R);
console.log("Matrix QR:");
console.log(A1);

// check that I ~ Q^T Q
let I = matmul(transp(Q),Q);
console.log("Matrix Q^T Q:");
console.log(I);
