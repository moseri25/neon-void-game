struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) uv: vec2<f32>,
};

struct Uniforms {
  resolution: vec2<f32>,
  time: f32,
  cell_size: f32,
  color: vec4<f32>,
  glow_intensity: f32,
  scroll_speed: f32,
  _padding: vec2<f32>,
};

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

@vertex
fn vs_main(@builtin(vertex_index) vertex_index: u32) -> VertexOutput {
  var positions = array<vec2<f32>, 6>(
    vec2<f32>(-1.0, -1.0),
    vec2<f32>( 1.0, -1.0),
    vec2<f32>( 1.0,  1.0),
    vec2<f32>(-1.0, -1.0),
    vec2<f32>( 1.0,  1.0),
    vec2<f32>(-1.0,  1.0),
  );

  var output: VertexOutput;
  output.position = vec4<f32>(positions[vertex_index], 0.0, 1.0);
  output.uv = (positions[vertex_index] + vec2<f32>(1.0)) * 0.5;
  return output;
}

fn grid_sdf(uv: vec2<f32>, cell_size: f32, line_width: f32) -> f32 {
  let grid_uv = fract(uv / cell_size);
  let dx = min(grid_uv.x, 1.0 - grid_uv.x);
  let dy = min(grid_uv.y, 1.0 - grid_uv.y);
  let d = min(dx, dy);
  return smoothstep(0.0, line_width, d);
}

@fragment
fn fs_main(input: VertexOutput) -> @location(0) vec4<f32> {
  let pixel = input.uv * uniforms.resolution;
  let scroll_offset = vec2<f32>(uniforms.time * uniforms.scroll_speed);
  let scrolled_uv = pixel + scroll_offset;

  let grid_main = 1.0 - grid_sdf(scrolled_uv, uniforms.cell_size, 1.5);
  let grid_sub = 1.0 - grid_sdf(scrolled_uv, uniforms.cell_size * 0.25, 0.5);

  let main_intensity = grid_main * 0.8;
  let sub_intensity = grid_sub * 0.15;
  let total = main_intensity + sub_intensity;

  let glow = total * uniforms.glow_intensity;
  let base_color = uniforms.color.rgb;
  let final_color = base_color * glow;

  let pulse = sin(uniforms.time * 2.0) * 0.1 + 0.9;
  let corner_fade = smoothstep(0.0, 0.3, input.uv.x)
                  * smoothstep(0.0, 0.3, input.uv.y)
                  * smoothstep(0.0, 0.3, 1.0 - input.uv.x)
                  * smoothstep(0.0, 0.3, 1.0 - input.uv.y);

  return vec4<f32>(final_color * pulse * corner_fade, total * 0.5 * corner_fade);
}
