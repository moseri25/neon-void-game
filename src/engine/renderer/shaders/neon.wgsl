struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) uv: vec2<f32>,
};

struct PostUniforms {
  resolution: vec2<f32>,
  time: f32,
  bloom_intensity: f32,
  chromatic_offset: f32,
  scanline_intensity: f32,
  vignette_strength: f32,
  _padding: f32,
};

@group(0) @binding(0) var<uniform> uniforms: PostUniforms;
@group(0) @binding(1) var scene_texture: texture_2d<f32>;
@group(0) @binding(2) var scene_sampler: sampler;

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
  output.uv.y = 1.0 - output.uv.y;
  return output;
}

fn bloom_sample(uv: vec2<f32>, offset: vec2<f32>) -> vec3<f32> {
  let sample_color = textureSample(scene_texture, scene_sampler, uv + offset).rgb;
  let brightness = dot(sample_color, vec3<f32>(0.2126, 0.7152, 0.0722));
  return sample_color * smoothstep(0.5, 1.0, brightness);
}

@fragment
fn fs_main(input: VertexOutput) -> @location(0) vec4<f32> {
  let pixel_size = 1.0 / uniforms.resolution;

  // Chromatic aberration
  let ca_offset = uniforms.chromatic_offset * pixel_size.x;
  let r = textureSample(scene_texture, scene_sampler, input.uv + vec2<f32>(ca_offset, 0.0)).r;
  let g = textureSample(scene_texture, scene_sampler, input.uv).g;
  let b = textureSample(scene_texture, scene_sampler, input.uv - vec2<f32>(ca_offset, 0.0)).b;
  var color = vec3<f32>(r, g, b);

  // Bloom (9-tap gaussian approximation)
  var bloom = vec3<f32>(0.0);
  let bloom_offsets = array<vec2<f32>, 8>(
    vec2<f32>(-1.0, -1.0), vec2<f32>(0.0, -1.0), vec2<f32>(1.0, -1.0),
    vec2<f32>(-1.0,  0.0),                         vec2<f32>(1.0,  0.0),
    vec2<f32>(-1.0,  1.0), vec2<f32>(0.0,  1.0), vec2<f32>(1.0,  1.0),
  );
  for (var i = 0u; i < 8u; i = i + 1u) {
    bloom += bloom_sample(input.uv, bloom_offsets[i] * pixel_size * 3.0);
  }
  bloom /= 8.0;
  color += bloom * uniforms.bloom_intensity;

  // Scanlines
  let scanline = sin(input.uv.y * uniforms.resolution.y * 3.14159) * 0.5 + 0.5;
  let scanline_effect = mix(1.0, scanline, uniforms.scanline_intensity);
  color *= scanline_effect;

  // Vignette
  let dist = length(input.uv - vec2<f32>(0.5));
  let vignette = 1.0 - smoothstep(0.3, 0.9, dist) * uniforms.vignette_strength;
  color *= vignette;

  // Subtle noise grain
  let noise = fract(sin(dot(input.uv * uniforms.time, vec2<f32>(12.9898, 78.233))) * 43758.5453);
  color += vec3<f32>(noise * 0.02 - 0.01);

  return vec4<f32>(color, 1.0);
}
