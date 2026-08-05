# frozen_string_literal: true

module Exporters
  class StandaloneHtml
    ###
    # @description: Gathers all the data the public crosswalk view (`PropertyMappingList`)
    #   loads from the API, shaped so it can be embedded into a self-contained HTML file and
    #   served back to the React components through the static axios adapter.
    #
    #   Each slice reuses the *exact* serializer + options the matching `API::V1` controller
    #   uses, so the embedded JSON is byte-for-byte identical to the live API responses. The
    #   React code (`apiRequest`) camelizes the keys downstream, so everything here stays in
    #   the raw snake_case serializer form -- except `configurationProfile` and `viewOptions`,
    #   which are consumed directly by the frontend to preset the store and are therefore
    #   already camelCase.
    ###
    class Data
      delegate :predicate_set, to: :configuration_profile

      def initialize(configuration_profile:, domains:, view_options: {})
        @configuration_profile = configuration_profile
        # Only abstract classes that actually have a spine can be rendered.
        @domains = domains.select(&:spine?)
        @view_options = view_options.presence || CrosswalkViewOptions.sanitize
      end

      def call
        {
          configurationProfile: {
            id: configuration_profile.id,
            name: configuration_profile.name,
            withSharedMappings: true
          },
          viewOptions: @view_options,
          domains: serialize(@domains, each_serializer: DomainSerializer),
          predicates: serialize(predicates, each_serializer: PredicateSerializer),
          specificationsByDomain: specifications_by_domain,
          spineTerms: spine_terms_by_spine,
          alignments: alignments_by_spine
        }
      end

      private

      attr_reader :configuration_profile

      def predicates
        configuration_profile.predicates.includes(:predicate_set)
      end

      # Mirrors API::V1::SpecificationsController#index (per domain).
      def specifications_by_domain
        @domains.index_by(&:id).transform_values do |domain|
          specifications =
            configuration_profile
              .specifications
              .mapped
              .where(domain_id: domain.id)
              .distinct
              .order(name: :asc)

          serialize(specifications, each_serializer: SpecificationSerializer, base: true)
        end
      end

      # Mirrors API::V1::SpineTermsController#index (with_weights), keyed by spine id.
      def spine_terms_by_spine
        spines.index_by(&:id).transform_values do |spine|
          max_weight = predicate_set&.max_weight || 0
          select = "terms.*, " \
                   "SUM(COALESCE(predicates.weight, 0))::int AS current_mapping_weight, " \
                   "SUM(#{max_weight})::int AS max_mapping_weight"

          terms = spine
                    .terms
                    .select(Arel.sql(select))
                    .left_joins(alignments: :predicate)
                    .group(:id)
                    .includes(:property, :vocabularies)

          serialize(terms, each_serializer: TermSerializer, spine: true)
        end
      end

      # Mirrors API::V1::AlignmentsController#index, keyed by spine id.
      def alignments_by_spine
        spines.index_by(&:id).transform_values do |spine|
          alignments =
            configuration_profile
              .alignments
              .includes(
                :predicate,
                :specification,
                mapping: %i(organization),
                mapped_terms: %i(organization property vocabularies)
              )
              .mapped_for_spine(spine.id)
              .where.not(predicate_id: nil)
              .order(:spine_term_id, :uri)

          mapped_term_ids = alignments.flat_map { |a| a.mapped_terms.map(&:id) }
          specification_ids =
            Specification.joins(:terms)
              .select("specifications.id as id, terms.id as term_id")
              .where("terms.id = ANY(ARRAY[?]::int[])", mapped_term_ids)
              .group_by(&:term_id).transform_values { |v| v.map(&:id) }

          serialize(
            alignments,
            each_serializer: AlignmentSerializer,
            with_schema_name: true,
            specification_ids:
          )
        end
      end

      def spines
        @spines ||= @domains.filter_map(&:spine).uniq
      end

      def serialize(collection, options)
        ActiveModelSerializers::SerializableResource.new(collection, options).as_json
      end
    end
  end
end
