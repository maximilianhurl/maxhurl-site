import Matter from './matter';
import _ from 'underscore';
import Visibility from 'visibilityjs';
import vectorizeText from 'vectorize-text';
import decomp from 'poly-decomp';

window.decomp = decomp;

const SHAPEHEIGHT = 5;

// Matter.js module aliases
var Engine = Matter.Engine,
    World = Matter.World,
    Common = Matter.Common,
    Bodies = Matter.Bodies,
    Composites = Matter.Composites,
    Vertices = Matter.Vertices;

// create a Matter.js engine
var engine = Engine.create(document.body, {
    render: {
        options: {
            background: '#fafafa',
            wireframeBackground: '#222',
            wireframes: false,
        }
    }
});
engine.world.gravity.x = 0.16;
engine.world.gravity.y = 0.8;


function updateScene() {

	let sceneWidth = document.documentElement.clientWidth;
	let sceneHeight = document.documentElement.clientHeight;

	const boundsMax = engine.world.bounds.max,
	    renderOptions = engine.render.options,
	    canvas = engine.render.canvas;

	boundsMax.x = sceneWidth + SHAPEHEIGHT;
	boundsMax.y = sceneHeight + SHAPEHEIGHT;

	canvas.width = renderOptions.width = sceneWidth;
	canvas.height = renderOptions.height = sceneHeight;
}

function addShape() {
	let body = Bodies.circle(
		Common.random(-100, document.documentElement.clientWidth - 100),
		Common.random(-50, -100),
		SHAPEHEIGHT
	);
	body.frictionAir = 0.07
	World.add(engine.world, [body]);
}

function removeShapes() {
	let clientHeight = document.documentElement.clientHeight;
  let toRemove = _.filter(engine.world.bodies, (body) => body.position.y > clientHeight)
  if (toRemove) {
    World.remove(engine.world, toRemove);
  }
}

function loop() {
	addShape();
	removeShapes();
}


function addText(letter, index) {

  var polygons = vectorizeText(letter, {
    polygons: true,
    width: 40,
    font: 'arial',
    textBaseline: "bottom"
  })

  let verticies = _.map(polygons[0][0], (vertice) => {
    return {x:vertice[0], y:vertice[1]}
  });


  let body = Bodies.fromVertices(100 + (index * 50), 100, verticies, {
    render: {
      fillStyle: '#4ECDC4',
      strokeStyle: '#4ECDC4'
    },
    isStatic: true
  }, true)

  World.add(engine.world, body);
}

// set initial size
updateScene();

_.each(['H', 'A', 'P', 'P', 'Y'], (letter, index) => { addText(letter, index) })
//_.each(['C', 'H', 'R', 'I', 'S', 'T', 'M', 'A', 'S'], (letter, index) => { addText(letter, index) })

// run the engine
Engine.run(engine);

//spawn and remove shapes
Visibility.every(500, loop);

window.onresize = () => updateScene();
