import { lensShape, cameraBody, apertureStop } from './schematics.js';
// Object-space illustration: the camera is on the left and subjects on the right.
// Limits are numerical; spatial layout and ray angles are schematic.
export function lightDiagram(v, o) {
	const label = (x, y, t, c = '#52637d', extra = '') =>
		`<text x="${x}" y="${y}" fill="${c}" font-family="DM Sans,sans-serif" font-size="12" ${extra}>${t}</text>`;
	const line = (a, b, c, d, color = '#2458d3', extra = '') =>
		`<line x1="${a}" y1="${b}" x2="${c}" y2="${d}" stroke="${color}" stroke-width="2" ${extra}/>`;
	const depthLength = Number.isFinite(o.dof)
		? o.dof < 0.01
			? `${(o.dof * 1000).toFixed(1)} mm`
			: o.dof < 1
				? `${(o.dof * 100).toFixed(1)} cm`
				: `${o.dof.toFixed(2)} m`
		: '∞ (unbounded)';
	const m = (n) =>
		!Number.isFinite(n) ? '∞' : n < 1 ? `${(n * 1000).toFixed(1)} mm` : `${n.toFixed(2)} m`;
	const cy = 174,
		lens = 220,
		sensor = 82,
		ap = 220,
		focus = 435 + (55 * Math.log(v.d / 0.5)) / Math.log(60);
	// Keep focus fixed visually so aperture changes are easy to compare. Map the
	// near/far limits monotonically on either side, without asserting a linear scale.
	const x = (n) =>
		!Number.isFinite(n)
			? 637
			: n <= v.d
				? focus - 145 * (1 - n / v.d)
				: focus + 145 * (1 - v.d / n);
	const near = x(o.near),
		far = x(o.far),
		opening = (70 * 1.4) / v.n;
	let svg = `<rect width="720" height="370" rx="8" fill="#f4f6fa"/>${label(25, 28, `${v.f} mm · f/${v.n} · focus ${m(v.d)}`, '#192843', 'font-weight="600"')}${label(695, 28, 'OBJECT SPACE', '#7a89a0', 'text-anchor="end" font-size="10"')}<rect x="${near}" y="100" width="${Math.max(2, far - near)}" height="145" fill="#ffe4a6" fill-opacity=".65" rx="3"/>${line(35, cy, 680, cy, '#bac8df', 'stroke-dasharray="4 5"')}${cameraBody(sensor, lens, cy, 88)}${line(sensor, 105, sensor, 243, '#f17b3c', 'stroke-width="7"')}${lensShape(lens, cy, 77, 19)}`;
	// Rays from the focused axial object point travel through the opening and
	// converge to one point on the sensor. Their slopes respond to aperture.
	for (const sign of [-1, 1]) {
		const atLens = cy + sign * opening,
			extY = atLens + ((cy - atLens) * (675 - lens)) / (focus - lens);
		svg += `${line(sensor, cy, lens, atLens, '#2d84d6')}${line(lens, atLens, 675, extY, '#2d84d6')}`;
	}
	svg += `${line(ap, 96, ap, cy - (opening * (focus - ap)) / (focus - lens), '#192843', 'stroke-width="7"')}${line(ap, cy + (opening * (focus - ap)) / (focus - lens), ap, 252, '#192843', 'stroke-width="7"')}<circle cx="${sensor}" cy="${cy}" r="4" fill="#f17b3c"/>`;
	for (const [xx, name, num, col] of [
		[near, 'Near limit', m(o.near), '#bd5570'],
		[focus, 'Focus distance', m(v.d), '#192843'],
		[far, 'Far limit', m(o.far), '#3476af'],
	]) {
		const yy = name === 'Focus distance' ? 58 : 86;
		const tx = name === 'Focus distance' ? focus : name === 'Near limit' ? 345 : 620;
		svg += `${line(xx, 96, xx, 252, col, 'stroke-width="1" stroke-dasharray="3 5"')}<circle cx="${xx}" cy="${cy}" r="${name === 'Focus distance' ? 5 : 3}" fill="${col}"/>${line(tx, yy + 6, xx, 98, col, 'stroke-width="1"')}${label(tx, yy - 15, name, col, 'text-anchor="middle" font-size="11"')}${label(tx, yy, num, col, 'text-anchor="middle" font-weight="600"')}`;
	}
	svg += `${line(near, 273, far, 273, '#be8d29')}${line(near, 267, near, 279, '#be8d29')}${line(far, 267, far, 279, '#be8d29')}${label((near + far) / 2, 298, 'Depth of field', '#87621e', 'text-anchor="middle"')}${label((near + far) / 2, 316, depthLength, '#87621e', 'text-anchor="middle" font-weight="600"')}${label(sensor, 289, 'Sensor', '#d65d25', 'text-anchor="middle"')}${label(lens - 10, 289, 'Lens', '#52637d', 'text-anchor="middle"')}${label(ap + 10, 309, 'Aperture', '#52637d', 'text-anchor="middle"')}${label(360, 344, 'Light travels from the subject toward the sensor ←', '#52637d', 'text-anchor="middle" font-size="11"')}${label(360, 362, 'Schematic ray geometry · numerical focus limits from the depth-of-field model', '#7a89a0', 'text-anchor="middle" font-size="9"')}`;
	return svg;
}
