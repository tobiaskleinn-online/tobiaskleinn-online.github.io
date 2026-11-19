export const scenePresets = {
	portrait: {
		name: 'Portrait',
		f: 50,
		n: 2,
		focus: 3,
		foreground: 1,
		subject: 3,
		background: 15,
		max: 50,
		min: 0.3,
		step: 0.1,
	},
	landscape: {
		name: 'Landscape',
		f: 24,
		n: 8,
		focus: 60,
		cameraPosition: -12,
		foreground: 15,
		subject: 60,
		background: 70,
		max: 100,
		min: 0.3,
		step: 0.1,
	},
	macro: {
		name: 'Macro',
		f: 50,
		n: 8,
		focus: 0.132,
		foreground: 0.095,
		subject: 0.12,
		background: 0.3,
		max: 1,
		min: 0.065,
		step: 0.0001,
	},
};
export function newScene(key) {
	return { ...scenePresets[key], key };
}
export const formatDistance = (m) =>
	!Number.isFinite(m)
		? '∞'
		: m < 0.01
			? `${(m * 1000).toFixed(1)} mm`
			: m < 1
				? `${(m * 100).toFixed(1)} cm`
				: `${m.toFixed(2)} m`;
export function limitScene(scene, f) {
	const min = Math.max(scene.min, (f / 1000) * 1.1);
	for (const key of ['foreground', 'subject', 'background'])
		scene[key] = Math.max(min, Math.min(scene.max, scene[key]));
	scene.subject = Math.max(scene.subject, scene.foreground + scene.step);
	scene.background = Math.max(scene.background, scene.subject + scene.step);
	return min;
}
export function setObjectDistance(scene, key, value, min = scene.min) {
	value = Number((Math.round(value / scene.step) * scene.step).toFixed(3));
	const gap = scene.step;
	const bounds =
		key === 'foreground'
			? [min, scene.subject - gap]
			: key === 'subject'
				? [scene.foreground + gap, scene.background - gap]
				: [scene.subject + gap, scene.max];
	scene[key] = Math.min(Math.max(bounds[0], value), Math.max(bounds[0], bounds[1]));
	return scene[key];
}
export function sceneScale(scene) {
	const min = scene.min,
		max = scene.max,
		span = Math.log(max / min);
	return {
		x: (d) => 135 + (Math.log(Math.max(min, Math.min(max, d)) / min) / span) * 535,
		d: (x) => min * Math.exp(Math.max(0, Math.min(1, (x - 135) / 535)) * span),
	};
}
export function topView(scene, v, o) {
	const { x } = sceneScale(scene),
		near = x(o.near),
		far = x(o.far);
	return `<rect width="720" height="330" fill="#f4f6fa"/><text x="22" y="25" font-size="13" font-family="sans-serif" fill="#192843">${scene.name} · drag objects or the focus line</text><rect x="${near}" y="45" width="${Math.max(2, far - near)}" height="230" fill="#ffe6ae" opacity=".7"/><path d="M65 45v230M85 160H690" stroke="#c3d0e6" stroke-dasharray="4 5"/><rect x="38" y="146" width="43" height="30" rx="5" fill="#192843"/><rect x="80" y="151" width="18" height="20" rx="2" fill="#192843"/><text x="66" y="199" font-size="11" text-anchor="middle" fill="#52637d">Camera</text><path d="M${x(v.d)} 42v235" stroke="#2458d3" stroke-width="2"/><g data-drag="focus" role="slider" tabindex="0" aria-label="Focus plane distance" aria-valuemin="${scene.min}" aria-valuemax="${scene.max}" aria-valuenow="${v.d}" aria-valuetext="${formatDistance(v.d)}"><path d="M${x(v.d)} 40v240" stroke="transparent" stroke-width="26"/><path d="M${x(v.d) - 8} 42h16l-8 10z" fill="#2458d3"/><text x="${x(v.d)}" y="312" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#2458d3">Focus ${formatDistance(v.d)}</text></g>${[
		['foreground', 'Foreground', 95, '#7195a6'],
		[
			'subject',
			scene.key === 'portrait' ? 'Person' : scene.key === 'macro' ? 'Ladybird' : 'Cypress trees',
			165,
			'#db8749',
		],
		['background', 'Background', 235, '#8c80b9'],
	]
		.map(
			([key, label, y, col]) =>
				`<g data-drag="${key}" role="slider" tabindex="0" aria-label="${label} distance" aria-valuemin="${scene.min}" aria-valuemax="${scene.max}" aria-valuenow="${scene[key]}" aria-valuetext="${formatDistance(scene[key])}"><circle cx="${x(scene[key])}" cy="${y}" r="16" fill="${col}" stroke="white" stroke-width="3"/><path d="M${x(scene[key]) - 7} ${y}h14m-11-4l-4 4 4 4m8-8l4 4-4 4" stroke="white" fill="none"/><text x="${x(scene[key])}" y="${y - 24}" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#52637d">${label} · ${formatDistance(scene[key])}</text></g>`,
		)
		.join(
			'',
		)}<text x="22" y="295" font-family="sans-serif" font-size="10" fill="#7c8ba3">Yellow: depth of field · Distance axis uses a logarithmic scale</text>`;
}
