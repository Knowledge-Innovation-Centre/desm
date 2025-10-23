import mappingProcess from '../../../assets/images/mapping-process.png';

const RightSideHome = () => (
  <div className="col-lg-8 p-lg-5 pt-5 bg-col-secondary">
    <h1 className="subtitle">About the DESM tool</h1>
    <p>
      The Data Ecosystem Schema Mapping (DESM) Tool helps users create, edit, maintain, and view
      crosswalks between two or more schemas or standards. These crosswalks are based on semantic
      alignment between terms across standards and can support:
    </p>

    <ul>
      <li>Translating data from one schema or standard to another</li>
      <li>Developing data models that align with multiple standards</li>
      <li>Identifying which schemas and standards cover which terms</li>
    </ul>

    <p>
      These capabilities reflect the reality that any data ecosystem will include actors using
      different standards, schemas, and data models to meet their unique goals and system
      requirements.
    </p>
    <p>
      DESM organizes these alignments through pairwise mappings to a synthetic spine—a
      schema-neutral synthesis of terms created during the mapping process.
    </p>
    <p>
      The diagram below illustrates how DESM enables alignment of schema properties from multiple
      sources to this synthetic spine, which serves as a unified semantic reference to support
      schema crosswalks.
    </p>

    <img src={mappingProcess} alt="mapping process" style={{ width: '100%', padding: '2rem' }} />

    <p>
      The crosswalks are based on pairwise mapping of terms from the different standards to a
      &quot;synthetic spine&quot;, a schema-neutral synthesis of terms that is created during the
      mapping. Mappings from terms in one standard to terms in another can then be inferred where
      their respective mappings to the spine are transitive.
    </p>

    <p>
      The{' '}
      <a href="https://github.com/t3-innovation-network/desm" target="_blank" rel="noreferrer">
        DESM tool
      </a>{' '}
      is available as Open Source Software under an Apache 2.0 license.
    </p>

    <p>
      DESM is sponsored by the U.S. Chamber of Commerce Foundations&apos; T3 Innovation Network
      program.
    </p>

    <p>
      This DESM instance has been deployed by the <a href="https://knowledgeinnovation.eu/" target="_blank">
      Knowledge Innovation Centre (KIC)</a> as part of the <a href="https://quality-link.eu/" target="_blank">
      QualityLink project</a>.
    </p>

    <div style={{ display: 'flex' }}>
      <img src="http://quality-link.eu/wp-content/uploads/sites/90/2025/01/EN_Co-fundedbytheEU_RGB_POS.png" style={{ 'margin-right': '15px', width: '200px', 'object-fit': 'contain' }} />
      <p style={{ margin: '0' }}>
        The QualityLink project has been funded with support from the European Commission. This website
        reflects the views only of the authors, and the Commission or the National Agency cannot be held#
        responsible for any use which may be made of the information contained therein.
      </p>
    </div>
  </div>
);

export default RightSideHome;
