(function () {
	let binary = [];

	const canvas = document.querySelector("canvas");
	const context = canvas.getContext("2d");

	function decode(binary=null) {
		Array.prototype.chunk = function (chunk_size) {
		    var index = 0;
		    var arrayLength = this.length;
		    var tempArray = [];
		    
		    for (index = 0; index < arrayLength; index += chunk_size) {
		        myChunk = this.slice(index, index+chunk_size);
		        tempArray.push(myChunk);
		    }

		    return tempArray;
		}

		let decoded_message = [...binary]
			// ignores transparency bytes (every 4th value)
			.filter((x, i) => (i + 1) % 4 != 0)

			 // gather last bits from bytes
			.map(x => x % 2)
			
			// group bits into a byte
			.chunk(8)
		    .map(x => x.join(""))
		    .map(x => parseInt(x, 2))

		    // interpret bytes as ascii code
			.map(x => String.fromCharCode(x))
		    .join("");

	    const END_SYMBOL = String.fromCharCode(4);
		let message_end = decoded_message.indexOf(END_SYMBOL);
		decoded_message = decoded_message.slice(0, message_end);

		return decoded_message;
	}

	function encode(message) {
		let messageBits = message.split("")
			.map(c => c.charCodeAt())
			.map(x => x.toString(2).padStart(8, "0"))
			.map(x => x.split(""))
			.reduce((a, b) => a.concat(b), [])
			.concat((4).toString(2).padStart(8, "0").split("")); // end message symbol

		let encodedBytes = [...binary]
			.map((b, i) => { // encode message into the rgb bits
				if ((i + 1) % 4 == 0) { // transparency bits are unchanged
					return b;
				}

				let messageIndexOffset = parseInt((i + 1) / 4);
				return encodeBitInNum(b, messageBits[i - messageIndexOffset])
			});

		let encodedImg = context.createImageData(img.naturalWidth, img.naturalHeight);
		encodedBytes.forEach((byte, index) => encodedImg.data[index] = byte);
		saveImageData(encodedImg, message.replace(" ", "_"));
		return [...encodedImg.data];
	}

	function encodeBitInNum(num, bit) {
		if (bit == undefined) {
			return num;
		}

		// correct bit is already encoded
		if (num % 2 == bit) {
			return num;
		}

		else {
			// encode a 1
			if (num % 2 == 0 && bit == 1) {
				return num + 1;
			}

			// encode a 0
			else {
				return num - 1;
			}
		}
	}

	function saveImageData(imgdata, name){
		const a = document.createElement("a");
		document.body.appendChild(a);
		a.style = "display: none";

		createImageBitmap(imgdata).then((bm) => {
			context.drawImage(bm, 0, 0);

			const url = context.canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
			a.download = `${name}.png`;
			a.href = url
			a.click();

			window.URL.revokeObjectURL(url);
			a.remove();

			console.log("ENCODED IMAGE:", imgdata.data.slice(0, 5));
		});
	}

	function clearCanvas() {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		document.querySelector("#fileSelector").value = null;
	}

	function handleInput(e) {
		const input = e.target.files;
		const reader = new FileReader();
		
		reader.onloadend = (e) => {
			let data = reader.result;
			data = new Int8Array(data)

			var blob = new Blob([data], {type: 'image/png'});
			var url = URL.createObjectURL(blob);
			var img = new Image();

			window.img = img

			img.onload = function() {
				console.log(`blob: ${blob}`);
				console.log(`url: ${url}`);
				console.log(`img: ${img}`);
				canvas.width = img.naturalWidth;
				canvas.height = img.naturalHeight;
		        context.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);
		        URL.revokeObjectURL(url);

		        binary = context.getImageData(0, 0, img.naturalWidth, img.naturalHeight).data;
		        window.binary = binary;
		    }
		    img.src = url;
		}

		reader.readAsArrayBuffer(input[0]);
	}

	document.querySelector("#fileSelector").addEventListener("change", handleInput);
	document.querySelector("#encode").addEventListener("click", (e) => {
		let message = document.querySelector("#message").value;
		document.querySelector("#message").value = "Encoding...";
		encode(message)
		document.querySelector("#message").value = "";
	});

	document.querySelector("#decode").addEventListener("click", (e) => {
		document.querySelector("#message").value = "Decoding...";
		document.querySelector("#message").value = decode(binary);
	});

	document.querySelector("#clear").addEventListener("click", () => {
		document.querySelector("#message").value = "";
		clearCanvas();
	});
})()
