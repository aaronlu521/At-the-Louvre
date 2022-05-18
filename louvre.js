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
        
        this.shapes = {
            wall: new Square(),
        }

        this.materials = {
            // wall_material: new Material(new defs.Phong_Shader(),
            //   { ambient: 0.1, diffusivity: 0.9, color: hex_color("#ffffff") }),

            texture_floor: new Material(new Textured_Phong(), {
                color: hex_color("#ffffff"),
                ambient: 0.1, diffusivity: 1, specularity: 0.1,
                texture: new Texture("assets/floor.jpg")
            }),

            texture_ceiling: new Material(new Textured_Phong(), {
                color: hex_color("#ffffff"),
                ambient: 0.1, diffusivity: 1, specularity: 0.1,
                texture: new Texture("assets/ceiling.jpg")
            }),

            texture_wall: new Material(new Textured_Phong(), {
                color: hex_color("#ffffff"),
                ambient: 0.1, diffusivity: 1, specularity: 0.1,
                texture: new Texture("assets/wall.jpg")
            }),

             //painting textures
            texture_painting1: new Material(new Textured_Phong(), {
                color: hex_color("#ffffff"),
                ambient: 0.1, diffusivity: 0.5, specularity: 0.1,
                texture: new Texture("assets/monalisa.jpg")
            }),
        };
        
        this.initial_camera_location = Mat4.look_at(vec3(-10,3,0),vec3(0,1,0).times(Mat4.rotation(- Math.PI / 2, 1, 0, 0)));
    }

    getEyeLocation(program_state) {
        center = program_state.camera_transform.times(vec4(0, 0, 0, 1));
        return center;
    }
    
    lightToCamera(program_state) {
        const light_position = this.getEyeLocation(program_state);
        program_state.lights = [new Light(light_position, color(1,1,1,1), 1000)];
    }
    
    display(context, program_state) {
        this.lightToCamera(program_state);
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

    createRoom(context, program_state, model_transform) {
        let floor_transform = model_transform.times(Mat4.scale(20,20,20));
        this.shapes.wall.draw(context, program_state, floor_transform, this.materials.texture_floor);

        let ceiling_transform = floor_transform.times(Mat4.translation(0,1,1)).times(Mat4.rotatioon(Math.PI/2, 1, 0, 0))
        this.shapes.wall.draw(context, program_state, ceiling_transform, this.materials.texture_ceiling);

        let wall1_transform = floor_transform.times(Mat4.translation(2, 0, 1))
            .times(Mat4.rotation(-Math.PI / 2, 0, 1, 0))
            .times(Mat4.translation(0,0,1))
        this.shapes.wall.draw(context, program_state, wall1_transform, this.materials.texture_wall);

        let wall2_transform = floor_transform.times(Mat4.translation(-2,0,1)).times(Mat4.rotation(Math.PI /2, 0, 1, 0)).times(Mat4.translation(0,0,1));
        this.shapes.wall.draw(context, program_state, wall2_transform, this.materials.texture_wall);

        let wall3_transform = floor_transform.times(Mat4.translation(0,2,1)).times(Mat4.rotation(Math.PI/2, 1, 0, 0)).times(Mat4.translation(0,0,1));
        this.shapes.wall.draw(context, program_state, wall3_transform, this.materials.texture_wall);

        let wall4_transform = floor_transform.times(Mat4.translation(0,-2,1)).times(Mat4.rotation(Math.PI/2, 1, 0, 0)).times(Mat4.translation(0,0,1));
        this.shapes.wall.draw(context, program_state, wall4_transform, this.materials.texture_wall);

    }


    
    display(context, program_state){
        super.display(context, program_state);
        let model_transform = Mat4.identity();
        // program_state.lights = [new Light(vec4(0,1,1,0), color(1,1,1,1), 1000000)];
        // program_state.set_camera(Mat4.look_at(...Vector.cast([0, 0, 4], [0,0,0], [0,1,0])));
        program_state.set_camera(this.initial_camera_location);
        this.createRoom(context, program_state, model_transform);
        this.createPieces(context, program_state, model_transform);
    }
    
}