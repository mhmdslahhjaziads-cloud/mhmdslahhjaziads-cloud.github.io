"""Catch accidental media nesting in the stylesheet bundle."""
from pathlib import Path
import json
import tinycss2

root = Path(__file__).resolve().parents[1]
filename = json.loads((root / 'docs/performance-sizes.json').read_text())['filename']
rules = tinycss2.parse_stylesheet((root / 'assets/css' / filename).read_text(encoding='utf-8'))
root_selectors = [tinycss2.serialize(r.prelude).strip() for r in rules if r.type == 'qualified-rule']
for selector in [
    '#hegazy-preview #hp-services .hp-services-title',
    '#hegazy-preview .hp-tracking-grid',
    '#hegazy-preview .hp-journey-stop .hp-company-logo',
    '#hegazy-preview #hp-services .hp-service-compact',
]:
    assert selector in root_selectors, f'Global rule was accidentally nested: {selector}'
print('PASS: global section, company logo and compact card rules retain their media scope.')
