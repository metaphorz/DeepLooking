#!/usr/bin/env python3
"""Generate limestone geology diagram candidates for the Lourmarin cliffs lens."""

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy as np
import os

script_dir = os.path.dirname(os.path.abspath(__file__))


def diagram1_cross_section():
    """Cross-section showing limestone cliff layers and formation."""
    fig, ax = plt.subplots(figsize=(6, 4), dpi=150)

    # Draw layered cliff cross-section
    colors = ['#f5e6c8', '#e8d5a3', '#d4c48e', '#c2b07a', '#b09c66', '#9e8852']
    labels = ['Recent Soil', 'Weathered Limestone', 'Fossiliferous Limestone',
              'Oolitic Limestone', 'Dense Limestone', 'Marl / Clay Base']

    y_positions = [3.5, 3.0, 2.4, 1.7, 0.9, 0.0]
    heights = [0.5, 0.6, 0.6, 0.7, 0.8, 0.9]

    for i, (y, h, c, l) in enumerate(zip(y_positions, heights, colors, labels)):
        # Create slightly irregular layers
        rect = mpatches.FancyBboxPatch((0.5, y), 5.0, h,
                                        boxstyle="round,pad=0.02",
                                        facecolor=c, edgecolor='#666', linewidth=0.8)
        ax.add_patch(rect)
        ax.text(3.0, y + h/2, l, ha='center', va='center', fontsize=8, fontweight='bold')

    # Add cliff face on right side
    cliff_x = [5.5, 5.5, 5.8, 5.6, 5.9, 5.5, 5.7, 5.5]
    cliff_y = [0.0, 1.0, 1.5, 2.0, 2.8, 3.2, 3.8, 4.0]
    ax.plot(cliff_x, cliff_y, 'k-', linewidth=2)

    # Annotations
    ax.annotate('Cliff\nFace', xy=(5.6, 2.0), fontsize=8, ha='center',
                fontstyle='italic', color='#333')
    ax.annotate('~65 million\nyears old', xy=(0.8, 0.4), fontsize=7,
                color='#666', fontstyle='italic')

    ax.set_xlim(0, 6.5)
    ax.set_ylim(-0.2, 4.3)
    ax.set_title('Limestone Cliff Cross-Section', fontsize=12, fontweight='bold', pad=10)
    ax.set_xlabel('← Inland          Cliff Edge →', fontsize=9)
    ax.axis('off')

    plt.tight_layout()
    plt.savefig(os.path.join(script_dir, 'diagram1_cross_section.png'),
                bbox_inches='tight', facecolor='white')
    plt.close()


def diagram2_formation_cycle():
    """How limestone forms - from sea creatures to rock."""
    fig, ax = plt.subplots(figsize=(6, 4), dpi=150)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 7)
    ax.axis('off')

    ax.set_title('How Limestone Forms', fontsize=12, fontweight='bold', pad=10)

    # Step boxes
    steps = [
        (1.2, 5.5, 'Step 1:\nMarine organisms\n(shells, coral)\nlive in warm seas'),
        (5.0, 5.5, 'Step 2:\nOrganisms die,\nshells accumulate\non sea floor'),
        (8.5, 5.5, 'Step 3:\nSediment layers\ncompact under\npressure'),
        (1.2, 1.8, 'Step 4:\nCalcite crystals\ncement together\n→ Limestone'),
        (5.0, 1.8, 'Step 5:\nTectonic forces\nlift rock above\nsea level'),
        (8.5, 1.8, 'Step 6:\nErosion carves\ncliffs like those\nin Provence'),
    ]

    box_colors = ['#d4e8f7', '#b8d4e8', '#9cc0d9', '#e8d5a3', '#d4c48e', '#c2b07a']

    for (x, y, text), color in zip(steps, box_colors):
        box = mpatches.FancyBboxPatch((x - 1.1, y - 1.0), 2.2, 2.0,
                                       boxstyle="round,pad=0.15",
                                       facecolor=color, edgecolor='#666',
                                       linewidth=1)
        ax.add_patch(box)
        ax.text(x, y, text, ha='center', va='center', fontsize=7, fontweight='bold')

    # Arrows between steps
    arrow_props = dict(arrowstyle='->', color='#444', lw=1.5)
    # Top row arrows
    ax.annotate('', xy=(3.7, 5.5), xytext=(2.5, 5.5), arrowprops=arrow_props)
    ax.annotate('', xy=(7.2, 5.5), xytext=(6.3, 5.5), arrowprops=arrow_props)
    # Down arrow
    ax.annotate('', xy=(8.5, 3.0), xytext=(8.5, 4.3), arrowprops=arrow_props)
    # Bottom row arrows (right to left)
    ax.annotate('', xy=(6.3, 1.8), xytext=(7.2, 1.8), arrowprops=arrow_props)
    ax.annotate('', xy=(2.5, 1.8), xytext=(3.7, 1.8), arrowprops=arrow_props)

    plt.tight_layout()
    plt.savefig(os.path.join(script_dir, 'diagram2_formation.png'),
                bbox_inches='tight', facecolor='white')
    plt.close()


def diagram3_composition():
    """Pie chart of limestone chemical composition."""
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(6, 3.5), dpi=150)

    fig.suptitle('Limestone Composition', fontsize=12, fontweight='bold')

    # Chemical composition
    minerals = ['Calcite\n(CaCO₃)', 'Clay\nminerals', 'Quartz\n(SiO₂)', 'Other']
    sizes = [80, 10, 5, 5]
    colors = ['#f5e6c8', '#b09c66', '#d4c48e', '#e8d5a3']
    explode = (0.05, 0, 0, 0)

    ax1.pie(sizes, explode=explode, labels=minerals, colors=colors,
            autopct='%1.0f%%', startangle=90, textprops={'fontsize': 7})
    ax1.set_title('Mineral Content', fontsize=9, fontweight='bold')

    # How it looks under microscope - simplified
    ax2.set_xlim(0, 4)
    ax2.set_ylim(0, 4)
    ax2.set_aspect('equal')

    # Draw fossils/grains
    np.random.seed(42)
    for _ in range(15):
        x, y = np.random.uniform(0.3, 3.7, 2)
        r = np.random.uniform(0.15, 0.35)
        circle = plt.Circle((x, y), r, facecolor='#e8d5a3',
                           edgecolor='#999', linewidth=0.5)
        ax2.add_patch(circle)

    # Add some shell-like shapes
    for _ in range(5):
        x, y = np.random.uniform(0.5, 3.5, 2)
        ellipse = mpatches.Ellipse((x, y), 0.5, 0.25,
                                    angle=np.random.uniform(0, 180),
                                    facecolor='#f5e6c8', edgecolor='#888',
                                    linewidth=0.5)
        ax2.add_patch(ellipse)

    ax2.set_facecolor('#d4c48e')
    ax2.set_title('Microscopic View\n(fossils in calcite matrix)', fontsize=9, fontweight='bold')
    ax2.set_xticks([])
    ax2.set_yticks([])

    plt.tight_layout()
    plt.savefig(os.path.join(script_dir, 'diagram3_composition.png'),
                bbox_inches='tight', facecolor='white')
    plt.close()


def diagram4_karst_erosion():
    """Karst landscape diagram showing how limestone erodes."""
    fig, ax = plt.subplots(figsize=(6, 4), dpi=150)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 7)

    ax.set_title('Karst Erosion of Limestone', fontsize=12, fontweight='bold', pad=10)

    # Sky
    ax.axhspan(5, 7, color='#c8ddf0')

    # Rain arrows
    for x in [1.5, 3.5, 5.5, 7.5]:
        ax.annotate('', xy=(x, 5.5), xytext=(x - 0.3, 6.5),
                    arrowprops=dict(arrowstyle='->', color='#4488cc', lw=1))
    ax.text(9, 6.2, 'Rain\n(weak acid:\nH₂O + CO₂)', fontsize=7, ha='center',
            color='#336699', fontstyle='italic')

    # Surface with cliff
    surface_x = [0, 2, 2.5, 3, 3, 4, 5, 5, 7, 8, 10]
    surface_y = [5, 5, 4.5, 5, 5, 5, 5, 4, 4, 5, 5]
    ax.fill_between(surface_x, surface_y, 0, color='#e8d5a3', alpha=0.8)
    ax.plot(surface_x, surface_y, 'k-', linewidth=1.5)

    # Cave system underground
    cave = mpatches.FancyBboxPatch((3.5, 1.5), 3, 1.2,
                                    boxstyle="round,pad=0.3",
                                    facecolor='white', edgecolor='#888',
                                    linewidth=1, linestyle='--')
    ax.add_patch(cave)
    ax.text(5, 2.1, 'Cave / Cavity', ha='center', va='center', fontsize=8,
            fontstyle='italic', color='#666')

    # Water channel
    ax.annotate('', xy=(5, 1.5), xytext=(5, 4.0),
                arrowprops=dict(arrowstyle='->', color='#4488cc', lw=1.5, linestyle='--'))
    ax.text(5.8, 3.0, 'Water\ndissolves\nCaCO₃', fontsize=7, color='#336699')

    # Sinkhole label
    ax.annotate('Sinkhole', xy=(5, 4.0), fontsize=8, fontweight='bold',
                ha='center', va='bottom')

    # Cliff label
    ax.annotate('Cliff face\n(exposed\nlimestone)', xy=(2.5, 4.2), fontsize=7,
                ha='center', fontstyle='italic')

    # Chemical equation
    ax.text(5, 0.5, 'CaCO₃ + H₂CO₃ → Ca²⁺ + 2HCO₃⁻',
            ha='center', fontsize=8, fontfamily='monospace',
            bbox=dict(boxstyle='round', facecolor='#fff8e8', edgecolor='#ccc'))

    ax.axis('off')
    plt.tight_layout()
    plt.savefig(os.path.join(script_dir, 'diagram4_karst.png'),
                bbox_inches='tight', facecolor='white')
    plt.close()


if __name__ == '__main__':
    diagram1_cross_section()
    print('Generated diagram1_cross_section.png')
    diagram2_formation_cycle()
    print('Generated diagram2_formation.png')
    diagram3_composition()
    print('Generated diagram3_composition.png')
    diagram4_karst_erosion()
    print('Generated diagram4_karst.png')
