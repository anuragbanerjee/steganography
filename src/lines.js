function simple (pointA, pointB, color) {
	pointA = Object.assign({}, pointA);
	pointB = Object.assign({}, pointB);

	rise = pointB.y - pointA.y; // change in y
	run  = pointB.x - pointA.x; // change in x
	m = rise/run; // slope between the lines

	// y-intercept, calculated from y = mx + b
	b = pointA.y - m * pointA.x;

	// handles when user clicks same point twice -> slope = 0/0 = NaN
	if (m == NaN) {
		return;
	}

	// console.log(`Drawing line from (${pointA.x}, ${pointA.y}) to (${pointB.x}, ${pointB.y}). Slope = ${m}. Method = simple.`);

	/*
		HORIZONTAL LINES
	*/

	// ensures pointA has the lowest x value
	// to makes input points commutative
	if (pointA.x > pointB.x) {
		[pointA, pointB] = [pointB, pointA];
	}

	// handles straight and angled horizontal lines
	if (-1 < m && m < 1) {
		// loops through intermediary x values between
		// pointA and pointB and activates pixels using
		// the simple line formula
		for (let x = pointA.x; x < pointB.x; x++) {
			y = m * x + b;
			setPixel(x, y, color);
		}

		return;
	}

	/*
		VERTICAL LINES
	*/

	// ensures pointA has the lowest y values
	// to makes input points commutative
	if (pointA.y > pointB.y) {
		[pointA, pointB] = [pointB, pointA];
	}


	// handles straight vertical lines
	if (m == Infinity || m == -Infinity) {
		x = pointA.x; // no need to calculate bc both x values are same
		y = pointA.y;
		while (y <= pointB.y) {
			setPixel(x, y);
			y++;
		}

		return;
	}

	// handles angled vertical lines
	else {
		// loops through intermediary y values between
		// pointA and pointB and activates pixels using
		// the simple line formula
		for (let y = pointA.y; y < pointB.y; y++) {
			x = (y - b) / m
			setPixel(x, y, color);
		}

		return;
	}
}

function bresenham (pointA, pointB, color){
	pointA = Object.assign({}, pointA);
	pointB = Object.assign({}, pointB);

	console.log(`Drawing line from (${pointA.x}, ${pointA.y}) to (${pointB.x}, ${pointB.y}). Method = Bresenham.`);

	const run  = Math.abs(pointB.x - pointA.x);
	const rise = Math.abs(pointB.y - pointA.y);

	let error;

	// straight lines are handled the same as simple technique
	if (run === 0 || rise === 0) {
		// console.log(`Straight line detected, deferring to simple technique`);
		simple(pointA, pointB, color);
		return;
	}

	// angled horizonal lines
	else if (run > rise) {
		error = run/2;

		// ensures pointA has the lowest x value
		// to makes input points commutative
		if (pointA.x > pointB.x) {
			[pointA, pointB] = [pointB, pointA];
		}

		const shiftX = pointA.x < pointB.x ? 1 : -1;
		const shiftY = pointA.y < pointB.y ? 1 : -1;

		for(let x = pointA.x; x < pointB.x; x++) {
			setPixel(pointA.x, pointA.y, color);

			if (error > -run) {
				error -= rise;
				pointA.x += shiftX;
			}

			if (error < rise) {
				error += run;
				pointA.y += shiftY;
			}
		}
	}

	// angled vertical lines
	else {
		error = -rise/2;

		// ensures pointA has the lowest y value
		// to makes input points commutative
		if (pointA.y > pointB.y) {
			[pointA, pointB] = [pointB, pointA];
		}

		const shiftX = pointA.x < pointB.x ? 1 : -1;
		const shiftY = pointA.y < pointB.y ? 1 : -1;


		for(let y = pointA.y; y < pointB.y; y++) {

			setPixel(pointA.x, pointA.y, color);

			if (error > -run) {
				error -= rise;
				pointA.x += shiftX;
			}

			if (error < rise) {
				error += run;
				pointA.y += shiftY;
			}
		}
	}
}

DRAWING_TECHNIQUES = {
	simple, bresenham
}
