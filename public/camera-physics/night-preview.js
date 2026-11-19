import { nightUrl } from './night-asset.js';
import { siderealRate, cameraTime } from './star-model.js';
import { localize } from './i18n.js';
const $ = (id) => document.getElementById(id);
const noise = (i) => {
	const n = Math.sin(i * 127.1 + 311.7) * 43758.5453;
	return n - Math.floor(n);
};
export function setupNightPreview() {
	const canvas = $('night-scene'),
		foreground = new Image();
	let result = null,
		exposure = 6,
		mode = 'pixel',
		playing = false,
		enlarge = true,
		visible = false,
		frame = 0,
		last = 0,
		phase = 0;
	foreground.onload = paint;
	foreground.src = nightUrl;
	const seconds = (t) => `${t.toFixed(t < 10 ? 1 : 0)} s`;
	function updateExposure() {
		if (!result) return;
		if (mode === 'pixel') exposure = cameraTime(result.limit);
		else if (mode === '500') exposure = result.rule500;
		else if (mode === 'long') exposure = 60;
		const max = Math.max(120, result.limit, result.rule500);
		$('night-exposure').value = (100 * Math.log(exposure / 0.1)) / Math.log(max / 0.1);
		$('night-exposure-value').textContent = seconds(exposure);
		$('night-exposure').setAttribute('aria-valuetext', seconds(exposure));
		for (const b of document.querySelectorAll('[data-night-time]'))
			b.setAttribute('aria-pressed', b.dataset.nightTime === mode);
		paint();
		localize($('night-preview'));
	}
	function paint() {
		const box = canvas.getBoundingClientRect();
		if (!box.width || !result) return;
		const dpr = devicePixelRatio || 1,
			w = 1000,
			h = 650;
		canvas.width = box.width * dpr;
		canvas.height = box.height * dpr;
		const ctx = canvas.getContext('2d');
		ctx.scale(canvas.width / w, canvas.height / h);
		let g = ctx.createLinearGradient(0, 0, 0, h);
		g.addColorStop(0, '#071021');
		g.addColorStop(0.6, '#142846');
		g.addColorStop(1, '#355072');
		ctx.fillStyle = g;
		ctx.fillRect(0, 0, w, h);
		// A faint, static atmospheric wash; the discrete stars below rotate together.
		for (let i = 0; i < 12; i++) {
			const x = 380 + i * 42,
				y = 50 + i * 31,
				r = 80 + noise(i) * 50,
				glow = ctx.createRadialGradient(x, y, 0, x, y, r);
			glow.addColorStop(0, '#8098b50b');
			glow.addColorStop(1, '#8098b500');
			ctx.fillStyle = glow;
			ctx.fillRect(x - r, y - r, r * 2, r * 2);
		}
		const cx = 230,
			cy = 160,
			arc = siderealRate * exposure * (enlarge ? 20 : 1);
		for (let i = 0; i < 160; i++) {
			const radius = 40 + noise(i + 11) * 800,
				angle = noise(i + 23) * Math.PI * 2 + phase,
				size = 0.55 + noise(i + 42) * 1.1,
				x = cx + Math.cos(angle) * radius,
				y = cy + Math.sin(angle) * radius;
			if (y > h || x < -40 || x > w + 40) continue;
			ctx.strokeStyle = i % 8 === 0 ? '#f5d7ae' : '#c8dcf5';
			ctx.globalAlpha = 0.4 + noise(i + 70) * 0.6;
			ctx.lineWidth = size;
			ctx.lineCap = 'round';
			ctx.beginPath();
			ctx.arc(cx, cy, radius, angle - arc, angle);
			ctx.stroke();
			ctx.fillStyle = '#eff6ff';
			ctx.beginPath();
			ctx.arc(x, y, size * 0.65, 0, Math.PI * 2);
			ctx.fill();
		}
		ctx.globalAlpha = 1;
		ctx.fillStyle = '#e1ecfc';
		ctx.beginPath();
		ctx.arc(cx, cy, 1.6, 0, Math.PI * 2);
		ctx.fill();
		if (foreground.complete && foreground.naturalWidth) ctx.drawImage(foreground, 0, 0, w, h);
	}
	function tick(now) {
		frame = 0;
		if (!playing || !visible || document.hidden) return;
		if (last) phase += ((now - last) / 1000) * siderealRate * 600;
		last = now;
		paint();
		frame = requestAnimationFrame(tick);
	}
	function sync() {
		cancelAnimationFrame(frame);
		last = 0;
		if (playing && visible && !document.hidden) frame = requestAnimationFrame(tick);
		else paint();
	}
	$('night-animate').onclick = () => {
		playing = !playing;
		$('night-animate').setAttribute('aria-pressed', playing);
		$('night-animate').textContent = playing ? 'Pause sky' : 'Animate sky';
		sync();
		localize($('night-preview'));
	};
	$('night-motion').onclick = () => {
		enlarge = !enlarge;
		$('night-motion').setAttribute('aria-pressed', enlarge);
		$('night-motion').textContent = enlarge ? 'Motion ×20' : 'Motion 1×';
		paint();
		localize($('night-preview'));
	};
	for (const b of document.querySelectorAll('[data-night-time]'))
		b.onclick = () => {
			mode = b.dataset.nightTime;
			updateExposure();
		};
	$('night-exposure').oninput = () => {
		if (!result) return;
		const max = Math.max(120, result.limit, result.rule500);
		exposure = 0.1 * Math.exp((+$('night-exposure').value / 100) * Math.log(max / 0.1));
		mode = 'custom';
		updateExposure();
	};
	$('star-recommend-toggle').onclick = () => {
		const open = $('star-recommendations').hidden;
		$('star-recommendations').hidden = !open;
		$('star-recommend-toggle').setAttribute('aria-expanded', open);
	};
	new ResizeObserver(paint).observe(canvas);
	new IntersectionObserver((entries) => {
		visible = entries[0].isIntersecting;
		sync();
	}).observe(canvas);
	document.addEventListener('visibilitychange', sync);
	return {
		setResult(o) {
			result = o;
			$('night-preview').hidden = !o;
			if (!o) {
				playing = false;
				$('night-animate').setAttribute('aria-pressed', false);
				$('night-animate').textContent = 'Animate sky';
				sync();
				$('recommended-exposure').textContent = '—';
				return;
			}
			$('recommended-exposure').textContent = seconds(cameraTime(o.limit));
			updateExposure();
			localize($('star-recommendations'));
		},
	};
}
