# frozen_string_literal: true

module Exporters
  ###
  # @description: The view state the HTML exporters (standalone file + embeddable snippet) bake into
  #   the artifact they generate: the ordering the exported crosswalk opens with. Viewers can still
  #   re-sort afterwards -- this only seeds the store.
  #
  #   The accepted values are the *keys* of the sort option maps in
  #   `app/javascript/components/property-mapping-list/SortOptions.jsx` (the display labels live
  #   there and may change without invalidating an already generated export). Unknown or missing
  #   values fall back to the frontend's own defaults rather than raising, so a stale link or a
  #   hand-written request still produces a usable export.
  ###
  module CrosswalkViewOptions
    SPINE_ORDERS = %w(
      OVERALL_ALIGNMENT_SCORE
      TOTAL_IDENTICAL_ALIGNMENTS
      SPINE_CLASS_TYPE
      SPINE_PROPERTY
    ).freeze

    ALIGNMENT_ORDERS = %w(
      ORGANIZATION
      CLASS_TYPE
      ALIGNMENT_SCORE
      PROPERTY
      HAS_ALIGNMENT_ISSUES
    ).freeze

    DEFAULT_SPINE_ORDER = "OVERALL_ALIGNMENT_SCORE"
    DEFAULT_ALIGNMENT_ORDER = "ORGANIZATION"

    ###
    # @description: Builds the `viewOptions` slice of the embedded payload. The keys are camelCase
    #   because the frontend consumes this slice directly (like `configurationProfile`) instead of
    #   going through the camelizing `apiRequest` path -- see StandaloneHtml::Data.
    ###
    def self.sanitize(spine_order: nil, alignment_order: nil)
      {
        spineOrder: SPINE_ORDERS.include?(spine_order) ? spine_order : DEFAULT_SPINE_ORDER,
        alignmentOrder: ALIGNMENT_ORDERS.include?(alignment_order) ? alignment_order : DEFAULT_ALIGNMENT_ORDER
      }
    end
  end
end
