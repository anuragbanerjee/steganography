// GLOBAL VARIABLES
let canvas;
let context;

// HELPER FUNCTIONS
	const setPixel = (x, y, color="#000000") => {
		if (viewport == null || (
			viewport.bottomLeft.x <= x && x <= viewport.topRight.x &&
			viewport.bottomLeft.y <= y && y <= viewport.topRight.y
		)) {
			context.strokeStyle = color;
			context.strokeRect(x, y, 1, 1);
		}
	}

	const getCurrentTechnique = () => {
		return DRAWING_TECHNIQUES["bresenham"];
	}

	function handleInput(e) {
		const input = e.target.files;
		const reader = new FileReader();
		reader.onload = (e) => {
			const data = reader.result;
			const all_datalines = inputLines(data)
			displayPixels(all_datalines)
			document.querySelector("#output").innerText = data;
		}
		reader.readAsText(input[0]);
	}

	function triggerDownload(data) {
		const blob = new Blob([data]);
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = "export.txt";
		link.click()
	}

	function showCurrentOutput() {
		const output_data = all_datalines.reduce( (a, b) =>  {
			return `${a} ${b.start.x} ${b.start.y} ${b.end.x} ${b.end.y}\n`
		}, "");

		document.querySelector("#output").innerText = output_data;
		return output_data;
	};

// GLOBAL FUNCTIONS
	function main() {
		document.querySelector("#fileSelector").addEventListener("change", handleInput);
		document.querySelector("#export").addEventListener("click", () => {
			const output_data = showCurrentOutput();
			triggerDownload(output_data);
		});
		document.querySelector("#applyTransforms").addEventListener("click", () => {
			const translateX = Number(document.querySelector("#translateX").value) || 0;
			const translateY = Number(document.querySelector("#translateY").value) || 0;
			const translateZ = Number(document.querySelector("#translateZ").value) || 0;

			const scaleSx = Number(document.querySelector("#scaleSx").value) || 1;
			const scaleSy = Number(document.querySelector("#scaleSy").value) || 1;
			const scaleSz = Number(document.querySelector("#scaleSz").value) || 1;
			const scaleCx = Number(document.querySelector("#scaleCx").value) || 0;
			const scaleCy = Number(document.querySelector("#scaleCy").value) || 0;
			const scaleCz = Number(document.querySelector("#scaleCz").value) || 0;

			const rotateAngleX = Number(document.querySelector("#rotateAngleX").value) || 0;
			const rotateAngleY = Number(document.querySelector("#rotateAngleY").value) || 0;
			const rotateAngleZ = Number(document.querySelector("#rotateAngleZ").value) || 0;
			const rotateCx = Number(document.querySelector("#rotateCx").value) || 0;
			const rotateCy = Number(document.querySelector("#rotateCy").value) || 0;
			const rotateCz = Number(document.querySelector("#rotateCz").value) || 0;

			// const viewportX0 = Number(document.querySelector("#viewportX0").value) || 0;
			// const viewportY0 = Number(document.querySelector("#viewportY0").value) || 0;
			// const viewportX1 = Number(document.querySelector("#viewportX1").value) || Number(window.innerWidth);
			// const viewportY1 = Number(document.querySelector("#viewportY1").value) || Number(window.innerHeight);

			console.log("translateX", translateX)
			console.log("translateY", translateY)
			console.log("translateZ", translateZ)
			transformations.push(basicTranslate3D(translateX, translateY, translateZ));

			console.log("scaleSx", scaleSx)
			console.log("scaleSy", scaleSy)
			console.log("scaleSz", scaleSz)
			console.log("scaleCx", scaleCx)
			console.log("scaleCy", scaleCy)
			console.log("scaleCz", scaleCz)
			transformations.push(scale3D(scaleSx, scaleSy, scaleSz, scaleCx, scaleCy, scaleCz));

			console.log("rotateAngleX", rotateAngleX)
			console.log("rotateAngleY", rotateAngleY)
			console.log("rotateAngleZ", rotateAngleZ)
			console.log("rotateCx", rotateCx)
			console.log("rotateCy", rotateCy)
			console.log("rotateCz", rotateCz)
			transformations.push(rotate3D(rotateAngleX, rotateAngleY, rotateAngleZ, rotateCx, rotateCy, rotateCz));

			all_datalines = applyTransformation(transformations.reduce(multiplyMatricies3D, identity_matrix3D), all_datalines);
			projected = applyTransformation(projection(), all_datalines)

			transformations = [];
			showCurrentOutput();

			if (document.querySelector("#projection").checked) {
				displayPixels(projected);
			} else {
				displayPixels(all_datalines);
			}
		});

		// Links context to DOM element
		canvas = document.querySelector("canvas");
		context = canvas.getContext("2d");

		// Fits canvas to screen
		canvas.width  = window.innerWidth;
		canvas.height = window.innerHeight;

		// Set button to clear the canvas
		document.getElementById("clearCanvas").addEventListener("click", () => {
			clearCanvas();
			all_datalines = [];
			displayPixels();
		});

		// Start with empty canvas
		clearCanvas();
	}

	let numberOfSamples = 0;
	function handleGenerateLines() {
		const numberOfLines = parseInt(document.getElementById("numLines").value);
		const technique = getCurrentTechnique();

		generateLines(numberOfLines, technique)

		numberOfSamples++;
		if (numberOfSamples % 5 == 0 && document.getElementById("useTimer").checked) {
			document.getElementById("numLines").value = numberOfLines * 10;
		}

	}

	function generateLines(numberOfLines, draw) {
		let timePassedInMilliseconds = 0;

		let delay = 0;
		const animationDelay = 1;

		setTimeout(() => {
			const timePassedInSeconds = (timePassedInMilliseconds/1000).toFixed(3)

			document.getElementById("timerContainer").style.display = "block";
			document.getElementById("timeEntries").innerHTML = `
				<tr>
					<td>${numberOfLines}</td>
					<td>${timePassedInSeconds}</td>
					<td>${draw.name}</td>
				</tr>
			` + document.getElementById("timeEntries").innerHTML;

			if (parseInt(document.getElementById("numLines").value) <= 100000 &&
				document.getElementById("useTimer").checked) {
				handleGenerateLines();
			}
		}, numberOfLines * animationDelay);

		for (let line = 0; line < numberOfLines; line++) {
			setTimeout(() => {
				const beforeInMilliseconds = (new Date()).getTime();
				draw(getRandomPoint(), getRandomPoint(), getRandomColor());
				const afterInMilliseconds = (new Date()).getTime();
				timePassedInMilliseconds += afterInMilliseconds - beforeInMilliseconds;
			}, delay);
			delay += animationDelay;
		}
	}

	function runTests(draw=getCurrentTechnique()) {
		const w = window.innerWidth;
		const h = window.innerHeight;

		const topRight = point(w, h);
		const bottomRight = point(w, 0);
		const bottomLeft = point(0, 0);
		const topLeft = point(0, h);

		const bottomMid = point(w/2, h);
		const topMid    = point(w/2, 0);
		const leftMid   = point(0, h/2);
		const rightMid  = point(w, h/2)

		const center    = point(w/2, h/2);

		const boxTopLeft = point(center.x - 100, center.y + 250);
		const boxTopRight = point(center.x + 100, center.y + 250);
		const boxBottomRight = point(center.x + 100, center.y - 250);
		const boxBottomLeft = point(center.x - 100, center.y - 250);

		// centered box (tests input commutativity for straight lines)
		// made clockwise from top left
		draw(boxTopLeft, boxTopRight);
		draw(boxTopRight, boxBottomRight);
		draw(boxBottomRight, boxBottomLeft);
		draw(boxBottomLeft, boxTopLeft);

		// steep vertical lines (center box diagonals)
		draw(boxTopLeft, center);
		draw(boxTopRight, center);
		draw(boxBottomRight, center);
		draw(boxBottomLeft, center);

		// diamond (tests input commutativity for angled lines)
		// made counter-clockwise from the top
		draw(topMid, leftMid);
		draw(leftMid, bottomMid);
		draw(bottomMid, rightMid);
		draw(rightMid, topMid);

		// diagonals
		draw(bottomLeft, topRight);
		draw(topLeft,    bottomRight);

		// horizontal lines
		draw(leftMid, rightMid);

		// vertical lines
		draw(topMid, bottomMid);
	}

	function clearCanvas() {
		canvas.width = canvas.width;
	}

// DEV/DEBUG FUNCTIONS
	function showCoordinates(e){
		document.getElementById("coordinates").innerText = `(${e.pageX}, ${window.innerHeight - e.pageY})`;
	}

	let color = getRandomColor();
	let clicks = [];

	function plotMouseClick(e) {
		const x = e.pageX;

		// flip vertically to anchor (0, 0) to bottom left
		const y = window.innerHeight - e.pageY;

		setPixel(x, y, color);
		clicks.push(point(x, y));

		console.log(`clicks: ${JSON.stringify(clicks)}`);

		if (clicks.length == 2) {
			getCurrentTechnique()(clicks[0], clicks[1], color);
			color = getRandomColor();
			clicks = []
		}
	}

// GLOBAL EVENT LISTENERS
document.body.onload = main;
document.onmousemove = showCoordinates;
document.querySelector("canvas").addEventListener("click", plotMouseClick);
