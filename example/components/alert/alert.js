import { Component } from "../../../framework/component/component.js";

// Mapeo a clases de Bootstrap
const TYPE_CLASS = { success: "success", error: "danger", info: "info" };

const template = (type) => `
  <div class="alert alert-${TYPE_CLASS[type] || "info"} alert-dismissible d-flex align-items-center mb-3" role="alert">
    <span data-bind="message"></span>
    <button data-click="dismiss" type="button" class="btn-close ms-2" aria-label="Cerrar"></button>
  </div>
`.trim();

export function showAlert(root, message, type = "info") {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = template(type);
  root.prepend(wrapper);

  const instance = Component({
    el: wrapper,
    state: () => ({ message }),
    methods: {
      dismiss(_, ctx) {
        ctx.root.remove();
        instance.destroy();
      }
    }
  });

  setTimeout(() => {
    if (wrapper.isConnected) {
      wrapper.remove();
      instance.destroy();
    }
  }, 3000);
}
