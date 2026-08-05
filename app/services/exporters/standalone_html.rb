# frozen_string_literal: true

module Exporters
  ###
  # @description: Builds a single, self-contained HTML file rendering a configuration profile's
  #   public crosswalk view (the same one served at `/mappings-list?cp=<id>`), with the React
  #   bundle, the compiled CSS, the icon font and all the mapping data inlined. The result can be
  #   hosted anywhere or embedded into any CMS via raw HTML (e.g. inside an `<iframe>`) -- it makes
  #   no network calls back to DESM.
  ###
  class StandaloneHtml
    include FsSanitizable
    include AssetInlining

    # Pre-built assets produced by `yarn build` / `yarn build:css`.
    JS_BUNDLE = Rails.root.join("app/assets/builds/static.js")
    CSS_BUNDLE = Rails.root.join("app/assets/builds/application.css")

    def initialize(configuration_profile:, domains:, view_options: {})
      @configuration_profile = configuration_profile
      @domains = domains
      @view_options = view_options
    end

    def call
      ApplicationController.render(
        template: "exports/standalone",
        layout: false,
        locals: {
          title: @configuration_profile.name,
          font_face: IconFont.font_face_css,
          css: read_asset(CSS_BUNDLE),
          js: inline_js(read_asset(JS_BUNDLE)),
          data_json: embeddable_json(data)
        }
      )
    end

    def filename
      "#{sanitized_filename_for(@configuration_profile.name)}-mapping.html"
    end

    private

    def data
      Data.new(
        configuration_profile: @configuration_profile,
        domains: @domains,
        view_options: @view_options
      ).call
    end
  end
end
