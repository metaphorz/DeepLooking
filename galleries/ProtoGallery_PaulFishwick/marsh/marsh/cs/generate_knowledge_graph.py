#!/usr/bin/env python3
"""Generate the marsh knowledge graph using Graphviz."""

import subprocess
import os

dot_source = """
digraph MarshKnowledgeGraph {
    // Global settings
    rankdir=TB;
    bgcolor=white;
    pad=0.5;
    nodesep=0.7;
    ranksep=0.9;
    splines=true;

    // Default node style
    node [
        shape=ellipse,
        style=filled,
        fillcolor="#f0f0f0",
        color="#666666",
        fontname="Helvetica",
        fontsize=14,
        penwidth=1.5
    ];

    // Default edge style
    edge [
        fontname="Helvetica",
        fontsize=11,
        color="#444444",
        fontcolor="#444444",
        penwidth=1.2
    ];

    // Central node - Marsh (green)
    Marsh [
        fillcolor="#c8e6c0",
        color="#4a7a3f",
        penwidth=2.5,
        fontsize=16
    ];

    // Node declarations with ordering hints
    TidalCreek [label="Tidal Creek"];
    SpartinaGrass [label="Spartina Grass"];

    // Row 1: Sky level (order: Sky, Clouds, then Heron on right)
    { rank=same; Sky; Clouds; Heron; }

    // Row 2: Marsh center
    { rank=same; Marsh; }

    // Row 3: Main features (order left to right)
    { rank=same; Boardwalk; Vegetation; TidalCreek; }

    // Row 4: Details (order left to right matching parents)
    { rank=same; Planks; Railing; SpartinaGrass; Water; Crabs; }

    // === Edges ===

    // Sky relationships
    Sky -> Clouds [label="contains"];
    Sky -> Marsh [label="above"];

    // Heron relationships
    Heron -> Marsh [label="lives in"];
    Heron -> Crabs [label="eats"];

    // Marsh relationships
    Marsh -> Boardwalk [label="has", style=dashed];
    Boardwalk -> Marsh [label="crosses", style=dashed, constraint=false];
    Marsh -> Vegetation [label="covered by"];
    Marsh -> TidalCreek [label="has"];

    // Boardwalk details
    Boardwalk -> Planks [label="made of"];
    Boardwalk -> Railing [label="has"];

    // Vegetation
    Vegetation -> SpartinaGrass [label="is"];

    // Water relationships
    TidalCreek -> Water [label="is"];
    Water -> Crabs [label="home to"];
}
"""

script_dir = os.path.dirname(os.path.abspath(__file__))
dot_file = os.path.join(script_dir, "marsh_knowledge_graph.dot")
png_file = os.path.join(script_dir, "marsh_knowledge_graph.png")

# Write DOT file
with open(dot_file, 'w') as f:
    f.write(dot_source)

# Generate PNG
result = subprocess.run(
    ["dot", "-Tpng", "-Gdpi=150", dot_file, "-o", png_file],
    capture_output=True, text=True
)

if result.returncode == 0:
    print(f"Generated: {png_file}")
else:
    print(f"Error: {result.stderr}")
