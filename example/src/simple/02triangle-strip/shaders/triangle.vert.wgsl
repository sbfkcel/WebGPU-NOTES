@stage(vertex)
fn main(@builtin(vertex_index) VertexIndex : u32) -> @builtin(position) vec4<f32> {
    var pos = array<vec2<f32>, 4>(
        // 左下角点
	    vec2<f32>(-0.5, -0.5),
        // 左上角点
	    vec2<f32>(-0.5, 0.5),
        // 右下角点
	    vec2<f32>(0.5, -0.5),
        // 右上角点
        vec2<f32>(0.5, 0.5)
    );
    return vec4<f32>(pos[VertexIndex], 0.0, 1.0);
}