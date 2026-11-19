import { setupIntegratedScenes } from './integrated-scenes.js';
import { setupPortrait3D } from './portfolio-portrait.js';
import { scene3D, scene3DScale, shiftCamera } from './scene-3d.js';
import { setupComparison } from './comparison.js';
import { setupTools } from './tools.js';
import { mountLessonVisual, releaseLessonDiagrams, updateLessonVisual } from './basics-visuals.js';
import { setupTheme } from './theme.js';
import { setupLanguage, localize } from './i18n.js';
import { setupEffects, openLearningGroup } from './effects.js';
import { setupIris, animateIris } from './iris.js';
import {
	newScene,
	scenePresets,
	limitScene,
	setObjectDistance,
	sceneScale,
	topView,
	formatDistance,
} from './scene-model.js';
import { drawScene } from './scene-render.js';
import { lightDiagram } from './light-diagram.js';
import { updateDiagrams, setupDiagrams } from './diagrams.js';
import { sensors, optics } from './optics.js';
const $ = (id) => document.getElementById(id),
	stops = [1.4, 2, 2.8, 4, 5.6, 8, 11, 16, 22];
let mode = 'scene',
	grid = false,
	currentTopic = 'sensor';
let sceneState = newScene('portrait');
let integratedScenes = null;
let portraitViewer = null,
	portraitSubject = 'human';
const fmt = (n, d = 2) => (Number.isFinite(n) ? n.toFixed(d) : '∞');
const distance = formatDistance;
function values() {
	return {
		sensor: sensors[$('sensor').value],
		f: +$('focal').value,
		n: stops[+$('aperture').value],
		d: +$('distance').value,
	};
}
function page(id) {
	if (id === 'equiv') id = 'tools';
	if (!['lab', 'learn', 'tools'].includes(id)) id = 'lab';
	$('camera-controls').hidden = id === 'tools';
	document.querySelector('.module-header').hidden = false;
	document.querySelectorAll('.camera-app .page').forEach((el) => (el.hidden = el.id !== id));
	document.querySelectorAll('.camera-app .nav').forEach((el) => {
		const active = el.dataset.page === id;
		el.classList.toggle('active', active);
		if (active) el.setAttribute('aria-current', 'page');
		else el.removeAttribute('aria-current');
	});
	if (id === 'lab') update();
	history.replaceState(null, '', '#' + id);
	document.title =
		{ lab: 'Camera Lab', learn: 'Camera and optics basics', tools: 'Tools' }[id] +
		' — Camera & optics — Tobias Klein';
}
document.querySelectorAll('[data-page]').forEach(
	(b) =>
		(b.onclick = (e) => {
			e.preventDefault();
			page(b.dataset.page);
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}),
);
document.querySelector('[data-topic]').onclick = (e) => {
	e.preventDefault();
	lesson('sensor');
	page('learn');
	openLearningGroup('basics');
};
document.querySelectorAll('.brand').forEach(
	(b) =>
		(b.onclick = (e) => {
			e.preventDefault();
			page('explore');
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}),
);
$('show-diagrams').onclick = () => {
	page('learn');
	openLearningGroup('basics');
	lesson('focal');
	$('lesson').scrollIntoView({ behavior: 'smooth', block: 'start' });
};
function preset(key) {
	sceneState = newScene(key);
	const p = scenePresets[key];
	$('sensor').value = 'full';
	$('focal').value = p.f;
	$('aperture').value = stops.indexOf(p.n);
	$('distance').value = p.focus;
	configureRanges();
	$('distance').value = p.focus;
	$('test-distance').value = p.subject * 1.2;
	document
		.querySelectorAll('[data-preset]')
		.forEach((b) => b.classList.toggle('chosen', b.dataset.preset === key));
	update();
}
document
	.querySelectorAll('[data-preset]')
	.forEach((b) => (b.onclick = () => preset(b.dataset.preset)));
$('reset').onclick = () => preset(sceneState.key);
function configureRanges() {
	const min = limitScene(sceneState, +$('focal').value);
	for (const id of ['distance', 'test-distance']) {
		const el = $(id),
			old = +el.value;
		el.min = min;
		el.max = sceneState.max;
		el.step = sceneState.step;
		el.value = Math.max(min, Math.min(sceneState.max, old));
	}
	for (const key of ['foreground', 'subject', 'background']) {
		const el = $(`object-${key}`);
		el.min = min;
		el.max = sceneState.max;
		el.step = sceneState.step;
		el.value = Number(sceneState[key].toFixed(3));
	}
	const labels = $('distance').nextElementSibling.children;
	labels[0].textContent = `${distance(min)} · NEAR`;
	labels[1].textContent = `${distance(sceneState.max)} · FAR`;
}
['sensor', 'focal', 'aperture', 'distance'].forEach((id) =>
	$(id).addEventListener('input', () => {
		document.querySelectorAll('[data-preset]').forEach((b) => b.classList.remove('chosen'));
		update();
	}),
);
document.querySelectorAll('[data-view]').forEach(
	(b) =>
		(b.onclick = () => {
			mode = b.dataset.view;
			document
				.querySelectorAll('[data-view]')
				.forEach((x) => x.classList.toggle('selected', x === b));
			update();
		}),
);
$('grid-toggle').onclick = () => {
	grid = !grid;
	$('grid-toggle').setAttribute('aria-pressed', grid);
	update();
};
function update() {
	configureRanges();
	const { sensor, f, n, d } = values(),
		o = optics(sensor, f, n, d);
	if (integratedScenes) {
		const mm = d * 1000,
			q = (n * o.coc * (mm - f)) / (f * f);
		o.near = d / (1 + q);
		o.far = q < 1 ? d / (1 - q) : Infinity;
		o.dof = o.far - o.near;
	}
	$('focal-val').textContent = `${f} mm`;
	document
		.querySelectorAll('[data-focal-stop]')
		.forEach((b) => b.setAttribute('aria-pressed', Math.abs(+b.dataset.focalStop - f) < 0.01));
	$('aperture-val').textContent = `f/${n}`;
	$('distance-val').textContent = distance(d);
	$('view-sensor').textContent = sensor.name.toUpperCase();
	$('shot-info').textContent = `${f} mm    /    f/${n}    /    ${distance(d)}`;
	$('fov-info').textContent = `${o.aov.toFixed(1)}° horizontal`;
	$('result-equiv').textContent = `${Math.round(o.equivalent)} mm`;
	$('crop-label').textContent = `${o.crop.toFixed(2)}× diagonal crop factor`;
	$('result-dof').textContent = distance(o.dof);
	$('result-limits').textContent =
		o.dof < 0.01
			? `${(o.near * 1000).toFixed(1)} → ${(o.far * 1000).toFixed(1)} mm`
			: `${distance(o.near)} → ${distance(o.far)}`;
	$('hyper-label').textContent = `Hyperfocal distance ${o.H.toFixed(1)} m`;
	$('result-pupil').textContent = `${o.pupil.toFixed(1)} mm`;
	animateIris($('iris'), n);
	$('insight').textContent =
		n <= 2.8
			? 'A wide aperture lets in more light and narrows the sharp zone. Try f/8 and watch the background.'
			: n >= 11
				? 'A small aperture expands the sharp zone, but needs more light or a longer exposure. Very small apertures also soften detail through diffraction.'
				: 'A middle aperture balances light and depth. Focus farther away to expand the sharp zone.';
	$('scene-name').textContent = sceneState.name.toUpperCase();
	$('scene-caption').textContent =
		mode === 'optics'
			? 'Yellow: depth of field. Camera and sensor on the left; objects on the right.'
			: mode === 'three'
				? sceneState.key === 'portrait'
					? 'Drag to orbit; drag the colored rings to move objects. Gold: depth of field. Blue: focus plane.'
					: 'Drag the camera or objects along the axis. Gold shows the depth of field.'
				: mode === 'top'
					? 'Drag a dot to move an object. Drag the blue line to change focus.'
					: `${sceneState.key === 'portrait' ? 'Person' : sceneState.key === 'macro' ? 'Ladybird' : 'Cypress trees'}: ${distance(sceneState.subject)} · focus: ${distance(d)}. Use Top view to move the objects.`;
	$('focus-mark').style.display = 'none';
	$('subject-separation').textContent =
		`Subject → background: ${distance(sceneState.background - sceneState.subject)}`;
	depthChart(o, d);
	draw(values(), o);
	updateComparison();
	updateDiagrams(values(), o);
	updateLessonVisual(values(), o);
	localize();
	integratedScenes?.sync(values(), sceneState);
}
function depthChart(o, d) {
	const lo = sceneState.min,
		hi = sceneState.max,
		x = (m) => 14 + (Math.log(Math.max(lo, Math.min(hi, m)) / lo) / Math.log(hi / lo)) * 614;
	const ticks =
		sceneState.key === 'macro'
			? [0.07, 0.1, 0.2, 0.5, 1]
			: sceneState.key === 'landscape'
				? [0.5, 1, 3, 10, 30, 150]
				: [0.5, 1, 3, 10, 30, 50];
	$('depth-chart').innerHTML =
		`<rect x="14" y="37" width="614" height="24" rx="3" fill="#e8edf6"/><rect x="${x(o.near)}" y="37" width="${Math.max(2, x(o.far) - x(o.near))}" height="24" rx="3" fill="#98b6f5"/><path d="M${x(d)} 28v42" stroke="#2458d3" stroke-width="2"/><text x="${Math.min(575, Math.max(65, x(d)))}" y="18" text-anchor="middle" font-size="10" fill="#2458d3">Focus ${distance(d)}</text>${ticks.map((t) => `<text x="${x(t)}" y="85" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#66758c">${distance(t)}</text>`).join('')}`;
}
const canvas = $('scene');
function draw(v, o, target = canvas) {
	if (target === canvas) return;
	if (target !== canvas) {
		drawScene(target, v, sceneState, grid);
		return;
	}
	const optics = mode === 'optics',
		top = mode === 'top',
		three = mode === 'three';
	canvas.hidden = optics || top || three;
	const portrait = three && sceneState.key === 'portrait';
	$('portrait-3d-host').hidden = !portrait;
	$('portrait-3d-controls').hidden = !portrait;
	$('portrait-3d-note').hidden = !portrait;
	$('scene-3d').toggleAttribute('hidden', !three || portrait);
	if (portrait && !portraitViewer)
		portraitViewer = setupPortrait3D($('portrait-3d-host'), change3D);
	portraitViewer?.update(sceneState, v, o, portrait);
	document.querySelector('.viewfinder').classList.toggle('portrait-mode', portrait);
	$('camera-position-control').hidden = !three;
	document.querySelector('.viewfinder').classList.toggle('three-mode', three);
	$('camera-position').value = sceneState.cameraPosition || 0;
	$('camera-position').step = sceneState.step;
	$('live-optics').toggleAttribute('hidden', !optics);
	$('top-view').toggleAttribute('hidden', !top);
	$('scene-distances').hidden = !(top || three);
	document.querySelector('.viewfinder').classList.toggle('optics-mode', optics || top || three);
	if (three && sceneState.key !== 'portrait') $('scene-3d').innerHTML = scene3D(sceneState, v, o);
	else if (three) {
	} else if (optics) $('live-optics').innerHTML = lightDiagram(v, o);
	else if (top) $('top-view').innerHTML = topView(sceneState, v, o);
	else drawScene(canvas, v, sceneState, grid);
}
let dragging = null;
function changeDistance(kind, value) {
	if (!Number.isFinite(value)) return;
	const min = Math.max(sceneState.min, (+$('focal').value / 1000) * 1.1);
	if (kind === 'focus') $('distance').value = Math.max(min, Math.min(sceneState.max, value));
	else setObjectDistance(sceneState, kind, value, min);
	update();
}
$('top-view').addEventListener('pointerdown', (e) => {
	const handle = e.target.closest('[data-drag]');
	if (!handle) return;
	e.preventDefault();
	dragging = handle.dataset.drag;
	$('top-view').setPointerCapture(e.pointerId);
});
$('top-view').addEventListener('pointermove', (e) => {
	if (!dragging) return;
	const root = $('top-view'),
		p = root.createSVGPoint();
	p.x = e.clientX;
	p.y = e.clientY;
	const q = p.matrixTransform(root.getScreenCTM().inverse());
	changeDistance(dragging, sceneScale(sceneState).d(q.x));
});
for (const event of ['pointerup', 'pointercancel', 'lostpointercapture'])
	$('top-view').addEventListener(event, () => (dragging = null));
$('top-view').addEventListener('keydown', (e) => {
	const h = e.target.closest('[data-drag]');
	if (!h || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
	e.preventDefault();
	const kind = h.dataset.drag,
		old = kind === 'focus' ? values().d : sceneState[kind];
	changeDistance(
		kind,
		old +
			(['ArrowRight', 'ArrowUp'].includes(e.key) ? 1 : -1) *
				sceneState.step *
				(e.shiftKey ? 10 : 1),
	);
	$('top-view').querySelector(`[data-drag="${kind}"]`).focus();
});
for (const key of ['foreground', 'subject', 'background']) {
	const el = $(`object-${key}`),
		commit = () => {
			if (el.value !== '' && Number.isFinite(el.valueAsNumber))
				changeDistance(key, el.valueAsNumber);
		};
	el.onchange = commit;
	el.onblur = commit;
	el.onkeydown = (e) => {
		if (e.key === 'Enter') {
			commit();
			el.blur();
		}
	};
}
for (const id of ['focus-subject', 'snap-focus', 'toolbar-snap'])
	$(id).onclick = () => changeDistance('focus', sceneState.subject);
let comparisonView;
function toggleComparison(open) {
	if (!open) comparisonView?.close();
	$('aperture-comparison').hidden = !open;
	$('compare-toggle').setAttribute('aria-expanded', open);
	$('compare-toggle').classList.toggle('selected', open);
	if (open) {
		$('compare-a').value = values().n;
		if (+$('compare-b').value === values().n) $('compare-b').value = values().n === 2.8 ? 1.4 : 2.8;
		updateComparison();
	}
}
for (const id of ['compare-a', 'compare-b']) {
	stops.forEach((n) => $(id).add(new Option(`f/${n}`, n)));
}
$('compare-b').value = 2.8;
$('compare-toggle').onclick = () => toggleComparison($('aperture-comparison').hidden);
$('compare-close').onclick = () => toggleComparison(false);
$('compare-a').onchange = () => {
	$('aperture').value = stops.indexOf(+$('compare-a').value);
	document.querySelectorAll('[data-preset]').forEach((b) => b.classList.remove('chosen'));
	update();
};
$('compare-b').onchange = updateComparison;
function updateComparison() {
	if ($('aperture-comparison').hidden) return;
	const v = values();
	$('compare-a').value = v.n;
	const b = +$('compare-b').value;
	for (const [key, n] of [
		['a', v.n],
		['b', b],
	]) {
		const setup = { ...v, n },
			o = optics(v.sensor, v.f, n, v.d);
		$(`compare-result-${key}`).textContent =
			`f/${n} · sharp zone ${o.dof < 0.01 ? `${(o.near * 1000).toFixed(1)}–${(o.far * 1000).toFixed(1)} mm` : `${distance(o.near)}–${distance(o.far)}`} · depth ${distance(o.dof)}`;
	}
	const light = (b / v.n) ** 2,
		stopDifference = 2 * Math.abs(Math.log2(b / v.n));
	$('compare-explanation').textContent =
		light === 1
			? 'Both apertures are identical. Choose a different value to compare.'
			: `f/${Math.min(v.n, b)} admits about ${Math.max(light, 1 / light).toFixed(1)}× as much light as f/${Math.max(v.n, b)} (${stopDifference.toFixed(1)} stops), at the same shutter speed and ISO. Brightness is compensated here to compare blur. Change focal length or focus distance above to test both views together.`;
	comparisonView?.refresh(v, sceneState, grid, b);
	localize($('aperture-comparison'));
}

const lessons = {
	sensor: [
		'01 / THE SENSOR',
		'Sensor size',
		'The sensor sits behind the lens and turns incoming light into image data. Its physical size determines how much of the lens’s image you capture. Megapixels describe the number of samples, not the physical size of that canvas.',
		'With the same lens and camera position, a smaller sensor captures a tighter view. It does not change the lens’s actual focal length.',
		'Try switching from full frame to APS-C without changing the lens. Watch the edges of the scene disappear.',
	],
	lens: [
		'02 / THE LENS',
		'The lens',
		'A lens bends light to form an image on the sensor. Real lenses combine several glass elements. The focal length describes their optical behavior; it is not simply the physical length of the lens barrel.',
		'A lens has a focal length, a maximum aperture, and a range of distances it can focus on. A zoom changes focal length; a prime has one fixed focal length.',
		'Choose “Light & lens” in the lab to see a simplified view of the light path.',
	],
	focal: [
		'03 / FOCAL LENGTH',
		'Focal length',
		'Focal length is the distance from the rear principal plane of a lens to its rear focal point, in millimeters. With the lens focused at infinity, the sensor lies at this focal plane. For a thin lens the principal plane is at its center; for a multi-element lens it is an optical reference plane, not necessarily inside the glass. Focal length is not the physical length of the lens.',
		'Perspective depends on camera position. Changing focal length alone changes framing. Moving to restore the same framing changes perspective.',
		'A shorter focal length gives a wider angle of view; a longer one gives a narrower angle and a larger image of the same subject. Compare the angle-of-view diagram in the lab at 24 mm and 100 mm.',
	],
	aperture: [
		'04 / APERTURE',
		'Aperture and f-number',
		'The aperture is the opening that admits light through the lens. The f-number is focal length divided by entrance pupil diameter. At 50 mm and f/2, that diameter is 25 mm.',
		'A lower f-number means a larger opening, more light per unit sensor area, and a shallower depth of field when other settings stay fixed. Each full stop changes light by about 2×.',
		'Go from f/2 to f/2.8: about half the light. The lab compensates exposure so you can compare blur.',
	],
	focus: [
		'05 / FOCUS',
		'Focus',
		'In geometric optics, an object point is in focus when its rays converge at the sensor plane. If the rays converge in front of or behind that plane, they intersect the sensor as a disc: the blur circle. Focusing changes the optical configuration to bring the chosen object plane into focus.',
		'Real lenses do not form infinitely small points: diffraction and aberrations spread light even at best focus. A point can be out of exact focus yet appear sharp if its blur remains below the chosen tolerance. Focus distance is measured from the sensor plane.',
		'Use the focus diagram in the lab. Move the test object in front of or behind the focus distance, then compare the ray cones at two aperture sizes.',
	],
	depth: [
		'06 / DEPTH OF FIELD',
		'Depth of field',
		'Depth of field is the range of object distances that meets a specified sharpness criterion without refocusing. This tool uses a maximum geometric blur-circle diameter, called the circle of confusion. The criterion depends on output size and viewing conditions; blur changes continuously at the boundaries.',
		'Depth of focus is different: it is the tolerance in sensor position on the image side, for a stationary subject and lens. A higher f-number increases geometric depth of field, but diffraction also increases.',
		'Try the landscape preset. Stop down, focus farther away, and read the near and far limits below the scene.',
	],
};
const topics = {
	sensor: 'The sensor',
	lens: 'The lens',
	focal: 'Focal length',
	aperture: 'Aperture / f-stop',
	focus: 'Focusing',
	depth: 'Depth of field',
};
Object.entries(topics).forEach(([id, label]) => {
	const b = document.createElement('button');
	b.textContent = label;
	b.role = 'tab';
	b.id = `topic-${id}`;
	b.onclick = () => lesson(id);
	document.querySelector('.topic-nav').append(b);
});
function lesson(id) {
	releaseLessonDiagrams();
	currentTopic = id;
	document.querySelectorAll('.topic-nav button').forEach((b) => {
		b.classList.toggle('selected', b.id === `topic-${id}`);
		b.setAttribute('aria-selected', b.id === `topic-${id}`);
	});
	const [num, title, body, take, tryit] = lessons[id];
	$('lesson').innerHTML =
		`<span class="eyebrow">${num}</span><h2>${title}</h2><p>${body.split('. ')[0]}.</p><details class="explain-more"><summary>Read more</summary><p>${body}</p><div class="takeaway">${take}</div><p>${tryit}</p></details><div id="lesson-visual"></div><button class="primary" id="try-lab">Try it in the lab ↗</button>`;
	$('try-lab').onclick = () => {
		page('lab');
		if (id === 'lens') {
			mode = 'optics';
			document
				.querySelectorAll('[data-view]')
				.forEach((b) => b.classList.toggle('selected', b.dataset.view === mode));
			update();
		}
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};
	mountLessonVisual(id);
	const v = values();
	updateLessonVisual(v, optics(v.sensor, v.f, v.n, v.d));
	localize($('lesson'));
}
for (const id of ['from-sensor', 'to-sensor']) {
	Object.entries(sensors).forEach(([key, s]) => $(id).add(new Option(s.name, key)));
	$(id).onchange = equivalence;
}
$('from-sensor').value = 'aps';
$('to-sensor').value = 'full';
['eq-focal', 'eq-aperture'].forEach((id) => ($(id).oninput = equivalence));
$('swap').onclick = () => {
	const a = $('from-sensor').value;
	$('from-sensor').value = $('to-sensor').value;
	$('to-sensor').value = a;
	equivalence();
};
function equivalence() {
	const f = +$('eq-focal').value,
		n = +$('eq-aperture').value;
	if (!Number.isFinite(f) || f < 1 || f > 2000 || !Number.isFinite(n) || n < 0.5 || n > 64) {
		$('eq-error').textContent = 'Enter 1–2000 mm and an aperture from f/0.5 to f/64.';
		$('eq-answer').textContent = '—';
		$('eq-explain').textContent = '';
		localize($('equiv'));
		return;
	}
	$('eq-error').textContent = '';
	const from = sensors[$('from-sensor').value],
		to = sensors[$('to-sensor').value],
		r = Math.hypot(to.w, to.h) / Math.hypot(from.w, from.h);
	$('eq-answer').textContent = `${(f * r).toFixed(1)} mm / f/${(n * r).toFixed(1)}`;
	$('eq-explain').textContent =
		`${f} mm at f/${n} on ${from.name} matches the diagonal field of view and approximate depth of field of ${(f * r).toFixed(1)} mm at f/${(n * r).toFixed(1)} on ${to.name}. The format ratio is ${r.toFixed(3)}×.`;
	localize($('equiv'));
}

document.querySelectorAll('[data-focal-stop]').forEach(
	(b) =>
		(b.onclick = () => {
			$('focal').value = b.dataset.focalStop;
			document.querySelectorAll('[data-preset]').forEach((p) => p.classList.remove('chosen'));
			update();
		}),
);
new ResizeObserver((entries) => {
	document.documentElement.style.setProperty(
		'--controls-height',
		`${entries[0].target.getBoundingClientRect().height}px`,
	);
}).observe($('camera-controls'));
setupLanguage();
setupTheme();
comparisonView = setupComparison(updateComparison);
setupTools(() => ({ sensorKey: $('sensor').value, f: +$('focal').value }));
setupEffects();
setupIris($('iris'));
setupDiagrams(() => values(), update);
lesson('sensor');
equivalence();
window.addEventListener('resize', () => update());
page(
	['explore', 'lab', 'learn', 'tools', 'equiv'].includes(location.hash.slice(1))
		? location.hash.slice(1)
		: 'explore',
);
window.addEventListener('hashchange', () => page(location.hash.slice(1) || 'explore'));
document.fonts.ready.then(update);

document.addEventListener('click', (e) => {
	const b = e.target.closest('[data-sensor-choice]');
	if (b) {
		$('sensor').value = b.dataset.sensorChoice;
		update();
	}
});

window.addEventListener('portrait-image-ready', update);

let dragging3D = null;
function change3D(kind, world) {
	const camera = sceneState.cameraPosition || 0;
	if (kind === 'camera') {
		$('distance').value = shiftCamera(sceneState, world, values().d, values().f);
		update();
	} else changeDistance(kind, world - camera);
}
$('scene-3d').addEventListener('pointerdown', (e) => {
	const h = e.target.closest('[data-3d-drag]');
	if (!h) return;
	e.preventDefault();
	const pt = $('scene-3d').createSVGPoint();
	pt.x = e.clientX;
	pt.y = e.clientY;
	dragging3D = {
		kind: h.dataset['3dDrag'],
		startX: pt.matrixTransform($('scene-3d').getScreenCTM().inverse()).x,
		startWorld:
			(sceneState.cameraPosition || 0) +
			(h.dataset['3dDrag'] === 'camera'
				? 0
				: h.dataset['3dDrag'] === 'focus'
					? values().d
					: sceneState[h.dataset['3dDrag']]),
	};
	$('scene-3d').setPointerCapture(e.pointerId);
});
$('scene-3d').addEventListener('pointermove', (e) => {
	if (!dragging3D) return;
	const root = $('scene-3d'),
		pt = root.createSVGPoint();
	pt.x = e.clientX;
	pt.y = e.clientY;
	const q = pt.matrixTransform(root.getScreenCTM().inverse()),
		scale = scene3DScale(sceneState),
		x = scale.x(dragging3D.startWorld) + (q.x - dragging3D.startX) / 0.86;
	change3D(dragging3D.kind, scale.world(x));
});
for (const event of ['pointerup', 'pointercancel', 'lostpointercapture'])
	$('scene-3d').addEventListener(event, () => (dragging3D = null));
$('scene-3d').addEventListener('keydown', (e) => {
	const h = e.target.closest('[data-3d-drag]');
	if (!h || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
	e.preventDefault();
	const key = h.dataset['3dDrag'],
		old =
			key === 'camera'
				? sceneState.cameraPosition || 0
				: (sceneState.cameraPosition || 0) + (key === 'focus' ? values().d : sceneState[key]);
	change3D(
		key,
		old +
			(['ArrowRight', 'ArrowUp'].includes(e.key) ? 1 : -1) *
				sceneState.step *
				(e.shiftKey ? 10 : 1),
	);
	$('scene-3d').querySelector(`[data-3d-drag="${key}"]`).focus();
});
const commitCamera = () => {
	if ($('camera-position').value !== '' && Number.isFinite($('camera-position').valueAsNumber))
		change3D('camera', $('camera-position').valueAsNumber);
};
$('camera-position').onchange = commitCamera;
$('camera-position').onblur = commitCamera;
$('camera-position').onkeydown = (e) => {
	if (e.key === 'Enter') {
		commitCamera();
		$('camera-position').blur();
	}
};

for (const b of document.querySelectorAll('[data-portrait-subject]'))
	b.onclick = () => {
		portraitSubject = b.dataset.portraitSubject;
		document
			.querySelectorAll('[data-portrait-subject]')
			.forEach((x) => x.setAttribute('aria-pressed', x === b));
		portraitViewer?.setSubject(portraitSubject);
	};
for (const b of document.querySelectorAll('[data-portrait-view]'))
	b.onclick = () => {
		document
			.querySelectorAll('[data-portrait-view]')
			.forEach((x) => x.setAttribute('aria-pressed', x === b));
		portraitViewer?.setView(b.dataset.portraitView);
	};
$('portrait-reset-view').onclick = () => portraitViewer?.reset();

integratedScenes = setupIntegratedScenes(
	values,
	() => sceneState,
	preset,
	(s) => {
		sceneState = {
			...sceneState,
			foreground: s.foreground,
			subject: s.subject,
			background: s.background,
			cameraPosition: s.camera,
		};
		$('sensor').value = s.sensor;
		$('focal').value = s.focal;
		$('aperture').value = stops.indexOf(s.aperture);
		$('distance').value = s.focus;
		update();
	},
);
integratedScenes.sync(values(), sceneState);

for (const id of ['star-focal', 'eq-focal', 'eq-aperture']) {
	const slider = $(id),
		exact = $(id + '-exact'),
		output = $(id + '-output');
	const sync = () => {
		exact.value = slider.value;
		output.textContent = id === 'eq-aperture' ? 'f/' + slider.value : slider.value + ' mm';
	};
	slider.addEventListener('input', sync);
	exact.oninput = () => {
		if (exact.value === '' || !Number.isFinite(exact.valueAsNumber)) return;
		slider.max = Math.max(id === 'eq-aperture' ? 32 : 400, exact.valueAsNumber);
		slider.value = exact.value;
		slider.dispatchEvent(new Event('input', { bubbles: true }));
	};
	sync();
}
