export const sensors = {
	full: { name: 'Full frame', w: 36, h: 24 },
	aps: { name: 'APS-C · 1.5×', w: 23.5, h: 15.7 },
	canon: { name: 'APS-C · 1.6×', w: 22.3, h: 14.9 },
	mft: { name: 'Micro Four Thirds', w: 17.3, h: 13 },
	medium: { name: 'Medium format · 44×33', w: 44, h: 33 },
};
export function optics(sensor, f, n, d) {
	const diagonal = Math.hypot(sensor.w, sensor.h),
		crop = Math.hypot(36, 24) / diagonal,
		coc = diagonal / 1500,
		s = d * 1000;
	const H = (f * f) / (n * coc) + f;
	const near = (H * s) / (H + s - f),
		far = H > s - f ? (H * s) / (H - s + f) : Infinity;
	return {
		crop,
		coc,
		H: H / 1000,
		near: near / 1000,
		far: far / 1000,
		dof: (far - near) / 1000,
		equivalent: f * crop,
		equivN: n * crop,
		pupil: f / n,
		aov: (2 * Math.atan(sensor.w / (2 * f)) * 180) / Math.PI,
		width: (d * sensor.w) / f,
	};
}
// Thin-lens image conjugates, with all distances in millimeters.
export function defocus(f, n, focusM, objectM) {
	const s = focusM * 1000,
		u = objectM * 1000;
	const sensorDistance = (f * s) / (s - f),
		imageDistance = (f * u) / (u - f);
	const blur = ((f / n) * Math.abs(sensorDistance - imageDistance)) / imageDistance;
	return { sensorDistance, imageDistance, blur };
}
