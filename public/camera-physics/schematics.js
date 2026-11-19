export const svgText = (x, y, t, c = '#52637d', extra = '') =>
	`<text x="${x}" y="${y}" fill="${c}" font-family="DM Sans,sans-serif" font-size="12" ${extra}>${t}</text>`;
export const svgLine = (x1, y1, x2, y2, c = '#2458d3', extra = '') =>
	`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="2" ${extra}/>`;
export function lensShape(x, y, h = 72, w = 22) {
	return `<path class="lens-glass" d="M${x},${y - h} Q${x - w * 2},${y} ${x},${y + h} Q${x + w * 2},${y} ${x},${y - h} Z" fill="#b5ddf488" stroke="#79a8ce" stroke-width="1.4"/>`;
}
export function cameraBody(sensor, lens, y, h = 80) {
	return `<path d="M${sensor - 25},${y - h + 12} L${sensor + 10},${y - h + 12} L${sensor + 20},${y - h} L${lens - 28},${y - h} L${lens - 28},${y - h + 20} L${lens + 28},${y - h + 20} L${lens + 28},${y + h - 20} L${lens - 28},${y + h - 20} L${lens - 28},${y + h} L${sensor - 25},${y + h} Z" fill="#ffffffbb" stroke="#c8d5e9" stroke-width="1.5"/>`;
}
export function apertureStop(x, y, half, h = 72) {
	return (
		svgLine(x, y - h, x, y - half, '#192843', 'stroke-width="4"') +
		svgLine(x, y + half, x, y + h, '#192843', 'stroke-width="4"')
	);
}
export function focalDefinition(f) {
	const sensor = 115,
		lens = 315,
		y = 125;
	return `<rect width="620" height="285" rx="8" fill="#f4f6fa"/>${svgText(25, 28, 'Infinity focus · light travels right to left ←')}${cameraBody(sensor, lens, y, 73)}${lensShape(lens, y, 65, 18)}${svgLine(25, y, 590, y, '#c4cfe0', 'stroke-dasharray="4 5"')}${svgLine(sensor, 60, sensor, 190, '#f17b3c', 'stroke-width="4"')}${[-42, 0, 42].map((d) => svgLine(590, y + d, lens, y + d) + svgLine(lens, y + d, sensor, y)).join('')}${svgLine(lens, 48, lens, 204, '#6c86ad', 'stroke-dasharray="4 5"')}<circle cx="${sensor}" cy="${y}" r="4" fill="#f17b3c"/>${svgText(sensor - 12, y - 12, 'F′', '#d65d25', 'text-anchor="end"')}${svgText(sensor, 224, 'Sensor / focal plane', '#d65d25', 'text-anchor="middle" font-size="10"')}${svgText(lens, 224, 'Rear principal plane H′', '#52637d', 'text-anchor="middle" font-size="10"')}${svgText(540, 210, 'Distant object →', '#52637d', 'text-anchor="middle" font-size="10"')}${svgLine(sensor, 248, lens, 248, '#192843')}${svgLine(sensor, 242, sensor, 254, '#192843')}${svgLine(lens, 242, lens, 254, '#192843')}${svgText((lens + sensor) / 2, 274, `f = ${f} mm`, '#2458d3', 'text-anchor="middle" font-weight="600"')}`;
}
