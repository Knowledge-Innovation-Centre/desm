# frozen_string_literal: true

module Exporters
  ###
  # @description: Adapts the compiled Bootstrap/DESM stylesheet for use inside a Shadow DOM
  #   (the embeddable snippet). Two problems are solved:
  #
  #   1. Bootstrap defines its `--bs-*` custom properties on `:root` (the document's <html>),
  #      which a shadow tree never sees. Rewriting `:root` -> `:host` puts those variables on
  #      the shadow host so they inherit into the widget.
  #   2. Bootstrap's base typography lives on `html`/`body`, which don't exist inside a shadow
  #      tree. A small reboot block on `:host` restores the essentials without risky `body`
  #      selector rewriting.
  ###
  module ShadowCss
    # Replaces Bootstrap's `body` reboot (font + colors) for the shadow host; values fall back to
    # the `--bs-*` vars now defined on `:host`. Box-sizing on the host itself (descendants are
    # already covered by Bootstrap's own `*, *::before, *::after` rule, which matches in shadow).
    REBOOT = <<~CSS
      :host {
        display: block;
        box-sizing: border-box;
        font-family: var(--bs-body-font-family, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif);
        font-size: var(--bs-body-font-size, 1rem);
        font-weight: var(--bs-body-font-weight, 400);
        line-height: var(--bs-body-line-height, 1.5);
        color: var(--bs-body-color, #212529);
        text-align: var(--bs-body-text-align, left);
        background-color: var(--bs-body-bg, #fff);
      }
    CSS

    module_function

    def transform(css)
      REBOOT + css.gsub(":root", ":host")
    end
  end
end
