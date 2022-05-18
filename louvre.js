import { defs, tiny } from './examples/common.js';
import { Shape_From_File } from './examples/obj-file-demo.js';
import { Text_Line } from './examples/text-demo.js';
// Pull these names into this module's scope for convenience:
const { vec3, vec4, Vector, color, hex_color, Mat4, Light, Shape, Material, Shader, Texture, Scene } = tiny;
const { Triangle, Square, Tetrahedron, Torus, indmill, Cube, Subdivision_Sphere, Cylindrical_Tube, Textured_Phong, Textured_Phong_text, Phong_Shader } = defs;

export class Louvre_Base extends Scene  {
    constructor() {
        super();

        this.startGame = false;
        this.pauseGame = false;
        this.endGame = false;
        this.allPiecesFound = false;
        this.currentGameTime = 60;
        this.gameDuration = 60;
        this.timeUpdated = false;

        this.torus_speend = -2;
        this.torus_Y = 0;
        // status
        this.won = false;

        this.shapes = {
            cube: new Cube(),
            wall: new Square(),
            text: new Text_Line(35),
            torus: new defs.Torus(3, 15),
			cylinder: new defs.Capped_Cylinder(8, 8),
        };

        this.pieceFound = {
            "Find the following": true,
            "s": false,
        };



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
			
			texture_painting2: new Material(new Textured_Phong(), {
                color: hex_color("#ffffff"),
                ambient: 0.1, diffusivity: 0.5, specularity: 0.1,
                texture: new Texture("assets/Sunflowers.jpg")
            }),
			
			texture_painting3: new Material(new Textured_Phong(), {
                color: hex_color("#ffffff"),
                ambient: 0.1, diffusivity: 0.5, specularity: 0.1,
                texture: new Texture("assets/StarryNight.jpg")
            }),

            start_background: new Material(new Phong_Shader(), {
                color: color(0, 0.5, 0.5, 1), ambient: 0,
                diffusivity: 0, specularity: 0, smoothness: 20
            }),
            time_background: new Material(new Phong_Shader(), {
                color: color(161, 31, 31, 1), ambient: 0,
                diffusivity: 0, specularity: 0.3, smoothness: 50
            }),
            cube_material: new Material(new defs.Phong_Shader(),
                { ambient: 0.1, diffusivity: 1, specularity: 0.5, color: hex_color("#0398FC") }),

            text_image: new Material(new Textured_Phong(1), {
                ambient: 1, diffusivity: 0, specularity: 0,
                texture: new Texture("assets/text.png")
            }),
            text_image_screen: new Material(new Textured_Phong(1), {
                ambient: 1, diffusivity: 0, specularity: 0,
                texture: new Texture("assets/wall.jpg")
            }),
			
			cylinder_material: new Material(new defs.Phong_Shader(), {
				ambient: 0.1, diffusivity: 1, specularity: 0.5, color: hex_color("#43464B")
			}),
        };
        
        this.initial_camera_location = Mat4.look_at(vec3(-10,3,0),vec3(0,3,0),vec3(0,1,0)).times(Mat4.rotation(- Math.PI / 2, 1, 0, 0));
    }

    make_control_panel() {
        this.control_panel.innerHTML += "Game Control Panel: ";
        this.new_line(); this.new_line();

        // start
        this.key_triggered_button("Start Game", ["Control", "s"], ()=> {
            this.startGame = true;
        });
        this.new_line(); this.new_line();

        // pause
        this.key_triggered_button("Pause Game", ["Control", "p"], () => {
            if (this.startGame && !this.endGame) {
                this.pauseGame = !this.pauseGame;
            }
        });
        this.new_line(); this.new_line();

        // restart
        this.key_triggered_button("Restart Game", ["Control", "r"], () => {
            this.reset();
        });
        this.new_line(); this.new_line();

        this.key_triggered_button("Return To Initial Position", ["Control", "k"], () => this.attached = () => this.initial_camera_location);
    }

    reset() {
        for (var key in this.pieceFound) {
            if (this.pieceFound.hasOwnProperty(key)) {
                if (key != 'Find the following') {
                    this.pieceFound[key] = false;
                }
            }
        }
        this.startGame = false;
        this.pauseGames = false;
        this.endGame = false;
        this.allPiecesFound = false;
        this.won = false;
        this.timeUpdated = false;
        this.currentGameTime = 60;
    }

    getEyeLocation(program_state) {
        const V = vec4(0,0,0,1);
        const center = program_state.camera_transform.times(V);
        return center;
    }
    
    lightToCamera(program_state) {
        const light_position = this.getEyeLocation(program_state);
        program_state.lights = [new Light(light_position, color(1,1,1,1), 1000)];
    }
    
    display(context, program_state) {
        if (!context.scratchpad.controls) {
          this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
          program_state.set_camera(this.initial_camera_location);
        } 
        else {
          if (this.attached) {
            if (this.attached().equals(this.initial_camera_location)) {
              program_state.set_camera(this.initial_camera_location);
            }
          }
        }
        program_state.projection_transform = Mat4.perspective(Math.PI / 4, context.width / context.height, 1, 100);
        const t = this.t = program_state.animation_time / 1000;
        this.lightToCamera(program_state);
      }
}

export class Louvre extends Louvre_Base {
    // Create art pieces inside the louvre
    createPieces(context, program_state, model_transform) {
        let t = program_state.animation_time / 1000, dt = program_state.animation_delta_time / 1000;
		
        let painting1_model_transform = model_transform
			.times(Mat4.translation(10, 10, 7))
			.times(Mat4.rotation(0.5 * Math.sin(t) * Math.cos(t), 1, 0, 0))
			.times(Mat4.rotation(Math.PI/2, 1, 0, 0))
			.times(Mat4.scale(0.1, 3, 2));
        this.shapes.cube.draw(context, program_state, painting1_model_transform, this.materials.texture_painting1);
		
		let painting2_model_transform = model_transform
			.times(Mat4.translation(-10, -10, 7))
			.times(Mat4.rotation(0.5 * Math.sin(t) * Math.cos(t), 1, 0, 0))
			.times(Mat4.rotation(Math.PI/2, 1, 0, 0))
			.times(Mat4.scale(0.1, 3, 2));
        this.shapes.cube.draw(context, program_state, painting2_model_transform, this.materials.texture_painting2);
		
		let painting3_model_transform = model_transform
			.times(Mat4.translation(-10, 10, 7))
			.times(Mat4.rotation(0.5 * Math.sin(t) * Math.cos(t), 1, 0, 0))
			.times(Mat4.rotation(Math.PI/2, 1, 0, 0))
			.times(Mat4.scale(0.1, 3, 2));
        this.shapes.cube.draw(context, program_state, painting3_model_transform, this.materials.texture_painting3);
    }
	
	// Create the pedestals for the paintings to be rotating about
	createPedestals(context, program_state, model_transform){
		// Pedestal 1
		// Transform + Draw for pedestal tip
		let cylinder_model_transform_tip1 = model_transform
			.times(Mat4.translation(10, 10, 3))
			.times(Mat4.scale(1, 1, 1))
		this.shapes.cylinder.draw(context, program_state, cylinder_model_transform_tip1, this.materials.cylinder_material)
		
		// Transform + Draw for pedestal body
		let cylinder_model_transform_body1 = model_transform
			.times(Mat4.translation(10, 10, 2))
			.times(Mat4.scale(2, 2, 1))
		this.shapes.cylinder.draw(context, program_state, cylinder_model_transform_body1, this.materials.cylinder_material)
		
		// Transform + Draw for pedestal end
		let cylinder_model_transform_end1 = model_transform
			.times(Mat4.translation(10, 10, 1))
			.times(Mat4.scale(3, 3, 1))
		this.shapes.cylinder.draw(context, program_state, cylinder_model_transform_end1, this.materials.cylinder_material)
		
		// Pedestal 2
		// Transform + Draw for pedestal tip
		let cylinder_model_transform_tip2 = model_transform
			.times(Mat4.translation(-10, -10, 3))
			.times(Mat4.scale(1, 1, 1))
		this.shapes.cylinder.draw(context, program_state, cylinder_model_transform_tip2, this.materials.cylinder_material)
		
		// Transform + Draw for pedestal body
		let cylinder_model_transform_body2 = model_transform
			.times(Mat4.translation(-10, -10, 2))
			.times(Mat4.scale(2, 2, 1))
		this.shapes.cylinder.draw(context, program_state, cylinder_model_transform_body2, this.materials.cylinder_material)
		
		// Transform + Draw for pedestal end
		let cylinder_model_transform_end2 = model_transform
			.times(Mat4.translation(-10, -10, 1))
			.times(Mat4.scale(3, 3, 1))
		this.shapes.cylinder.draw(context, program_state, cylinder_model_transform_end2, this.materials.cylinder_material)
		
		// Pedestal 3
		// Transform + Draw for pedestal tip
		let cylinder_model_transform_tip3 = model_transform
			.times(Mat4.translation(-10, 10, 3))
			.times(Mat4.scale(1, 1, 1))
		this.shapes.cylinder.draw(context, program_state, cylinder_model_transform_tip3, this.materials.cylinder_material)
		
		// Transform + Draw for pedestal body
		let cylinder_model_transform_body3 = model_transform
			.times(Mat4.translation(-10, 10, 2))
			.times(Mat4.scale(2, 2, 1))
		this.shapes.cylinder.draw(context, program_state, cylinder_model_transform_body3, this.materials.cylinder_material)
		
		// Transform + Draw for pedestal end
		let cylinder_model_transform_end3 = model_transform
			.times(Mat4.translation(-10, 10, 1))
			.times(Mat4.scale(3, 3, 1))
		this.shapes.cylinder.draw(context, program_state, cylinder_model_transform_end3, this.materials.cylinder_material)
	}

    createRoom(context, program_state, model_transform) {
        let floor_transform = model_transform
			.times(Mat4.scale(20,20,20));
        this.shapes.wall.draw(context, program_state, floor_transform, this.materials.texture_floor);

        let ceiling_transform = floor_transform
			.times(Mat4.translation(0,0,2))
			.times(Mat4.rotation(Math.PI, 1, 0, 0))
        this.shapes.wall.draw(context, program_state, ceiling_transform, this.materials.texture_ceiling);

        let wall1_transform = floor_transform.times(Mat4.translation(2, 0, 1))
            .times(Mat4.rotation(-Math.PI / 2, 0, 1, 0))
            .times(Mat4.translation(0,0,1))
        this.shapes.wall.draw(context, program_state, wall1_transform, this.materials.texture_wall);

        let wall2_transform = floor_transform
			.times(Mat4.translation(-2,0,1))
			.times(Mat4.rotation(Math.PI /2, 0, 1, 0))
			.times(Mat4.translation(0,0,1));
        this.shapes.wall.draw(context, program_state, wall2_transform, this.materials.texture_wall);

        let wall3_transform = floor_transform
			.times(Mat4.translation(0,2,1))
			.times(Mat4.rotation(Math.PI/2, 1, 0, 0))
			.times(Mat4.translation(0,0,1));
        this.shapes.wall.draw(context, program_state, wall3_transform, this.materials.texture_wall);

        let wall4_transform = floor_transform
			.times(Mat4.translation(0,0,1))
			.times(Mat4.rotation(Math.PI/2, 1, 0, 0))
			.times(Mat4.translation(0,0,1));
        this.shapes.wall.draw(context, program_state, wall4_transform, this.materials.texture_wall);
    }

    baseDisplay(context, program_state, model_transform) {
        program_state.lights= [new Light(vec4(0,1,1,0), color(1,1,1,1), 1000000)];
        program_state.set_camera(Mat4.look_at(...Vector.cast([0, 0, 4], [0,0,0], [0,1,0])));
        let start_message_transform = model_transform.times(Mat4.scale(2.5, 0.5, 0.5));
        this.shapes.cube.draw(context, program_state, start_message_transform, this.materials.start_background);
    }

    setStartGame(context, program_state, model_transform) {
        this.baseDisplay(context, program_state, model_transform);

        let string = ["At the Louvre.\n\n\nPress 'CTRL+S' to \n\nStart the Game"];
        const strings = string[0].split("\n");
        let cube_side = Mat4.rotation(0, 1, 0, 0).times(Mat4.rotation(0,0,1,0)).times(Mat4.translation(-1, 0, 1));

        this.textOnDisplay(context, program_state, strings, cube_side);
    }

    setPauseGame(context, program_state, model_transform) {
        this.baseDisplay(context, program_state, model_transform);
        let string = ["\t\t\t\t\tGame Paused\n\n\n\n Press CTRL+P to Resume"];
        const strings = string[0].split("\n");
        let cube_side = Mat4.rotation(0,1,0,0).times(Mat4.rotation(0,0,1,0)).times(Mat4.translation(-1.5,0,0.9));
        this.textOnDisplay(context, program_state, strings, cube_side);
    }

    setLostScreen (context, program_state, model_transform) {
        this.baseDisplay(context, program_state, model_transform);
        let string = ['\t\t\t\tGame Over, You Lost\n\n\nPress CTRL+R To Restart.'];
        const strings = strings[0].split("\n");
        let cube_side = Mat4.rotation(0, 1, 0, 0).times(Mat4.rotation(0, 0, 1, 0)).times(Mat4.translation(-1.9, 0, 0.9));

        this.textOnDisplay(context, program_state, multi_line_string, cube_side);
    }

    setWonScreen (context, program_state, model_transform) {
        this.baseDisplay(context, program_state, model_transform);
        var timeTaken = 60 - this.currentGameTime;
        timeTaken = timeTaken.toFixed(2);
        let string = ['\t\t\t\tYou Won!\n\n\nYou took ' + timeTaken + 's.'];
        const strings = strings[0].split("\n");
        let cube_side = Mat4.rotation(0, 1, 0, 0).times(Mat4.rotation(0, 0, 1, 0)).times(Mat4.translation(-1, 0, 0.9));
        this.textOnDisplay(context, program_state, multi_line_string, cube_side);
    }

    getGameState() {
        // All pieces found
        if (this.currentGameTime > 0) {
          for (var key in this.pieceFound) {
            if (this.pieceFound.hasOwnProperty(key)) {
              if (this.pieceFound[key] == false) {
                this.won = false;
                return;
              }
            }
          }
          this.won = true;
          this.endGame = true;
        }
        // All pieces found BUT time out
        else if ((this.allObjectsFound) && (this.currentGameTime <= 0)) {
          this.won = false;
        }
        // time out
        else if (this.currentGameTime <= 0) {
          this.endGame = true;
          this.won = false;
        }
    }

    updateTimer(program_state) {
        if (!this.timeUpdated) {
          this.currentGameTime = this.gameDuration;
          this.timeUpdated = true;
        }
        else {
          this.currentGameTime = this.currentGameTime - (program_state.animation_delta_time / 1000);
        }
      }
    

    textOnDisplay(context, program_state, strings, cube_side) {
        for (let line of strings.slice(0, 30)) {
            this.shapes.text.set_string(line, context.context);
            this.shapes.text.draw(context, program_state, cube_side.times(Mat4.scale(.1, .1, .1)), this.materials.text_image);

            cube_side.post_multiply(Mat4. translation(0, -0.09, 0));
        }
    }
    
    showTOD(context, program_state, model_transform) {

        let string = ['' + this.currentGameTime.toFixed(2) + 's'];
        const strings = string[0].split("\n");
        let cube_side = Mat4.identity().times(Mat4.scale(0.05, 0.05, 0.0)).times(Mat4.translation(-3, 18, 0));
        for (let line of strings.slice(0, 30)) {
          this.shapes.text.set_string(line, context.context);
          if (this.currentGameTime < 11 && Math.floor(this.currentGameTime) % 2 == 0) {
            let text_color = color(1, 0, 0, 1);
            this.shapes.text.draw(context, program_state, cube_side, this.materials.text_image_screen.override({ color: text_color }));
          } else {
            this.shapes.text.draw(context, program_state, cube_side, this.materials.text_image_screen);
          }
        }
        cube_side = cube_side.times(Mat4.scale(0.5, 0.75, 0));
        cube_side = cube_side.times(Mat4.translation(-30, 0, 0));
    
        for (var key in this.pieceFound) {
          cube_side = cube_side.times(Mat4.translation(0, -2, 0));
          let obj_strings = ['' + key];
          let text_color = color(1, 0, 0, 1);
    
          if (key == 'Objects List') {
            text_color = color(1, 1, 1, 1);
          }
          else if (this.pieceFound[key] == true)
            text_color = color(0, 1, 0, 1);
          else {
            text_color = color(1, 1, 1, 1);
          }
    
          const strings2 = obj_strings[0].split("\n");
    
          for (let line of strings2.slice(0, 30)) {
    
            // Set the string using set_string
            this.shapes.text.set_string(line, context.context);
            // Draw but scale down to fit box size
            this.shapes.text.draw(context, program_state, cube_side, this.materials.text_image_screen.override({ color: text_color }));
          }
        }
      }
    
    display(context, program_state){
        super.display(context, program_state);
        let model_transform = Mat4.identity();
        if(this.startGame) {
            if (!this.pauseGame) {
                if (!this.endGame) {
                    program_state.set_camera(this.initial_camera_location);
                    this.getGameState();
                    this.showTOD(context, program_state, model_transform);
                    this.updateTimer(program_state);
                    this.createRoom(context, program_state, model_transform);
					this.createPedestals(context, program_state, model_transform);
                    this.createPieces(context, program_state, model_transform);
                    let mouse_X = 0;
                    let mouse_Y = 0;

                    if(defs.canvas_mouse_pos) {
                        mouse_X = defs.canvas_mouse_pos[0];
                        mouse_Y = defs.canvas_mouse_pos[1];
                    }
                }
                else {
                    if(this.won) {
                        this.setWonScreen(context, program_state, model_transform);
                    }
                    else {
                        this.setLostScreen(context, program_state, model_transform);
                    }
                }
            }
            else {
                this.setPauseGame(context, program_state, model_transform);
            }
        }
        else {
            this.setStartGame(context, program_state, model_transform);
        }
    
    }
    
}