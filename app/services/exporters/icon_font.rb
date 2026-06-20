# frozen_string_literal: true

module Exporters
  ###
  # @description: Builds an inline `@font-face` for the Material Symbols Outlined icon font used
  #   by the crosswalk UI (`.desm-icon`). The font is vendored as a small subset woff2 (only the
  #   icons the view uses) so standalone/embedded exports carry no external font dependency.
  ###
  module IconFont
    WOFF2 = Rails.root.join("app/assets/fonts/material-symbols-subset.woff2")

    module_function

    def font_face_css
      data = Base64.strict_encode64(File.binread(WOFF2))
      <<~CSS
        @font-face {
          font-family: 'Material Symbols Outlined';
          font-style: normal;
          font-weight: 400;
          src: url(data:font/woff2;base64,#{data}) format('woff2');
        }
      CSS
    end
  end
end
