"use client";

import { useEffect, useRef, useState } from "react";
import { displayFont } from "@/app/fonts";
import { labProjects } from "./workData";
import type { DemoProps } from "../registry";

const VERTEX = `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}`;

// Ripple centred on the pointer, with the channels pulled apart along the wave so
// the split is strongest at the crest instead of uniformly across the card.
const FRAGMENT = `
precision mediump float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform vec2 uMouse;
uniform float uTime;
uniform float uHover;
uniform vec2 uRatio;

void main() {
  vec2 uv = vec2(vUv.x, 1.0 - vUv.y);
  vec2 d = (uv - uMouse) * uRatio;
  float dist = length(d);

  float wave = sin(dist * 26.0 - uTime * 3.4) * exp(-dist * 4.5) * 0.028 * uHover;
  vec2 offset = normalize(d + 1e-5) * wave;
  float split = wave * 1.6;

  float r = texture2D(uTex, uv + offset + vec2(split, 0.0)).r;
  float g = texture2D(uTex, uv + offset).g;
  float b = texture2D(uTex, uv + offset - vec2(split, 0.0)).b;

  vec3 color = vec3(r, g, b);
  color += vec3(0.58, 0.85, 0.30) * abs(wave) * 9.0;
  gl_FragColor = vec4(color, 1.0);
}`;

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
}

export default function WorkShaderCards({ replayKey }: DemoProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointer = useRef({ x: 0.5, y: 0.5, hover: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || hovered === null) return;

    const gl = canvas.getContext("webgl", { alpha: false, antialias: false });
    if (!gl) return;

    const program = gl.createProgram();
    const vs = compile(gl, gl.VERTEX_SHADER, VERTEX);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
    if (!program || !vs || !fs) return;

    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uMouse = gl.getUniformLocation(program, "uMouse");
    const uTime = gl.getUniformLocation(program, "uTime");
    const uHover = gl.getUniformLocation(program, "uHover");
    const uRatio = gl.getUniformLocation(program, "uRatio");

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([12, 14, 12, 255]));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    const image = new window.Image();
    image.crossOrigin = "anonymous";
    image.src = labProjects[hovered].cover;
    image.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    };

    let frame = 0;
    const start = performance.now();

    const render = () => {
      frame = requestAnimationFrame(render);
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.round(rect.width * dpr);
      const h = Math.round(rect.height * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, canvas.width, canvas.height);

      pointer.current.hover += (1 - pointer.current.hover) * 0.1;
      gl.uniform2f(uMouse, pointer.current.x, pointer.current.y);
      gl.uniform1f(uTime, (performance.now() - start) / 1000);
      gl.uniform1f(uHover, pointer.current.hover);
      gl.uniform2f(uRatio, Math.max(1, rect.width / rect.height), 1);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    frame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frame);
      gl.deleteTexture(texture);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buffer);
    };
  }, [hovered]);

  useEffect(() => {
    setHovered(null);
    pointer.current.hover = 0;
  }, [replayKey]);

  return (
    <div className="flex h-full w-full flex-col justify-center px-6 py-8 sm:px-12">
      <p className="font-mono text-[0.62rem] uppercase tracking-[0.3em] text-lime-300">
        Selected work
      </p>
      <h2
        className={`${displayFont.className} mt-4 text-[clamp(1.8rem,4vw,2.8rem)] font-semibold tracking-tight text-white`}
      >
        Hover a card
      </h2>

      <div className="mt-8 grid gap-5 sm:grid-cols-3">
        {labProjects.map((project, i) => (
          <button
            key={project.id}
            type="button"
            onMouseEnter={() => {
              pointer.current.hover = 0;
              setHovered(i);
            }}
            onMouseLeave={() => setHovered(null)}
            onMouseMove={(event) => {
              const rect = event.currentTarget.getBoundingClientRect();
              pointer.current.x = (event.clientX - rect.left) / rect.width;
              pointer.current.y = (event.clientY - rect.top) / rect.height;
            }}
            className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 text-left"
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700"
              style={{
                backgroundImage: `url(${project.cover})`,
                transform: hovered === i ? "scale(1.05)" : "scale(1)",
                opacity: hovered === i ? 0 : 1,
              }}
            />
            {hovered === i && (
              <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
            )}

            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-4">
              {/* The name is real text, not baked into the image, so it is readable and indexable. */}
              <p className={`${displayFont.className} text-base font-semibold text-white`}>
                {project.name}
              </p>
              <p className="mt-0.5 font-mono text-[0.55rem] uppercase tracking-[0.2em] text-neutral-400">
                {project.category}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
