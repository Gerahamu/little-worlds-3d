#!/usr/bin/env python3
"""Embed the ES module graph, CSS and vendored Three.js into one offline HTML."""
import argparse
import base64
import json
from pathlib import Path
import re
import sys

IMPORT = re.compile(r"(?P<prefix>\bfrom\s*|\bimport\s*)(?P<quote>['\"])(?P<spec>[^'\"\n]+)(?P=quote)")


def export(project, output):
    sources = {}
    def canonical(path):
        return 'lw/' + path.relative_to(project).as_posix()
    def resolve(parent, spec):
        if spec == 'three':
            target = project / 'vendor/three/build/three.module.js'
        elif spec.startswith('three/addons/'):
            target = project / 'vendor/three/examples/jsm' / spec.removeprefix('three/addons/')
        elif spec.startswith('.'):
            target = parent.parent / spec
        else:
            raise ValueError(f'Unvendored dependency {spec!r} in {parent.name}')
        target = target.resolve()
        target.relative_to(project)
        if not target.is_file():
            raise ValueError(f'Missing module: {target}')
        return target
    def collect(path):
        key = canonical(path)
        if key in sources:
            return key
        sources[key] = ''
        text = path.read_text()
        def rewrite(match):
            target = resolve(path, match['spec'])
            return match['prefix'] + match['quote'] + collect(target) + match['quote']
        sources[key] = IMPORT.sub(rewrite, text)
        return key
    entry = collect(project / 'src/main.js')
    imports = {key: 'data:text/javascript;base64,' + base64.b64encode(text.encode()).decode() for key, text in sources.items()}
    html = (project / 'index.html').read_text()
    html = re.sub(r'<link\s+rel="stylesheet"\s+href="\./styles.css"\s*>', lambda _: '<style>' + (project / 'styles.css').read_text() + '</style>', html)
    html = re.sub(r'<script type="importmap">.*?</script>', lambda _: '<script type="importmap">' + json.dumps({'imports': imports}, separators=(',', ':')) + '</script>', html, flags=re.S)
    html = html.replace('<script type="module" src="./src/main.js"></script>', '<script type="module">import ' + json.dumps(entry) + ';</script>')
    if 'src="./src/main.js"' in html or 'href="./styles.css"' in html:
        raise ValueError('HTML entry was not inlined')
    license_text = (project / 'vendor/three/LICENSE').read_text().replace('--', '- -')
    html = html.replace('</head>', '<!-- Three.js 0.180.0 license\n' + license_text + '\n-->\n</head>')
    if output.resolve() == (project / 'index.html').resolve():
        raise ValueError('Refusing to replace the editable source entry')
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(html)
    return len(sources), len(html.encode())


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path)
    args = parser.parse_args()
    project = Path(__file__).resolve().parent.parent
    config = json.loads((project / 'project.config.js').read_text().removeprefix('export default').strip().removesuffix(';'))
    output = (args.output or project / 'dist' / (config['name'] + '.html')).expanduser().absolute()
    try:
        count, size = export(project, output)
    except (OSError, ValueError) as exc:
        sys.exit(f'Export failed: {exc}')
    print(f'Exported {output}: {count} modules, {size:,} bytes. Three.js included; no network required.')
