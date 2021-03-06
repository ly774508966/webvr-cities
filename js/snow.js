THREE.ShaderLib.snow = {
	uniforms: {
		texture:	{ type: "t", value: null },
		globalTime:	{ type: "f", value: 0.0 },
		size:	{ type: "f", value: 0.5 }, //????
		range: { type: "3f", value: [1000, 1000, 1000] },
		screenHeight: { type: "f", value: 1080 }
	},
	vertexShader: [
		'uniform float globalTime;',
		'uniform float size;',
		'uniform float screenHeight;',
		'uniform vec3 range;',

		'const vec4 zero = vec4(0.0, 0.0, 0.0, 1.0);',

		'void main() {',
		'	float maxSize = size * screenHeight * length(range.xy) / 1000.0;',

		'	vec3 pos = position;',

		// offset pos by world position and then mod by range so particles repeat forever
		'	vec4 offset = modelMatrix * zero;',
		'	pos.xz = mod(pos.xz + range.xz / 2.0 - offset.xz, range.xz) - range.xz / 2.0;',

			// time
		'	float localTime = length(position) + globalTime;',
		'	float modTime = mod( localTime, 1.0 );',
		'	float accTime = modTime;// * modTime;',

		'	pos.x += cos(modTime*8.0 + (position.z)) * 0.05 * range.x;',
		'	pos.z += sin(modTime*6.0 + (position.x)) * 0.05 * range.y;',

		'	vec3 animated = vec3( pos.x, pos.y * accTime, pos.z );',

		'	vec4 mvPosition = modelViewMatrix * vec4( animated, 1.0 );',

		'	gl_Position = projectionMatrix * mvPosition;',

		'	gl_PointSize = maxSize / length( gl_Position.xyz );',
		'}'
	].join("\n"),
	fragmentShader: [
		'uniform sampler2D texture;',

		'void main() {',

		'	gl_FragColor = texture2D( texture, gl_PointCoord );',
		'	gl_FragColor.rgb *= 0.47;',

		'}'
	].join("\n")
};

THREE.Snow = function (options) {
	var snowShader = THREE.ShaderLib.snow;
	var uniforms = THREE.UniformsUtils.clone( snowShader.uniforms );
	var attributes = {};

	var shaderMaterial = new THREE.ShaderMaterial( {
		uniforms: 		uniforms,
		attributes:     attributes,
		vertexShader:   snowShader.vertexShader,
		fragmentShader: snowShader.fragmentShader,

		blending: 		THREE.AdditiveBlending,
		depthTest: 		false,
		transparent:	true
	});

	options = options || {};

	var count = options.count || 10000;
	var minSize = options.minSize || 50;
	var sizeRange = (options.maxSize || 80) - minSize;
	var range = options.range || new THREE.Vector3(10, 10, 10);

	uniforms.texture.value = THREE.ImageUtils.loadTexture( options.flake || THREE.Snow.flake ); //todo: make configurable
	uniforms.range.value = [range.x, range.y, range.z];

	var geometry = new THREE.BufferGeometry();
	var vertices = [];
	var size = [];
	var colors = [];
	var times = [];
	var color = new THREE.Color( 0xffffff );

	for ( var i = 0; i < count; i++ ) {
		vertices.push(
			Math.random() * range.x - range.x / 2,
			-range.y,
			Math.random() * range.z - range.z / 2
		);
	}

	geometry.addAttribute( 'position',
		new THREE.BufferAttribute( new Float32Array( vertices ), 3 )
	);
	// geometry.addAttribute( 'size',
	// 	new THREE.BufferAttribute( new Float32Array( size ), 1 )
	// );
	// geometry.addAttribute( 'time',
	// 	new THREE.BufferAttribute( new Float32Array( times ), 1 )
	// );
	// geometry.addAttribute( 'customColor',
	// 	new THREE.BufferAttribute( new Float32Array( colors ), 3 )
	// );

	var particles = new THREE.PointCloud( geometry, shaderMaterial );
	particles.position.y = range.y / 2;
	//particles.position.z = -range.z / 2;

	this.particles = particles;
	this.position = particles.position;

	this.time = function (t) {
		if (t !== undefined) {
			uniforms.globalTime.value = t;
		}

		return uniforms.globalTime.value;
	};

	this.screenHeight = function (val) {
		if (val !== undefined) {
			uniforms.globalTime.screenHeight = val;
		}

		return uniforms.globalTime.screenHeight;
	};

	Object.defineProperty(this, 'visible', {
		get: function () {
			return particles.visible;
		},
		set: function (val) {
			particles.visible = !!val;
		}
	});
};

THREE.Snow.flake = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAIAAABMXPacAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkU3RTAyNUNGNjU3MDExRTE4RjZFQUQzRTYzNzcxOENCIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkU3RTAyNUQwNjU3MDExRTE4RjZFQUQzRTYzNzcxOENCIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6RTdFMDI1Q0Q2NTcwMTFFMThGNkVBRDNFNjM3NzE4Q0IiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6RTdFMDI1Q0U2NTcwMTFFMThGNkVBRDNFNjM3NzE4Q0IiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz5CMaWgAAASq0lEQVR42tRd23YbOQ6U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';