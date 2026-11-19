import { localize } from './i18n.js';
const $ = (id) => document.getElementById(id);
export const effects = {
	fringing: {
		group: 'optical',
		name: 'Fringing',
		summary:
			'Colored outlines appear along high-contrast edges, such as dark branches against a bright sky.',
		notice: 'Look along the branch edges for purple halos.',
		cause:
			'Glass bends different wavelengths by different amounts because its refractive index varies with wavelength (dispersion). If a lens does not fully correct this, the red, green and blue images of a high-contrast edge do not line up perfectly. Light from the bright side then leaves a colored outline along the dark side.',
		reduce:
			'Lens correction and defringe tools can reduce it. Check bright, high-contrast edges when comparing lenses.',
		source: [
			'Nikon · chromatic aberration',
			'https://www.nikonusa.com/learn-and-explore/c/products-and-innovation/chromatic-aberration',
		],
	},
	chromatic: {
		group: 'optical',
		name: 'Chromatic aberration',
		summary:
			'A lens does not place all wavelengths of light at exactly the same position or focus.',
		notice: 'Look for red and blue edges separating around the dark shapes.',
		cause:
			'Lateral chromatic aberration produces different image magnifications for different colors, often most visible near the frame edges. Longitudinal chromatic aberration places colors at different focus distances. This example illustrates lateral color separation.',
		reduce:
			'Lens design and correction profiles reduce lateral color errors. Stopping down can reduce longitudinal color blur, but does not generally remove lateral chromatic aberration.',
		source: [
			'Edmund Optics · aberrations',
			'https://www.edmundoptics.com/knowledge-center/application-notes/imaging/how-aberrations-affect-machine-vision-lenses',
		],
	},
	vignette: {
		group: 'optical',
		name: 'Vignetting',
		summary: 'The image becomes darker toward its corners and edges.',
		notice: 'Compare corner brightness with the center.',
		cause:
			'Photographers often group corner darkening under vignetting. It can include optical or mechanical obstruction and natural illumination fall-off; these are distinct causes.',
		reduce:
			'Stopping down often reduces optical vignetting. Check filters and hoods for obstruction, or use a lens profile. Brightening corners in processing can also reveal more noise.',
		source: [
			'Edmund Optics · relative illumination',
			'https://www.edmundoptics.com/knowledge-center/application-notes/imaging/sensor-relative-illumination-roll-off-and-vignetting/',
		],
	},
	barrel: {
		group: 'optical',
		name: 'Barrel distortion',
		summary: 'Straight lines bow outward, changing the geometry of the image.',
		notice: 'The straight reference grid bends away from the center.',
		cause:
			'In barrel distortion, image magnification decreases toward the edges: points appear closer to the center than an ideal rectilinear projection predicts. This differs from perspective changes caused by camera position.',
		reduce:
			'Use a calibrated lens profile or distortion correction. Correction can crop the image and resample detail.',
		source: [
			'Edmund Optics · distortion',
			'https://www.edmundoptics.com/knowledge-center/application-notes/imaging/distortion/',
		],
	},
	flare: {
		group: 'optical',
		name: 'Lens flare',
		summary: 'Bright light creates unwanted haze, streaks or ghost reflections inside the image.',
		notice: 'Look for reduced contrast and colored ghost shapes near the light source.',
		cause:
			'Stray light and internal reflections can create a veiling glow or distinct ghosts. Their shapes and positions depend on lens design and where the bright source lies.',
		reduce:
			'A suitable lens hood can help with light outside the frame. Try changing the camera angle or shading the lens without blocking the image.',
		source: [
			'Tamron · flare and ghosting',
			'https://www.tamron.com/global/consumer/sp/impression/detail/article-what-is-camera-lens-flare-ghost-whiteout-blackout-vignetting.html',
		],
	},
	noise: {
		group: 'noise',
		name: 'Digital noise',
		summary: 'Random variations in brightness or color make smooth image areas look speckled.',
		notice: 'Look for colored and brightness variations, especially in darker areas.',
		cause:
			'Photon shot noise comes from the statistics of arriving light. Electronic read noise and dark-current noise also contribute. ISO changes amplification and processing; a high ISO value alone does not describe how many photons were captured.',
		reduce:
			'Capture more light when practical, expose appropriately and avoid unnecessarily brightening dark files. Noise reduction trades some fine detail for a smoother image.',
		source: ['Hamamatsu · sensor noise', 'https://hamamatsu.magnet.fsu.edu/articles/ccdsnr.html'],
	},
	stars: {
		group: 'optical',
		name: 'Lens stars',
		summary:
			'Small bright lights form star-shaped diffraction spikes, often more distinct at small apertures.',
		notice: 'Compare the bright point with the star-shaped spikes around it.',
		cause:
			'Light diffracts around the aperture edges. The shape and number of aperture blades influence the spike pattern; a rounded opening may produce less distinct spikes. This is different from ghost reflections and veiling flare.',
		reduce:
			'To emphasize stars, try a small aperture and a bright point light. To reduce the effect, try a wider aperture. Stopping down also increases diffraction softening of fine image detail.',
		source: [
			'Nikon · diffraction starbursts',
			'https://www.nikonusa.com/learn-and-explore/c/tips-and-techniques/bright-idea-adding-star-power',
		],
	},
	rolling: {
		group: 'motion',
		name: 'Rolling shutter',
		summary:
			'A moving subject can look tilted, stretched or bent because different rows are recorded at different times.',
		notice:
			'The moving target skews, while its edges remain sharp. This illustrates row-to-row timing, not motion blur.',
		cause:
			'A rolling exposure samples rows sequentially. If the subject or camera moves during that interval, each row records a different position. Short exposure per row can freeze local detail while the overall frame remains skewed.',
		reduce:
			'Reduce fast panning or relative subject speed, or use a mode or sensor with faster full-frame readout or global exposure. A faster shutter setting alone does not necessarily shorten the row-to-row scan time.',
		source: [
			'Axis · global shutter vs rolling shutter',
			'https://whitepapers.axis.com/en-us/global-shutter-vs-rolling-shutter',
		],
	},
	motion: {
		group: 'motion',
		name: 'Motion blur',
		summary: 'Movement during an exposure spreads a subject’s image along its path.',
		notice: 'The moving target smears horizontally; the stationary background stays sharp.',
		cause:
			'Each pixel integrates light over its exposure time. Subject motion, camera motion or both can smear detail during that time. Motion blur and rolling shutter are different effects and can occur together.',
		reduce:
			'A shorter exposure can reduce blur. Stabilization helps with camera movement, but does not freeze an independently moving subject. Longer exposures can deliberately show motion.',
		source: [
			'Canon · shutter speed and motion',
			'https://support.usa.canon.com/kb/s/article/ART173798',
		],
	},
	grain: {
		group: 'noise',
		name: 'Film grain',
		summary: 'Film records an irregular physical texture that becomes visible when enlarged.',
		notice: 'Compare the irregular monochrome texture with digital color speckles.',
		cause:
			'Black-and-white grain is associated with developed silver particles. Color film forms dye clouds at sites associated with exposed silver-halide crystals. Graininess depends on the film, exposure, processing and enlargement—not a fixed pixel grid.',
		reduce:
			'Film stock, exposure, development and enlargement affect visible grain. The example is a monochrome texture illustration, not a simulation of a particular emulsion or scanner.',
		source: [
			'Kodak · film reference guide',
			'https://www.kodak.com/content/products-brochures/Film/kodak-essential-reference-guide-for-filmmakers.pdf',
		],
	},
};
const extraDetails = {
	fringing: `<div class="mechanism-notes"><h3>How the colors separate</h3><p><strong>Lateral chromatic aberration:</strong> different wavelengths have slightly different image magnifications. Their edges separate sideways, often near the frame boundary, producing paired color fringes.</p><p><strong>Longitudinal chromatic aberration:</strong> wavelengths reach best focus at different distances along the optical axis. Defocused colors can form magenta or green halos around edges and highlights, including near the image center.</p><p><strong>Purple fringing:</strong> a purple outline near very bright boundaries is a visible symptom, not a diagnosis of one specific aberration. Its appearance can differ from the paired fringes of lateral color error. The drawing exaggerates an edge halo to make it easy to identify.</p><a class="source-link" href="https://support.captureone.com/hc/en-us/articles/360002579977-Chromatic-aberration-and-purple-fringing" target="_blank" rel="noreferrer">Capture One · chromatic aberration and purple fringing ↗</a></div>`,
	rolling: `<div class="mechanism-notes"><h3>Electronic vs. mechanical shutter</h3><p>“Electronic” describes how the exposure is controlled. It does not automatically mean that all pixels record the same instant.</p><div class="table-scroll"><table class="shutter-table"><thead><tr><th>Shutter type</th><th>How exposure travels across the frame</th></tr></thead><tbody><tr><th>Electronic rolling shutter</th><td>Rows start and end exposure at different times. Fast motion during the full-frame scan can produce skew, even with a short exposure per row.</td></tr><tr><th>Mechanical focal-plane shutter</th><td>Physical curtains travel across the sensor. At fast settings, a narrow slit sweeps across it. Timing differences still exist, but the sweep is usually quicker than many electronic rolling readouts, so distortion is often smaller.</td></tr><tr><th>Electronic first curtain (EFCS)</th><td>Exposure starts electronically and ends with a mechanical curtain. It reduces opening-curtain vibration, but it is not a global exposure.</td></tr><tr><th>Electronic global shutter</th><td>All pixels share the same exposure interval. Later readout does not produce row-timing skew. Movement during the exposure can still cause ordinary motion blur.</td></tr></tbody></table></div><p><strong>Two different times:</strong> the exposure time controls motion blur within each row; the time offset from the first row to the last controls rolling-shutter distortion. A faster shutter setting does not necessarily make that scan quicker. Actual behavior depends on the camera and mode.</p><p class="diagram-note">The mechanical comparison above refers to focal-plane shutters. Leaf shutters use a different arrangement.</p><a class="source-link" href="https://www.usa.canon.com/learning/training-articles/training-articles-list/a-look-at-the-shutter-modes-in-canon-eos-cameras" target="_blank" rel="noreferrer">Canon · shutter modes ↗</a><br><a class="source-link" href="https://www.fujifilm-x.com/en-gb/learning-centre/electronic-vs-mechanical-shutter/" target="_blank" rel="noreferrer">Fujifilm · electronic and mechanical shutters ↗</a></div>`,
};
const treePath =
	'M80 235L83 130M83 165L40 100M83 150L140 75M63 135L30 125M106 122L145 115M120 100L122 55';
function grid(strength) {
	const warp = (x, y) => {
		const nx = (x - 180) / 180,
			ny = (y - 120) / 120,
			k = 1 - 0.22 * strength * (nx * nx + ny * ny);
		return [180 + (x - 180) * k, 120 + (y - 120) * k];
	};
	let paths = '';
	for (let i = 0; i <= 8; i++) {
		for (const vertical of [true, false]) {
			let p = '';
			for (let j = 0; j <= 40; j++) {
				const x = vertical ? i * 45 : j * 9,
					y = vertical ? j * 6 : i * 30;
				const q = warp(x, y);
				p += `${j ? 'L' : 'M'}${q[0].toFixed(2)},${q[1].toFixed(2)}`;
			}
			paths += `<path d="${p}" fill="none" stroke="${i === 4 ? '#db8749' : '#5c789d'}" stroke-width="1.4"/>`;
		}
	}
	return `<rect width="360" height="240" fill="#eaf0f9"/>${paths}`;
}
function background(id, dark = false, mono = false) {
	return `<defs><linearGradient id="${id}-sky" x2="0" y2="1"><stop stop-color="${dark ? '#253b5c' : mono ? '#d7d7d7' : '#cbdff2'}"/><stop offset="1" stop-color="${dark ? '#64718b' : mono ? '#a8a8a8' : '#f1e1c6'}"/></linearGradient></defs><rect width="360" height="240" fill="url(#${id}-sky)"/><path d="M0 155L62 80L120 150L205 95L310 165L360 130V240H0Z" fill="${dark ? '#26354d' : mono ? '#868686' : '#8da4bd'}"/><path d="M0 200L125 150L230 192L360 165V240H0Z" fill="${dark ? '#172338' : mono ? '#626262' : '#678597'}"/><rect x="235" y="144" width="58" height="65" fill="${mono ? '#ddd' : '#d9ba98'}"/><path d="M224 145L264 117L304 145Z" fill="${mono ? '#555' : '#5e6072'}"/><rect x="254" y="167" width="17" height="22" fill="${dark ? '#ffce7c' : mono ? '#393939' : '#354d70'}"/>`;
}
function movingTarget() {
	return '<rect x="105" y="85" width="155" height="95" rx="3" fill="#d98054"/><rect x="117" y="98" width="28" height="40" fill="#e0edf7"/><rect x="156" y="98" width="28" height="40" fill="#e0edf7"/><rect x="195" y="98" width="28" height="40" fill="#e0edf7"/><rect x="234" y="98" width="15" height="68" fill="#374d66"/><path d="M112 151H226" stroke="#efba8c" stroke-width="5"/>';
}
export function effectSvg(key, amount = 0, uid = 'effect') {
	const t = Math.max(0, Math.min(1, amount / 100));
	let body;
	if (key === 'rolling' || key === 'motion') {
		body =
			'<rect width="360" height="240" fill="#e6edf7"/><path d="M0 185H360M28 35V185M323 35V185" stroke="#b8c7dc" stroke-width="3"/><path d="M20 209H340" stroke="#b8c7dc" stroke-width="2" stroke-dasharray="15 10"/><text x="275" y="53" font-family="sans-serif" font-size="14" fill="#516b8e">→</text>';
		if (key === 'rolling')
			body += `<g transform="matrix(1 0 ${t * 0.55} 1 ${-t * 0.55 * 132.5} 0)">${movingTarget()}</g>`;
		else
			body += `<defs><filter id="${uid}-motion" x="-70%" width="240%" y="-10%" height="120%"><feGaussianBlur stdDeviation="${t * 14} 0"/></filter></defs><g filter="url(#${uid}-motion)">${movingTarget()}</g>`;
	} else if (key === 'stars') {
		body = background(uid, true);
		body += '<circle cx="195" cy="65" r="4" fill="#fff9d9"/>';
		for (let i = 0; i < 14; i++) {
			const a = (i * Math.PI) / 7,
				len = 9 + t * 70,
				spread = 0.22 + t * 0.1,
				x = 195,
				y = 65;
			body += `<path d="M${x + Math.cos(a - spread) * 4} ${y + Math.sin(a - spread) * 4} L${x + Math.cos(a) * len} ${y + Math.sin(a) * len} L${x + Math.cos(a + spread) * 4} ${y + Math.sin(a + spread) * 4}Z" fill="#fff5cf" opacity="${t * 0.95}"/>`;
		}
	} else if (key === 'barrel') body = grid(t);
	else if (key === 'fringing')
		body = `<rect width="360" height="240" fill="#e6edf7"/>${t ? `<path d="${treePath}" fill="none" stroke="#a745d3" stroke-opacity="${t * 0.95}" stroke-width="${7 + t * 9}" stroke-linecap="round"/>` : ''}<path d="${treePath}" fill="none" stroke="#25334a" stroke-width="6" stroke-linecap="round"/><circle cx="280" cy="65" r="30" fill="#fff9dc"/>`;
	else if (key === 'chromatic') {
		body = '<rect width="360" height="240" fill="#e6edf7"/>';
		const forms = '<path d="M50 40H310V200H50Z M90 40V200 M270 40V200 M50 90H310 M50 150H310"/>';
		for (const [dx, col] of [
			[-t * 6, '#e64b59'],
			[t * 6, '#3e90e4'],
		])
			body += `<g transform="translate(${dx} 0)" fill="none" stroke="${col}" stroke-width="6">${forms}</g>`;
		body += `<g fill="none" stroke="#22344d" stroke-width="4">${forms}</g>`;
	} else {
		body = background(uid, key === 'noise', key === 'grain');
		if (key === 'vignette' && t)
			body += `<defs><radialGradient id="${uid}-shade"><stop offset=".25" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="${t * 0.92}"/></radialGradient></defs><rect width="360" height="240" fill="url(#${uid}-shade)"/>`;
		if (key === 'flare') {
			body += '<circle cx="315" cy="35" r="17" fill="#fff5be"/>';
			if (t)
				body += `<defs><radialGradient id="${uid}-glow"><stop stop-color="#fff9df" stop-opacity="${t * 0.9}"/><stop offset="1" stop-color="#fff9df" stop-opacity="0"/></radialGradient></defs><circle cx="315" cy="35" r="150" fill="url(#${uid}-glow)"/><rect width="360" height="240" fill="#ffefca" opacity="${t * 0.22}"/>${[
					[250, 83, 17, '#eab0b4'],
					[205, 118, 25, '#8bc3d4'],
					[127, 165, 32, '#b5d2a1'],
					[80, 200, 10, '#d1c3ed'],
				]
					.map(
						([x, y, r, col]) =>
							`<circle cx="${x}" cy="${y}" r="${r}" fill="${col}" opacity="${t * 0.45}" stroke="${col}" stroke-width="2"/>`,
					)
					.join('')}`;
		}
		if ((key === 'noise' || key === 'grain') && t) {
			let seed = 1729;
			const rnd = () => {
				seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
				return seed / 4294967296;
			};
			for (let i = 0; i < (key === 'noise' ? 2600 : 1700); i++) {
				const x = rnd() * 360,
					y = rnd() * 240,
					a = rnd();
				if (key === 'noise') {
					const col =
						i % 3 === 0
							? ['#ed7aa1', '#7dd5b2', '#89a2f2'][(i % 7) % 3]
							: a > 0.5
								? '#fff'
								: '#000';
					body += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="2" height="2" fill="${col}" opacity="${(t * (0.12 + a * 0.6)).toFixed(2)}"/>`;
				} else
					body += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${(0.25 + rnd() * 1.0).toFixed(2)}" ry="${(0.3 + rnd() * 0.8).toFixed(2)}" fill="${a > 0.55 ? '#fff' : '#000'}" opacity="${(t * (0.12 + a * 0.42)).toFixed(2)}"/>`;
			}
		}
	}
	return `<svg viewBox="0 0 360 240" role="img" aria-label="${effects[key].name}: ${amount === 0 ? 'reference' : 'illustrative effect at ' + amount + ' percent strength'}" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
}
let active = 'fringing',
	selectLearningGroup;
export function openLearningGroup(key) {
	selectLearningGroup?.(key);
}
function keyboardTabs(buttons, select) {
	buttons.forEach(
		(b, i) =>
			(b.onkeydown = (e) => {
				let n;
				if (e.key === 'ArrowRight') n = (i + 1) % buttons.length;
				else if (e.key === 'ArrowLeft') n = (i + buttons.length - 1) % buttons.length;
				else if (e.key === 'Home') n = 0;
				else if (e.key === 'End') n = buttons.length - 1;
				else return;
				e.preventDefault();
				select(buttons[n]);
				buttons[n].focus();
			}),
	);
}
export function setupEffects() {
	function render(key) {
		active = key;
		const e = effects[key];
		document.querySelectorAll('[data-effect]').forEach((b) => {
			const on = b.dataset.effect === key;
			b.setAttribute('aria-selected', on);
			b.tabIndex = on ? 0 : -1;
			b.classList.toggle('selected', on);
		});
		$('effect-panel').setAttribute('aria-labelledby', `effect-tab-${key}`);
		$('effect-panel').innerHTML =
			`<div class="effect-intro"><span class="eyebrow">${e.group === 'optical' ? 'OPTICAL EFFECT' : e.group === 'motion' ? 'MOTION & SHUTTER' : 'NOISE & GRAIN'}</span><h2>${e.name}</h2><p>${e.summary}</p></div><div class="effect-examples"><figure><div id="effect-before">${effectSvg(key, 0, 'before')}</div><figcaption>Reference</figcaption></figure><figure><div id="effect-after"></div><figcaption>${e.name}</figcaption></figure></div><div class="effect-strength"><label for="effect-strength">Example strength <output id="effect-strength-value">60%</output></label><input id="effect-strength" type="range" min="0" max="100" value="60" step="1"><button id="effect-reset">Show no effect</button></div><p class="effect-notice">${e.notice}</p><p class="effect-model-note">Illustrative example, not a lens or film measurement. This strength slider controls the example independently of the camera settings above.</p><details class="explain-more"><summary>Cause, practical notes &amp; reference</summary><p><strong>Why it happens.</strong> ${e.cause}</p>${extraDetails[key] || ''}<p><strong>What helps.</strong> ${e.reduce}</p><a class="source-link" href="${e.source[1]}" target="_blank" rel="noreferrer">${e.source[0]} ↗</a></details>`;
		const draw = () => {
			const amount = +$('effect-strength').value;
			$('effect-strength-value').textContent = `${amount}%`;
			$('effect-after').innerHTML = effectSvg(key, amount, 'after');
			localize($('effects-panel'));
		};
		$('effect-strength').oninput = draw;
		$('effect-reset').onclick = () => {
			$('effect-strength').value = 0;
			draw();
		};
		draw();
	}
	function group(key) {
		document.querySelectorAll('[data-learn-group]').forEach((b) => {
			const on = b.dataset.learnGroup === key;
			b.setAttribute('aria-selected', on);
			b.tabIndex = on ? 0 : -1;
		});
		$('basics-panel').hidden = key !== 'basics';
		$('diagrams-panel').hidden = key !== 'diagrams';
		$('effects-panel').hidden = ['basics', 'diagrams'].includes(key);
		if (['basics', 'diagrams'].includes(key)) return;
		$('effects-panel').setAttribute('aria-labelledby', `learn-group-${key}`);
		$('effect-topic-nav').innerHTML = '';
		const buttons = [];
		for (const [id, e] of Object.entries(effects)) {
			if (e.group !== key) continue;
			const b = document.createElement('button');
			b.role = 'tab';
			b.id = `effect-tab-${id}`;
			b.dataset.effect = id;
			b.textContent = e.name;
			b.setAttribute('aria-controls', 'effect-panel');
			b.onclick = () => render(id);
			$('effect-topic-nav').append(b);
			buttons.push(b);
		}
		keyboardTabs(buttons, (b) => render(b.dataset.effect));
		render(effects[active].group === key ? active : buttons[0].dataset.effect);
	}
	const groups = [...document.querySelectorAll('[data-learn-group]')];
	groups.forEach((b) => (b.onclick = () => group(b.dataset.learnGroup)));
	keyboardTabs(groups, (b) => group(b.dataset.learnGroup));
	selectLearningGroup = group;
	group('basics');
}
