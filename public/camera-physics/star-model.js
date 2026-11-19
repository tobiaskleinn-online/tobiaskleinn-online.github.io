// Local small-angle image-plane drift for a stationary, untracked camera.
export const siderealRate = (2 * Math.PI) / 86164.0905; // radians per second
export function starExposure(sensor, focal, megapixels, tolerance = 2, declination = 0) {
	if (
		!sensor ||
		![sensor.w, sensor.h, focal, megapixels, tolerance, declination].every(Number.isFinite) ||
		sensor.w <= 0 ||
		sensor.h <= 0 ||
		focal < 1 ||
		focal > 2000 ||
		megapixels < 1 ||
		megapixels > 200 ||
		tolerance <= 0 ||
		tolerance > 10 ||
		declination < 0 ||
		declination > 85
	)
		throw new RangeError('Invalid star exposure inputs');
	const pitch = Math.sqrt((sensor.w * sensor.h) / (megapixels * 1e6)) * 1000;
	const crop = Math.hypot(36, 24) / Math.hypot(sensor.w, sensor.h);
	const pixelsPerSecond =
		(focal * siderealRate * Math.cos((declination * Math.PI) / 180)) / (pitch / 1000);
	const limit = tolerance / pixelsPerSecond,
		rule500 = 500 / (focal * crop);
	return { pitch, crop, pixelsPerSecond, limit, rule500, rule500Drift: rule500 * pixelsPerSecond };
}
export function cameraTime(limit) {
	const times = [
		1 / 8000,
		1 / 4000,
		1 / 2000,
		1 / 1000,
		1 / 500,
		1 / 250,
		1 / 125,
		1 / 60,
		1 / 30,
		1 / 15,
		1 / 8,
		1 / 4,
		0.5,
		1,
		1.3,
		1.6,
		2,
		2.5,
		3.2,
		4,
		5,
		6,
		8,
		10,
		13,
		15,
		20,
		25,
		30,
	];
	if (!Number.isFinite(limit) || limit <= 0) throw new RangeError('Invalid exposure time');
	if (limit >= 30) return Math.floor(limit);
	return times.filter((t) => t <= limit * (1 + 1e-12)).at(-1) || limit;
}
