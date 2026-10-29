#!/usr/bin/env python3
"""Create an independent Little Worlds project without overwriting a destination."""
import argparse
import json
from pathlib import Path
import re
import shlex
import shutil
import sys


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--name', required=True, help='Lowercase project slug')
    parser.add_argument('--destination', required=True, type=Path)
    parser.add_argument('--title', help='Display title; defaults to title-cased name')
    parser.add_argument('--seed', type=int, default=None)
    parser.add_argument('--width', type=float, default=None)
    parser.add_argument('--depth', type=float, default=None)
    parser.add_argument('--people', type=int, default=None)
    parser.add_argument('--vehicles', type=int, default=None)
    parser.add_argument('--weather', choices=['clear', 'mist', 'rain'], default=None)
    parser.add_argument('--terrain', choices=['plaza', 'meadow'], default=None)
    parser.add_argument('--day', action='store_true')
    args = parser.parse_args()
    if not re.fullmatch(r'[a-z0-9][a-z0-9-]{0,63}', args.name):
        parser.error('--name must be 1–64 lowercase letters, digits or hyphens')
    for name, lo, hi in [('width', 28, 120), ('depth', 24, 120), ('people', 0, 120), ('vehicles', 0, 24)]:
        value = getattr(args, name)
        if value is not None and not lo <= value <= hi:
            parser.error(f'--{name} must be between {lo} and {hi}')
    title = args.title or args.name.replace('-', ' ').title()
    if not title.strip() or len(title) > 120:
        parser.error('--title must contain 1–120 characters')
    starter = Path(__file__).resolve().parent.parent / 'assets' / 'starter'
    required = ['index.html', 'project.config.js', 'scene.js', 'src/main.js', 'vendor/three/build/three.module.js']
    if not all((starter / f).is_file() for f in required):
        parser.error('Installed Starter is incomplete; do not create a partial project')
    destination = args.destination.expanduser().absolute()
    if destination.exists() or destination.is_symlink():
        parser.error(f'Destination already exists; nothing changed: {destination}')
    destination.parent.mkdir(parents=True, exist_ok=True)
    created = False
    try:
        destination.mkdir(exist_ok=False)
        created = True
        shutil.copytree(starter, destination, dirs_exist_ok=True)
        config_path = destination / 'project.config.js'
        text = config_path.read_text()
        config = json.loads(text.removeprefix('export default').strip().removesuffix(';'))
        config.update(name=args.name, title=title)
        if args.seed is not None:
            config['seed'] = args.seed
        for name in ['width', 'depth']:
            if getattr(args, name) is not None:
                config['terrain'][name] = getattr(args, name)
        scale = max(config['terrain']['width'] / 34, config['terrain']['depth'] / 28)
        if args.width is not None or args.depth is not None:
            config['camera']['position'] = [v * scale for v in config['camera']['position']]
            config['camera']['viewHeight'] *= scale
        if args.people is not None:
            config['people']['count'] = args.people
            config['people']['economyCount'] = min(args.people, config['people']['economyCount'])
        if args.vehicles is not None:
            config['traffic']['count'] = args.vehicles
        if args.weather:
            config['weather']['preset'] = args.weather
        if args.terrain:
            config['terrain']['surface'] = args.terrain
        if args.day:
            config['lighting']['night'] = False
        config_path.write_text('export default ' + json.dumps(config, ensure_ascii=False, indent=2) + ';\n')
        package_path = destination / 'package.json'
        package = json.loads(package_path.read_text())
        package['name'] = args.name
        package_path.write_text(json.dumps(package, indent=2) + '\n')
    except Exception:
        if created:
            shutil.rmtree(destination)
        raise
    print(f'Created: {destination}')
    print(f'Scene entry: {destination / "scene.js"}')
    print(f'Configuration: {config_path}')
    print('Run: python3 ' + shlex.quote(str(destination / 'scripts/serve.py')) + ' --port 8768')
    print('Export offline HTML: python3 ' + shlex.quote(str(destination / 'scripts/export-html.py')))
    print('No npm install is required. Local Three.js 0.180.0 is included.')


if __name__ == '__main__':
    try:
        main()
    except (OSError, ValueError) as exc:
        sys.exit(f'Creation failed: {exc}')
