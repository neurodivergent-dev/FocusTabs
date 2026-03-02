import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import { useTheme } from './ThemeProvider';

interface ManifoldBackgroundProps {
  primaryColor?: string;
  accentColor?: string;
  refreshId?: number;
}

const ManifoldBackground: React.FC<ManifoldBackgroundProps> = ({ primaryColor, accentColor, refreshId = 0 }) => {
  const { colors } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  const color1 = primaryColor || colors.primary;
  const color2 = accentColor || colors.secondary || colors.info || colors.primary;

  useEffect(() => {
    setMounted(false);
    const timer = setTimeout(() => setMounted(true), 200);
    return () => clearTimeout(timer);
  }, [refreshId, color1, color2]);

  const htmlContent = useMemo(() => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
        <style>
          body { margin: 0; padding: 0; background: #000; overflow: hidden; height: 100vh; width: 100vw; }
          canvas { width: 100%; height: 100%; display: block; }
        </style>
      </head>
      <body>
        <canvas id="gl"></canvas>
        <script>
          (function() {
            const canvas = document.getElementById('gl');
            const gl = canvas.getContext('webgl', { antialias: true });
            if (!gl) return;

            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            gl.viewport(0, 0, canvas.width, canvas.height);

            const vsSource = "attribute vec2 p; void main(){ gl_Position=vec4(p,0,1); }";
            const fsSource = \`
              precision highp float;
              uniform vec2 r;
              uniform float t;
              uniform vec3 c1;
              uniform vec3 c2;

              mat2 rot(float a) {
                float s = sin(a), c = cos(a);
                return mat2(c, -s, s, c);
              }

              // CLEAN TESERRACT (4D Hypercube) - No Fog, No Beams
              float map(vec3 p) {
                float t_4d = t * 0.5;
                
                // Infinite room repetition
                vec3 q = mod(p + 2.0, 4.0) - 2.0;
                
                vec3 aq = abs(q);
                // Sharp outer box walls
                float outerBox = max(aq.x, max(aq.y, aq.z)) - 1.95;
                
                // Hollowing the center
                float centerVoid = length(p) - 1.5;
                
                // Very thin structural beams
                float beams = min(length(q.xy), min(length(q.yz), length(q.xz))) - 0.005;
                
                // Folding membranes (Clean lines)
                float s = sin(t_4d) * 0.5 + 0.5;
                float membrane = aq.x * aq.y * aq.z - (0.05 + s * 0.1);
                
                float d = max(outerBox, -membrane);
                d = min(d, beams);
                
                return max(d, -centerVoid);
              }

              vec3 calcNormal(vec3 p) {
                float h = 0.0001; vec2 k = vec2(1.0, -1.0);
                return normalize(k.xyy * map(p + k.xyy*h) + k.yyx * map(p + k.yyx*h) + k.yxy * map(p + k.yxy*h) + k.xxx * map(p + k.xxx*h));
              }

              void main() {
                vec2 uv = (gl_FragCoord.xy - 0.5 * r.xy) / r.y;
                
                vec3 ro = vec3(0.0, 0.0, 0.0);
                vec3 rd = normalize(vec3(uv, -1.0));
                
                rd.xz *= rot(t * 0.15);
                rd.yz *= rot(t * 0.1);
                
                vec3 col = vec3(0.0);
                float dTotal = 0.0;
                
                // Faster stepping for sharper edges
                for(int i=0; i<80; i++) {
                  vec3 p = ro + rd * dTotal;
                  float d = map(p);
                  if(d < 0.0001 || dTotal > 30.0) break;
                  dTotal += d;
                }

                if(dTotal < 30.0) {
                  vec3 pos = ro + rd * dTotal;
                  vec3 norm = calcNormal(pos);
                  
                  // Extremely sharp rim light (No fuzziness)
                  float rim = 1.0 - max(dot(norm, -rd), 0.0);
                  rim = pow(rim, 15.0); 
                  
                  vec3 baseCol = mix(c1, c2, sin(pos.y * 1.0 + t) * 0.5 + 0.5);
                  col = baseCol * rim * 12.0;
                  
                  // High-contrast geometric grid
                  float grid = abs(sin(pos.x * 15.0) * sin(pos.y * 15.0) * sin(pos.z * 15.0));
                  grid = pow(1.0 - grid, 40.0);
                  col += c1 * grid * 6.0;
                  
                  // Black distance fading
                  col *= exp(-0.15 * dTotal);
                }

                // Final post-process for high-tech look
                col *= 1.5 - length(uv) * 1.2;
                col = col / (1.0 + col);
                col = pow(col, vec3(0.9));
                
                gl_FragColor = vec4(col, 1.0);
              }
            \`;

            const program = gl.createProgram();
            const add = (type, src) => {
              const s = gl.createShader(type);
              gl.shaderSource(s, src); gl.compileShader(s); gl.attachShader(program, s);
            };
            add(gl.VERTEX_SHADER, vsSource); add(gl.FRAGMENT_SHADER, fsSource);
            gl.linkProgram(program); gl.useProgram(program);

            const buf = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buf);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
            const pLoc = gl.getAttribLocation(program, "p");
            gl.enableVertexAttribArray(pLoc); gl.vertexAttribPointer(pLoc, 2, gl.FLOAT, false, 0, 0);

            const rL = gl.getUniformLocation(program, "r");
            const tL = gl.getUniformLocation(program, "t");
            const c1L = gl.getUniformLocation(program, "c1");
            const c2L = gl.getUniformLocation(program, "c2");

            const h = (hex) => {
              const b = parseInt(hex.replace('#', ''), 16);
              return [(b >> 16 & 255)/255, (b >> 8 & 255)/255, (b & 255)/255];
            };
            const col1 = h('${color1}'); const col2 = h('${color2}');

            function render(now) {
              gl.uniform2f(rL, canvas.width, canvas.height);
              gl.uniform1f(tL, now * 0.0008);
              gl.uniform3f(c1L, col1[0], col1[1], col1[2]);
              gl.uniform3f(c2L, col2[0], col2[1], col2[2]);
              gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
              requestAnimationFrame(render);
            }
            requestAnimationFrame(render);
          })();
        </script>
      </body>
      </html>
    `;
  }, [color1, color2]);

  return (
    <View style={styles.container}>
      {mounted ? (
        <WebView
          key={`manifold-wv-${refreshId}-${color1}`}
          originWhitelist={['*']}
          source={{ html: htmlContent }}
          style={styles.webView}
          javaScriptEnabled={true}
          domStorageEnabled={false}
          scrollEnabled={false}
          pointerEvents="none"
        />
      ) : (
        <ActivityIndicator size="small" color={colors.primary} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  webView: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    backgroundColor: '#000',
  }
});

export default ManifoldBackground;
