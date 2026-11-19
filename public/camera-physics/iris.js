import { localize } from './i18n.js';
// A seven-blade schematic iris, with a polygonal opening and moving lamellas.
export function irisGeometry(n) {
	const radius = (24 * 1.4) / n,
		phase = 0.28 + 0.42 * (1 - 1.4 / n),
		count = 7;
	const point = (r, a) => [35 + r * Math.cos(a), 35 + r * Math.sin(a)];
	const vertices = Array.from({ length: count }, (_, i) =>
		point(radius, phase + (i * 2 * Math.PI) / count),
	);
	const blades = vertices.map((v, i) => {
		const next = vertices[(i + 1) % count],
			a = phase + (i * 2 * Math.PI) / count;
		const p = point(31, a - 0.48),
			q = point(31, a + (2 * Math.PI) / count - 0.48);
		return `M${v} L${next} L${q} A31,31 0 0 0 ${p} Z`;
	});
	return { opening: vertices.map((p) => p.join(',')).join(' '), blades };
}
let current = 2,
	frame;
export function setupIris(svg) {
	svg.innerHTML = `<defs><clipPath id="iris-clip"><circle cx="35" cy="35" r="31"/></clipPath></defs><circle cx="35" cy="35" r="34" fill="#172840"/><circle cx="35" cy="35" r="30" fill="#ffad71"/><g clip-path="url(#iris-clip)">${Array.from({ length: 7 }, (_, i) => `<path data-blade="${i}" fill="${['#445770', '#3b4d65', '#34455e'][i % 3]}" stroke="#7d8da5" stroke-width=".5"/>`).join('')}</g><circle cx="35" cy="35" r="31" fill="none" stroke="#172840" stroke-width="2"/>`;
	paint(svg, current);
}
function paint(svg, n) {
	const g = irisGeometry(n);
	svg.querySelectorAll('[data-blade]').forEach((p, i) => p.setAttribute('d', g.blades[i]));
	svg.setAttribute('aria-label', `Seven aperture blades at f/${Number(n.toFixed(1))}`);
	localize(svg);
}
export function animateIris(svg, n) {
	if (Math.abs(current - n) < 0.001) return;
	cancelAnimationFrame(frame);
	const start = current,
		at = performance.now(),
		reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
	function tick(now) {
		const t = reduced ? 1 : Math.min(1, (now - at) / 260),
			ease = 1 - (1 - t) ** 3;
		current = start + (n - start) * ease;
		paint(svg, current);
		if (t < 1) frame = requestAnimationFrame(tick);
	}
	frame = requestAnimationFrame(tick);
}
