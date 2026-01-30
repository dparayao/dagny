# React ASCII Model

A React component that renders 3D GLB models with the Three.js ASCII effect.

## Setup

```bash
npm install
```

Place your `.glb` model in the `public/` folder as `model.glb`, then:

```bash
npm run dev
```

## Usage

```jsx
import AsciiModel from './components/AsciiModel';

function MyComponent() {
  const [animation, setAnimation] = useState('Idle');

  return (
    <div style={{ width: '100%', height: '500px' }}>
      <AsciiModel
        modelPath="/model.glb"
        currentAnimation={animation}
        options={{
          characters: ' .:-=+*#%@',
          invert: true,
          resolution: 0.15,
          color: 'white',
          backgroundColor: 'black',
          scale: 1,
          position: [0, 0, 0],
          autoRotate: false,
          enableControls: true,
        }}
      />
    </div>
  );
}
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `modelPath` | string | Path to .glb file (in public folder) |
| `currentAnimation` | string | Name of animation to play |
| `options` | object | Configuration (see below) |

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `characters` | string | `' .:-=+*#%@'` | ASCII chars, dark → light |
| `invert` | boolean | `true` | Invert colors |
| `resolution` | number | `0.15` | Detail level (lower = more detail) |
| `color` | string | `'white'` | Text color |
| `backgroundColor` | string | `'black'` | Background color |
| `scale` | number | `1` | Model scale |
| `position` | array | `[0, 0, 0]` | Model position [x, y, z] |
| `autoRotate` | boolean | `false` | Auto-rotate model |
| `enableControls` | boolean | `true` | Enable orbit controls |

## Notes

- Check browser console for available animation names
- The component auto-fits the camera to your model
- Orbit controls: drag to rotate, scroll to zoom
- Container must have explicit width/height
