@stage(vertex)
fn main(@builtin(vertex_index) VertexIndex : u32) -> @builtin(position) vec4<f32> {
    // WebGPU 中空间坐标是三维的，画三角形是平面的，在下方将 z 轴坐标固定为0即可
    var pos = array<vec2<f32>, 3>(
	    vec2<f32>(0.0, 0.5),
	    vec2<f32>(-0.5, -0.5),
	    vec2<f32>(0.5, -0.5)
    );
    // 将 z 轴坐标固安为 0
    return vec4<f32>(pos[VertexIndex], 0.0, 1.0);
}