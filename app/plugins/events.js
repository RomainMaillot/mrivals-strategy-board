import Emitter from 'tiny-emitter';

export default defineNuxtPlugin(() => {
	const emitter = new Emitter();

	const on = (...args) => emitter.on(...args);
	const once = (...args) => emitter.once(...args);
	const off = (...args) => emitter.off(...args);
	const emit = (...args) => emitter.emit(...args);

	return {
		provide: {
			on: on,
			once: once,
			off: off,
			emit: emit,
		},
	};
});
