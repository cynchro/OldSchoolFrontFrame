export default {
  state: () => ({
    title: "External module",
    content: "Loaded from modules/external folder."
  }),
  methods: {
    refresh(_event, ctx) {
      const now = new Date().toLocaleTimeString();
      ctx.state.content = `Template re-bound at ${now}.`;
    }
  }
};
