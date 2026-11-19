import { adaptScene } from './portfolio-scenes.js';
import { getLanguage } from './i18n.js';

export function setupIntegratedScenes(values, current, preset, onState) {
	const old = document.querySelector('.lab-grid');
	old.hidden = true;
	const panel = document.createElement('section');
	panel.className = 'integrated-lab';
	panel.innerHTML =
		'<div class="presets integrated-presets"><button data-scene-choice="portrait">Portrait</button><button data-scene-choice="landscape">Landscape</button><button data-scene-choice="macro">Macro</button><button id="integrated-reset">Reset ↺</button></div><iframe title="Interactive 3D camera scene" sandbox="allow-scripts" class="integrated-frame"></iframe>';
	old.before(panel);
	const frame = panel.querySelector('iframe');
	let key = '',
		ready = false,
		receiving = false;
	const dictionary = {};
	function control() {
		if (ready)
			frame.contentWindow.postMessage(
				{
					kind: 'camera-scene-control',
					values: { ...values(), sensor: document.getElementById('sensor').value },
					language: getLanguage(),
					dictionary,
					theme: document.documentElement.dataset.theme || 'light',
				},
				'*',
			);
	}
	function sync(v, s) {
		if (document.getElementById('lab').hidden) return;
		if (s.key !== key) {
			key = s.key;
			ready = false;
			const requested = key;
			import('./scene-documents.js')
				.then(({ sceneDocuments }) => {
					if (key === requested) frame.srcdoc = adaptScene(sceneDocuments[key]);
				})
				.catch(() => {
					frame.srcdoc = '<p>The 3D scene could not load. Reload to try again.</p>';
				});
			panel
				.querySelectorAll('[data-scene-choice]')
				.forEach((b) => b.classList.toggle('chosen', b.dataset.sceneChoice === key));
		} else if (!receiving) control();
	}
	panel
		.querySelectorAll('[data-scene-choice]')
		.forEach((b) => (b.onclick = () => preset(b.dataset.sceneChoice)));
	panel.querySelector('#integrated-reset').onclick = () => {
		key = '';
		preset(current().key);
	};
	window.addEventListener('message', (e) => {
		if (e.source !== frame.contentWindow) return;
		const data = e.data;
		if (data?.kind === 'camera-scene-ready') {
			ready = true;
			control();
		} else if (data?.kind === 'camera-scene-height') {
			const h = Number(data.height);
			if (Number.isFinite(h)) frame.style.height = Math.max(600, Math.min(4000, h + 10)) + 'px';
		} else if (data?.kind === 'camera-scene-state' && ready) {
			const s = data.state;
			if (
				!s ||
				![s.focal, s.aperture, s.focus, s.foreground, s.subject, s.background, s.camera].every(
					Number.isFinite,
				)
			)
				return;
			receiving = true;
			onState(s);
			receiving = false;
			control();
		}
	});
	new MutationObserver(control).observe(document.documentElement, {
		attributes: true,
		attributeFilter: ['lang', 'data-theme'],
	});
	return { sync };
}
