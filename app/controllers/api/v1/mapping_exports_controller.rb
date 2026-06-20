# frozen_string_literal: true

###
# @description: Place all the actions related to mappings
###
module API
  module V1
    class MappingExportsController < BaseController
      include ConfigurationProfileQueryable

      ###
      # @description: Returns exported mappings in a given format as binary
      ###
      HTML_EXPORTERS = {
        "html" => { exporter: Exporters::StandaloneHtml, type: "text/html" },
        "embed" => { exporter: Exporters::EmbedSnippet, type: "text/plain" }
      }.freeze

      def index
        return export_html_view if HTML_EXPORTERS.key?(params[:format])

        domains = current_configuration_profile
                    .domains
                    .where(id: Array.wrap(params.fetch(:domain_ids, "").split(",")))

        mapping = current_configuration_profile
                    .mappings
                    .find_by(id: params[:mapping_id])

        if domains.empty? && mapping.nil?
          render json: { error: "Either domain_ids or mapping_id is required" }, status: :bad_request
          return
        end

        result = ExportMappings.call(
          configuration_profile: current_configuration_profile,
          domains:,
          format: params[:format],
          mapping:
        )

        if result.success?
          send_data result.data,
                    filename: result.filename,
                    type: result.content_type
        else
          render json: { error: response.error }, status: :unprocessable_entity
        end
      rescue StandardError => e
        Airbrake.notify(e)
        render json: { error: e.message }, status: :internal_server_error
      end

      private

      ###
      # @description: Returns the configuration profile's crosswalk as a self-contained HTML
      #   artifact -- either a full standalone file (`html`) or an embeddable snippet (`embed`).
      #   Defaults to all abstract classes when no `domain_ids` are given.
      ###
      def export_html_view
        # `domain_ids` may arrive as an array (`domain_ids[]=1&domain_ids[]=2`) or a
        # comma-separated string; normalize both. Defaults to all abstract classes when blank.
        raw_ids = params[:domain_ids]
        ids = (raw_ids.is_a?(String) ? raw_ids.split(",") : Array.wrap(raw_ids)).compact_blank
        domains = current_configuration_profile.domains
        domains = domains.where(id: ids) if ids.present?

        config = HTML_EXPORTERS.fetch(params[:format])
        exporter = config[:exporter].new(
          configuration_profile: current_configuration_profile,
          domains:
        )

        send_data exporter.call,
                  filename: exporter.filename,
                  type: config[:type]
      rescue StandardError => e
        Airbrake.notify(e)
        render json: { error: e.message }, status: :internal_server_error
      end
    end
  end
end
