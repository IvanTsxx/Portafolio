# ASCII vs SVG vs WebGL

## Decision

Tres caminos, roles distintos:

| Superficie | Renderer | Cuándo |
|------------|----------|--------|
| **Site field** (fondo de todas las rutas) | WebGL `AsciiWorld` (R3F) | Persistente, wormhole, ripples, moods |
| **Lab / dissolve / image→ASCII** | ASCII `<pre>` + rAF | Densidad tipográfica, O(cells), SSR snapshot |
| **Marcas fijas** | SVG / CSS | Iconos, dither tile, geometría chrome |

## Por qué el cosmos es WebGL

El portal necesita un **único canvas** que sobreviva a los cambios de ruta, anime charge/tunnel/land, y responda a clicks (`pulseRipple`) sin remontar DOM de `<pre>` a full-viewport. Eso es `AsciiWorld`.

## Por qué Lab sigue en `<pre>`

| Criterio | `<pre>` engine | SVG paths |
|----------|----------------|-----------|
| Brand density | Terminal grid | Ilustración genérica |
| Costo por frame | `textContent`, O(cells) | Path/DOM churn |
| SSR + reduced-motion | Mismo string snapshot | Pipeline aparte |
| Cap | `MAX_CELLS = 9000` | — |

Reemplazar fields Lab por blobs SVG falla el brand test.

## Hybrid rule

```
site background     → AsciiWorld (WebGL)
live density panels → lib/ascii (<pre> + rAF)
static ornament     → SVG / CSS (dither-bg, icons)
```

## Anti-patrones

- Segundo canvas R3F compitiendo con el cosmos en home.
- Redibujar phyllotaxis/flow como “SVG art” por nitidez.
- Snapshotear el canvas WebGL en View Transitions del theme toggle (OOM en Chromium).

## Cuándo revisar

- Cosmos: si el shader no llega a budget en mobile low-end → bajar resolución / glyph gain, no duplicar renderers.
- `<pre>`: solo si profiling bajo `MAX_CELLS` con varios fields simultáneos falla el frame budget — documentar en `ascii-engine.md` antes de Canvas 2D.
