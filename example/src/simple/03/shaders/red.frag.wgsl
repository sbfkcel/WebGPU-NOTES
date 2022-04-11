// 通过 @group(0) @binding(0) 位置获取一个 uniform buffer
// 它是一个 1x4 的数组，内容是 float32 的小数
@group(0) @binding(0) var<uniform> color:vec4<f32>;
@stage(fragment)
fn main() -> @location(0) vec4<f32> {
    return color;
}