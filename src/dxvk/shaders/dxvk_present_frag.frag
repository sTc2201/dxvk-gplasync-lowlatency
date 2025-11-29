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

  vec4 src = texelFetch(s_image, coord, 0);

  vec3 linear = srgbdecode(src.rgb);
  vec3 rec709_encoded = rec709encode(linear);

  o_color = vec4(rec709_encoded, src.a);
}
