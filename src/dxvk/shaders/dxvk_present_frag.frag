#version 450

#extension GL_GOOGLE_include_directive : enable

#include "dxvk_present_common.glsl"

vec3 srgbdecode(vec3 color) {
  bvec3 usePower = greaterThan(color, vec3(0.04045));
  vec3 linearsection = color / 12.92;
  vec3 powersection  = pow((color + vec3(0.055)) / 1.055, vec3(2.4));
  return mix(linearsection, powersection, vec3(usePower));
}

vec3 rec709encode(vec3 color) {
  bvec3 usePower = greaterThan(color, vec3(0.018));
  vec3 linearsection = color * 4.5;
  vec3 powersection  = 1.099 * pow(color, vec3(0.45)) - 0.099;
  return mix(linearsection, powersection, vec3(usePower));
}

layout(location = 0) out vec4 o_color;

void main() {
  ivec2 coord = ivec2(gl_FragCoord.xy) + src_offset - dst_offset;

  vec3 sampled = texelFetch(s_image, coord, 0).xyz;
  sampled = rec709encode(srgbdecode(sampled));

  o_color = input_to_sc_rgb(vec4(sampled, 1.0));
  o_color = composite_image(o_color);
  o_color = sc_rgb_to_output(o_color);
}
