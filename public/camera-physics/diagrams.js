import { formatDistance } from './scene-model.js';
import { focalDefinition, lensShape, cameraBody, apertureStop } from './schematics.js';
import { defocus } from './optics.js';
const $ = (id) => document.getElementById(id);
const line = (x1, y1, x2, y2, color = '#2458d3', extra = '') =>
	`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="2" ${extra}/>`;
const text = (x, y, t, color = '#52637d', extra = '') =>
	`<text x="${x}" y="${y}" fill="${color}" font-family="DM Sans, sans-serif" font-size="12" ${extra}>${t}</text>`;
export function setupDiagrams(getValues, update) {
	[16, 35, 50, 135].forEach((f) => {
		const b = document.createElement('button');
		b.textContent = `${f} mm`;
		b.dataset.fov = f;
		b.onclick = () => {
			$('focal').value = f;
			document.querySelectorAll('[data-preset]').forEach((p) => p.classList.remove('chosen'));
			update();
		};
		$('fov-options').append(b);
	});
	$('human-reference').onclick = () => {
		const v = getValues(),
			crop = Math.hypot(36, 24) / Math.hypot(v.sensor.w, v.sensor.h);
		$('focal').value = (50 / crop).toFixed(1);
		document.querySelectorAll('[data-preset]').forEach((p) => p.classList.remove('chosen'));
		update();
	};
	$('test-distance').oninput = update;
	for (const [id, mult] of [
		['test-near', 0.7],
		['test-sharp', 1],
		['test-far', 1.5],
	])
		$(id).onclick = () => {
			$('test-distance').value = Math.max(
				+$('test-distance').min,
				Math.min(+$('test-distance').max, getValues().d * mult),
			);
			update();
		};
}
export function updateDiagrams(v, o) {
	const f = v.f;
	$('focal-definition').innerHTML = focalDefinition(f);
	const lengths = [16, 35, 50, 135],
		colors = ['#6485e8', '#f4b551', '#e97f43', '#c75c93'],
		cx = 95,
		center = 210,
		radius = 205;
	const edge = (fl) => {
		const a = Math.atan(v.sensor.w / (2 * fl));
		return { end: cx + radius * Math.cos(a), half: radius * Math.sin(a) };
	};
	let fan = `<rect width="620" height="430" rx="8" fill="#f4f6fa"/>${text(25, 29, `${v.sensor.name} · horizontal angle of view`)}${line(cx, 42, cx, 400, '#bec9dc', 'stroke-dasharray="4 5"')}`;
	lengths.forEach((fl, i) => {
		const { end, half } = edge(fl);
		fan += `<polygon points="${cx},${center} ${end},${center - half} ${end},${center + half}" fill="${colors[i]}" fill-opacity=".40" stroke="${colors[i]}" stroke-width="1"/>`;
	});
	// The human-vision convention is fixed at 50 mm on full frame, rather
	// than incorrectly treating a 50 mm lens on every sensor as the same view.
	const humanAngle = Math.atan(36 / (2 * 50)),
		hx = cx + radius * Math.cos(humanAngle),
		hy = radius * Math.sin(humanAngle);
	fan += `<path d="M${hx},${center - hy} L${cx},${center} L${hx},${center + hy}" fill="none" stroke="#172b4d" stroke-width="2" stroke-dasharray="5 4"/>${text(360, 345, 'Human vision reference', '#172b4d', 'font-weight="600"')}${text(360, 363, '50 mm full frame · 39.6° horizontal', '#52637d', 'font-size="10"')}<path d="M${hx},${center + hy} L345,340" fill="none" stroke="#172b4d" stroke-width="1" stroke-dasharray="3 3"/>`;
	$('human-equivalent').textContent =
		`On ${v.sensor.name}: about ${(50 / o.crop).toFixed(1)} mm for the same diagonal view.`;
	const { end, half: selectedHalf } = edge(f);
	fan += `<path d="M${end},${center - selectedHalf} L${cx},${center} L${end},${center + selectedHalf}" fill="none" stroke="#2458d3" stroke-width="3"/>${line(end, center - selectedHalf, end, center + selectedHalf, '#2458d3', 'stroke-width="3"')}<rect x="42" y="197" width="40" height="26" rx="5" fill="#192843"/><rect x="80" y="203" width="14" height="14" rx="2" fill="#192843"/>${text(62, 247, 'Camera', '#52637d', 'text-anchor="middle"')}${text(400, 408, `${f} mm → ${o.aov.toFixed(1)}°`, '#2458d3', 'text-anchor="end" font-weight="600"')}`;
	lengths.forEach((fl, i) => {
		fan += `<rect x="452" y="${118 + i * 48}" width="9" height="9" rx="2" fill="${colors[i]}"/>${text(470, 127 + i * 48, `${fl} mm`)}${text(470, 143 + i * 48, `${((2 * Math.atan(v.sensor.w / (2 * fl)) * 180) / Math.PI).toFixed(1)}°`, '#72819a')}`;
	});
	$('fov-diagram').setAttribute('viewBox', '0 0 620 430');
	$('fov-diagram').innerHTML = fan;
	$('fov-summary').textContent =
		`Selected: ${f} mm · ${o.aov.toFixed(1)}° horizontal · ${v.sensor.w} mm sensor width`;
	document.querySelectorAll('[data-fov]').forEach((b) => {
		const on = +b.dataset.fov === f;
		b.classList.toggle('selected', on);
		b.setAttribute('aria-pressed', on);
	});
	const u = +$('test-distance').value,
		a = defocus(f, v.n, v.d, u),
		ratio = a.blur / o.coc,
		mm = a.blur.toFixed(4);
	$('test-distance-value').textContent = formatDistance(u);
	const exact = Math.abs(u - v.d) < 0.001;
	$('blur-readout').textContent =
		`Blur ${mm} mm · ${exact ? 'Best geometric focus' : ratio <= 1 ? 'Within sharpness limit' : 'Outside sharpness limit'}`;
	$('blur-limit-compact').textContent = `${o.coc.toFixed(4)} mm`;
	$('blur-limit-summary').textContent =
		`This sensor uses a ${o.coc.toFixed(4)} mm (${(o.coc * 1000).toFixed(1)} µm) acceptable blur diameter. The current blur is ${ratio.toFixed(1)}× that diameter. Dashed rings mark this tolerance.`;
	const spotScale = Math.min(3 / o.coc, 18 / Math.max(a.blur, 1e-9));
	let focus = `<rect width="620" height="400" rx="8" fill="#f4f6fa"/>${text(20, 23, `Object: ${u.toFixed(3)} m · focus: ${v.d.toFixed(3)} m`)}${text(72, 52, 'Blur spot', '#cf4d78', 'text-anchor="middle" font-size="10"')}${text(145, 52, 'Sensor', '#d65d25', 'text-anchor="middle" font-size="10"')}${text(350, 52, 'Lens + stop', '#52637d', 'text-anchor="middle" font-size="10"')}${text(560, 52, 'Object', '#52637d', 'text-anchor="middle" font-size="10"')}`;
	const sensor = 145,
		lens = 350,
		qshift = (a.imageDistance - a.sensorDistance) / a.sensorDistance,
		ix = sensor - Math.tanh(qshift * 40) * 60;
	for (let row = 0; row < 2; row++) {
		const n = v.n * (row ? 2 : 1),
			y = 133 + row * 166,
			opening = (52 * 1.4) / n,
			blur = defocus(f, n, v.d, u).blur;
		focus += `${cameraBody(sensor, lens, y, 62)}${lensShape(lens, y, 56, 15)}${line(100, y, 585, y, '#c4cfe0', 'stroke-dasharray="4 5"')}${apertureStop(lens, y, opening, 56)}`;
		for (const sign of [-1, 1]) {
			const ly = y + sign * opening,
				ey = ly + ((y - ly) * (110 - lens)) / (ix - lens);
			focus += line(560, y, lens, ly) + line(lens, ly, 110, ey);
		}
		const circleHalf = opening * Math.abs(1 - (sensor - lens) / (ix - lens));
		focus += `${line(sensor, y - 52, sensor, y + 52, '#f17b3c', 'stroke-width="3"')}${line(sensor, y - circleHalf, sensor, y + circleHalf, '#cf4d78', 'stroke-width="5"')}<circle cx="${ix}" cy="${y}" r="3" fill="#2458d3"/><circle cx="560" cy="${y}" r="4" fill="#192843"/>${text(550, y + 38, `f/${Number(n.toFixed(1))}`, '#192843', 'text-anchor="middle" font-weight="600"')}${text(550, y + 53, row ? '2 stops smaller' : 'Current aperture', '#52637d', 'text-anchor="middle" font-size="10"')}${text(240, y + 80, `${blur.toFixed(4)} mm blur`, '#cf4d78', 'text-anchor="middle"')}<circle cx="72" cy="${y}" r="${o.coc * spotScale}" fill="none" stroke="#8c9db8" stroke-dasharray="2 2"/><circle cx="72" cy="${y}" r="${Math.max(0.6, blur * spotScale)}" fill="#cf4d7850" stroke="#cf4d78"/>`;
	}
	$('focus-diagram').setAttribute('viewBox', '0 0 620 400');
	$('focus-diagram').innerHTML = focus;
}
