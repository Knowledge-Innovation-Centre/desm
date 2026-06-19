# frozen_string_literal: true

module Exporters
  ###
  # @description: Builds a single, self-contained HTML file rendering a configuration profile's
  #   public crosswalk view (the same one served at `/mappings-list?cp=<id>`), with the React
  #   bundle, the compiled CSS and all the mapping data inlined. The result can be hosted
  #   anywhere or embedded into any CMS via raw HTML (e.g. inside an `<iframe>`) -- it makes no
  #   network calls back to DESM.
  ###
  class StandaloneHtml
    include FsSanitizable

    # Pre-built assets produced by `yarn build` / `yarn build:css`.
    JS_BUNDLE = Rails.root.join("app/assets/builds/static.js")
    CSS_BUNDLE = Rails.root.join("app/assets/builds/application.css")

    # Material Symbols icon font used by the crosswalk UI (matches layouts/application.html.erb).
    ICON_FONT_HREF =
      "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24," \
      "400,0..1,0&icon_names=account_tree,arrow_split,chevron_left,chevron_right,download," \
      "filter_alt,help,info,keyboard_arrow_up,menu,search"

    def initialize(configuration_profile:, domains:)
      @configuration_profile = configuration_profile
      @domains = domains
    end

    def call
      ApplicationController.render(
        template: "exports/standalone",
        layout: false,
        locals: {
          title: @configuration_profile.name,
          icon_font_href: ICON_FONT_HREF,
          css: read_asset(CSS_BUNDLE),
          js: read_asset(JS_BUNDLE),
          data_json: embeddable_json(data)
        }
      )
    end

    def filename
      "#{sanitized_filename_for(@configuration_profile.name)}-mapping.html"
    end

    private

    def data
      Data.new(configuration_profile: @configuration_profile, domains: @domains).call
    end

    # Make the JSON safe to inline inside a <script> tag: neutralize sequences that could break
    # out of the element (`</script>`, HTML comment openers) or be mis-parsed as JS line
    # terminators (U+2028 / U+2029). The escaped forms stay valid JSON/JS.
    def embeddable_json(payload)
      payload.to_json
        .gsub("<", "\\u003c")
        .gsub(">", "\\u003e")
        .gsub(" ", "\\u2028")
        .gsub(" ", "\\u2029")
    end

    def read_asset(path)
      raise "Missing build artifact: #{path}. Run `yarn build` and `yarn build:css`." unless File.exist?(path)

      File.read(path)
    end
  end
end
