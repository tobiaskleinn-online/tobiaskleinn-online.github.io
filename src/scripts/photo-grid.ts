import GLightbox from 'glightbox';
import justifiedLayout from 'justified-layout';
import 'glightbox/dist/css/glightbox.css';
import '../styles/glightbox-custom.css';

function setupGallery() {
	document.querySelectorAll<HTMLElement>('.justified-gallery').forEach((container) => {
		const cards = Array.from(container.querySelectorAll<HTMLElement>('.photo-card'));
		const dimensions = cards.map((card) => ({
			width: Number(card.dataset.width),
			height: Number(card.dataset.height),
		}));
		let previousWidth = 0;
		function arrange() {
			const width = container.clientWidth;
			if (!width || Math.abs(width - previousWidth) < 1) return;
			previousWidth = width;
			const tokens = getComputedStyle(document.documentElement);
			const gap = parseFloat(
				tokens.getPropertyValue(width < 650 ? '--gallery-gap-mobile' : '--gallery-gap'),
			);
			const layout = justifiedLayout(dimensions, {
				containerWidth: width,
				containerPadding: 0,
				targetRowHeight: width < 500 ? 210 : width < 900 ? 240 : 300,
				boxSpacing: gap,
			});
			container.style.aspectRatio = 'auto';
			container.style.height = `${layout.containerHeight}px`;
			cards.forEach((card, index) => {
				const box = layout.boxes[index];
				Object.assign(card.style, {
					left: `${box.left}px`,
					top: `${box.top}px`,
					width: `${box.width}px`,
					height: `${box.height}px`,
				});
			});
		}
		arrange();
		if (typeof ResizeObserver !== 'undefined') new ResizeObserver(arrange).observe(container);
		else window.addEventListener('resize', arrange);
	});
	if (!document.querySelector('.glightbox')) return;
	GLightbox({
		selector: '.glightbox',
		openEffect: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'none' : 'fade',
		closeEffect: 'fade',
		touchNavigation: true,
		loop: false,
	});
}
if (document.readyState === 'loading')
	document.addEventListener('DOMContentLoaded', setupGallery, { once: true });
else setupGallery();
