import { defs, tiny } from "./examples/common.js";
import { Text_Line } from "./examples/text-demo.js";
import {
  Color_Phong_Shader,
  Shadow_Textured_Phong_Shader,
  Buffered_Texture,
  LIGHT_DEPTH_TEX_SIZE,
} from "./examples/shadow-demo-shaders.js";

// Pull these names into this module's scope for convenience:
const {
  vec3,
  vec4,
  Vector,
  color,
  hex_color,
  Mat4,
  Light,
  Shape,
  Material,
  Shader,
  Texture,
  Scene,
} = tiny;

const {
  Triangle,
  Closed_Cone,
  Square,
  Tetrahedron,
  Torus,
  Windmill,
  Cube,
  Subdivision_Sphere,
  Cylindrical_Tube,
  Capped_Cylinder,
  Textured_Phong,
  Textured_Phong_text,
  Phong_Shader,
} = defs;

export class Louvre_Base extends Scene {
  constructor() {
    super();

    this.startGame = false;
    this.pauseGame = false;
    this.endGame = false;
    this.allPiecesFound = false;
    this.currentGameTime = 60;
    this.gameDuration = 60;
    this.timeUpdated = false;

    this.background_music = new Audio("assets/song.mp3");
    this.musicOn = false;
    // status
    this.won = false;

    this.obj_centers = new Array(9).fill(0);
    this.collision_bounce = false;

    this.shapes = {
      cube: new Cube(),
      cone: new Closed_Cone(8, 8),
      wall: new Square(),
      text: new Text_Line(35),
      torus: new Torus(3, 15),
      cylinder: new Capped_Cylinder(8, 8),
      sphere: new Subdivision_Sphere(4),
      object1: new Subdivision_Sphere(4),
      object2: new Subdivision_Sphere(2),
      coin: new defs.Capped_Cylinder(12, 12),
    };

    this.colliders = [
      {
        intersect_test: this.intersect_sphere,
        points: new Subdivision_Sphere(1),
        leeway: 0.5,
      },
      {
        intersect_test: this.intersect_sphere,
        points: new Subdivision_Sphere(2),
        leeway: 0.3,
      },
      {
        intersect_test: this.intersect_cube,
        points: new Cube(),
        leeway: 0.1,
      },
    ];

    this.pieceFound = {
      "Find the following": true,
      "Globe": false,
      "Mona Lisa": false,
      "Venus": false,
      "Starry Night": false,
      "A coin": false,
    };

    this.pieceIndex = {
      0: "Globe",
      4: "Mona Lisa",
      5: "Venus",
      6: "Starry Night",
      7: "A coin"
    };

    this.pure = new Material(new Color_Phong_Shader(), {});

    this.materials = {
      texture_floor: new Material(new Shadow_Textured_Phong_Shader(1), {
        color: hex_color("#545454"),
        ambient: 0.5,
        diffusivity: 1,
        specularity: 0.1,
        color_texture: new Texture("assets/floor.jpg"),
        light_depth_texture: null,
      }),

      texture_ceiling: new Material(new Textured_Phong(), {
        color: hex_color("#ffffff"),
        ambient: 0.1,
        diffusivity: 1,
        specularity: 0.1,
        texture: new Texture("assets/ceiling.jpg"),
      }),

      texture_wall: new Material(new Textured_Phong(), {
        color: hex_color("#545454"),
        ambient: 0.5,
        diffusivity: 1,
        specularity: 0.1,
        texture: new Texture("assets/wall.jpg"),
      }),

      texture_sphere: new Material(new Textured_Phong(), {
        color: hex_color("#000000"),
        ambient: 0.75,
        diffusivity: 1,
        specularity: 0.1,
        texture: new Texture("assets/earth.gif"),
      }),
      //painting textures
      texture_painting1: new Material(new Textured_Phong(), {
        color: hex_color("#000000"),
        ambient: 0.85,
        diffusivity: 0.5,
        specularity: 0.1,
        texture: new Texture("assets/monalisa.jpg"),
      }),

      texture_painting2: new Material(new Textured_Phong(), {
        color: hex_color("#000000"),
        ambient: 0.85,
        diffusivity: 0.5,
        specularity: 0.1,
        texture: new Texture("assets/Sunflowers.jpg"),
      }),

      texture_painting3: new Material(new Textured_Phong(), {
        color: hex_color("#000000"),
        ambient: 0.85,
        diffusivity: 0.5,
        specularity: 0.1,
        texture: new Texture("assets/StarryNight.jpg"),
      }),

      texture_painting4: new Material(new Textured_Phong(), {
        color: hex_color("#000000"),
        ambient: 0.85,
        diffusivity: 0.5,
        specularity: 0.1,
        texture: new Texture("assets/June.jpg"),
      }),

      texture_painting5: new Material(new Textured_Phong(), {
        color: hex_color("#000000"),
        ambient: 0.85,
        diffusivity: 0.5,
        specularity: 0.1,
        texture: new Texture("assets/Almond.jpg"),
      }),

      texture_painting6: new Material(new Textured_Phong(), {
        color: hex_color("#000000"),
        ambient: 0.85,
        diffusivity: 0.5,
        specularity: 0.1,
        texture: new Texture("assets/Earring.jpg"),
      }),

      texture_painting7: new Material(new Textured_Phong(), {
        color: hex_color("#000000"),
        ambient: 0.85,
        diffusivity: 0.5,
        specularity: 0.1,
        texture: new Texture("assets/Pair.jpg"),
      }),

      texture_painting8: new Material(new Textured_Phong(), {
        color: hex_color("#000000"),
        ambient: 0.85,
        diffusivity: 0.5,
        specularity: 0.1,
        texture: new Texture("assets/Cafe.jpg"),
      }),

      texture_painting9: new Material(new Textured_Phong(), {
        color: hex_color("#000000"),
        ambient: 0.85,
        diffusivity: 0.5,
        specularity: 0.1,
        texture: new Texture("assets/venus.jpg"),
      }),

      start_background: new Material(new Phong_Shader(), {
        color: color(0, 0.5, 0.5, 1),
        ambient: 0,
        diffusivity: 0,
        specularity: 0,
        smoothness: 20,
      }),

      time_background: new Material(new Phong_Shader(), {
        color: color(161, 31, 31, 1),
        ambient: 0,
        diffusivity: 0,
        specularity: 0.3,
        smoothness: 50,
      }),

      cube_material: new Material(new defs.Phong_Shader(), {
        ambient: 0.1,
        diffusivity: 1,
        specularity: 0.5,
        color: hex_color("#0398FC"),
      }),

      coin_material: new Material(new Phong_Shader(), {
        ambient: 0.2,
        diffusivity: 1,
        specularity: 0.5,
        color: hex_color("#ffd700"),
      }),

      cone_material: new Material(new defs.Phong_Shader(), {
        ambient: 0.1,
        diffusivity: 1,
        specularity: 0.5,
        color: hex_color("#FFFF00"),
      }),

      text_image: new Material(new Textured_Phong(1), {
        ambient: 1,
        diffusivity: 0,
        specularity: 0,
        texture: new Texture("assets/text.png"),
      }),

      text_image_screen: new Material(new Textured_Phong_text(1), {
        ambient: 1,
        diffusivity: 0,
        specularity: 0,
        texture: new Texture("assets/text.png"),
      }),

      cylinder_material: new Material(new defs.Phong_Shader(), {
        ambient: 0.1,
        diffusivity: 1,
        specularity: 0.5,
        color: hex_color("#43464B"),
      }),

      sphere_material: new Material(new defs.Phong_Shader(), {
        ambient: 0.1,
        diffusivity: 1,
        specularity: 0.5,
        color: hex_color("#ff0000"),
      }),
    };

    this.initial_camera_location = Mat4.look_at(
      vec3(-10, 7, 0),
      vec3(0, 7, 0),
      vec3(0, 1, 0)
    ).times(Mat4.rotation(-Math.PI / 2, 1, 0, 0));

    this.init_ok = false;
  }

  // Control maker
  make_control_panel(program_state) {
    this.control_panel.innerHTML += "Game Control Panel: ";
    this.new_line();
    this.new_line();

    // start
    this.key_triggered_button("Start Game", ["Control", "s"], () => {
      this.startGame = true;

      if (!this.musicOn) {
        this.background_music.play();
        this.musicOn = true;
      }
    });
    this.new_line();
    this.new_line();

    // pause
    this.key_triggered_button("Pause Game", ["Control", "p"], () => {
      if (this.startGame && !this.endGame) {
        this.pauseGame = !this.pauseGame;
        if (!this.background_music.paused) {
          this.background_music.pause();
        } else {
          this.background_music.play();
        }
      }
    });
    this.new_line();
    this.new_line();

    // restart
    this.key_triggered_button("Restart Game", ["Control", "r"], () => {
      this.reset();
    });
    this.new_line();
    this.new_line();

    this.key_triggered_button(
      "Return To Initial Position",
      ["Control", "o"],
      () => {
        program_state.set_camera(this.initial_camera_location);
      }
    );
  }

  texture_buffer_init(gl) {
    // Depth Texture
    this.lightDepthTexture = gl.createTexture();
    // Bind it to TinyGraphics
    this.light_depth_texture = new Buffered_Texture(this.lightDepthTexture);
    this.materials.texture_floor.light_depth_texture = this.light_depth_texture;

    this.lightDepthTextureSize = LIGHT_DEPTH_TEX_SIZE;
    gl.bindTexture(gl.TEXTURE_2D, this.lightDepthTexture);
    gl.texImage2D(
      gl.TEXTURE_2D, // target
      0, // mip level
      gl.DEPTH_COMPONENT, // internal format
      this.lightDepthTextureSize, // width
      this.lightDepthTextureSize, // height
      0, // border
      gl.DEPTH_COMPONENT, // format
      gl.UNSIGNED_INT, // type
      null
    ); // data
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // Depth Texture Buffer
    this.lightDepthFramebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.lightDepthFramebuffer);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER, // target
      gl.DEPTH_ATTACHMENT, // attachment point
      gl.TEXTURE_2D, // texture target
      this.lightDepthTexture, // texture
      0
    ); // mip level
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    // create a color texture of the same size as the depth texture
    // see article why this is needed_
    this.unusedTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.unusedTexture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      this.lightDepthTextureSize,
      this.lightDepthTextureSize,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    // attach it to the framebuffer
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER, // target
      gl.COLOR_ATTACHMENT0, // attachment point
      gl.TEXTURE_2D, // texture target
      this.unusedTexture, // texture
      0
    ); // mip level
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  // Game reset
  reset() {
    for (const key in this.pieceFound) {
      if (this.pieceFound.hasOwnProperty(key)) {
        if (key !== "Find the following") {
          this.pieceFound[key] = false;
        }
      }
    }
    this.startGame = false;
    this.pauseGame = false;
    this.endGame = false;
    this.allPiecesFound = false;
    this.won = false;
    this.timeUpdated = false;
    this.currentGameTime = 60;
    this.background_music.pause();
    this.background_music = new Audio("assets/song.mp3");
    this.musicOn = false;
  }

  getEyeLocation(program_state) {
    const Eye = vec4(0, 0, 0, 1);
    return program_state.camera_transform.times(Eye);
  }

  lightToCamera(program_state) {
    const light_position = this.getEyeLocation(program_state);
    program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];
  }

  // Initial camera and light set up
  display(context, program_state) {
    const gl = context.context;

    if (!this.init_ok) {
      const ext = gl.getExtension("WEBGL_depth_texture");
      if (!ext) {
        return alert("need WEBGL_depth_texture"); // eslint-disable-line
      }
      this.texture_buffer_init(gl);

      this.init_ok = true;
    }

    if (!context.scratchpad.controls) {
      this.children.push(
        (context.scratchpad.controls = new defs.Movement_Controls())
      );
      program_state.set_camera(this.initial_camera_location);
    }
    program_state.projection_transform = Mat4.perspective(
      Math.PI / 4,
      context.width / context.height,
      1,
      100
    );
    const t = (this.t = program_state.animation_time / 1000);
    this.lightToCamera(program_state);
  }
}

export class Louvre extends Louvre_Base {
  // Create art pieces inside the louvre
  createPieces(context, program_state, model_transform) {
    let t = program_state.animation_time / 1000;
    let dt = program_state.animation_delta_time / 1000;

    let painting1_model_transform = model_transform
      .times(Mat4.translation(20, 20, 7))
      .times(Mat4.rotation(0.5 * Math.sin(t) * Math.cos(t), 1, 0, 0))
      .times(Mat4.rotation(Math.PI / 2, 1, 0, 0))
      .times(Mat4.scale(0.1, 3, 2));
    this.shapes.cube.draw(
      context,
      program_state,
      painting1_model_transform,
      this.materials.texture_painting1
    );

    let painting2_model_transform = model_transform
      .times(Mat4.translation(-15, -20, 7))
      .times(Mat4.rotation(0.5 * Math.sin(t) * Math.cos(t), 1, 0, 0))
      .times(Mat4.rotation(Math.PI / 2, 1, 0, 0))
      .times(Mat4.scale(0.1, 3, 2));
    this.shapes.cube.draw(
      context,
      program_state,
      painting2_model_transform,
      this.materials.texture_painting2
    );

    let painting3_model_transform = model_transform
      .times(Mat4.translation(-25, 25, 7))
      .times(Mat4.rotation(0.5 * Math.sin(t) * Math.cos(t), 1, 0, 0))
      .times(Mat4.rotation(Math.PI / 2, 1, 0, 0))
      .times(Mat4.scale(0.1, 3, 2));
    this.shapes.cube.draw(
      context,
      program_state,
      painting3_model_transform,
      this.materials.texture_painting3
    );

    let painting4_model_transform = model_transform
      .times(Mat4.translation(-40, 20, 20))
      //.times(Mat4.rotation(0.5 * Math.sin(t) * Math.cos(t), 1, 0, 0))
      .times(Mat4.rotation(Math.PI / 2, 1, 0, 0))
      .times(Mat4.scale(0.1, 15, 10));
    this.shapes.cube.draw(
      context,
      program_state,
      painting4_model_transform,
      this.materials.texture_painting4
    );

    let painting5_model_transform = model_transform
      .times(Mat4.translation(-40, -20, 20))
      //.times(Mat4.rotation(0.5 * Math.sin(t) * Math.cos(t), 1, 0, 0))
      .times(Mat4.rotation(Math.PI / 2, 1, 0, 0))
      .times(Mat4.scale(0.1, 15, 10));
    this.shapes.cube.draw(
      context,
      program_state,
      painting5_model_transform,
      this.materials.texture_painting5
    );

    let painting6_model_transform = model_transform
      .times(Mat4.translation(40, 20, 20))
      //.times(Mat4.rotation(0.5 * Math.sin(t) * Math.cos(t), 1, 0, 0))
      .times(Mat4.rotation(Math.PI / 2, 1, 0, 0))
      .times(Mat4.scale(0.1, 15, 10));
    this.shapes.cube.draw(
      context,
      program_state,
      painting6_model_transform,
      this.materials.texture_painting6
    );

    let painting7_model_transform = model_transform
      .times(Mat4.translation(40, -20, 20))
      //.times(Mat4.rotation(0.5 * Math.sin(t) * Math.cos(t), 1, 0, 0))
      .times(Mat4.rotation(Math.PI / 2, 1, 0, 0))
      .times(Mat4.scale(0.1, 15, 10));
    this.shapes.cube.draw(
      context,
      program_state,
      painting7_model_transform,
      this.materials.texture_painting7
    );

    let painting8_model_transform = model_transform
      .times(Mat4.translation(1, 40, 15))
      //.times(Mat4.rotation(0.5 * Math.sin(t) * Math.cos(t), 1, 0, 0))
      .times(Mat4.rotation(Math.PI / 2, Math.PI / 2, 0, 0))
      .times(Mat4.rotation(0, Math.PI / 2, 1, 0))
      .times(Mat4.scale(15, 10, 0.1));
    this.shapes.cube.draw(
      context,
      program_state,
      painting8_model_transform,
      this.materials.texture_painting8
    );

    let painting9_model_transform = model_transform
      .times(Mat4.translation(1, -40, 15))
      //.times(Mat4.rotation(0.5 * Math.sin(t) * Math.cos(t), 1, 0, 0))
      .times(Mat4.rotation(Math.PI / 2, Math.PI / 2, 0, 0))
      .times(Mat4.rotation(0, Math.PI / 2, 1, 0))
      .times(Mat4.scale(15, 10, 0.1));
    this.shapes.cube.draw(
      context,
      program_state,
      painting9_model_transform,
      this.materials.texture_painting9
    );

    // Pedestal 1
    // Transform + Draw for pedestal tip
    let cylinder_model_transform_tip1 = model_transform
      .times(Mat4.translation(20, 20, 3))
      .times(Mat4.scale(1, 1, 1));
    this.shapes.cylinder.draw(
      context,
      program_state,
      cylinder_model_transform_tip1,
      this.materials.cylinder_material
    );

    // Transform + Draw for pedestal body
    let cylinder_model_transform_body1 = model_transform
      .times(Mat4.translation(20, 20, 2))
      .times(Mat4.scale(2, 2, 1));
    this.shapes.cylinder.draw(
      context,
      program_state,
      cylinder_model_transform_body1,
      this.materials.cylinder_material
    );

    // Transform + Draw for pedestal end
    let cylinder_model_transform_end1 = model_transform
      .times(Mat4.translation(20, 20, 1))
      .times(Mat4.scale(3, 3, 1));
    this.shapes.cylinder.draw(
      context,
      program_state,
      cylinder_model_transform_end1,
      this.materials.cylinder_material
    );

    // Pedestal 2
    // Transform + Draw for pedestal tip
    let cylinder_model_transform_tip2 = model_transform
      .times(Mat4.translation(-15, -20, 3))
      .times(Mat4.scale(1, 1, 1));
    this.shapes.cylinder.draw(
      context,
      program_state,
      cylinder_model_transform_tip2,
      this.materials.cylinder_material
    );

    // Transform + Draw for pedestal body
    let cylinder_model_transform_body2 = model_transform
      .times(Mat4.translation(-15, -20, 2))
      .times(Mat4.scale(2, 2, 1));
    this.shapes.cylinder.draw(
      context,
      program_state,
      cylinder_model_transform_body2,
      this.materials.cylinder_material
    );

    // Transform + Draw for pedestal end
    let cylinder_model_transform_end2 = model_transform
      .times(Mat4.translation(-15, -20, 1))
      .times(Mat4.scale(3, 3, 1));
    this.shapes.cylinder.draw(
      context,
      program_state,
      cylinder_model_transform_end2,
      this.materials.cylinder_material
    );

    // Create the pedestals for the paintings to be rotating about
    // Pedestal 3
    // Transform + Draw for pedestal tip
    let cylinder_model_transform_tip3 = model_transform
      .times(Mat4.translation(-25, 25, 3))
      .times(Mat4.scale(1, 1, 1));
    this.shapes.cylinder.draw(
      context,
      program_state,
      cylinder_model_transform_tip3,
      this.materials.cylinder_material
    );

    // Transform + Draw for pedestal body
    let cylinder_model_transform_body3 = model_transform
      .times(Mat4.translation(-25, 25, 2))
      .times(Mat4.scale(2, 2, 1));
    this.shapes.cylinder.draw(
      context,
      program_state,
      cylinder_model_transform_body3,
      this.materials.cylinder_material
    );

    // Transform + Draw for pedestal end
    let cylinder_model_transform_end3 = model_transform
      .times(Mat4.translation(-25, 25, 1))
      .times(Mat4.scale(3, 3, 1));
    this.shapes.cylinder.draw(
      context,
      program_state,
      cylinder_model_transform_end3,
      this.materials.cylinder_material
    );

    let theta = Math.PI / 2 * t;
    let coin_model_transform = model_transform.times(Mat4.translation(-15, 21, 0.5)).times(Mat4.scale(0.2,0.2,0.2)).times(Mat4.rotation(Math.PI/2, 0,1,0)).times(Mat4.rotation(theta,1,0,0));
    this.shapes.coin.draw(context, program_state, coin_model_transform, this.materials.coin_material);

    let cone_model_transform = model_transform
      .times(Mat4.translation(18, 14, 2))
      .times(Mat4.scale(2, 2, 2));
    this.shapes.cone.draw(
      context,
      program_state,
      cone_model_transform,
      this.materials.cone_material
    );

    let cube_model_transform = model_transform
      .times(Mat4.translation(22.5, 12, 2.5))
      .times(Mat4.scale(2.5, 2.5, 2.5));
    this.shapes.cube.draw(
      context,
      program_state,
      cube_model_transform,
      this.materials.cube_material
    );

    let sphere_toy_model_transform = model_transform
      .times(Mat4.translation(18, 11, 1))
      .times(Mat4.scale(1, 1, 1));
    this.shapes.sphere.draw(
      context,
      program_state,
      sphere_toy_model_transform,
      this.materials.sphere_material
    );

    let sphere_model_transform = model_transform
      .times(Mat4.translation(-16, -10, 1))
      .times(Mat4.rotation(Math.PI / 2, 1, 0, 0))
      .times(Mat4.rotation((Math.PI / 2) * t, 0, 1, 0));
    this.shapes.object1.draw(
      context,
      program_state,
      sphere_model_transform,
      this.materials.texture_sphere
    );
    this.obj_centers[0] = [...sphere_model_transform.transposed()[3], 3, 3];
    this.obj_centers[1] = [
      ...cylinder_model_transform_end1.transposed()[3],
      2,
      2,
    ];
    this.obj_centers[2] = [
      ...cylinder_model_transform_end2.transposed()[3],
      2,
      2,
    ];
    this.obj_centers[3] = [
      ...cylinder_model_transform_end3.transposed()[3],
      2,
      2,
    ];
    this.obj_centers[4] = [...painting1_model_transform.transposed()[3], 2, 6];
    this.obj_centers[5] = [
      ...painting9_model_transform.transposed()[3],
      13,
      26,
    ];
    this.obj_centers[6] = [...painting3_model_transform.transposed()[3], 2, 6];
    this.obj_centers[7] = [...coin_model_transform.transposed()[3], 1, 1.5];
    this.distances = this.obj_centers.map((pos) => {
      const camera_position = this.getEyeLocation(program_state);
      return [
        Math.abs(camera_position[1] - pos[1]),
        Math.abs(camera_position[0] - pos[0]),
        pos[4],
        pos[5],
      ];
    });
    this.collision_detection(this.distances, 1);
  }

  // Create the museum. Walls/floor/ceilings, etc.
  createRoom(
    context,
    program_state,
    model_transform,
    shadow_pass = false,
    draw_shadow = false
  ) {
    program_state.draw_shadow = draw_shadow;
    let floor_transform = model_transform.times(Mat4.scale(40, 40, 20));
    this.shapes.wall.draw(
      context,
      program_state,
      floor_transform,
      shadow_pass ? this.materials.texture_floor : this.pure
    );

    let ceiling_transform = floor_transform
      .times(Mat4.translation(0, 0, 2))
      .times(Mat4.rotation(Math.PI, 1, 0, 0));
    this.shapes.wall.draw(
      context,
      program_state,
      ceiling_transform,
      this.materials.texture_ceiling
    );

    let wall1_transform = floor_transform
      .times(Mat4.translation(2, 0, 1))
      .times(Mat4.rotation(-Math.PI / 2, 0, 1, 0))
      .times(Mat4.translation(0, 0, 1));
    this.shapes.wall.draw(
      context,
      program_state,
      wall1_transform,
      this.materials.texture_wall
    );

    let wall2_transform = floor_transform
      .times(Mat4.translation(-2, 0, 1))
      .times(Mat4.rotation(Math.PI / 2, 0, 1, 0))
      .times(Mat4.translation(0, 0, 1));
    this.shapes.wall.draw(
      context,
      program_state,
      wall2_transform,
      this.materials.texture_wall
    );

    let wall3_transform = floor_transform
      .times(Mat4.translation(0, 2, 1))
      .times(Mat4.rotation(Math.PI / 2, 1, 0, 0))
      .times(Mat4.translation(0, 0, 1));
    this.shapes.wall.draw(
      context,
      program_state,
      wall3_transform,
      this.materials.texture_wall
    );

    let wall4_transform = floor_transform
      .times(Mat4.translation(0, 0, 1))
      .times(Mat4.rotation(Math.PI / 2, 1, 0, 0))
      .times(Mat4.translation(0, 0, 1));
    this.shapes.wall.draw(
      context,
      program_state,
      wall4_transform,
      this.materials.texture_wall
    );
  }

  collision_detection(distances) {
    let obj = null;
    let counter = 0;

    const collide = distances.some((dist) => {
      if (dist[0] < dist[2] && dist[1] < dist[3]) {
        obj = counter;
      }
      counter += 1;
      return dist[0] < dist[2] && dist[1] < dist[3];
    });

    if (collide) {
      // Find object we collided with and set to true
      if (obj in this.pieceIndex) {
        if (!this.pieceFound[this.pieceIndex[obj]]) {
          const pieceName = this.pieceIndex[obj];
          console.log(pieceName);
          this.pieceFound[pieceName] = true;
        }
      }

      if (defs.left) {
        defs.thrust[0] = -0.3;
      } else if (defs.right) {
        defs.thrust[0] = 0.3;
      }

      if (defs.forward) {
        defs.thrust[2] = -0.3;
      } else if (defs.backward) {
        defs.thrust[2] = 0.3;
      }
      this.collision_bounce = true;
    } else if (this.collision_bounce) {
      defs.thrust[0] = 0;
      defs.thrust[2] = 0;
      this.collision_bounce = false;
    }
  }

  // Initial screen set up
  baseDisplay(context, program_state, model_transform) {
    program_state.lights = [
      new Light(vec4(0, 1, 1, 0), color(1, 1, 1, 1), 1000000),
    ];
    program_state.set_camera(
      Mat4.look_at(...Vector.cast([0, 0, 4], [0, 0, 0], [0, 1, 0]))
    );
    let start_message_transform = model_transform.times(
      Mat4.scale(2.5, 0.5, 0.5)
    );
    this.shapes.cube.draw(
      context,
      program_state,
      start_message_transform,
      this.materials.start_background
    );
  }

  setStartGame(context, program_state, model_transform) {
    this.baseDisplay(context, program_state, model_transform);

    let string = ["At the Louvre.\n\n\nPress 'CTRL+S' to \n\nStart the Game"];
    const strings = string[0].split("\n");
    let cube_side = Mat4.rotation(0, 1, 0, 0)
      .times(Mat4.rotation(0, 0, 1, 0))
      .times(Mat4.translation(-1, 0, 1));

    this.textOnDisplay(context, program_state, strings, cube_side);
  }

  setPauseGame(context, program_state, model_transform) {
    this.baseDisplay(context, program_state, model_transform);
    let string = ["\t\t\t\t\tGame Paused\n\n\n\n Press CTRL+P to Resume"];
    const strings = string[0].split("\n");
    let cube_side = Mat4.rotation(0, 1, 0, 0)
      .times(Mat4.rotation(0, 0, 1, 0))
      .times(Mat4.translation(-1.5, 0, 0.9));
    this.textOnDisplay(context, program_state, strings, cube_side);
  }

  setLostScreen(context, program_state, model_transform) {
    this.baseDisplay(context, program_state, model_transform);
    let string = ["\t\t\t\tGame Over, You Lost\n\n\nPress CTRL+R To Restart."];
    const strings = string[0].split("\n");
    let cube_side = Mat4.rotation(0, 1, 0, 0)
      .times(Mat4.rotation(0, 0, 1, 0))
      .times(Mat4.translation(-1.9, 0, 0.9));
    this.background_music.pause();
    this.textOnDisplay(context, program_state, strings, cube_side);
  }

  setWonScreen(context, program_state, model_transform) {
    this.baseDisplay(context, program_state, model_transform);
    let timeTaken = 60 - this.currentGameTime;
    timeTaken = timeTaken.toFixed(2);
    let string = ["\t\t\t\tYou Won!\n\n\nYou took " + timeTaken + "s."];
    const strings = string[0].split("\n");
    let cube_side = Mat4.rotation(0, 1, 0, 0)
      .times(Mat4.rotation(0, 0, 1, 0))
      .times(Mat4.translation(-1, 0, 0.9));
    this.textOnDisplay(context, program_state, strings, cube_side);
  }

  // Game process set up
  getGameState() {
    // All pieces found
    if (this.currentGameTime > 0) {
      for (const key in this.pieceFound) {
        if (this.pieceFound.hasOwnProperty(key)) {
          if (this.pieceFound[key] === false) {
            this.won = false;
            return;
          }
        }
      }
      this.won = true;
      this.endGame = true;
    }
    // All pieces found BUT time out
    else if (this.allPiecesFound && this.currentGameTime <= 0) {
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
    } else {
      this.currentGameTime =
        this.currentGameTime - program_state.animation_delta_time / 1000;
    }
  }

  // Not properly finished yet
  textOnDisplay(context, program_state, strings, cube_side) {
    for (let line of strings.slice(0, 30)) {
      this.shapes.text.set_string(line, context.context);
      this.shapes.text.draw(
        context,
        program_state,
        cube_side.times(Mat4.scale(0.1, 0.1, 0.1)),
        this.materials.text_image
      );

      cube_side.post_multiply(Mat4.translation(0, -0.09, 0));
    }
  }

  showTOD(context, program_state, model_transform) {
    let string = ["" + this.currentGameTime.toFixed(2) + "s"];
    const strings = string[0].split("\n");
    let cube_side = Mat4.identity()
      .times(Mat4.scale(0.05, 0.05, 0.0))
      .times(Mat4.translation(-3, 18, 0));
    for (let line of strings.slice(0, 30)) {
      this.shapes.text.set_string(line, context.context);
      if (
        this.currentGameTime < 11 &&
        Math.floor(this.currentGameTime) % 2 === 0
      ) {
        let text_color = color(1, 0, 0, 1);
        this.shapes.text.draw(
          context,
          program_state,
          cube_side,
          this.materials.text_image_screen.override({ color: text_color })
        );
      } else {
        this.shapes.text.draw(
          context,
          program_state,
          cube_side,
          this.materials.text_image_screen
        );
      }
    }
    cube_side = cube_side.times(Mat4.scale(0.55, 0.75, 0));
    cube_side = cube_side.times(Mat4.translation(-30, 0, 0));

    for (const key in this.pieceFound) {
      cube_side = cube_side.times(Mat4.translation(0, -3.5, 0));
      let obj_strings = ["" + key];
      let text_color = color(1, 0, 0, 1);

      if (key === "Find the following") {
        text_color = color(1, 1, 0, 1);
      } else if (this.pieceFound[key] === true) text_color = color(0, 1, 0, 1);
      else {
        text_color = color(1, 1, 1, 1);
      }

      const strings2 = obj_strings[0].split("\n");

      for (let line of strings2.slice(0, 30)) {
        this.shapes.text.set_string(line, context.context);

        this.shapes.text.draw(
          context,
          program_state,
          cube_side,
          this.materials.text_image_screen.override({ color: text_color })
        );
      }
    }
  }

  // Initialize game and display
  display(context, program_state) {
    super.display(context, program_state);
    let model_transform = Mat4.identity();
    const gl = context.context;
    if (this.startGame) {
      if (!this.pauseGame) {
        if (!this.endGame) {
          program_state.set_camera(this.initial_camera_location);

          this.light_view_target = vec4(0, 0, 0, 1);
          this.light_field_of_view = (130 * Math.PI) / 180; // 130 degree
          this.light_position = this.getEyeLocation(program_state);
          const light_view_mat = Mat4.look_at(
            vec3(
              this.light_position[0],
              this.light_position[1],
              this.light_position[2]
            ),
            vec3(
              this.light_view_target[0],
              this.light_view_target[1],
              this.light_view_target[2]
            ),
            vec3(0, 1, 0) // assume the light to target will have a up dir of +y, maybe need to change according to your case
          );
          const light_proj_mat = Mat4.perspective(
            this.light_field_of_view,
            1,
            0.5,
            500
          );

          gl.bindFramebuffer(gl.FRAMEBUFFER, this.lightDepthFramebuffer);
          gl.viewport(
            0,
            0,
            this.lightDepthTextureSize,
            this.lightDepthTextureSize
          );
          gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
          // Prepare uniforms
          program_state.light_view_mat = light_view_mat;
          program_state.light_proj_mat = light_proj_mat;
          program_state.light_tex_mat = light_proj_mat;
          program_state.view_mat = light_view_mat;
          program_state.projection_transform = light_proj_mat;
          this.createRoom(
            context,
            program_state,
            model_transform,
            false,
            false
          );

          gl.bindFramebuffer(gl.FRAMEBUFFER, null);
          gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
          program_state.view_mat = program_state.camera_inverse;
          program_state.projection_transform = Mat4.perspective(
            Math.PI / 4,
            context.width / context.height,
            0.5,
            500
          );

          this.getGameState();
          this.showTOD(context, program_state, model_transform);
          this.updateTimer(program_state);
          this.createRoom(context, program_state, model_transform, true, true);
          this.createPieces(context, program_state, model_transform);
        } else {
          if (this.won) {
            this.setWonScreen(context, program_state, model_transform);
          } else {
            this.setLostScreen(context, program_state, model_transform);
          }
        }
      } else {
        this.setPauseGame(context, program_state, model_transform);
      }
    } else {
      this.setStartGame(context, program_state, model_transform);
    }
  }
}
