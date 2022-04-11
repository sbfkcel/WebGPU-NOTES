@stage(vertex)
fn main(
    // xy 为一个 1x2的数组，内容为 Float32
    @location(0) xy:vec2<f32>,
    // z 则为一个 Float32 
    @location(1) z:f32
) -> @builtin(position) vec4<f32> {
    return vec4<f32>(xy, z, 1.0);
}