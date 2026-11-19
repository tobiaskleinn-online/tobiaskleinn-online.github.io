import { formatDistance } from './scene-model.js';
// Isometric projection of a 3D scene; all object motion is constrained to X.
export function scene3DScale(scene) {
	const k = scene.min * 3,
		hi = scene.max * 1.5,
		lo = scene.max * 0.5;
	return {
		x: (w) =>
			140 +
			(w >= 0
				? (460 * Math.log1p(w / k)) / Math.log1p(hi / k)
				: (-100 * Math.log1p(-w / k)) / Math.log1p(lo / k)),
		world: (x) =>
			x >= 140
				? k * Math.expm1(((x - 140) / 460) * Math.log1p(hi / k))
				: -k * Math.expm1(((140 - x) / 100) * Math.log1p(lo / k)),
	};
}
export function shiftCamera(scene, position, focus, focal) {
	const old = scene.cameraPosition || 0,
		min = Math.max(scene.min, (focal / 1000) * 1.1),
		lower = Math.max(-scene.max * 0.45, old + scene.background - scene.max),
		upper = old + scene.foreground - min;
	let next = Math.round(position / scene.step) * scene.step;
	next = Math.max(lower, Math.min(upper, next));
	const delta = old - next;
	for (const key of ['foreground', 'subject', 'background'])
		scene[key] = Number((scene[key] + delta).toFixed(6));
	scene.cameraPosition = next;
	return Math.max(min, Math.min(scene.max, focus + delta));
}
export const cameraPositionText = (n) =>
	n === 0 ? '0 m' : `${n < 0 ? '−' : ''}${formatDistance(Math.abs(n))}`;
export function scene3D(scene, v, o) {
	const scale = scene3DScale(scene),
		camera = scene.cameraPosition || 0;
	const p = (x, y, z) => [58 + x * 0.86 + y * 0.42, 310 - x * 0.12 + y * 0.28 - z * 0.9];
	const point = (x, y, z) => p(scale.x(x), y, z),
		pts = (a) => a.map((q) => q.join(',')).join(' ');
	const poly = (a, fill, stroke = 'none', extra = '') =>
		`<polygon points="${pts(a)}" fill="${fill}" stroke="${stroke}" ${extra}/>`;
	const text = (x, y, s, c = 'var(--muted)', extra = '') =>
		`<text x="${x}" y="${y}" fill="${c}" font-family="system-ui,sans-serif" font-size="12" ${extra}>${s}</text>`;
	const box = (x1, x2, y1, y2, z, fill, stroke) =>
		poly([p(x1, y1, 0), p(x2, y1, 0), p(x2, y1, z), p(x1, y1, z)], fill, stroke) +
		poly([p(x1, y1, z), p(x2, y1, z), p(x2, y2, z), p(x1, y2, z)], fill, stroke) +
		poly([p(x2, y1, 0), p(x2, y2, 0), p(x2, y2, z), p(x2, y1, z)], fill, stroke);
	const nx = scale.x(camera + o.near),
		fx = scale.x(camera + (Number.isFinite(o.far) ? o.far : scene.max)),
		focus = scale.x(camera + v.d),
		ground = point(camera, 0, 0),
		far = point(camera + scene.max, 0, 0);
	let svg = `<rect width="720" height="430" rx="8" fill="var(--paper)"/>${text(22, 28, '3D scene · drag along the distance axis', 'var(--ink)', 'font-weight="600"')}`;
	svg += poly(
		[p(35, -90, 0), p(665, -90, 0), p(665, 95, 0), p(35, 95, 0)],
		'var(--surface)',
		'var(--line)',
	);
	for (let x = 60; x <= 660; x += 50)
		svg += `<path d="M${p(x, -90, 0)}L${p(x, 95, 0)}" stroke="var(--line)" stroke-width=".6"/>`;
	for (let y = -60; y <= 90; y += 30)
		svg += `<path d="M${p(35, y, 0)}L${p(665, y, 0)}" stroke="var(--line)" stroke-width=".6"/>`;
	svg += box(nx, Math.max(nx + 1, fx), -60, 60, 165, '#eebc4c22', '#cda33b66');
	svg += `<path d="M${ground}L${far}" stroke="var(--accent)" stroke-width="1.5" stroke-dasharray="5 5"/>`;
	const plane = [p(focus, -65, 0), p(focus, 65, 0), p(focus, 65, 175), p(focus, -65, 175)];
	svg += poly(plane, '#7ba6ee16', 'var(--accent)', 'stroke-dasharray="4 4"');
	const handle = (key, label, distance, draw, color, z = 0) => {
		const x = scale.x(camera + distance),
			[gx, gy] = p(x, 0, 0),
			value = key === 'camera' ? camera : distance,
			min = key === 'camera' ? -scene.max * 0.45 : scene.min,
			max =
				key === 'camera'
					? camera + scene.foreground - Math.max(scene.min, (v.f / 1000) * 1.1)
					: scene.max,
			labelY = key === 'foreground' ? 75 : key === 'background' ? 85 : 43,
			labelX = key === 'camera' ? gx - 14 : gx,
			anchor = key === 'camera' ? 'end' : 'middle';
		return `<g data-3d-drag="${key}" role="slider" tabindex="0" aria-label="${label} distance" aria-valuemin="${min}" aria-valuemax="${max}" aria-valuenow="${value}" aria-valuetext="${key === 'camera' ? cameraPositionText(value) : formatDistance(value)}"><ellipse cx="${gx}" cy="${gy + 5}" rx="29" ry="10" fill="${color}" opacity=".13"/>${draw(x, gx, gy)}<circle cx="${gx}" cy="${gy + 18}" r="12" fill="${color}" stroke="var(--surface)" stroke-width="2"/><path d="M${gx - 6} ${gy + 18}h12m-8-3l-3 3 3 3m4-6l3 3-3 3" stroke="white" fill="none" stroke-width="1.2"/>${text(labelX, gy + labelY, label, 'var(--ink)', `text-anchor="${anchor}" font-size="11"`)}${text(labelX, gy + labelY + 16, key === 'camera' ? cameraPositionText(value) : formatDistance(value), 'var(--muted)', `text-anchor="${anchor}" font-size="10"`)}<rect x="${gx - 32}" y="${gy - z - 12}" width="64" height="${z + 45}" fill="transparent"/></g>`;
	};
	// Far objects are painted first so the translucent volume remains legible.
	svg += handle(
		'background',
		'Background',
		scene.background,
		(x, gx, gy) => {
			let wall = box(x - 4, x + 6, -40, 40, 104, '#c7a681', '#a18061');
			for (let i = 0; i < 4; i++)
				wall += `<path d="M${gx - 33 + i * 16} ${gy - 34}v-30q7-15 13 0v30Z" fill="#73685c"/>`;
			return wall;
		},
		'#927ec7',
		105,
	);
	const subject =
		scene.key === 'portrait' ? 'Person' : scene.key === 'macro' ? 'Ladybird' : 'Cypress trees';
	svg += handle(
		'subject',
		subject,
		scene.subject,
		(x, gx, gy) =>
			scene.key === 'macro'
				? `<path d="M${gx - 25} ${gy}Q${gx + 5} ${gy - 90} ${gx + 26} ${gy - 22}" fill="none" stroke="#bba67b" stroke-width="5"/><ellipse cx="${gx + 3}" cy="${gy - 50}" rx="13" ry="18" fill="#df822f"/><path d="M${gx + 3} ${gy - 67}v34" stroke="#272e2c"/><circle cx="${gx - 4}" cy="${gy - 54}" r="3" fill="#272e2c"/>`
				: scene.key === 'landscape'
					? `<path d="M${gx} ${gy}v-103" stroke="#736044" stroke-width="5"/><path d="M${gx} ${gy - 130}Q${gx - 34} ${gy - 45} ${gx} ${gy - 24}Q${gx + 34} ${gy - 45} ${gx} ${gy - 130}" fill="#557567"/>`
					: `<path d="M${gx - 12} ${gy}l4-48m20 48l-4-48" stroke="#35465c" stroke-width="8" stroke-linecap="round"/><path d="M${gx - 20} ${gy - 47}l5-59h30l5 59Z" fill="#e7e9e8" stroke="#aeb9c8"/><path d="M${gx - 15} ${gy - 94}l-10 38m40-38l10 38" stroke="#d5dce2" stroke-width="8" stroke-linecap="round"/><circle cx="${gx}" cy="${gy - 121}" r="13" fill="#d5ae8b"/><path d="M${gx - 12} ${gy - 125}q12-19 24 0" stroke="#5d4a3c" stroke-width="6" fill="none"/><path d="M${gx - 11} ${gy - 121}h22" stroke="#344256" stroke-width="3"/>`,
		'#dc9059',
		140,
	);
	svg += handle(
		'foreground',
		'Foreground',
		scene.foreground,
		(x, gx, gy) =>
			`<path d="M${gx - 18} ${gy - 26}h36l-5 26h-26Z" fill="#bd8a61"/><path d="M${gx} ${gy - 21}v-43" stroke="#6a8467" stroke-width="4"/><ellipse cx="${gx - 11}" cy="${gy - 52}" rx="12" ry="22" fill="#8ca179" transform="rotate(-30 ${gx - 11} ${gy - 52})"/><ellipse cx="${gx + 11}" cy="${gy - 44}" rx="11" ry="22" fill="#78946d" transform="rotate(30 ${gx + 11} ${gy - 44})"/>`,
		'#6a9aa2',
		80,
	);
	svg += handle(
		'camera',
		'Camera',
		0,
		(x, gx, gy) =>
			box(x - 21, x + 19, -15, 15, 46, '#3e526c', '#7389a5') +
			`<ellipse cx="${gx + 20}" cy="${gy - 27}" rx="10" ry="14" fill="#182c44" stroke="#8da2ba" stroke-width="3"/>`,
		'#5276bc',
		55,
	);
	const [hx, hy] = p(focus, -65, 175);
	svg += `<g data-3d-drag="focus" role="slider" tabindex="0" aria-label="Focus plane distance" aria-valuemin="${scene.min}" aria-valuemax="${scene.max}" aria-valuenow="${v.d}" aria-valuetext="${formatDistance(v.d)}"><circle cx="${hx}" cy="${hy}" r="9" fill="var(--accent)"/>${text(hx + 14, hy + 4, 'Focus ' + formatDistance(v.d), 'var(--accent)', 'font-size="11"')}<rect x="${hx - 20}" y="${hy - 20}" width="130" height="40" fill="transparent"/></g>`;
	svg +=
		text(
			22,
			385,
			'Gold volume: depth of field · ' + formatDistance(o.dof),
			'#aa8130',
			'font-size="11"',
		) +
		text(
			22,
			408,
			'Schematic 3D view · logarithmic distance axis',
			'var(--muted)',
			'font-size="10"',
		);
	return svg;
}
