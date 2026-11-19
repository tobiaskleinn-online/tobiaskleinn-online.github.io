import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import postcss from 'postcss';
import { sensors, optics, defocus } from '../public/camera-physics/optics.js';
const root = path.resolve(import.meta.dirname, '..');
// Independent optical reference: 50 mm at f/2 has a 25 mm entrance pupil.
const reference = optics(sensors.full, 50, 2, 3);
assert.equal(reference.pupil, 25);
assert.equal(reference.equivalent, 50);
assert(reference.near > 2.7 && reference.near < 2.9);
assert(reference.far > 3.2 && reference.far < 3.3);
assert(optics(sensors.full, 50, 8, 3).dof > reference.dof);
assert.equal(defocus(50, 2, 3, 3).blur, 0);
assert(Math.abs(defocus(50, 2, 3, 4).blur / defocus(50, 4, 3, 4).blur - 2) < 1e-10);
const importedCSS = postcss.parse(
	await fs.readFile(path.join(root, 'src/styles/camera-physics-import.css'), 'utf8'),
);
importedCSS.walkRules((rule) => {
	if (rule.parent.type === 'atrule' && /keyframes/.test(rule.parent.name)) return;
	for (const selector of rule.selectors)
		assert(selector.includes('.camera-app'), `Unscoped imported rule: ${selector}`);
});
// Check the imported module graph and module-relative photographic assets.
const directory = path.join(root, 'public/camera-physics');
for (const name of (await fs.readdir(directory)).filter((name) => name.endsWith('.js'))) {
	const source = await fs.readFile(path.join(directory, name), 'utf8');
	// Scene documents intentionally contain their own inline module and data URLs.
	if (name === 'scene-documents.js' || name === 'vendor-3d.js') continue;
	for (const match of source.matchAll(/(?:from\s*|import\s*\()(['"])(\.\/[^'"]+\.js)\1/g))
		await fs.access(path.resolve(directory, match[2]));
}
for (const name of ['portrait-cutout.png', 'portrait-background.jpg', 'night-foreground.png'])
	await fs.access(path.join(directory, 'images', name));
const html = await fs.readFile(path.join(root, 'src/data/camera-physics.html'), 'utf8');
for (const id of ['lab', 'learn', 'tools', 'camera-controls']) assert(html.includes(`id="${id}"`));
assert(!html.includes('<header class="site-header">'));
assert(!html.includes('<main>'));
assert(!html.includes('camera-physics.html'));
console.log(
	'Camera integration checks passed: optical reference values, CSS isolation, runtime imports, assets and route targets.',
);

assert(!html.includes('id="explore"'));
assert(!html.includes('footer-lab'));
assert(!html.includes('data-language'));
assert(!html.includes('Learn &amp; Experiment'));
assert(html.includes('Camera and optics basics'));
const { getLanguage } = await import('../public/camera-physics/i18n.js');
assert.equal(getLanguage(), 'en');
assert(
	!(await fs
		.readFile(path.join(directory, 'i18n.js'), 'utf8')
		.then((text) => text.includes('localStorage'))),
);
// Sliders must remain visible against both page and panel backgrounds in each theme.
const tokenCSS = await fs.readFile(path.join(root, 'src/styles/tokens.css'), 'utf8');
const blocks = tokenCSS.split(':root[data-theme=');
const parseColors = (text) =>
	Object.fromEntries(
		[...text.matchAll(/--([\w-]+):\s*(#[\da-f]{6})/gi)].map((match) => [match[1], match[2]]),
	);
const luminance = (hex) => {
	const rgb = [1, 3, 5]
		.map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
		.map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
	return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
};
const contrast = (a, b) =>
	(Math.max(luminance(a), luminance(b)) + 0.05) / (Math.min(luminance(a), luminance(b)) + 0.05);
for (const palette of [parseColors(blocks[0]), parseColors(blocks[1].split(':root {')[0])]) {
	for (const surface of ['paper', 'soft'])
		assert(
			contrast(palette['slider-track'], palette[surface]) >= 3,
			'Slider track has insufficient contrast',
		);
	assert(
		contrast(palette['slider-thumb'], palette['slider-track']) >= 3,
		'Slider handle has insufficient contrast',
	);
}
console.log(
	'Publishing checks passed: simplified navigation, English-only UI, and slider contrast in both themes.',
);
