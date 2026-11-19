import { drawScene } from './scene-render.js';
import { localize } from './i18n.js';
const $ = (id) => document.getElementById(id);
export function setupComparison(redraw) {
	const root = $('aperture-comparison'),
		split = $('compare-split'),
		loupe = $('comparison-loupe');
	let layout = 'side',
		zoom = false,
		buffers = new Map(),
		splitA,
		splitB,
		suppressMenu = false,
		last = null,
		dragging = false;
	const ratio = () => Math.min(4, (devicePixelRatio || 1) * 2);
	function setZoom(on) {
		zoom = on;
		$('compare-magnify').setAttribute('aria-pressed', on);
		root.classList.toggle('magnifying', on);
		$('magnifier-help').hidden = !on;
		loupe.hidden = true;
		if (!on) last = null;
		else {
			const target = layout === 'split' ? split : $('compare-scene-a'),
				box = target.getBoundingClientRect();
			last = { target, x: box.left + box.width / 2, y: box.top + box.height / 2, touch: false };
			paintLoupe(last);
		}
	}
	function paintSplit() {
		if (!splitA || layout !== 'split') return;
		const ctx = split.getContext('2d'),
			x = split.width * (+$('compare-wipe').value / 100);
		ctx.clearRect(0, 0, split.width, split.height);
		ctx.drawImage(splitB, 0, 0);
		ctx.save();
		ctx.beginPath();
		ctx.rect(0, 0, x, split.height);
		ctx.clip();
		ctx.drawImage(splitA, 0, 0);
		ctx.restore();
		$('compare-divider').style.left = `${$('compare-wipe').value}%`;
		$('compare-wipe').setAttribute(
			'aria-valuetext',
			`A ${$('compare-wipe').value}% · B ${100 - $('compare-wipe').value}%`,
		);
		localize($('comparison-split-wrap'));
		if (zoom && last) paintLoupe(last);
	}
	function setLayout(next) {
		layout = next;
		root.classList.toggle('split-mode', next === 'split');
		$('comparison-split-wrap').hidden = next !== 'split';
		for (const b of root.querySelectorAll('[data-comparison-layout]'))
			b.setAttribute('aria-pressed', b.dataset.comparisonLayout === next);
		loupe.hidden = true;
		redraw();
	}
	for (const b of root.querySelectorAll('[data-comparison-layout]'))
		b.onclick = () => setLayout(b.dataset.comparisonLayout);
	$('compare-magnify').onclick = () => setZoom(!zoom);
	$('compare-wipe').oninput = paintSplit;
	function bufferFor(canvas, v, scene, grid) {
		const box = canvas.getBoundingClientRect();
		if (!box.width || !box.height) return null;
		const buffer = document.createElement('canvas');
		drawScene(buffer, v, scene, grid, {
			width: box.width,
			height: box.height,
			pixelRatio: ratio(),
		});
		return buffer;
	}
	function paintLoupe(p) {
		const target = p.target,
			source = buffers.get(target) || target;
		if (!source.width) return;
		const box = target.getBoundingClientRect(),
			r = root.getBoundingClientRect(),
			zoomFactor = 3,
			dpr = devicePixelRatio || 1,
			size = Math.min(160, r.width * 0.4),
			sx = ((p.x - box.left) / box.width) * source.width,
			sy = ((p.y - box.top) / box.height) * source.height,
			sw = (size / zoomFactor / box.width) * source.width,
			sh = (size / zoomFactor / box.height) * source.height;
		loupe.width = Math.round(size * dpr);
		loupe.height = Math.round(size * dpr);
		loupe.style.width = `${size}px`;
		loupe.style.height = `${size}px`;
		const ctx = loupe.getContext('2d');
		ctx.fillStyle = '#132139';
		ctx.fillRect(0, 0, loupe.width, loupe.height);
		ctx.drawImage(source, sx - sw / 2, sy - sh / 2, sw, sh, 0, 0, loupe.width, loupe.height);
		ctx.strokeStyle = '#fff9';
		ctx.lineWidth = dpr;
		ctx.beginPath();
		ctx.moveTo(loupe.width / 2 - 8 * dpr, loupe.height / 2);
		ctx.lineTo(loupe.width / 2 + 8 * dpr, loupe.height / 2);
		ctx.moveTo(loupe.width / 2, loupe.height / 2 - 8 * dpr);
		ctx.lineTo(loupe.width / 2, loupe.height / 2 + 8 * dpr);
		ctx.stroke();
		const x = p.x - r.left + 22,
			left = x + size > r.width ? p.x - r.left - size - 22 : x,
			top = p.touch ? p.y - r.top - size - 24 : p.y - r.top + 20;
		loupe.style.left = `${Math.max(4, Math.min(r.width - size - 4, left))}px`;
		loupe.style.top = `${Math.max(4, Math.min(r.height - size - 4, top))}px`;
		loupe.hidden = false;
	}
	for (const canvas of [$('compare-scene-a'), $('compare-scene-b'), split]) {
		canvas.addEventListener('pointerdown', (e) => {
			if (zoom) {
				if (e.pointerType === 'mouse') {
					suppressMenu = e.button === 2;
					setZoom(false);
					e.preventDefault();
					return;
				}
				canvas.setPointerCapture(e.pointerId);
				last = { target: canvas, x: e.clientX, y: e.clientY, touch: true };
				paintLoupe(last);
				e.preventDefault();
				return;
			}
			if (canvas === split && e.button === 0) {
				dragging = true;
				canvas.setPointerCapture(e.pointerId);
				wipe(e);
			}
		});
		canvas.addEventListener('pointermove', (e) => {
			if (zoom) {
				last = { target: canvas, x: e.clientX, y: e.clientY, touch: e.pointerType !== 'mouse' };
				paintLoupe(last);
			} else if (dragging && canvas === split) wipe(e);
		});
		for (const event of ['pointerup', 'pointercancel', 'lostpointercapture'])
			canvas.addEventListener(event, () => (dragging = false));
		canvas.addEventListener('pointerleave', () => {
			loupe.hidden = true;
			last = null;
		});
	}
	function wipe(e) {
		const r = split.getBoundingClientRect();
		$('compare-wipe').value = Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100));
		paintSplit();
	}
	root.addEventListener('contextmenu', (e) => {
		if (zoom || suppressMenu) {
			e.preventDefault();
			setZoom(false);
			suppressMenu = false;
		}
	});
	document.addEventListener('pointerdown', (e) => {
		if (zoom && e.pointerType === 'mouse' && !e.target.closest('#compare-magnify')) setZoom(false);
	});
	document.addEventListener('keydown', (e) => {
		if (e.key === 'Escape') setZoom(false);
	});
	return {
		refresh(v, scene, grid, b) {
			buffers.clear();
			if (layout === 'side') {
				for (const [key, n] of [
					['a', v.n],
					['b', b],
				]) {
					const canvas = $(`compare-scene-${key}`),
						buffer = bufferFor(canvas, { ...v, n }, scene, grid);
					if (buffer) {
						buffers.set(canvas, buffer);
						canvas.width = buffer.width;
						canvas.height = buffer.height;
						canvas.getContext('2d').drawImage(buffer, 0, 0);
					}
				}
			} else {
				splitA = bufferFor(split, v, scene, grid);
				splitB = bufferFor(split, { ...v, n: b }, scene, grid);
				if (splitA && splitB) {
					split.width = splitA.width;
					split.height = splitA.height;
					paintSplit();
				}
			}
			loupe.hidden = true;
			localize(root);
		},
		close() {
			setZoom(false);
			dragging = false;
		},
	};
}
