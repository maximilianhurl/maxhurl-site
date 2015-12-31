import Matter from './matter';
import _ from 'underscore';
import Visibility from 'visibilityjs';
import { randomItem } from './utils';

// Matter.js module aliases
const Engine = Matter.Engine,
    World = Matter.World,
    Common = Matter.Common,
    Bodies = Matter.Bodies,
    Composites = Matter.Composites,
    Vertices = Matter.Vertices,
    MouseConstraint = Matter.MouseConstraint;


export default class CanvasManager {
  constructor(triangleCount, containerId) {

    this.TRIANGLECOUNT = triangleCount;
    this.INITIALWIDTH = 0;
    this.TRIANGLERADIUS = 0;
    this.TRIANGLELENGTH = 0;
    this.TRIANGLEOFFSET = 0;
    this.SHAPEHEIGHT = 0;
    this.TOTALHEIGHT = 0;

    this.COLOURS = [
      '#b6dc62',
      '#575b5b',
      '#c44d58',
      '#4cc9c0',
      '#b6dc62',
      '#575b5b',
      '#c44d58',
      '#4cc9c0',
      '#b6dc62',
      '#575b5b',
      '#c44d58',
      '#4cc9c0'
    ];

    this.BGCOL = '#1e1f1f';

    this.SPAWNTIME = 680;

    this.engine = Engine.create(document.getElementById(containerId), {
        render: {
            options: {
                background: this.BGCOL,
                wireframeBackground: '#222',
                wireframes: false,
            }
        }
    });
  }

  setSizeOptions() {
    this.INITIALWIDTH = Math.min(500, document.documentElement.clientWidth);
    const clientWidth = this.INITIALWIDTH - ((this.INITIALWIDTH/100) * 16);
    this.TRIANGLERADIUS = (clientWidth/100) * 60;
    //length of each side of the triangle
    this.TRIANGLELENGTH = (Math.cos(30 * Math.PI / 180) * this.TRIANGLERADIUS) * 2;
    this.TRIANGLEOFFSET = (clientWidth/100) * 30 + this.TRIANGLERADIUS;
    this.SHAPEHEIGHT = (clientWidth/100) * 5;
    this.TOTALHEIGHT = this.TRIANGLELENGTH * (this.TRIANGLECOUNT / 2) + this.TRIANGLELENGTH/2 + 100;
  }

  addShape() {
    const color = randomItem(this.COLOURS);
    let body = Bodies.circle(
      Common.random(this.TRIANGLEOFFSET, this.TRIANGLERADIUS),
      Common.random(-50, -100),
      this.SHAPEHEIGHT,
      {
        render: {
          fillStyle: color,
          strokeStyle: color
        }
      }
    );
    body.frictionAir = 0.01;
    body.friction = 0.008;
    World.add(this.engine.world, [body]);
  }

  removeShapes() {
    let toRemove = _.filter(this.engine.world.bodies, (body) => body.position.y > this.TOTALHEIGHT)
    if (toRemove.length) {
      World.remove(this.engine.world, toRemove);
    }
  }

 addTriangles() {
    const bodies = _.map(_.range(this.TRIANGLECOUNT), (index) => {

      const renderOpts = { fillStyle: this.COLOURS[index], strokeStyle: this.BGCOL };

      if (index % 2) {
        //left side triangle
        return Bodies.polygon(
          this.TRIANGLERADIUS/2,
          Math.ceil(index/2) * this.TRIANGLELENGTH,
          3,
          this.TRIANGLERADIUS,
          {
            isStatic: true,
            angle: Math.PI * 0.33,
            render: renderOpts
          }
        );

      } else {
        //right side triangle
        return Bodies.polygon(
          this.TRIANGLEOFFSET,
          (index/2) * this.TRIANGLELENGTH + (this.TRIANGLELENGTH/2),
          3,
          this.TRIANGLERADIUS,
          {
            isStatic: true,
            render: renderOpts
          }
        );
      }
    });
    World.add(this.engine.world, bodies);
  }

  addBorders() {
    //add invisible borders
    const borderOpts = { isStatic: true, render: {fillStyle: 'transparent', strokeStyle: 'transparent'}};
    World.add(this.engine.world, [
      Bodies.rectangle(
        this.SHAPEHEIGHT * 2.7, 0, 1,this. TRIANGLELENGTH * (this.TRIANGLECOUNT + 1), borderOpts
      ),
      Bodies.rectangle(
        this.TRIANGLELENGTH + 2, 0, 1, this.TRIANGLELENGTH * (this.TRIANGLECOUNT), borderOpts
      ),
    ]);
  }

  updateScene() {
    //clear canvas
    World.clear(this.engine.world);
    Engine.clear(this.engine);
    var renderController = this.engine.render.controller;
    if (renderController.clear) {
      renderController.clear(enging.render);
    }

    //resize canvas
    this.setSizeOptions();

    const boundsMax = this.engine.world.bounds.max,
        renderOptions = this.engine.render.options,
        canvas = this.engine.render.canvas;

    boundsMax.y = canvas.width = renderOptions.width = this.INITIALWIDTH;
    boundsMax.y = canvas.height = renderOptions.height = this.TOTALHEIGHT;

    //add background shapes
    this.addTriangles();
    this.addBorders();
  }

  render() {
    // run the engine
    Engine.run(this.engine);

    // set initial size
    this.updateScene();

    //spawn and remove shapes
    Visibility.every(this.SPAWNTIME, () => {
      this.addShape();
      this.removeShapes();
    });

    window.onresize = () => this.updateScene();
  }
}