# frozen_string_literal: true

require "rails_helper"

RSpec.describe Exporters::CrosswalkViewOptions do
  describe ".sanitize" do
    it "passes recognized option keys through" do
      result = described_class.sanitize(spine_order: "SPINE_PROPERTY", alignment_order: "PROPERTY")

      expect(result).to eq(spineOrder: "SPINE_PROPERTY", alignmentOrder: "PROPERTY")
    end

    it "falls back to the defaults when no options are given" do
      expect(described_class.sanitize).to eq(
        spineOrder: described_class::DEFAULT_SPINE_ORDER,
        alignmentOrder: described_class::DEFAULT_ALIGNMENT_ORDER
      )
    end

    it "falls back to the defaults for unknown or blank values" do
      result = described_class.sanitize(spine_order: "NOT_AN_OPTION", alignment_order: "")

      expect(result).to eq(
        spineOrder: described_class::DEFAULT_SPINE_ORDER,
        alignmentOrder: described_class::DEFAULT_ALIGNMENT_ORDER
      )
    end

    it "does not accept an alignment order in the spine position" do
      result = described_class.sanitize(spine_order: "ORGANIZATION", alignment_order: "SPINE_PROPERTY")

      expect(result).to eq(
        spineOrder: described_class::DEFAULT_SPINE_ORDER,
        alignmentOrder: described_class::DEFAULT_ALIGNMENT_ORDER
      )
    end

    it "keeps the defaults within the allowed values" do
      expect(described_class::SPINE_ORDERS).to include(described_class::DEFAULT_SPINE_ORDER)
      expect(described_class::ALIGNMENT_ORDERS).to include(described_class::DEFAULT_ALIGNMENT_ORDER)
    end
  end
end
