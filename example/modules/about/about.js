export default {
  state: () => ({
    description: "A tiny frontend framework with explicit behavior."
  }),
  methods: {
    changeTone(event, ctx) {
      const tone = event.target.value;
      ctx.state.description = `${tone} architecture with plain JavaScript modules.`;
    }
  }
};
