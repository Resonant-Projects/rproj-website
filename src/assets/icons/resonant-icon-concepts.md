# Resonant Projects Icon Concepts

Three organic, flowing icon designs representing "resonance" - the physics of vibration, transformation, and creative energy.

**Brand Context:**

- Primary Purple: #6e2765
- Secondary Purple: #7e3775
- Philosophy: "When things resonate at their true frequency, they transform both creator and audience"

---

## Concept 1: "The Bloom"

### Design Rationale

This icon represents resonance as organic growth and expansion - like a flower blooming from its center or ripples emanating from a point of impact. The curved petals suggest sound waves that have taken on life, transforming from mere vibration into something beautiful and alive. The spiral motion evokes the feeling of energy unfolding outward, capturing the transformative nature of resonance.

### SVG Code

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <defs>
    <linearGradient id="bloom-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7e3775"/>
      <stop offset="100%" stop-color="#6e2765"/>
    </linearGradient>
  </defs>
  <!-- Outer flowing petal -->
  <path d="M32 4 C20 4 12 14 12 26 C12 38 20 48 32 60 C44 48 52 38 52 26 C52 14 44 4 32 4"
        fill="url(#bloom-gradient)" opacity="0.3"/>
  <!-- Middle petal rotated -->
  <path d="M32 10 C22 10 16 18 16 28 C16 38 22 46 32 54 C42 46 48 38 48 28 C48 18 42 10 32 10"
        fill="url(#bloom-gradient)" opacity="0.5"/>
  <!-- Inner petal -->
  <path d="M32 16 C24 16 20 22 20 30 C20 38 24 44 32 48 C40 44 44 38 44 30 C44 22 40 16 32 16"
        fill="url(#bloom-gradient)" opacity="0.7"/>
  <!-- Core -->
  <ellipse cx="32" cy="32" rx="8" ry="10" fill="#6e2765"/>
</svg>
```

### Scalability Notes

- **16x16 (favicon):** The concentric structure remains visible; core ellipse provides solid anchor point
- **32x32:** Gradient layers become distinct; organic shape clearly readable
- **Large display:** Full gradient beauty visible; flowing curves create elegant presence
- **Monochrome:** Works well as single color due to layered opacity approach

### Pairing with Wordmark

Best positioned to the LEFT of "Resonant Projects" with equal height to the cap-height of the text. The vertical orientation of the bloom complements horizontal text flow.

---

## Concept 2: "The Wave Form"

### Design Rationale

This icon captures resonance as flowing energy - a continuous wave that curves and flows like liquid sound. Rather than a rigid audio waveform, this is an organic, breathing curve that suggests both movement and stillness simultaneously. The dual curves interweaving represent the relationship between creator and audience, vibrating together at the same frequency.

### SVG Code

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <defs>
    <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#6e2765"/>
      <stop offset="50%" stop-color="#7e3775"/>
      <stop offset="100%" stop-color="#6e2765"/>
    </linearGradient>
  </defs>
  <!-- Upper flowing wave -->
  <path d="M4 32 C4 20 14 12 24 18 C34 24 34 8 44 8 C54 8 60 20 60 32"
        stroke="url(#wave-gradient)" stroke-width="6" stroke-linecap="round" fill="none"/>
  <!-- Lower flowing wave (mirrored, offset) -->
  <path d="M4 32 C4 44 14 52 24 46 C34 40 34 56 44 56 C54 56 60 44 60 32"
        stroke="url(#wave-gradient)" stroke-width="6" stroke-linecap="round" fill="none"/>
  <!-- Center resonance point -->
  <circle cx="32" cy="32" r="4" fill="#6e2765"/>
</svg>
```

### Scalability Notes

- **16x16 (favicon):** Simplify to single wave or increase stroke width; center dot provides recognition anchor
- **32x32:** Both waves clearly visible; flowing motion is readable
- **Large display:** Graceful curves create sense of continuous motion; gradient adds depth
- **Monochrome:** Strong structure works perfectly in single color

### Pairing with Wordmark

Ideal as a horizontal lockup - place to the LEFT of text. The horizontal nature of the wave flow leads the eye naturally into "Resonant Projects". Consider reducing icon width for tighter integration.

---

## Concept 3: "The Convergence"

### Design Rationale

This icon represents resonance as convergence - multiple frequencies coming together to create something unified and powerful. Inspired by the interference patterns of sound waves, the overlapping curved forms suggest harmony and alignment. The design evokes a moment of perfect synchronization where separate vibrations merge into one transformative experience.

### SVG Code

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <defs>
    <linearGradient id="converge-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#6e2765"/>
      <stop offset="100%" stop-color="#7e3775"/>
    </linearGradient>
  </defs>
  <!-- Left flowing arc -->
  <path d="M8 56 C8 32 20 12 32 12 C20 12 8 32 8 56"
        fill="url(#converge-gradient)" opacity="0.4"/>
  <path d="M8 56 Q20 36 32 28 Q20 36 8 56"
        fill="#6e2765" opacity="0.6"/>

  <!-- Right flowing arc -->
  <path d="M56 56 C56 32 44 12 32 12 C44 12 56 32 56 56"
        fill="url(#converge-gradient)" opacity="0.4"/>
  <path d="M56 56 Q44 36 32 28 Q44 36 56 56"
        fill="#6e2765" opacity="0.6"/>

  <!-- Central convergence point with glow -->
  <ellipse cx="32" cy="24" rx="6" ry="8" fill="#6e2765"/>
  <ellipse cx="32" cy="24" rx="3" ry="4" fill="#7e3775"/>

  <!-- Flowing connection at base -->
  <path d="M12 56 Q32 44 52 56"
        stroke="#6e2765" stroke-width="4" stroke-linecap="round" fill="none"/>
</svg>
```

### Scalability Notes

- **16x16 (favicon):** The symmetrical structure scales well; central ellipse and base curve provide recognizable silhouette
- **32x32:** Layered transparency begins to show depth; convergence motion is clear
- **Large display:** Full complexity visible; overlapping forms create rich visual texture
- **Monochrome:** Works as solid shape by removing transparency or using single fill

### Pairing with Wordmark

Works well ABOVE "Resonant Projects" in a stacked arrangement, or to the LEFT in horizontal layout. The upward convergence point creates visual lift that pairs well with text below it.

---

## Comparison Summary

| Aspect               | The Bloom         | The Wave Form                   | The Convergence       |
| -------------------- | ----------------- | ------------------------------- | --------------------- |
| **Motion**           | Expanding outward | Flowing horizontal              | Converging inward     |
| **Metaphor**         | Growth, flowering | Energy, vibration               | Unity, harmony        |
| **Favicon Strength** | Good (solid core) | Moderate (needs simplification) | Good (symmetrical)    |
| **Complexity**       | Medium            | Low                             | High                  |
| **Best Pairing**     | Left of text      | Left of text (horizontal)       | Above or left of text |

---

## Recommended Next Steps

1. **Test at actual sizes** - Render at 16x16, 32x32, 64x64, and 256x256
2. **View in context** - Place alongside "Resonant Projects" wordmark
3. **Motion exploration** - Consider subtle animation for web use (CSS or Lottie)
4. **Monochrome variants** - Create single-color versions for various use cases
5. **Negative space versions** - White icon on purple background
