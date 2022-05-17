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
        
        this.materials = {
            wall_material: new Material(new defs.Phong_Shader(),
              { ambient: 0.1, diffusivity: 0.9, color: hex_color("#ffffff") }),

      
             //painting textures
            texture_painting1: new Material(new Textured_Phong(), {
                color: hex_color("#ffffff"),
                ambient: 0.1, diffusivity: 0.5, specularity: 0.1,
                texture: new Texture("assets/monalisa.jpg")
            }),
        };
        
        this.initial_camera_location = Mat4.look_at(vec3(-10,3,0),vec3(0,1,0).times(Mat4.rotation(- Math.PI / 2, 1, 0, 0)));
    }
}

export class Louvre extends Louvre_Base {
    // Create art pieces inside the louvre
    createPieces(context, program_state, model_transform) {
        let t = program_state.animation_time / 1000, dt = program_state.animation_delta_time / 1000;
        
        let painting1_model_transform = model_transform.times(Mat4.translation(19.5, 0, 9)).times(Mat4.rotation(Math.PI / 2, 1, 0, 0)).times(Mat4.scale(0.1, 4, 3));

        // Draw
        this.shapes.cube.draw(context, program_state, painting1_model_transform, this.materials.texture_painting1);

    }
}