#!/usr/bin/env python3
"""Generate a Provençal meadow flora diagram."""

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import os

script_dir = os.path.dirname(os.path.abspath(__file__))

fig, ax = plt.subplots(figsize=(6, 4.5), dpi=150)
ax.set_xlim(0, 10)
ax.set_ylim(0, 8)
ax.axis('off')

ax.set_title('Wildflowers of the Provençal Meadow', fontsize=12, fontweight='bold', pad=10)

# Plant entries: (x, y, name, family, color_swatch, note)
plants = [
    (1.5, 6.5, 'Wild Thyme', 'Lamiaceae', '#9b59b6', 'Aromatic herb\ncovering rocky ground'),
    (5.0, 6.5, 'Red Poppy', 'Papaveraceae', '#e74c3c', 'Blooms May–July\nin open fields'),
    (8.5, 6.5, 'Lavender', 'Lamiaceae', '#8e44ad', 'Icon of Provence\nbloom June–August'),
    (1.5, 3.5, 'Yellow Broom', 'Fabaceae', '#f1c40f', 'Nitrogen-fixing\nshrub on hillsides'),
    (5.0, 3.5, 'Wild Orchid', 'Orchidaceae', '#e91e8b', 'Over 100 species\nin southern France'),
    (8.5, 3.5, 'Rosemary', 'Lamiaceae', '#2980b9', 'Evergreen shrub\nin garrigue habitat'),
]

for x, y, name, family, color, note in plants:
    # Color swatch circle
    circle = plt.Circle((x - 0.9, y), 0.3, facecolor=color, edgecolor='#444', linewidth=1)
    ax.add_patch(circle)

    # Plant name
    ax.text(x, y + 0.15, name, fontsize=9, fontweight='bold', va='bottom')
    # Family
    ax.text(x, y - 0.15, family, fontsize=7, fontstyle='italic', color='#666', va='top')
    # Note
    ax.text(x, y - 0.65, note, fontsize=6.5, color='#555', va='top', ha='center',
            bbox=dict(boxstyle='round,pad=0.3', facecolor='#f9f5ec', edgecolor='#ddd', linewidth=0.5))

# Footer note
ax.text(5, 0.8, 'The garrigue and meadows of Provence host\n'
        'over 2,000 plant species adapted to the Mediterranean climate:\n'
        'hot dry summers and mild wet winters.',
        ha='center', va='center', fontsize=7.5, fontstyle='italic', color='#555',
        bbox=dict(boxstyle='round,pad=0.4', facecolor='#eef5e6', edgecolor='#aac88e', linewidth=1))

plt.tight_layout()
plt.savefig(os.path.join(script_dir, 'provencal_flora.png'),
            bbox_inches='tight', facecolor='white')
plt.close()
print('Generated provencal_flora.png')
