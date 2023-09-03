#!/usr/bin/env node

function iprod(A,j,k)
{
  // compute and return the inner product between columns j and k of A
  let r = 0.0, m=A.length;
  var i;
  for (i=0; i<m; i++)
  {
    r += (A[i][j])*(A[i][k]);
  }
  return r;
}

function nrm(A,j)
{
  // compute and return the 2-norm of the jth column of A
  return Math.sqrt(iprod(A,j,j));
}


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

function QR_GS(A)
{
  // compute QR factorization using Gram--Schmidt algorithm
  // Input: 2D array A
  // Output:  [Q,R], where Q is orthogonal, and R is upper triangular
  //
  // Determine the size of A
  let m = A.length;
  let n = A[0].length;
  // initialize the output arrays
  let R = zeros(n,n);
  let Q = zeros(m,n);
  // copy A to Q
  for (i=0; i<m; i++)
  {
    for (j=0; j<n; j++)
    {
      Q[i][j] = A[i][j];
    }
  }
  // go over columns of Q, and orthogonalize them
  var i,j,k;
  for (j=0; j<n; j++)
  {
    // determine the length of the column #j
    R[j][j] = nrm(Q,j);
    if (Math.abs(R[j][j])<1.0E-13)
    {
      console.log("Warning: columns of A are nearly linearlyy dependent!")
    }
    // make the jth column of Q into a unit vector
    for (i=0; i<m; i++)
    {
      Q[i][j] /= R[j][j];
    }
    // orthogonalize the vectors columns j+1,j+2,... to column j
    for (k=j+1; k<n; k++)
    {
      R[j][k] = iprod(Q,j,k);
      for (i=0; i<m; i++)
      {
        Q[i][k] -= R[j][k]*Q[i][j];
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

let QR = QR_GS(A);
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
