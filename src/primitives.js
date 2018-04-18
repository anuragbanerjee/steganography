// creates simple (x, y) objects
const point = (x, y) => Object.seal({x, y});
const point3D = (x, y, z) => Object.seal({x, y, z});

const getRandomPoint = () => {
  const x = parseInt(Math.random() * window.innerWidth);
  const y = parseInt(Math.random() * window.innerHeight);
  return point(x, y);
};

const getRandomColor = () => {
  const r = parseInt(Math.random() * 255);
  const g = parseInt(Math.random() * 255);
  const b = parseInt(Math.random() * 255);

  return `rgb(${r}, ${g}, ${b})`;
};

const line = (pointA, pointB) => Object.seal({
	start: pointA,
	end: pointB
});
