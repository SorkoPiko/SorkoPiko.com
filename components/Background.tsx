"use client";

import { useEffect, useRef } from "react";

// WebGL port of the desktop shader (~/.config/shaderbg/bg.frag), minus audio
// reactivity and the hex pattern, tuned down to sit behind text.

/** Render resolution relative to devicePixelRatio; the canvas is CSS-upscaled. */
const RESOLUTION_SCALE = 0.5;
const FRAME_INTERVAL = 1000 / 30;

const VERTEX_SHADER = `
attribute vec2 position;
void main() {
	gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform float iTime;
uniform vec2 iResolution;
// Render pixels per CSS pixel, so shapes keep the same on-screen size
// whatever the render resolution
uniform float iScale;

const vec4 backdrop = vec4(0.0667, 0.0667, 0.0667, 1.0); // #111111
const vec4 base = vec4(0.0863, 0.0863, 0.0941, 1.0);     // #161618
const vec4 primary = vec4(0.1765, 0.1765, 0.2275, 1.0);  // #2d2d3a
const vec4 accent = vec4(1.0, 0.8863, 0.9569, 1.0);      // #ffe2f4
const vec4 edge = vec4(0.0, 0.0, 0.0, 1.0);              // #000000

// Motion relative to the desktop original
const float SPEED = 0.35;
// How much of each tone survives the mix back toward the backdrop,
// at the screen edges and behind the centre column
const float STRENGTH_EDGE = 0.85;
const float STRENGTH_CENTRE = 0.25;
// The pink outline is the signature, but it shouldn't glare
const float ACCENT_STRENGTH = 0.35;

float noise(vec2 p) {
	vec2 p2 = mod(p, 10.0);
	return sin(fract(sin(dot(p2, vec2(127.1, 311.7))) * 43758.5453123) * 3.141592654);
}

float smoothNoise(vec2 p) {
	vec2 i = floor(p);
	vec2 f = fract(p);
	vec2 u = f * f * (3.0 - 2.0 * f);
	return mix(mix(noise(i), noise(i + vec2(1.0, 0.0)), u.x), mix(noise(i + vec2(0.0, 1.0)), noise(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
	float total = 0.0;
	float amplitude = 0.5;
	float frequency = 1.0;
	for (int i = 0; i < 2; i++) {
		total += amplitude * smoothNoise(p * frequency);
		frequency *= 2.0;
		amplitude *= 0.5;
	}
	return total;
}

void main() {
	vec2 uv = gl_FragCoord.xy / iResolution.xy;
	vec2 fragCoord = gl_FragCoord.xy / iScale;
	float t = iTime * SPEED;
	vec4 colour = backdrop;

	float bg = fbm((fragCoord / 100.0) + (0.1 * t));
	bg += fbm((fragCoord / 140.0) - (0.067 * t));

	bg += noise((fragCoord + t) / 1000.0) * 0.04;
	bg += fbm(vec2(fragCoord.x / 100.0, fragCoord.x / 2.0)) * 0.05;

	bg /= 2.05;

	vec2 distanceVector = abs(uv - 0.5);
	float dist = (distanceVector.x * distanceVector.x) + (distanceVector.y * distanceVector.y);

	bg *= dist * 1.5;

	float bg1 = mix(bg, fbm(fragCoord / 200.0), 0.1);
	float bg2 = mix(bg, fbm(fragCoord / 500.0), 0.1);

	float strength = 1.0;

	if (bg > 0.15) {
		colour = base;
	}

	if (bg1 > 0.235) {
		colour = accent;
		strength = ACCENT_STRENGTH;
	}

	if (bg1 > 0.24) {
		colour = edge;
		strength = 1.0;
	}

	if (bg2 > 0.25) {
		colour = primary;
		strength = 1.0;
	}

	// Calm behind the content column (centred, ~65ch wide), fuller at the sides
	float columnHalf = min(0.5, 360.0 / (iResolution.x / iScale));
	float sideways = smoothstep(columnHalf * 0.6, columnHalf * 1.6, distanceVector.x);
	strength *= mix(STRENGTH_CENTRE, STRENGTH_EDGE, sideways);

	gl_FragColor = vec4(mix(backdrop.rgb, colour.rgb, strength), 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
	const shader = gl.createShader(type);
	if (!shader) return null;
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		gl.deleteShader(shader);
		return null;
	}
	return shader;
}

export function Background() {
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;
		// A fresh canvas per mount: the context is lost on cleanup, and a lost
		// context can't be reused (e.g. by React's dev double-mount)
		const canvas = document.createElement("canvas");
		container.appendChild(canvas);

		let gl: WebGLRenderingContext | null = null;
		try {
			gl = canvas.getContext("webgl", {
				alpha: false,
				antialias: false,
				depth: false,
				stencil: false,
				powerPreference: "low-power",
			}) as WebGLRenderingContext | null;
		} catch {
			gl = null;
		}
		if (!gl) {
			// The body background (#111111) shows through
			canvas.remove();
			return;
		}

		const vs = compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
		const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
		const program = gl.createProgram();
		if (!vs || !fs || !program) {
			canvas.remove();
			return;
		}
		gl.attachShader(program, vs);
		gl.attachShader(program, fs);
		gl.linkProgram(program);
		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			canvas.remove();
			return;
		}
		gl.useProgram(program);

		// One triangle covering the whole viewport
		const buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
		const position = gl.getAttribLocation(program, "position");
		gl.enableVertexAttribArray(position);
		gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

		const uTime = gl.getUniformLocation(program, "iTime");
		const uResolution = gl.getUniformLocation(program, "iResolution");
		const uScale = gl.getUniformLocation(program, "iScale");

		const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
		// Start somewhere in the middle of the loop rather than at t=0
		const timeOffset = 40;
		const start = performance.now();
		let raf = 0;
		let last = 0;

		const resize = () => {
			const scale = (window.devicePixelRatio || 1) * RESOLUTION_SCALE;
			const width = Math.max(1, Math.round(canvas.clientWidth * scale));
			const height = Math.max(1, Math.round(canvas.clientHeight * scale));
			if (canvas.width !== width || canvas.height !== height) {
				canvas.width = width;
				canvas.height = height;
			}
			gl!.viewport(0, 0, width, height);
			gl!.uniform2f(uResolution, width, height);
			gl!.uniform1f(uScale, scale);
		};

		const draw = (now: number) => {
			gl!.uniform1f(uTime, timeOffset + (now - start) / 1000);
			gl!.drawArrays(gl!.TRIANGLES, 0, 3);
		};

		const loop = (now: number) => {
			raf = requestAnimationFrame(loop);
			if (now - last < FRAME_INTERVAL) return;
			last = now;
			draw(now);
		};

		const stop = () => {
			cancelAnimationFrame(raf);
			raf = 0;
		};

		const startLoop = () => {
			stop();
			if (reducedMotion.matches) {
				draw(start);
			} else if (!document.hidden) {
				raf = requestAnimationFrame(loop);
			}
		};

		const onResize = () => {
			resize();
			// Redraw straight away so a paused/static canvas isn't left stretched
			draw(reducedMotion.matches ? start : performance.now());
		};

		const onVisibility = () => (document.hidden ? stop() : startLoop());

		resize();
		startLoop();

		window.addEventListener("resize", onResize);
		document.addEventListener("visibilitychange", onVisibility);
		reducedMotion.addEventListener("change", startLoop);

		return () => {
			stop();
			window.removeEventListener("resize", onResize);
			document.removeEventListener("visibilitychange", onVisibility);
			reducedMotion.removeEventListener("change", startLoop);
			gl!.deleteBuffer(buffer);
			gl!.deleteProgram(program);
			gl!.deleteShader(vs);
			gl!.deleteShader(fs);
			gl!.getExtension("WEBGL_lose_context")?.loseContext();
			canvas.remove();
		};
	}, []);

	return <div ref={containerRef} aria-hidden="true" className="background" />;
}
