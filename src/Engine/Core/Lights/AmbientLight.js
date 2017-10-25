import {Color} from '../Color';
import {Light} from './Light';

class AmbientLight extends Light {
	constructor({color = new Color(), intensity= 1.0} = {}) {
		super({color, intensity});
	}
}
export {AmbientLight};