import {GL} from '../Engine/Core/GL';
import {Renderer} from '../Engine/Core/Renderer';
import {Scene} from '../Engine/Core/Scene';

import {Cube} from '../Engine/Primitives/Cube/Cube';

class FirstExample {
	constructor(domElement) {
		this._domElement = domElement;
		this._lastDT = 0;

		this.gl = new GL(this._domElement);
		this.scene = new Scene();
		this.renderer = new Renderer({glContext: this.gl.glContext, scene: this.scene});

		const cube = new Cube(this.gl);
		cube.position = {x: 0, y: 0, z: -8};
		this.scene.addToScene(cube);

		const cube2 = new Cube(this.gl);
		cube2.position = {x: 5, y: 0, z: -8};
		this.scene.addToScene(cube2);

		const cube3 = new Cube(this.gl);
		cube3.position = {x: -5, y: 0, z: -8};
		this.scene.addToScene(cube3);



		this.cubes = [cube, cube2, cube3];

		this.renderFunc = this.render.bind(this);

		requestAnimationFrame(this.renderFunc);
	}

	render(dt) {
		this.gl.resize();
		dt *= 0.001;
		const deltaTime = dt - this._lastDT;
		this._lastDT = dt;
		for (let [index, cube] of this.cubes.entries()) {

			cube.rotate({x: 0, y: 1, z: 0}, deltaTime);
			cube.rotate({x: 1, y: 0, z: 1}, deltaTime * 0.2 * index);
		}

		this.renderer.drawScene();
		requestAnimationFrame(this.renderFunc);
	}

}
export {FirstExample};