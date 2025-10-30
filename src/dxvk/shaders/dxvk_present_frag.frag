#version 450

#extension GL_GOOGLE_include_directive : enable

#include "dxvk_present_common.glsl"

vec3 srgb_to_linear(vec3 c) {
  vec3 linearSection = c / 12.92;
  vec3 powerSection  = pow((c + 0.055) / 1.055, vec3(2.4));
  return mix(linearSection, powerSection, step(vec3(0.04045), c));
}

vec3 rec709_encode(vec3 c) {
  vec3 linearSection = c * 4.5;
  vec3 powerSection  = 1.099 * pow(c, vec3(0.45)) - 0.099;
  return mix(linearSection, powerSection, step(vec3(0.018), c));
}

layout(location = 0) out vec4 o_color;

void main() {
  ivec2 coord = ivec2(gl_FragCoord.xy) + src_offset - dst_offset;

  vec4 src = texelFetch(s_image, coord, 0);

  vec3 processed = rec709_encode(srgb_to_linear(src.rgb));

  o_color = composite_image(vec4(processed, src.a));
  o_color = sc_rgb_to_output(o_color);
}
