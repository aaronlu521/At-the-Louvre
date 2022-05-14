import { defs, tiny } from './examples/common.js';
import { Shape_From_File } from './examples/obj-file-demo.js';
// Pull these names into this module's scope for convenience:
const { vec3, vec4, Vector, color, hex_color, Mat4, Light, Shape, Material, Shader, Texture, Scene } = tiny;
const { Triangle, Square, Tetrahedron, Torus, indmill, Cube, Subdivision_Sphere, Cylindrical_Tube, Textured_Phong, Textured_Phong_text, Phong_Shader } = defs;

export class Louvre_Base extends Scene  {
    constructor() {
        super();

        this.startGame = false;
        this.endGame = false;
        this.allPiecesFound = false;


    }
}

export class Louvre extends Louvre_Base {
    createPiecesInside(context, program_state, model_transform) {
        let t = program_state.animation_time / 1000, dt = program_state.animation_delta_time / 1000;
    }
}