import { portraitBackgroundUrl } from './portrait-background-asset.js';
let portraitBackgroundImage = null;
if (typeof Image !== 'undefined') {
	portraitBackgroundImage = new Image();
	portraitBackgroundImage.onload = () => window.dispatchEvent(new Event('portrait-image-ready'));
	portraitBackgroundImage.src = portraitBackgroundUrl;
}
import { portraitUrl } from './portrait-asset.js';
let portraitImage = null;
if (typeof Image !== 'undefined') {
	portraitImage = new Image();
	portraitImage.onload = () => window.dispatchEvent(new Event('portrait-image-ready'));
	portraitImage.src = portraitUrl;
}
import { defocus } from './optics.js';
import { scenePresets } from './scene-model.js';
// Photo-inspired drawings, separated into movable depth layers. No photographs
// or fixed photographic blur are baked into the camera simulation.
export function drawScene(canvas, v, scene, grid = false, size = null) {
	const box = size || canvas.getBoundingClientRect();
	if (!box.width) return;
	const ctx = canvas.getContext('2d'),
		pixelRatio = size?.pixelRatio || devicePixelRatio || 1,
		w = box.width,
		h = box.height;
	canvas.width = w * pixelRatio;
	canvas.height = h * pixelRatio;
	ctx.scale(pixelRatio, pixelRatio);
	ctx.fillStyle = '#15233b';
	ctx.fillRect(0, 0, w, h);
	let vw = w,
		vh = (w * v.sensor.h) / v.sensor.w;
	if (vh > h) {
		vh = h;
		vw = (h * v.sensor.w) / v.sensor.h;
	}
	ctx.save();
	ctx.translate((w - vw) / 2, (h - vh) / 2);
	ctx.beginPath();
	ctx.rect(0, 0, vw, vh);
	ctx.clip();
	const reference = scenePresets[scene.key],
		z = ((v.f / reference.f) * 36) / v.sensor.w;
	const rand = (i) => {
		const n = Math.sin(i * 127.1 + 311.7) * 43758.5453;
		return n - Math.floor(n);
	};
	const path = (d, fill, stroke, width = 1) => {
		const p = new Path2D(d);
		if (fill) {
			ctx.fillStyle = fill;
			ctx.fill(p);
		}
		if (stroke) {
			ctx.strokeStyle = stroke;
			ctx.lineWidth = width;
			ctx.stroke(p);
		}
	};
	const ellipse = (x, y, rx, ry, fill, angle = 0) => {
		ctx.beginPath();
		ctx.ellipse(x, y, rx, ry, angle, 0, Math.PI * 2);
		ctx.fillStyle = fill;
		ctx.fill();
	};
	const grad = (x, y, x2, y2, stops) => {
		const g = ctx.createLinearGradient(x, y, x2, y2);
		stops.forEach(([at, c]) => g.addColorStop(at, c));
		return g;
	};
	ctx.fillStyle = grad(
		0,
		0,
		0,
		vh,
		scene.key === 'macro'
			? [
					[0, '#92916a'],
					[0.5, '#6b7954'],
					[1, '#304f3d'],
				]
			: scene.key === 'portrait'
				? [
						[0, '#b2c6df'],
						[1, '#eee0c9'],
					]
				: [
						[0, '#5eabc5'],
						[0.48, '#bec6c4'],
						[1, '#d6bf99'],
					],
	);
	ctx.fillRect(0, 0, vw, vh);
	ctx.save();
	ctx.translate(vw / 2, vh * 0.52);
	ctx.scale((vw / 1600) * z, (vh / 1067) * z);
	ctx.translate(-800, -555);
	function layer(key, draw) {
		ctx.save();
		const scale = reference[key] / scene[key],
			blur = (defocus(v.f, v.n, v.d, scene[key]).blur / v.sensor.w) * vw * 0.6;
		ctx.filter = `blur(${Math.min(36, blur) * pixelRatio}px)`;
		ctx.translate(800, 555);
		ctx.scale(scale, scale);
		ctx.translate(-800, -555);
		draw();
		ctx.restore();
	}
	function cypress(x, y, size) {
		ctx.save();
		ctx.translate(x, y);
		ctx.scale(size, size);
		path('M-3 0L-2 -50H3L4 0Z', '#5b5037');
		path(
			'M0 -141C-8 -132 -10 -111 -13 -96C-22 -61 -16 -26 -7 -17C-5 -13 5 -13 10 -20C21 -36 16 -71 12 -95C9 -118 7 -135 0 -141Z',
			grad(-16, 0, 16, 0, [
				[0, '#192d27'],
				[0.6, '#3a4930'],
				[1, '#657049'],
			]),
		);
		path('M1 -129Q-4 -82 1 -31', null, '#8b8c5650', 2);
		ctx.restore();
	}
	function house(x, y, width, height) {
		ctx.fillStyle = '#d6d4ba';
		ctx.fillRect(x, y, width, height);
		path(
			`M${x - 12} ${y}L${x + width * 0.35} ${y - 42}L${x + width + 12} ${y - 12}L${x + width} ${y + 8}Z`,
			'#a36e50',
		);
		ctx.fillStyle = '#b3b4a0';
		ctx.fillRect(x + width * 0.7, y + 9, width * 0.3, height - 9);
		ctx.fillStyle = '#54605b';
		for (let i = 0; i < 3; i++)
			ctx.fillRect(x + 15 + i * width * 0.22, y + 22, width * 0.09, height * 0.28);
		ctx.fillStyle = '#6d715d';
		ctx.fillRect(x + width * 0.43, y + height * 0.55, width * 0.16, height * 0.45);
	}
	function portraitBackground() {
		if (portraitBackgroundImage?.complete && portraitBackgroundImage.naturalWidth) {
			const scale = Math.max(
					1600 / portraitBackgroundImage.naturalWidth,
					1067 / portraitBackgroundImage.naturalHeight,
				),
				w = portraitBackgroundImage.naturalWidth * scale,
				h = portraitBackgroundImage.naturalHeight * scale;
			ctx.drawImage(portraitBackgroundImage, (1600 - w) / 2, (1067 - h) / 2, w, h);
		}
	}
	function portraitSubject() {
		if (portraitImage?.complete && portraitImage.naturalWidth) {
			const height = 1020,
				width = (height * portraitImage.naturalWidth) / portraitImage.naturalHeight;
			ctx.drawImage(portraitImage, 650 - width / 2, 70, width, height);
		}
	}
	function landscapeBackground() {
		path(
			'M-1000 480L-200 342Q130 330 230 246Q360 160 467 175Q583 191 656 234Q748 209 815 242Q1060 351 1370 330Q1590 313 1900 367L2200 1100H-1000Z',
			grad(0, 180, 0, 700, [
				[0, '#6f7e80'],
				[1, '#9c9b89'],
			]),
		);
		for (let i = 0; i < 24; i++) {
			const y = 330 + i * 8;
			path(
				`M-150 ${y}Q280 ${y - 40} 640 ${y + 30}T1750 ${y + 5}`,
				null,
				i % 2 ? '#d6ccb329' : '#4b656733',
				2,
			);
		}
		path(
			'M-500 546Q200 342 610 446Q1010 508 1350 404Q1660 383 2100 516L2100 1200H-500Z',
			'#a89f7f',
		);
		path('M-200 578Q300 420 628 483Q1020 589 1480 456L1880 600L1900 1200H-200Z', '#b9a583');
		path(
			'M-200 601Q200 502 491 539Q722 547 852 493Q1012 430 1170 493Q1290 557 1760 476L2000 950H-200Z',
			'#7c8262',
		);
		for (let i = 0; i < 45; i++) {
			const x = rand(i + 50) * 2200 - 300,
				y = 520 + rand(i + 20) * 115;
			ellipse(
				x,
				y,
				12 + rand(i + 13) * 40,
				9 + rand(i + 74) * 15,
				['#67714c', '#4c6547', '#7a8052'][i % 3],
			);
		}
	}
	function landscapeSubject() {
		path(
			'M-700 782Q130 503 609 632Q902 714 1264 567Q1498 489 2100 655L2100 1300H-700Z',
			grad(0, 500, 0, 1100, [
				[0, '#d2b387'],
				[0.55, '#bd9b6f'],
				[1, '#8f805e'],
			]),
		);
		path(
			'M-300 796Q100 597 511 706Q747 786 917 695Q1031 677 1185 712L1280 914Q767 779 460 995L-300 1100Z',
			'#8b836a',
		);
		path('M-250 985Q330 757 677 874Q1050 1026 1750 807L1900 1200H-250Z', '#bba075');
		for (let i = 0; i < 26; i++) {
			const y = 666 + i * 11;
			path(
				`M-250 ${y + 120}Q248 ${y - 80} 544 ${y + 45}Q744 ${y + 120} 973 ${y + 32}`,
				null,
				'#e4c69b38',
				1.5,
			);
		}
		path(
			'M1007 1080Q1224 995 1211 865Q1211 787 1054 725Q806 646 838 580Q860 541 943 525',
			null,
			'#776f5d',
			24,
		);
		path(
			'M1007 1080Q1224 995 1211 865Q1211 787 1054 725Q806 646 838 580Q860 541 943 525',
			null,
			'#d3c9ad',
			16,
		);
		for (const [x, y, size] of [
			[1110, 990, 1.1],
			[1190, 927, 0.92],
			[1173, 847, 0.76],
			[1092, 778, 0.61],
			[1016, 733, 0.5],
			[915, 679, 0.4],
			[858, 634, 0.31],
			[857, 595, 0.26],
			[886, 561, 0.22],
			[920, 542, 0.2],
			[948, 530, 0.18],
		])
			cypress(x, y, size);
		house(951, 505, 60, 38);
		house(1011, 515, 43, 30);
		cypress(1027, 546, 0.28);
	}
	function grassHead() {
		const p = (t) => {
			const u = 1 - t;
			return [
				u * u * 120 + 2 * u * t * 520 + t * t * 1450,
				u * u * 1070 + 2 * u * t * 60 + t * t * 750,
			];
		};
		path('M120 1070Q520 60 1450 750', null, '#aca886', 25);
		path('M90 1160Q465 55 1470 760', null, '#797d4c', 14);
		path('M90 1160Q465 55 1470 760', null, '#c6bd8d', 5);
		for (let i = 0; i < 145; i++) {
			const t = 0.08 + i / 160,
				[x, y] = p(t),
				[nx, ny] = p(t + 0.005),
				a = Math.atan2(ny - y, nx - x),
				side = i % 2 ? 1 : -1,
				len = 30 + rand(i + 12) * 70,
				angle = a + side * (0.55 + rand(i + 23) * 0.5);
			ctx.save();
			ctx.translate(x, y);
			ctx.rotate(angle);
			ellipse(
				len * 0.36,
				0,
				len * 0.48,
				5 + rand(i) * 5,
				['#bbb18a', '#d0c6a1', '#a89f78', '#ded5b6'][i % 4],
			);
			path(`M0 0Q${len * 0.8} -7 ${len + 25} -3`, null, '#e7dfc177', 1.4);
			ctx.restore();
		}
	}
	function ladybird() {
		ctx.save();
		ctx.translate(860, 535);
		ctx.scale(1.1, 1.1);
		ctx.rotate(2.35);
		for (const side of [-1, 1])
			for (let j = 0; j < 3; j++) {
				const y = -45 + j * 37;
				path(
					`M${side * 40} ${y}L${side * 72} ${y - 14}L${side * 85} ${y + 13}`,
					null,
					'#27362a',
					4,
				);
			}
		ellipse(1, 7, 64, 83, '#263129');
		ellipse(
			0,
			0,
			60,
			80,
			grad(-50, -50, 45, 65, [
				[0, '#f7ba50'],
				[0.3, '#e68b23'],
				[0.75, '#d56b15'],
				[1, '#994513'],
			]),
		);
		path('M0 -77Q7 0 2 79', null, '#764718', 2);
		for (const [x, y, rx, ry] of [
			[-29, -34, 12, 14],
			[31, -30, 12, 13],
			[-31, 17, 13, 14],
			[30, 20, 12, 14],
			[-15, 55, 9, 10],
		])
			ellipse(x, y, rx, ry, '#26332e', 0.2);
		ellipse(0, -73, 39, 29, '#1e2d27');
		ellipse(-22, -75, 11, 9, '#e0d9bd', -0.5);
		ellipse(23, -74, 10, 8, '#e0d9bd', 0.5);
		path('M-15 -92L-23 -109M14 -93L21 -109', null, '#26352b', 3);
		ellipse(-25, -21, 13, 34, '#fff5d470', -0.25);
		ellipse(-33, -35, 5, 12, '#fff9e8b0', -0.25);
		ctx.restore();
	}
	layer('background', () => {
		if (scene.key === 'portrait') portraitBackground();
		else if (scene.key === 'landscape') landscapeBackground();
		else {
			for (let i = 0; i < 36; i++) {
				const x = rand(i + 5) * 2100 - 250,
					y = rand(i + 10) * 1500 - 200;
				ellipse(
					x,
					y,
					30 + rand(i + 34) * 75,
					55 + rand(i + 56) * 180,
					['#a6a170', '#6a8051', '#d1bd7c', '#456248', '#8e9863'][i % 5],
					-0.3,
				);
			}
			for (let i = 0; i < 22; i++) {
				const x = rand(i + 11) * 2000 - 200;
				path(
					`M${x} 1300Q${x - 160} 550 ${x + 100} -150`,
					null,
					['#607645', '#acac76', '#7a8d53'][i % 3],
					8 + rand(i + 7) * 20,
				);
			}
		}
	});
	layer('subject', () => {
		if (scene.key === 'portrait') portraitSubject();
		else if (scene.key === 'landscape') landscapeSubject();
		else {
			grassHead();
			ladybird();
		}
	});
	layer('foreground', () => {
		if (scene.key === 'landscape') {
			path(
				'M-700 1180Q-100 820 495 1022Q1000 1215 2300 866L2300 2000H-700Z',
				grad(0, 900, 0, 1400, [
					[0, '#8e7353'],
					[1, '#514d3a'],
				]),
			);
			for (let i = 0; i < 30; i++)
				path(
					`M-200 ${1060 + i * 10}Q420 ${930 + i * 13} 880 ${1120 + i * 11}`,
					null,
					'#c3a27250',
					2,
				);
		} else if (scene.key === 'portrait') {
			path('M-800 1220Q600 1080 2100 1200L2300 2000H-800Z', '#c5af94');
		} else {
			path('M-230 1220Q-60 770 243 718', null, '#7d8a53', 18);
			for (let i = 0; i < 18; i++) {
				const x = 40 + i * 11,
					y = 900 - i * 8;
				ellipse(x, y, 35, 8, i % 2 ? '#b5b17d' : '#cfc7a0', -0.9);
			}
		}
	});
	ctx.restore();
	if (grid) {
		ctx.strokeStyle = '#ffffff70';
		ctx.lineWidth = 0.8;
		for (let i = 1; i < 3; i++) {
			ctx.beginPath();
			ctx.moveTo((vw * i) / 3, 0);
			ctx.lineTo((vw * i) / 3, vh);
			ctx.moveTo(0, (vh * i) / 3);
			ctx.lineTo(vw, (vh * i) / 3);
			ctx.stroke();
		}
	}
	ctx.restore();
}
