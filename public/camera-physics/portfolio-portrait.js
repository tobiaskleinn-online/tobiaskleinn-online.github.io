// Compatibility for the older portrait view; load its engine only if requested.
export function setupPortrait3D(host, onMove) {
	let viewer, latest;
	const api = {
		update(...args) {
			latest = args;
			viewer?.update(...args);
		},
		setSubject(...args) {
			viewer?.setSubject(...args);
		},
		setView(...args) {
			viewer?.setView(...args);
		},
		reset() {
			viewer?.reset();
		},
	};
	import('./vendor-3d.js')
		.then(() => import('./portrait-3d.js'))
		.then((module) => {
			viewer = module.setupPortrait3D(host, onMove);
			if (latest) viewer.update(...latest);
		})
		.catch(() => {
			host.textContent = 'The 3D view could not load. Please reload.';
		});
	return api;
}
