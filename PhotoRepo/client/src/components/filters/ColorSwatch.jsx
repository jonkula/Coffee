import { useFilterStore } from '../../store/filterStore';

const COLOR_FAMILIES = [
  { name: 'red',     css: '#e74c3c' },
  { name: 'orange',  css: '#e67e22' },
  { name: 'yellow',  css: '#f1c40f' },
  { name: 'green',   css: '#27ae60' },
  { name: 'teal',    css: '#1abc9c' },
  { name: 'blue',    css: '#2980b9' },
  { name: 'purple',  css: '#8e44ad' },
  { name: 'pink',    css: '#e91e8c' },
  { name: 'brown',   css: '#795548' },
  { name: 'black',   css: '#1a1a1a' },
  { name: 'white',   css: '#f5f5f5' },
  { name: 'gray',    css: '#95a5a6' },
  { name: 'neutral', css: '#bdc3c7' },
];

export function ColorSwatch() {
  const { activeColors, toggleColor } = useFilterStore();

  return (
    <div className="color-swatch">
      {COLOR_FAMILIES.map(({ name, css }) => (
        <button
          key={name}
          className={`color-swatch__dot ${activeColors.includes(name) ? 'color-swatch__dot--active' : ''}`}
          style={{ background: css }}
          title={name}
          onClick={() => toggleColor(name)}
          aria-pressed={activeColors.includes(name)}
        />
      ))}
    </div>
  );
}
