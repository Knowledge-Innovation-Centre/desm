# frozen_string_literal: true

module Exporters
  ###
  # @description: Shared helpers for the HTML exporters (standalone file + embeddable snippet):
  #   reading the pre-built JS/CSS bundles and safely inlining JSON inside a <script> tag.
  ###
  module AssetInlining
    # JS line/paragraph separators (constructed by code point to avoid embedding the raw bytes).
    LINE_SEPARATOR = [0x2028].pack("U")
    PARAGRAPH_SEPARATOR = [0x2029].pack("U")

    # Sequences that must be neutralized so a JSON blob can't break out of a <script> element
    # (`</script>`, HTML comment openers) or be mis-parsed as a JS line terminator (U+2028/U+2029).
    # The escaped forms stay valid JSON/JS.
    JSON_SCRIPT_ESCAPES = {
      "<" => "\\u003c",
      ">" => "\\u003e",
      LINE_SEPARATOR => "\\u2028",
      PARAGRAPH_SEPARATOR => "\\u2029"
    }.freeze

    JSON_SCRIPT_PATTERN = /[<>#{LINE_SEPARATOR}#{PARAGRAPH_SEPARATOR}]/

    def read_asset(path)
      raise "Missing build artifact: #{path}. Run `yarn build` and `yarn build:css`." unless File.exist?(path)

      File.read(path)
    end

    def embeddable_json(payload)
      payload.to_json.gsub(JSON_SCRIPT_PATTERN, JSON_SCRIPT_ESCAPES)
    end

    # Make a JS bundle safe to inline in a <script> tag: a literal `</script` can only occur
    # inside a string/regex literal, where inserting a backslash (`<\/script`) is a no-op for
    # JS but stops the HTML parser from closing the element early.
    def inline_js(js)
      js.gsub(%r{<(?=/script)}i) { "<\\" }
    end
  end
end
