import Matter from './matter';
import _ from 'underscore';
import Visibility from 'visibilityjs';
import decomp from 'poly-decomp';

window.decomp = decomp;

const SHAPEHEIGHT = 20;
const TRIANGLEHEIGHT = 300;
const TRIANGECOUNT = 5;


const clientWidth = document.documentElement.clientWidth;



const COLOURS = [
  '#b6dc62',
  '#575b5b',
  '#c44d58',
  '#4cc9c0'
]

const BGCOL = '#1e1f1f';


const TOTALHEIGHT = TRIANGLEHEIGHT * TRIANGECOUNT + SHAPEHEIGHT

// Matter.js module aliases
var Engine = Matter.Engine,
    World = Matter.World,
    Common = Matter.Common,
    Bodies = Matter.Bodies,
    Composites = Matter.Composites,
    Vertices = Matter.Vertices,
    MouseConstraint = Matter.MouseConstraint;

// create a Matter.js engine
var engine = Engine.create(document.body, {
    render: {
        options: {
            background: BGCOL,
            wireframeBackground: '#222',
            wireframes: false,
        }
    }
});
//engine.world.gravity.x = 0.2;

//setup mouse events
let mouseConstraint = MouseConstraint.create(engine, {
  constraint: {
    render: {
      visible: false
    }
  }
});
let mouse = mouseConstraint.mouse;
mouse.element.removeEventListener('mousewheel', mouse.mousewheel);
mouse.element.removeEventListener('DOMMouseScroll', mouse.mousewheel);
World.add(engine.world, mouseConstraint);

function updateScene() {
	let sceneWidth = document.documentElement.clientWidth;
	let sceneHeight = document.documentElement.clientHeight;

	const boundsMax = engine.world.bounds.max,
	    renderOptions = engine.render.options,
	    canvas = engine.render.canvas;

	boundsMax.x = sceneWidth;
	boundsMax.y = TOTALHEIGHT;

	canvas.width = renderOptions.width = sceneWidth;
	canvas.height = renderOptions.height = TOTALHEIGHT;
}

function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function addShape() {
  const color = randomItem(COLOURS);
	let body = Bodies.circle(
    Common.random(SHAPEHEIGHT, TRIANGLEHEIGHT) + SHAPEHEIGHT,
		Common.random(-50, -100),
		SHAPEHEIGHT, {
      render: {
        fillStyle: color,
        strokeStyle: color
      }
    }
	);
	body.frictionAir = 0.02;
  body.friction = 0.009;
	World.add(engine.world, [body]);
}

function removeShapes() {
  let toRemove = _.filter(engine.world.bodies, (body) => body.position.y > TOTALHEIGHT)
  if (toRemove.length) {
    console.log('Remove shapes:' + toRemove.length)
    World.remove(engine.world, toRemove);
  }
}

World.add(engine.world, [
  Bodies.polygon(340, TRIANGLEHEIGHT, 3, TRIANGLEHEIGHT, { isStatic: true, render: { fillStyle: COLOURS[0], strokeStyle: BGCOL }}),
  Bodies.polygon(150, TRIANGLEHEIGHT * 2, 3, TRIANGLEHEIGHT, { isStatic: true, angle: Math.PI * 0.33, render: { fillStyle: COLOURS[1], strokeStyle: BGCOL }}),
  Bodies.polygon(340, TRIANGLEHEIGHT * 3, 3, TRIANGLEHEIGHT, { isStatic: true, render: { fillStyle: COLOURS[2], strokeStyle: BGCOL }}),
  Bodies.polygon(150, TRIANGLEHEIGHT * 4, 3, TRIANGLEHEIGHT, { isStatic: true, angle: Math.PI * 0.33, render: { fillStyle: COLOURS[3], strokeStyle: BGCOL }}),

  Bodies.rectangle(0, 0, 1, 2300, { isStatic: true }),
  Bodies.rectangle(TRIANGLEHEIGHT + 190, 0, 1, 2300, { isStatic: true }),
]);

function loop() {
	addShape();
	removeShapes();
}

// set initial size
updateScene();

// run the engine
Engine.run(engine);

//spawn and remove shapes
Visibility.every(600, loop);

window.onresize = () => updateScene();
