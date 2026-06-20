# frozen_string_literal: true

module Exporters
  ###
  # @description: Builds a copy-pasteable HTML snippet that renders a configuration profile's
  #   crosswalk view inside a Shadow DOM, with the React bundle, the (shadow-scoped) CSS, the
  #   icon font and all the mapping data inlined. Unlike StandaloneHtml it is a *fragment* (no
  #   <html>/<head>/<body>) meant to be pasted into a CMS's HTML source field. It loads no
  #   external resources and creates no <iframe>; style isolation comes from the shadow root.
  ###
  class EmbedSnippet
    include FsSanitizable
    include AssetInlining

    # Pre-built assets produced by `yarn build` / `yarn build:css`.
    JS_BUNDLE = Rails.root.join("app/assets/builds/embed.js")
    CSS_BUNDLE = Rails.root.join("app/assets/builds/application.css")

    def initialize(configuration_profile:, domains:)
      @configuration_profile = configuration_profile
      @domains = domains
    end

    def call
      ApplicationController.render(
        template: "exports/embed",
        layout: false,
        locals: {
          token: token,
          css: ShadowCss.transform(read_asset(CSS_BUNDLE)),
          font_face: IconFont.font_face_css,
          js: inline_js(read_asset(JS_BUNDLE)),
          data_json: embeddable_json(data)
        }
      )
    end

    def filename
      "#{sanitized_filename_for(@configuration_profile.name)}-embed.html"
    end

    private

    # Stable per-CP id so element ids in the snippet don't collide with the host page.
    def token
      "cp#{@configuration_profile.id}"
    end

    def data
      StandaloneHtml::Data.new(configuration_profile: @configuration_profile, domains: @domains).call
    end
  end
end
