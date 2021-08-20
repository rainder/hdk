export const load = async () => {
  const app = Vue.createApp({
    template: '<container/>',
  });

  await Promise.all([
    import('./components/container.js'),
  ]).then((components) => {
    components.forEach((component) => {
      component.mount(app);
    });
  });

  return app;
};
