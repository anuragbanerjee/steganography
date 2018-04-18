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
let points = []
let viewport = null

function inputLines(datalines, num) {
	const lines = datalines.split("\n");
	numLines = parseInt(lines[0])
	
	points = lines.slice(1, numLines + 1).filter(l => l.length > 0).map( (raw_data) => {
		return point3D(...raw_data.split(" ").map(n => parseInt(n)));
	});

	console.log(points)

	all_datalines = lines.slice(numLines + 1).map( (raw_data) => {
		return line(...raw_data.split(" ").map(n => points[parseInt(n)]))
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

function basicTranslate3D(Tx = 0, Ty = 0, Tz = 0) {
	const matrix = [
		[1, 0, 0, 0],
		[0, 1, 0, 0],
		[0, 0, 1, 0],
		[Tx, Ty, Tz,1]
	];

	return matrix;
}

function basicScale3D(Sx = 1, Sy = 1, Sz = 1) {
	const matrix = [
		[Sx, 0, 0, 0],
		[0, Sy, 0, 0],
		[0,  0, Sz,0],
		[0,  0, 0, 1]
	];

	return matrix;
}

function scale3D(Sx = 1, Sy = 1, Sz = 1, Cx, Cy, Cz) {
	const m1 = basicTranslate3D(-Cx, -Cy, -Cz);
	const m2 = basicScale3D(Sx, Sy, Sz);
	const m3 = basicTranslate3D(Cx, Cy, Cz);

	return [m1, m2, m3].reduce(multiplyMatricies3D)
}

function rotate3D(angleX, angleY, angleZ, Cx, Cy, Cz) {
	function basicRotateX(angle) {
		const toRadians = (a) => a * (Math.PI / 180);
		const c = Math.cos(toRadians(angle));
		const s = Math.sin(toRadians(angle));

		const matrix = [
			[1, 0, 0,  0],
			[0, c, s,  0],
			[0, -s, c, 0],
			[0, 0, 0,  1]
		];

		return matrix;
	}

	function basicRotateY(angle) {
		const toRadians = (a) => a * (Math.PI / 180);
		const c = Math.cos(toRadians(angle));
		const s = Math.sin(toRadians(angle));

		const matrix = [
			[c, 0, -s,  0],
			[0, 1, 0,  0],
			[s, 0, c,  0],
			[0, 0, 0,  1]
		];

		return matrix;
	}

	function basicRotateZ(angle) {
		const toRadians = (a) => a * (Math.PI / 180);
		const c = Math.cos(toRadians(angle));
		const s = Math.sin(toRadians(angle));

		const matrix = [
			[c, s, 0,  0],
			[-s, c, 0,  0],
			[0, 0, 1,  0],
			[0, 0, 0,  1]
		];

		return matrix;
	}

	const m1 = basicTranslate3D(-Cx, -Cy, -Cz);
	const m2 = basicRotateX(angleX)
	const m3 = basicRotateY(angleY)
	const m4 = basicRotateZ(angleZ)
	const m5 = basicTranslate3D(Cx, Cy, Cz);

	return [m1, m2, m3, m4, m5].reduce(multiplyMatricies3D);
}

function applyTransformation(matrix, datalines) {
	datalines = datalines.map( (l) => {
		const startPoint = [l.start.x, l.start.y, l.start.z, 1];
		const newStartPoint = point3D(...multiplyMatrixAndPoint3D(matrix, startPoint));

		const endPoint = [l.end.x, l.end.y, l.end.z, 1];
		const newEndpoint = point3D(...multiplyMatrixAndPoint3D(matrix, endPoint));

		return line(newStartPoint, newEndpoint);
	});

	return datalines;
}

function displayPixels(datalines) {
	clearCanvas();
	for (let l of datalines) {
		DRAWING_TECHNIQUES["bresenham"](l.start, l.end, "black");
	}
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

function multiplyMatrixAndPoint3D(matrix, point) {
	const [a, b, c, d] = matrix[0];
	const [e, f, g, h] = matrix[1];
	const [i, j, k, l] = matrix[2];
	const [m, n, o, p] = matrix[3];

  const [x, y, z, _] = point;

  return [
	  (x * a) + (y * e) + (z * i) + (_ * m),
	  (x * b) + (y * f) + (z * j) + (_ * n),
	  (x * c) + (y * g) + (z * k) + (_ * o),
	  (x * d) + (y * h) + (z * l) + (_ * p)
  ];
}

function multiplyMatricies3D(matrixA, matrixB){
	const [a, b, c, d] = matrixA[0]
	const [e, f, g, h] = matrixA[1]
	const [i, j, k, l] = matrixA[2]
	const [m, n, o, p] = matrixA[3]

	const [q, r, s, t] = matrixB[0]
	const [u, v, w, x] = matrixB[1]
	const [y, z, za, zb] = matrixB[2]
	const [zc, zd, ze, zf] = matrixB[3]

	return [
		[(a*q+b*u+c*y+d*zc), (a*r+b*v+c*z+d*zd), (a*s+b*w+c*za+d*ze), (a*t+b*x+c*zb+d*zf)],
		[(e*q+f*u+g*y+h*zc), (e*r+f*v+g*z+h*zd), (e*s+f*w+g*za+h*ze), (e*t+f*x+g*zb+h*zf)],
		[(i*q+j*u+k*y+l*zc), (i*r+j*v+k*z+l*zd), (i*s+j*w+k*za+l*ze), (i*t+j*x+k*zb+l*zf)],
		[(m*q+n*u+o*y+p*zc), (m*r+n*v+l*z+p*zd), (m*s+n*w+l*za+p*ze), (m*t+n*x+l*zb+p*zf)],
	];
}

function projection(x = 6, y = 8, z = 7.5, d = 60, s = 30) {
	//1) translate
	let t1 = basicTranslate3D(-x, -y, -z)

	//2) rotate about x by 90 degrees
	let t2 = [
	    [1,0,0,0],
	    [0,0,-1,0],
	    [0,1,0,0],
	    [0,0,0,1]
	];

	//3) rotate about y by theta
	let t3a = (y)/(Math.sqrt((x * x) + (y * y)));
	let t3b = (x)/(Math.sqrt((x * x) + (y * y)));
	let t3 = [
	    [-t3a,0,t3b,0],
	    [0,1,0,0],
	    [-t3b,0,-t3a,0],
	    [0,0,0,1]
	];

	//4) rotate about x by alpha
	let t4a = (Math.sqrt(x * x + y * y))/(Math.sqrt(x * x + y * y + z * z));//cos alpha
	let t4b = (z)/(Math.sqrt(x * x + y * y + z * z)); //sin alpha
	let t4 = [
	    [1,0,0,0],
	    [0,t4a,t4b,0],
	    [0,-t4b,t4a,0],
	    [0,0,0,1]
	];

	//5) flip z axis
	let t5 = [
	    [1, 0, 0, 0],
	    [0, 1, 0, 0],
	    [0, 0,-1, 0],
	    [0, 0, 0, 1]
	];

	//6) construct the projection matrix
	let v = [t1, t2, t3, t4, t5].reduce(multiplyMatricies3D)

	//7) multiply by constant n
	let n = [
	    [4,0,0,0],
	    [0,4,0,0],
	    [0,0,1,0],
	    [0,0,0,1]
	];

	const projection = multiplyMatricies3D(v, n)
	return projection;
}

const identity_matrix = [
	[1, 0, 0],
	[0, 1, 0],
	[0, 0, 1]
]

const identity_matrix3D = [
	[1, 0, 0, 0],
	[0, 1, 0, 0],
	[0, 0, 1, 0],
	[0, 0, 0, 1]
]
