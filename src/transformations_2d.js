// *******************************************************
// * Copyright (C) 2018 Anurag Banerjee <anuragbanerjee@uga.edu>
// * All rights reserved.
// *
// * This file is part of Transformations 2D.
// *
// * Transformations 2D can not be copied and/or distributed without the express written permission of Anurag Banerjee.
// *******************************************************

let all_datalines = [];
let transformations = [];

function inputLines(datalines, num) {
	const lines = datalines.split("\n");
	all_datalines = lines.filter(l => l.length > 0).map( (raw_data) => {
		const [x1, y1, x2, y2] = raw_data.split(" ");
		const pointA = point(parseInt(x1), parseInt(y1));
		const pointB = point(parseInt(x2), parseInt(y2));
		return line(pointA, pointB);
	});

	return all_datalines;
}

function outputLines(datalines, num) {
	let result = ``;
	for (let d of datalines) {
		result += `${d.start.x} ${d.start.y} ${d.end.x} ${d.end.y}\n`;
	}
	return result;
}

function basicTranslate(Tx, Ty) {
	const matrix = [
		[1,  0, 0],
		[0,  1, 0],
		[Tx, Ty, 1]
	];

	return matrix;
}

function basicScale(Sx, Sy) {
	const matrix = [
		[Sx, 0, 0],
		[0, Sy, 0],
		[0,  0, 1]
	];

	return matrix;
}

function basicRotate(angle) {
	const toRadians = (a) => a * (Math.PI / 180);
	const cos = Math.cos(toRadians(angle));
	const sin = Math.sin(toRadians(angle));

	const matrix = [
		[cos, -sin,  0],
		[sin,  cos,  0],
		[0,      0,  1]
	];

	return matrix;
}

function scale(Sx, Sy, Cx, Cy) {
	const m1 = basicTranslate(-Cx, -Cy);
	const m2 = basicScale(Sx, Sy);
	const m3 = basicTranslate(Cx, Cy);

	return [m1, m2, m3].reduce(multiplyMatrices)
}

function rotate(angle, Cx, Cy) {
	const m1 = basicTranslate(-Cx, -Cy);
	const m2 = basicRotate(angle);
	const m3 = basicTranslate(Cx, Cy);

	return [m1, m2, m3].reduce(multiplyMatrices);
}

function applyTransformation(matrix, datalines) {
	datalines = datalines.map( (l) => {
		let x, y, z;
		const startPoint = [l.start.x, l.start.y, 1];
		[x, y, z] = multiplyMatrixAndPoint(matrix, startPoint);
		const newStartPoint = point(x, y);

		const endPoint = [l.end.x, l.end.y, 1];
		[x, y, z] = multiplyMatrixAndPoint(matrix, endPoint);
		const newEndpoint = point(x, y);

		return line(newStartPoint, newEndpoint);
	});

	return datalines;
}

let viewport = null;
function viewportSpec(bottomLeft, topRight) {
	const topLeft = {
		x: bottomLeft.x,
		y: topRight.y
	};

	const bottomRight = {
		x: topRight.x,
		y: bottomLeft.y
	};

	viewport = {
		bottomLeft,
		bottomRight,
		topLeft,
		topRight,
		zlastOne: bottomLeft
	}

	const w = topRight.x - topLeft.x;
	const h = topLeft.y - bottomLeft.y;

	const viewportTransform = [
		[w/2,   0, (topRight.x + topLeft.x)/2  ],
		[0  , h/2, (topLeft.y + bottomLeft.y)/2],
		[0  ,   0,                            1]
	];

	return viewportTransform;
}

function displayPixels(datalines) {
	clearCanvas();
	for (let l of datalines) {
		DRAWING_TECHNIQUES["bresenham"](l.start, l.end, "black", viewport);
	}

	const {bottomLeft, bottomRight, topLeft, topRight} = viewport;

	[bottomLeft, bottomRight, topRight, topLeft, bottomLeft].reduce((a, b) => {
		bresenham(a, b)
		return b;
	});
}

function multiplyMatrixAndPoint(matrix, point) {
	const [a, b, c] = matrix[0];
	const [d, e, f] = matrix[1];
	const [g, h, i] = matrix[2];

  const [x, y, z] = point;

  return [
	  (x * a) + (y * d) + (z * g),
	  (x * b) + (y * e) + (z * h),
	  (x * c) + (y * f) + (z * i)
  ];
}

function multiplyMatrices(matrixA, matrixB) {
	const [a, b, c] = matrixA[0]
	const [d, e, f] = matrixA[1]
	const [g, h, i] = matrixA[2]

	const [j, k, l] = matrixB[0]
	const [m, n, o] = matrixB[1]
	const [p, q, r] = matrixB[2]

	return [
		[(a * j + b * m + c * p),    (a * k + b * n + c * q),    (a * l + b * o + c * r)],
		[(d * j + e * m + f * p),    (d * k + e * n + f * q),    (d * l + e * o + f * r)],
		[(g * j + h * m + i * p),    (g * k + h * n + i * q),    (g * l + h * o + i * r)]
	];
}

// transformations.push(basicRotate(10))
// transformations.push(basicTranslate(200, 200))
// transformations.push(basicScale(3, 3))
// transformations.push(scale(1, 1, 0, 0))
// transformations.push(rotate(90, 0, 0))

const identity_matrix = [
	[1, 0, 0],
	[0, 1, 0],
	[0, 0, 1]
]
