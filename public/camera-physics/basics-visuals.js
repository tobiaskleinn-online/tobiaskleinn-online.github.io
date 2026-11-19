import { sensors } from './optics.js';
import { lightDiagram } from './light-diagram.js';
import { irisGeometry } from './iris.js';
const $ = (id) => document.getElementById(id);
const label = (x, y, t, extra = '') =>
	`<text x="${x}" y="${y}" fill="var(--ink)" font-family="system-ui,sans-serif" font-size="13" ${extra}>${t}</text>`;
export function sensorComparison(selected) {
	const examples = {
		medium: [
			'Fujifilm GFX100 II',
			'https://www.fujifilm-x.com/global/products/cameras/gfx100-ii/specifications/',
		],
		full: [
			'Sony α7',
			'https://www.sony.com/electronics/support/e-mount-body-ilce-7-series/ilce-7/specifications',
		],
		aps: [
			'Sony α6000 · α6700',
			'https://www.sony.com/electronics/support/e-mount-body/ilce-6000/specifications',
		],
		canon: ['Canon EOS R50', 'https://www.usa.canon.com/support/p/eos-r50'],
		mft: ['OM SYSTEM OM-1', 'https://jp.omsystem.com/product/dslr/om-omd/om/om1/spec.html'],
	};
	const formats = ['medium', 'full', 'aps', 'canon', 'mft'],
		colors = ['#8975d9', '#3c78d8', '#e6a64a', '#d27552', '#39a5a8'];
	return `<svg viewBox="0 0 340 280" role="img" aria-label="Sensor sizes drawn to the same scale"><text x="24" y="25" fill="var(--muted)" font-size="12">Actual proportions · same scale</text>${formats
		.map((key, i) => {
			const s = sensors[key],
				w = s.w * 6.5,
				h = s.h * 6.5,
				on = key === selected;
			return `<rect x="25" y="${255 - h}" width="${w}" height="${h}" fill="${colors[i]}" fill-opacity=".12" stroke="${colors[i]}" stroke-width="${on ? 3 : 1.5}"/>`;
		})
		.join('')}</svg><figcaption class="sensor-key">${formats
		.map((key, i) => {
			const s = sensors[key];
			return `<div class="${key === selected ? 'sensor-active' : ''}"><i style="background:${colors[i]}"></i><span><strong>${s.name}</strong><small>${s.w} × ${s.h} mm</small><a class="sensor-camera-example" href="${examples[key][1]}" target="_blank" rel="noopener">${examples[key][0]} ↗</a></span></div>`;
		})
		.join(
			'',
		)}</figcaption><p class="sensor-format-note">Sensor dimensions are representative; exact sizes vary by model. Medium format shown: 44 × 33 mm.</p>`;
}
export function lensIllustration() {
	return `<svg viewBox="0 0 760 310" role="img" aria-label="Schematic side view of an α6700 with an 18–50 mm zoom lens and petal hood"><defs><linearGradient id="body-shade" x2="0" y2="1"><stop stop-color="#46515b"/><stop offset="1" stop-color="#25303b"/></linearGradient></defs><text x="24" y="27" fill="var(--muted)" font-size="12">Light travels right to left ←</text>
<path d="M63 90Q63 77 76 77H220Q234 77 234 94V236Q234 249 220 249H76Q63 249 63 236Z" fill="url(#body-shade)" stroke="var(--muted)" stroke-width="2"/><path d="M90 76V61H163V76M57 99H48V232H63" fill="#26323d" stroke="var(--muted)"/><rect x="77" y="94" width="133" height="140" rx="8" fill="none" stroke="#8d9aa9"/><path d="M87 96V230M78 130H210M78 201H210" stroke="#101b25" stroke-width="2"/><rect x="89" y="151" width="25" height="35" rx="3" fill="#18232c" stroke="#74818d"/><path d="M99 157v22l6-10z" stroke="#a1adba" fill="none"/>
<path d="M234 108H250V102H280V107H470V101H544V112H562V220H544V230H280V235H250V227H234Z" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2.5"/>
<path d="M250 108V226M279 108V230M351 108V230M410 108V230M470 104V230M544 112V220" stroke="var(--accent)" opacity=".6"/>
${Array.from({ length: 28 }, (_, i) => `<path d="M${284 + i * 2.3} 110v26M${284 + i * 2.3} 202v26" stroke="var(--accent)" opacity=".6"/>`).join('')}
${Array.from({ length: 34 }, (_, i) => `<path d="M${415 + i * 3.6} 106v31M${415 + i * 3.6} 200v27" stroke="var(--accent)" opacity=".6"/>`).join('')}
<path d="M562 112Q577 83 602 84H668Q687 87 690 106L668 132Q641 165 668 195L690 222Q687 242 668 246H602Q577 246 562 220Z" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
<path d="M190 111V222" stroke="#ed9b65" stroke-width="4"/><path d="M324 146Q309 168 324 190Q339 168 324 146M388 145Q366 168 388 192Q410 168 388 145M501 147Q484 168 501 189Q518 168 501 147" fill="#a2ced955" stroke="#739bab"/>
<path d="M730 149H500L388 149L190 168M730 187H500L388 187L190 168" stroke="#80a9e3" fill="none" stroke-width="1.5"/><text x="370" y="166" fill="var(--accent)" font-size="11" text-anchor="middle">18–50 mm</text><text x="370" y="214" fill="var(--muted)" font-size="8" text-anchor="middle">18 · 24 · 28 · 35 · 50</text><text x="148" y="267" fill="var(--ink)" text-anchor="middle" font-size="12">Camera body</text><text x="190" y="289" fill="var(--ink)" text-anchor="middle" font-size="12">Sensor</text><text x="400" y="267" fill="var(--ink)" text-anchor="middle" font-size="12">Zoom lens</text><text x="621" y="267" fill="var(--ink)" text-anchor="middle" font-size="12">Lens hood</text><text x="142" y="117" fill="#becbd8" font-size="10">α6700</text></svg>`;
}
export function releaseLessonDiagrams() {
	for (const el of document.querySelectorAll('#lesson-visual [data-lesson-diagram]')) {
		$('diagrams').append(el);
		el.hidden = true;
	}
}
export function mountLessonVisual(id) {
	const host = $('lesson-visual');
	const keys = { focal: ['focal', 'angle'], focus: ['blur'], depth: ['depth'] }[id] || [];
	for (const key of keys) {
		const el = $(`diagram-${key}`);
		el.dataset.lessonDiagram = key;
		el.hidden = false;
		el.removeAttribute('role');
		el.removeAttribute('aria-labelledby');
		host.append(el);
	}
	if (id === 'sensor')
		host.innerHTML = `<figure class="lesson-illustration" id="sensor-comparison"></figure><div class="sensor-choices" aria-label="Choose a sensor format">${['medium', 'full', 'aps', 'canon', 'mft'].map((key) => `<button data-sensor-choice="${key}">${sensors[key].name}</button>`).join('')}</div>`;
	if (id === 'lens')
		host.innerHTML = `<figure class="lesson-illustration">${lensIllustration()}</figure><p class="visual-caption">Compact mirrorless body with an 18–50 mm zoom. Highlighted: the lens. Shapes and optical elements are schematic.</p>`;
	if (id === 'aperture')
		host.innerHTML =
			'<figure class="aperture-illustration"><svg id="lesson-iris" viewBox="0 0 70 70" role="img" aria-label="Aperture blades and opening"></svg><div><h3 id="lesson-aperture-value"></h3><p>Entrance pupil diameter = focal length ÷ f-number.</p><p>Change the aperture above to see the opening and ray cone change.</p></div></figure><div class="lesson-illustration"><svg id="aperture-optics" viewBox="0 0 720 370" role="img" aria-label="Aperture and depth of field light path"></svg></div>';
}
export function updateLessonVisual(v, o) {
	if ($('sensor-comparison')) {
		$('sensor-comparison').innerHTML = sensorComparison($('sensor').value);
		document
			.querySelectorAll('[data-sensor-choice]')
			.forEach((b) => b.setAttribute('aria-pressed', b.dataset.sensorChoice === $('sensor').value));
	}
	if ($('lesson-iris')) {
		const g = irisGeometry(v.n);
		$('lesson-iris').innerHTML =
			`<circle cx="35" cy="35" r="34" fill="#172840"/><circle cx="35" cy="35" r="31" fill="#ffad71"/>${g.blades.map((d, i) => `<path d="${d}" fill="${i % 2 ? '#445770' : '#34455e'}" stroke="#7d8da5" stroke-width=".5"/>`).join('')}<circle cx="35" cy="35" r="31" fill="none" stroke="#172840" stroke-width="2"/>`;
		$('lesson-aperture-value').textContent = `f/${v.n} · ${o.pupil.toFixed(1)} mm`;
		$('aperture-optics').innerHTML = lightDiagram(v, o);
	}
}
