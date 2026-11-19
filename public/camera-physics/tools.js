import { setupNightPreview } from './night-preview.js';
import { sensors } from './optics.js';
import { starExposure, cameraTime } from './star-model.js';
import { localize } from './i18n.js';
const $ = (id) => document.getElementById(id);
const seconds = (t) => (t < 1 ? `1/${Math.round(1 / t)} s` : `${t.toFixed(t < 100 ? 1 : 0)} s`);
export function setupTools(getLab) {
	const tabs = [...document.querySelectorAll('[data-tool]')];
	const select = (b) => {
		tabs.forEach((t) => {
			const on = t === b;
			t.setAttribute('aria-selected', on);
			t.tabIndex = on ? 0 : -1;
			$(t.getAttribute('aria-controls')).hidden = !on;
		});
	};
	tabs.forEach((b, i) => {
		b.onclick = () => select(b);
		b.onkeydown = (e) => {
			let n;
			if (e.key === 'ArrowRight') n = (i + 1) % tabs.length;
			else if (e.key === 'ArrowLeft') n = (i + tabs.length - 1) % tabs.length;
			else if (e.key === 'Home') n = 0;
			else if (e.key === 'End') n = tabs.length - 1;
			else return;
			e.preventDefault();
			select(tabs[n]);
			tabs[n].focus();
		};
	});
	for (const [key, s] of Object.entries(sensors)) $('star-sensor').add(new Option(s.name, key));
	const night = setupNightPreview();
	function update() {
		if ($('star-focal-exact')) {
			$('star-focal-exact').value = $('star-focal').value;
			$('star-focal-output').textContent = $('star-focal').value + ' mm';
		}
		let result;
		try {
			result = starExposure(
				sensors[$('star-sensor').value],
				+$('star-focal').value,
				+$('star-mp').value,
				+$('star-tolerance').value,
				+$('star-declination').value,
			);
		} catch {
			$('star-error').textContent = 'Enter 1–2000 mm, 1–200 MP and a declination from 0–85°.';
			for (const id of ['star-limit', 'star-camera', 'star-500', 'star-pitch'])
				$(id).textContent = '—';
			for (const id of ['star-500-drift', 'star-crop']) $(id).textContent = '';
			night.setResult(null);
			localize($('star-tool'));
			return;
		}
		$('star-error').textContent = '';
		$('star-declination-summary').textContent = `${+$('star-declination').value}°`;
		const o = result,
			tolerance = +$('star-tolerance').value;
		$('star-limit').textContent = `${o.limit.toFixed(o.limit < 100 ? 2 : 0)} s`;
		$('star-camera').textContent = seconds(cameraTime(o.limit));
		$('star-500').textContent = seconds(o.rule500);
		$('star-pitch').textContent = `${o.pitch.toFixed(2)} µm`;
		$('star-500-drift').textContent = `${o.rule500Drift.toFixed(1)} pixels of movement`;
		$('star-crop').textContent = `${o.crop.toFixed(2)}× diagonal crop factor`;
		night.setResult(o);
		localize($('star-tool'));
	}
	for (const id of ['star-sensor', 'star-focal', 'star-mp', 'star-tolerance', 'star-declination'])
		$(id).addEventListener('input', update);
	$('star-use-lab').onclick = () => {
		const lab = getLab();
		$('star-sensor').value = lab.sensorKey;
		$('star-focal').value = lab.f;
		update();
	};
	update();
}
