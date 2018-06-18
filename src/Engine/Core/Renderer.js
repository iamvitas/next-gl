import twgl from 'twgl-base.js';

class Renderer {
	constructor({gl}) {
		this._context = gl.context;

		this._glDepthTest = this._context.getParameter(this._context.DEPTH_TEST);
		this._glCullFace = this._context.getParameter(this._context.CULL_FACE);
	}

	drawScene(scene, camera, target = null) {
		if (target) { // render to texture
			this._context.enable(this._context.DEPTH_TEST);
			this._context.viewport(0, 0, target.width, target.height);
			target.bindFrameBuffer();
		}

		this._context.clear(this._context.COLOR_BUFFER_BIT | this._context.DEPTH_BUFFER_BIT);
		this._renderShadowRT(scene);

		this._context.bindFramebuffer(this._context.FRAMEBUFFER, null);
		scene._update(camera);

		this._renderObjects(scene);
	}

	_renderShadowRT(scene) {
		this._context.enable(this._context.DEPTH_TEST);

		for (const shadowRT of scene.shadowRT) {
			shadowRT.shadowMap.bindFrameBuffer();
			scene._update(shadowRT.shadowCamera);
			this._context.clear(this._context.COLOR_BUFFER_BIT | this._context.DEPTH_BUFFER_BIT);
			this._renderObjects(scene, true);
		}
	}

	_renderObjects(scene, shadowPass = false) {
		if (!shadowPass) {
			this._context.disable(this._context.BLEND);
			this._context.enable(this._context.DEPTH_TEST);
		}

		this._render(scene, scene.renderList.get('opaque'));

		if (!shadowPass) {
			this._context.enable(this._context.BLEND);
			this._context.disable(this._context.DEPTH_TEST);
		}

		this._render(scene, scene.renderList.get('transparent'));
	}

	_render(scene, renderList) {
		for (const [program, renderable] of renderList.entries()) {
			scene._bindUBOByMaterial(renderable.material);

			this._context.useProgram(program);

			for (const sceneObject of renderable.sceneObjects) {
				if (!sceneObject.visible) continue;

				this._context.blendFunc(this._context.SRC_ALPHA, this._context.ONE); // todo from material
				this._depthTest(sceneObject.material.depthTest);
				this._useFaceCulluing(sceneObject.material.isDoubleSided);

				this._context.bindVertexArray(sceneObject.vao);

				this._updateRenderableUniforms(sceneObject, {normalMatrix: sceneObject.normalMatrix, modelWorldMatrix: sceneObject.worldMatrix});

				twgl.drawBufferInfo(this._context, sceneObject.bufferInfo);
			}
		}
	}


	_updateRenderableUniforms(renderObject, {normalMatrix, modelWorldMatrix}) {
		renderObject.material.uniforms.uNormalMatrix = normalMatrix;
		renderObject.material.uniforms.uModelWorldMatrix = modelWorldMatrix;

		twgl.setUniforms(renderObject.material.programInfo.uniformSetters, renderObject.material.uniforms);
	}

	_depthTest(useDepthTest) {
		if (this._glDepthTest === useDepthTest) return;

		this._glDepthTest = useDepthTest;
		useDepthTest ? this._context.enable(this._context.DEPTH_TEST) : this._context.disable(this._context.DEPTH_TEST);
	}

	_useFaceCulluing(isDoubleSided) {
		if (this._glCullFace === isDoubleSided) return;

		this._glCullFace = isDoubleSided;
		isDoubleSided ? this._context.disable(this._context.CULL_FACE) : this._context.enable(this._context.CULL_FACE);
	}


	_shouldBeFrustrumCulled(viewProjection, objectPosition) {

	}
}
export {Renderer};
