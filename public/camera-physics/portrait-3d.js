import { portraitModels } from './portrait-models.js';
import { translateText } from './i18n.js';
import { formatDistance } from './scene-model.js';
// Real world units are meters. The inspection camera is independent of the photographed camera.
export function setupPortrait3D(host, onMove) {
	const { THREE: T, OrbitControls, GLTFLoader } = globalThis.Camera3D;
	let renderer;
	try {
		renderer = new T.WebGLRenderer({ antialias: true, alpha: false });
	} catch {
		host.innerHTML =
			'<p class="webgl-error">3D is unavailable on this device. Top view still lets you adjust all distances.</p>';
		return { update() {}, setSubject() {}, setView() {}, reset() {} };
	}
	renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
	renderer.outputColorSpace = T.SRGBColorSpace;
	renderer.toneMapping = T.ACESFilmicToneMapping;
	renderer.toneMappingExposure = 1.2;
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = T.PCFSoftShadowMap;
	host.append(renderer.domElement);
	const world = new T.Scene();
	world.background = new T.Color('#d7e4e2');
	world.fog = new T.Fog('#d7e4e2', 32, 85);
	const overview = new T.PerspectiveCamera(43, 1, 0.05, 180),
		photo = new T.PerspectiveCamera(30, 1, 0.01, 180);
	const orbit = new OrbitControls(overview, renderer.domElement);
	orbit.enableDamping = false;
	orbit.minDistance = 1.5;
	orbit.maxDistance = 55;
	orbit.maxPolarAngle = Math.PI * 0.48;
	orbit.target.set(5, 1, 0);
	const home = () => {
		overview.position.set(-8, 8, 17);
		orbit.target.set(7, 1, 0);
		orbit.update();
		render();
	};
	world.add(new T.HemisphereLight(0xe9f5ff, 0x6d7151, 2.5));
	const sun = new T.DirectionalLight(0xffe6b6, 3);
	sun.position.set(-5, 12, 6);
	sun.castShadow = true;
	sun.shadow.mapSize.set(1024, 1024);
	Object.assign(sun.shadow.camera, { left: -12, right: 24, top: 16, bottom: -16, far: 60 });
	sun.shadow.bias = -0.0004;
	world.add(sun);
	const mat = (color, extra = {}) => new T.MeshStandardMaterial({ color, roughness: 1, ...extra });
	const mesh = (geo, m, parent = world) => {
		const a = new T.Mesh(geo, m);
		parent.add(a);
		return a;
	};
	const ground = mesh(new T.PlaneGeometry(150, 150), mat('#87916b'));
	ground.rotation.x = -Math.PI / 2;
	ground.position.y = -0.025;
	ground.receiveShadow = true;
	// A narrow warm path leads into the clearing; terrain beyond it stays deliberately simple.
	const path = mesh(new T.PlaneGeometry(40, 2.5), mat('#b2a586'));
	path.rotation.x = -Math.PI / 2;
	path.position.set(12, -0.018, 0);
	for (let i = 0; i < 5; i++) {
		const hill = mesh(
			new T.SphereGeometry(1, 20, 10),
			mat(['#76896e', '#819378', '#8b9b80'][i % 3]),
		);
		hill.position.set(35 + i * 5, -1.5, -17 + i * 9);
		hill.scale.set(13 + i, 4 + i * 0.6, 12);
	}
	const groups = {
		camera: new T.Group(),
		foreground: new T.Group(),
		subject: new T.Group(),
		background: new T.Group(),
	};
	Object.values(groups).forEach((g) => world.add(g));
	const cameraBody = mesh(new T.BoxGeometry(0.22, 0.32, 0.46), mat('#293645'), groups.camera);
	cameraBody.position.set(-0.15, 1.48, 0);
	const lens = mesh(new T.CylinderGeometry(0.13, 0.13, 0.25, 20), mat('#394754'), groups.camera);
	lens.rotation.z = Math.PI / 2;
	lens.position.set(0.06, 1.48, 0);
	const glass = mesh(
		new T.CylinderGeometry(0.1, 0.1, 0.008, 20),
		mat('#638f9f', { metalness: 0.4, roughness: 0.2 }),
		groups.camera,
	);
	glass.rotation.z = Math.PI / 2;
	glass.position.set(0.19, 1.48, 0);
	for (const z of [-0.23, 0.23]) {
		const leg = mesh(new T.CylinderGeometry(0.013, 0.02, 1.4, 6), mat('#46525d'), groups.camera);
		leg.position.set(-0.15, 0.7, z);
		leg.rotation.x = z > 0 ? -0.22 : 0.22;
	}
	const handles = [],
		markerColors = {
			camera: 0x5187cb,
			foreground: 0x4b9080,
			subject: 0xdd9b59,
			background: 0x9174b1,
		};
	for (const [key, g] of Object.entries(groups)) {
		const ring = mesh(
			new T.TorusGeometry(key === 'background' ? 1.5 : 0.48, 0.025, 8, 40),
			new T.MeshBasicMaterial({ color: markerColors[key] }),
			g,
		);
		ring.rotation.x = Math.PI / 2;
		ring.position.y = 0.025;
		ring.userData.kind = key;
		handles.push(ring);
		const hit = mesh(
			new T.CylinderGeometry(
				key === 'background' ? 1.6 : 0.58,
				key === 'background' ? 1.6 : 0.58,
				0.2,
				20,
			),
			new T.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
			g,
		);
		hit.position.y = 0.1;
		hit.userData.kind = key;
		handles.push(hit);
	}
	const focusPlane = mesh(
		new T.PlaneGeometry(4, 3.2),
		new T.MeshBasicMaterial({
			color: 0x5d9bdd,
			transparent: true,
			opacity: 0.16,
			side: T.DoubleSide,
			depthWrite: false,
		}),
	);
	focusPlane.rotation.y = Math.PI / 2;
	focusPlane.position.y = 1.6;
	focusPlane.userData.kind = 'focus';
	handles.push(focusPlane);
	const focusEdge = new T.LineSegments(
		new T.EdgesGeometry(new T.PlaneGeometry(4, 3.2)),
		new T.LineBasicMaterial({ color: 0x538ed0, transparent: true, opacity: 0.65 }),
	);
	focusPlane.add(focusEdge);
	const volume = mesh(
		new T.BoxGeometry(1, 3.15, 3.9),
		new T.MeshBasicMaterial({
			color: 0xf6bf57,
			transparent: true,
			opacity: 0.11,
			depthWrite: false,
			side: T.DoubleSide,
		}),
	);
	volume.position.y = 1.575;
	const volumeEdges = new T.LineSegments(
		new T.EdgesGeometry(volume.geometry),
		new T.LineBasicMaterial({ color: 0xdfac4d, transparent: true, opacity: 0.45 }),
	);
	volume.add(volumeEdges);
	const axisGeo = new T.BufferGeometry().setFromPoints([
			new T.Vector3(-2, 0.035, 0),
			new T.Vector3(50, 0.035, 0),
		]),
		axis = new T.Line(
			axisGeo,
			new T.LineDashedMaterial({ color: 0xd5e1cf, dashSize: 0.25, gapSize: 0.2 }),
		);
	axis.computeLineDistances();
	world.add(axis);
	const labels = document.createElement('div');
	labels.className = 'portrait-labels';
	labels.setAttribute('aria-hidden', 'true');
	host.append(labels);
	const labelNodes = {};
	for (const key of ['camera', 'foreground', 'subject', 'background', 'focus']) {
		const a = document.createElement('span');
		labels.append(a);
		labelNodes[key] = a;
	}
	const status = document.createElement('p');
	status.className = 'portrait-loading';
	status.setAttribute('role', 'status');
	status.textContent = 'Loading 3D models…';
	host.append(status);
	let active = false,
		subjectType = 'human',
		view = 'overview',
		last,
		loaded = false,
		failed = false;
	const subjects = {};
	const loader = new GLTFLoader();
	async function load(name, height) {
		const data = Uint8Array.from(atob(portraitModels[name]), (c) => c.charCodeAt(0));
		const gltf = await loader.parseAsync(data.buffer, '');
		const model = gltf.scene;
		if (gltf.animations.length) {
			const mixer = new T.AnimationMixer(model);
			mixer.clipAction(gltf.animations[0]).play();
			mixer.update(0.1);
			model.updateMatrixWorld(true);
		}
		let bounds = new T.Box3().setFromObject(model),
			size = bounds.getSize(new T.Vector3());
		const wrapper = new T.Group();
		wrapper.add(model);
		const scale = height / size.y;
		wrapper.scale.setScalar(scale);
		model.position.sub(
			new T.Vector3(
				(bounds.min.x + bounds.max.x) / 2,
				bounds.min.y,
				(bounds.min.z + bounds.max.z) / 2,
			),
		);
		wrapper.traverse((m) => {
			if (m.isMesh) {
				m.castShadow = true;
				m.receiveShadow = true;
			}
		});
		return wrapper;
	}
	Promise.all([load('human', 1.78), load('deer', 1.25), load('tree', 6), load('flowers', 0.55)])
		.then(([human, deer, tree, flowers]) => {
			subjects.human = human;
			subjects.deer = deer;
			human.rotation.y = -Math.PI / 2;
			deer.rotation.y = -Math.PI * 0.65;
			groups.subject.add(human, deer);
			groups.foreground.add(flowers);
			flowers.position.z = 1.1;
			for (const [x, z, s] of [
				[0.5, -1.4, 0.7],
				[1, 1.7, 0.6],
			]) {
				const f = flowers.clone();
				f.position.set(x, 0, z);
				f.scale.multiplyScalar(s);
				groups.foreground.add(f);
			}
			for (const [x, z, s] of [
				[0, -2.7, 1],
				[1.5, 3, 1.1],
				[4, -5, 1.25],
				[5, 6, 0.9],
				[9, -2, 1.1],
				[12, 4, 1.2],
				[14, -7, 1.35],
			]) {
				const t = tree.clone();
				t.position.set(x, 0, z);
				t.scale.multiplyScalar(s);
				t.rotation.y = x * 0.7;
				groups.background.add(t);
			}
			loaded = true;
			status.hidden = true;
			if (last) update(...last);
			render();
		})
		.catch((error) => {
			failed = true;
			status.textContent = 'The 3D models could not load. Use Top view to adjust distances.';
			console.error('Portrait 3D model loading', error);
		});
	function render() {
		if (!active || !host.clientWidth) return;
		const c = view === 'camera' ? photo : overview;
		const w = host.clientWidth,
			h = host.clientHeight;
		renderer.setScissorTest(false);
		renderer.setViewport(0, 0, w, h);
		if (view === 'camera' && last) {
			const aspect = last[1].sensor.w / last[1].sensor.h;
			let vw = w,
				vh = w / aspect;
			if (vh > h) {
				vh = h;
				vw = h * aspect;
			}
			renderer.setClearColor('#1c2930');
			renderer.clear();
			renderer.setViewport((w - vw) / 2, (h - vh) / 2, vw, vh);
			renderer.setScissor((w - vw) / 2, (h - vh) / 2, vw, vh);
			renderer.setScissorTest(true);
			photo.aspect = aspect;
			photo.updateProjectionMatrix();
		}
		renderer.render(world, c);
		renderer.setScissorTest(false);
		const rect = host.getBoundingClientRect();
		for (const [key, el] of Object.entries(labelNodes)) {
			el.hidden = view === 'camera';
			if (view === 'camera' || !last) continue;
			const s = last[0],
				v = last[1],
				o = last[2],
				worldX =
					key === 'focus'
						? (s.cameraPosition || 0) + v.d
						: key === 'camera'
							? s.cameraPosition || 0
							: (s.cameraPosition || 0) + s[key];
			const p = new T.Vector3(
				worldX,
				key === 'focus'
					? 3.45
					: key === 'subject'
						? subjectType === 'human'
							? 2
							: 1.6
						: key === 'background'
							? 6.5
							: 0.25,
				key === 'foreground' ? 1.1 : 0,
			).project(c);
			el.hidden = p.z > 1 || Math.abs(p.x) > 1 || Math.abs(p.y) > 1;
			el.style.left = (p.x * 0.5 + 0.5) * rect.width + 'px';
			el.style.top =
				(-p.y * 0.5 + 0.5) * rect.height +
				(key === 'camera' ? 20 : key === 'foreground' ? 44 : 0) +
				'px';
			el.textContent = translateText(
				(key === 'subject'
					? subjectType === 'human'
						? 'Human'
						: 'Deer'
					: key === 'focus'
						? 'Focus'
						: key[0].toUpperCase() + key.slice(1)) +
					' · ' +
					(key === 'camera' && !(s.cameraPosition || 0)
						? '0 m'
						: formatDistance(
								key === 'focus' ? v.d : key === 'camera' ? s.cameraPosition || 0 : s[key],
							)),
			);
		}
	}
	function resize() {
		const w = host.clientWidth,
			h = host.clientHeight;
		if (w && h) {
			renderer.setSize(w, h, false);
			overview.aspect = photo.aspect = w / h;
			overview.updateProjectionMatrix();
			photo.updateProjectionMatrix();
			render();
		}
	}
	new ResizeObserver(resize).observe(host);
	orbit.addEventListener('change', render);
	function update(s, v, o, visible = true) {
		last = [s, v, o, visible];
		active = visible;
		if (!active) return;
		const camera = s.cameraPosition || 0;
		for (const [key, g] of Object.entries(groups))
			g.position.x = camera + (key === 'camera' ? 0 : s[key]);
		if (loaded) {
			subjects.human.visible = subjectType === 'human';
			subjects.deer.visible = subjectType === 'deer';
		}
		const near = Math.max(0, o.near),
			far = Math.min(Number.isFinite(o.far) ? o.far : 60, 60);
		volume.position.x = camera + (near + far) / 2;
		volume.scale.x = Math.max(0.001, far - near);
		focusPlane.position.x = camera + v.d;
		photo.position.set(camera, 1.48, 0);
		photo.lookAt(camera + s.subject, subjectType === 'human' ? 1.2 : 0.78, 0);
		photo.fov = T.MathUtils.radToDeg(2 * Math.atan(v.sensor.h / (2 * v.f)));
		photo.updateProjectionMatrix();
		groups.camera.visible =
			focusPlane.visible =
			volume.visible =
			axis.visible =
				view === 'overview';
		handles.forEach((h) => {
			if (h !== focusPlane) h.visible = view === 'overview';
		});
		orbit.enabled = view === 'overview';
		resize();
	}
	const ray = new T.Raycaster(),
		pointer = new T.Vector2(),
		dragPlane = new T.Plane(new T.Vector3(0, 1, 0), 0),
		intersection = new T.Vector3();
	let drag = null;
	const setRay = (e) => {
		const r = renderer.domElement.getBoundingClientRect();
		pointer.set(
			((e.clientX - r.left) / r.width) * 2 - 1,
			(-(e.clientY - r.top) / r.height) * 2 + 1,
		);
		ray.setFromCamera(pointer, overview);
	};
	renderer.domElement.addEventListener(
		'pointerdown',
		(e) => {
			if (view !== 'overview' || !last) return;
			setRay(e);
			const hits = ray.intersectObjects(handles, false),
				hit = hits.find((h) => h.object.userData.kind !== 'focus') || hits[0];
			if (!hit) return;
			const key = hit.object.userData.kind;
			dragPlane.constant = key === 'focus' ? -hit.point.y : 0;
			if (!ray.ray.intersectPlane(dragPlane, intersection)) return;
			drag = {
				key,
				start: intersection.x,
				world: key === 'focus' ? focusPlane.position.x : groups[key].position.x,
			};
			orbit.enabled = false;
			renderer.domElement.setPointerCapture(e.pointerId);
			e.stopImmediatePropagation();
		},
		true,
	);
	renderer.domElement.addEventListener('pointermove', (e) => {
		if (!drag) return;
		setRay(e);
		if (ray.ray.intersectPlane(dragPlane, intersection))
			onMove(drag.key, drag.world + intersection.x - drag.start);
	});
	const end = () => {
		drag = null;
		orbit.enabled = view === 'overview';
	};
	for (const name of ['pointerup', 'pointercancel', 'lostpointercapture'])
		renderer.domElement.addEventListener(name, end);
	renderer.domElement.addEventListener('webglcontextlost', (e) => {
		e.preventDefault();
		status.hidden = false;
		status.textContent = '3D rendering was interrupted. Reload the page or use Top view.';
	});
	home();
	return {
		update,
		setSubject(type) {
			subjectType = type === 'deer' ? 'deer' : 'human';
			if (last) update(...last);
		},
		setView(next) {
			view = next === 'camera' ? 'camera' : 'overview';
			if (last) update(...last);
		},
		reset: home,
	};
}
