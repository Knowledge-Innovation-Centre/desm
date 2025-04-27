import mappingProcess from '../../../assets/images/mapping-process.png';

const RightSideHome = () => (
  <div className="col-lg-8 p-lg-5 pt-5 bg-col-secondary">
    <h1 className="subtitle">About the DESM tool</h1>
    <p>
      The Data Ecosystem Mapping Tool (DESM) is a specialized tool for creating, editing,
      maintaining and viewing crosswalks between data standards from two or more Data Standard
      Organizations (DSOs). These crosswalks are based on the degree of semantic alignment between
      terms in the different standards or schemas, and may be useful for:
    </p>

    <ul>
      <li>supporting translation of data from one standard to another,</li>
      <li>supporting the development of data models that align to several standards</li>
      <li>showing which standards cover what terms,</li>
    </ul>

    <p>
      among other uses. These uses recognize the reality that any data ecosystem will encompass
      actors who use different data standards, different models and different schemas, because they
      have different interests, systems and requirements for the data. Data translation allows a
      degree of interoperability despite the use of data standards; however our ultimate hope is
      that semantic mapping will show that data harmonization is possible, that is that different
      data standards can share semantics and models for common elements.
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
      program. The T3 Open Competency Network, in partnership with the T3 Data and Technology
      Standards Network is responsible for the requirements and project plans that are used for
      development and enhancement of the DESM too.
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
