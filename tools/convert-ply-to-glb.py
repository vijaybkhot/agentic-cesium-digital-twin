#!/usr/bin/env python3
"""Convert a local PLY file to a GLB file with Blender.

Run with:
  blender --background --python tools/convert-ply-to-glb.py -- input.ply output.glb

This script is intentionally local-only. It does not upload files, run COLMAP,
or change the Cesium app runtime.
"""

from __future__ import annotations

import sys
from pathlib import Path

try:
    import bpy
except ImportError as exc:
    raise SystemExit(
        "This script must be run by Blender, not by system Python.\n"
        "Use: blender --background --python tools/convert-ply-to-glb.py -- input.ply output.glb"
    ) from exc


def parse_args(argv: list[str]) -> tuple[Path, Path]:
    if "--" not in argv:
        raise SystemExit(
            "Missing '--' before script arguments.\n"
            "Use: blender --background --python tools/convert-ply-to-glb.py -- input.ply output.glb"
        )

    args = argv[argv.index("--") + 1 :]
    if len(args) != 2:
        raise SystemExit(
            "Expected exactly two arguments: input.ply output.glb\n"
            "Use: blender --background --python tools/convert-ply-to-glb.py -- input.ply output.glb"
        )

    input_path = Path(args[0]).expanduser().resolve()
    output_path = Path(args[1]).expanduser().resolve()

    if input_path.suffix.lower() != ".ply":
        raise SystemExit(f"Input must be a .ply file: {input_path}")

    if output_path.suffix.lower() != ".glb":
        raise SystemExit(f"Output must be a .glb file: {output_path}")

    if not input_path.is_file():
        raise SystemExit(f"Input file not found: {input_path}")

    return input_path, output_path


def clear_scene() -> None:
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete()


def import_ply(input_path: Path) -> None:
    if hasattr(bpy.ops.wm, "ply_import"):
        bpy.ops.wm.ply_import(filepath=str(input_path))
        return

    if hasattr(bpy.ops.import_mesh, "ply"):
        bpy.ops.import_mesh.ply(filepath=str(input_path))
        return

    raise SystemExit(
        "This Blender installation does not expose a PLY import operator."
    )


def export_glb(output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)

    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.export_scene.gltf(
        filepath=str(output_path),
        export_format="GLB",
        use_selection=True,
    )


def main() -> None:
    input_path, output_path = parse_args(sys.argv)

    clear_scene()
    import_ply(input_path)

    object_count = len(bpy.context.scene.objects)
    if object_count == 0:
        raise SystemExit(f"No objects were imported from: {input_path}")

    export_glb(output_path)

    size_mb = output_path.stat().st_size / (1024 * 1024)
    print(f"Converted {input_path.name} to {output_path}")
    print(f"Imported objects: {object_count}")
    print(f"Output size: {size_mb:.2f} MB")


if __name__ == "__main__":
    main()
