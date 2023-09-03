#include <stdlib.h>
#include <stdio.h>
#include <math.h>

void printRow(double* row, int len);
void printMatrix(double** matrix, int rows, int cols);
double** allocateMatrix(int rows, int cols);
void freeMatrix(double** matrix, int rows);
void hilbert(double** matrix, int n);
int powerMethod(double** matrix, double* vec, int size, int iter);
void matrixVectorProduct(double** matrix, double* vec, int rows, int cols);
double* matrixColumnVector(double** matrix, int rows, int col);
void vectorAdd(double* v, double* w, int len);
void vectorScale(double* v, int len, double c);
double vectorMax(double* v, int len);

int main(void) {
    double** matrix;
    double* vec;
    int rows, cols, iter;

    // get input from user 
    printf("How many rows, how many columns and how many iterations: ");
    scanf("%d %d %d", &rows, &cols, &iter);

    matrix = allocateMatrix(rows, cols);
    vec = (double*) malloc(sizeof(double) * rows);

    for (int i = 0; i < rows; i++) {
        vec[i] = 1;
    }

    hilbert(matrix, rows);

    powerMethod(matrix, vec, rows, iter);
    /* printMatrix(matrix, rows, cols); */

    freeMatrix(matrix, rows);
    free(vec);

    return 0;
}

double** allocateMatrix(int rows, int cols) {
    // allocate memory for rows amount of int pointers
    double** matrix = (double**) malloc(sizeof(double*) * rows);

    // for each row pointer allocate memory for cols ints
    for (int row = 0; row < rows; row++) {
        matrix[row] = (double*) malloc(sizeof(double) * cols);
    }

    return matrix;
}

void freeMatrix(double** matrix, int rows) {
    for (int row = 0; row < rows; row++) {
        double* ptr = matrix[row];
        free(ptr);
    }

    free(matrix);
}

void hilbert(double** matrix, int n) {
    for (int row = 1; row <= n; row++) {
        for (int col = 1; col <= n; col++) {
            matrix[row - 1][col - 1] = (double) 1 / (row + col - 1); 
        }
    }
}

void printRow(double* row, int len) {
    for (int i = 0; i < len; i++) {
        printf("%.4lf\t", row[i]);
    }

    printf("\n");
}

void printMatrix(double** matrix, int rows, int cols) {
    for (int i = 0; i < rows; i++) {
        printRow(matrix[i], cols);
    }

    printf("\n");
}

int powerMethod(double** matrix, double* vec, int size, int iter) {
    matrixVectorProduct(matrix, vec, size, size);
    double mu = vectorMax(vec, size);
    printf("%lf\n", mu);
    if (iter == 0) {
        return mu;
    } else {
        vectorScale(vec, size, 1 / mu);
        powerMethod(matrix, vec, size, iter - 1);
    }
}

void matrixVectorProduct(double** matrix, double* vec, int rows, int cols) {
    double vCopy[rows];
    for (int i = 0; i < rows; i++) {
        vCopy[i] = vec[i];
        vec[i] = 0;
    }

    for (int i = 0; i < cols; i++) {
        double* colVec = matrixColumnVector(matrix, rows, i);
        vectorScale(colVec, rows, vCopy[i]);
        vectorAdd(vec, colVec, rows);
        free(colVec);
    }

}

double* matrixColumnVector(double** matrix, int rows, int col) {
    double* colVec = (double*) malloc(sizeof(double) * rows);

    for (int i = 0; i < rows; i++) {
        colVec[i] = matrix[i][col];
    }

    return colVec;
}

void vectorAdd(double* v, double* w, int len) {
    for (int i = 0; i < len; i++) {
        v[i] += w[i];
    }
}

void vectorScale(double* v, int len, double c) {
    for (int i = 0; i < len; i++) {
        v[i] *= c;
    }
}

double vectorMax(double* v, int len) {
    double max = fabs(v[0]);
    for (int i = 1; i < len; i++) {
        if (max < fabs(v[i])) {
            max = fabs(v[i]);
        }
    }
    return max;
}
