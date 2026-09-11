import { ref, computed, defineComponent } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.prod.js';

export default defineComponent({
  name: 'MatchingReport',
  props: {
    mondoMapping: {
      type: Array,
      required: true
    },
    mondoMappingIdIndex: {
      type: Number,
      required: true
    },
    mondoMappingLabelIndex: {
      type: Number,
      required: true
    },
    hpoMapping: {
      type: Map,
      required: true
    },
    lang: {
      type: String,
      required: true
    },
    apiRequest: {
      type: Function,
      required: true
    },
    showToastMessage: {
      type: Function,
      required: true
    }
  },
  setup(props) {
    const matchResults = ref([]);

    const fetchMatchResults = async (submissionId) => {
      try {
        const [matchingsResponse, sourceDataResponse] = await Promise.all([
          props.apiRequest(`/casesharing/matchings-filtered-by-submission/${submissionId}`, { method: 'GET' }),
          props.apiRequest(`/casesharing/submissions/${submissionId}`, { method: 'GET' })
        ]);
        const matchings = matchingsResponse.data || [];
        const sourceData = sourceDataResponse.data;
        const promises = matchings.map((matchData) =>
          props.apiRequest(`/casesharing/submissions/${matchData.target_submission_id}`, { method: 'GET' })
        );
        const targetResults = await Promise.all(promises);
        matchResults.value = matchings.map((match, index) => {
          const targetData = targetResults[index].data;
          return {
            ...match,
            source: {
                ...sourceData,
                gene_symbols: sourceData.gene_symbols ? sourceData.gene_symbols?.split(',') : [],
                ensembl_ids: sourceData.ensembl_ids ? sourceData.ensembl_ids?.split(',') : [],
                entrez_ids: sourceData.entrez_ids ? sourceData.entrez_ids?.split(',') : [],
                allelic_states: sourceData.allelic_states ? sourceData.allelic_states?.split(',') : [],
                inheritances: sourceData.inheritances ? sourceData.inheritances?.split(',') : [],
                phenotypes: sourceData.phenotypes ? convertHpoIdsToWithName(sourceData.phenotypes?.split(',')) : [],
                suspected_diseases: sourceData.suspected_diseases ? convertIdsToWithName(sourceData.suspected_diseases?.split(',')) : [],
                clinical_diagnoses: sourceData.clinical_diagnoses ? convertIdsToWithName(sourceData.clinical_diagnoses?.split(',')) : [],
                final_diagnoses: sourceData.final_diagnoses ? convertIdsToWithName(sourceData.final_diagnoses?.split(',')) : []
            },
            target: {
                ...targetData,
                gene_symbols: targetData.gene_symbols ? targetData.gene_symbols?.split(',') : [],
                ensembl_ids: targetData.ensembl_ids ? targetData.ensembl_ids?.split(',') : [],
                entrez_ids: targetData.entrez_ids ? targetData.entrez_ids?.split(',') : [],
                allelic_states: targetData.allelic_states ? targetData.allelic_states?.split(',') : [],
                inheritances: targetData.inheritances ? targetData.inheritances?.split(',') : [],
                phenotypes: targetData.phenotypes ? convertHpoIdsToWithName(targetData.phenotypes?.split(',')) : [],
                suspected_diseases: targetData.suspected_diseases ? convertIdsToWithName(targetData.suspected_diseases?.split(',')) : [],
                clinical_diagnoses: targetData.clinical_diagnoses ? convertIdsToWithName(targetData.clinical_diagnoses?.split(',')) : [],
                final_diagnoses: targetData.final_diagnoses ? convertIdsToWithName(targetData.final_diagnoses?.split(',')) : []
            }
          }
        });
      } catch (error) {
        props.showToastMessage(elementTranslation['fetch-submission-error']?.[props.lang] || 'Failed to fetch matches', 'error', 5000);
      }
    }

    const clearMatchResults = () => {
      matchResults.value = [];
    }

    const convertIdsToWithName = (idArray) => idArray.map(id => props.mondoMappingIdIndex !== -1 && props.mondoMappingLabelIndex !== -1
      ? {id, name: props.mondoMapping.find(row => row[props.mondoMappingIdIndex] === id)?.[props.mondoMappingLabelIndex] || 'N/A'}
      : {id, name: 'N/A'}
    );

    const convertHpoIdsToWithName = (idArray) => idArray.map(id => {
      const entry = props.hpoMapping.get(id);
      const name = entry
        ? (props.lang === 'ja' ? entry.name_ja || entry.name_en : entry.name_en) || 'N/A'
        : 'N/A';
      return { id, name };
    });

    const getMailtoLink = (matchResult) => {
      const email = matchResult.target.submitter_email;
      const body = `Dear ${matchResult.target.submitter_first_name} ${matchResult.target.submitter_last_name},

[My case]
Share ID: ${matchResult.source.name}
Gene Symbols: ${matchResult.source.gene_symbols.join(', ')}
Ensembl IDs: ${matchResult.source.ensembl_ids.join(', ')}
NCBI Gene IDs: ${matchResult.source.entrez_ids.join(', ')}
Zygosity: ${matchResult.source.allelic_states.join(', ')}
Inheritance: ${matchResult.source.inheritances.join(', ')}
Suspected Diseases: ${matchResult.source.suspected_diseases.map(disease => `${disease.id}:${disease.name}`).join(', ')}
Clinical Diagnoses: ${matchResult.source.clinical_diagnoses.map(disease => `${disease.id}:${disease.name}`).join(', ')}
Final Diagnoses: ${matchResult.source.final_diagnoses.map(disease => `${disease.id}:${disease.name}`).join(', ')}
Phenotypes: ${matchResult.source.phenotypes.map(p => `${p.id}:${p.name}`).join(', ')}
comment: ${matchResult.source.comment}

[Your case]
Share ID: ${matchResult.target.name}
Gene Symbols: ${matchResult.target.gene_symbols.join(', ')}
Ensembl IDs: ${matchResult.target.ensembl_ids.join(', ')}
NCBI Gene IDs: ${matchResult.target.entrez_ids.join(', ')}
Zygosity: ${matchResult.target.allelic_states.join(', ')}
Inheritance: ${matchResult.target.inheritances.join(', ')}
Suspected Diseases: ${matchResult.target.suspected_diseases.map(disease => `${disease.id}:${disease.name}`).join(', ')}
Clinical Diagnoses: ${matchResult.target.clinical_diagnoses.map(disease => `${disease.id}:${disease.name}`).join(', ')}
Final Diagnoses: ${matchResult.target.final_diagnoses.map(disease => `${disease.id}:${disease.name}`).join(', ')}
Phenotypes: ${matchResult.target.phenotypes.map(p => `${p.id}:${p.name}`).join(', ')}
comment: ${matchResult.target.comment}`;
      return `mailto:${encodeURIComponent(email)}?body=${encodeURIComponent(body)}`;
    }

    return {
      matchResults,
      fetchMatchResults,
      clearMatchResults,
      getMailtoLink
    };
  },
  template: `
    <div class="match-report-section">
      <template v-if="matchResults && matchResults.length > 0">
        <div class="match-report-count">Match: <span class="match-report-count-number">{{ matchResults.length }}</span></div>
        <!-- Match Results with Target Information -->
        <div v-for="match in matchResults" :key="match.id" class="match-report-item">
          <!-- Target Information for each match -->
          <div class="match-id">Match ID: {{ match.id }}</div>
          <div class="match-data-contents">
            <div class="target-info-section">
              <div class="target-info-title">Matched case owner information</div>
              <div class="target-info-list">
                <div class="target-info-item">
                  <span class="label">Name:</span>
                  <span class="value">{{ match.target.submitter_first_name + ' ' + match.target.submitter_last_name || 'N/A' }}</span>
                </div>
                <div class="target-info-item">
                  <span class="label">Institution:</span>
                  <span class="value">{{ match.target.submitter_institution || 'N/A' }}</span>
                </div>
                <div class="target-info-item">
                  <span class="label">Email:</span>
                  <a :href="getMailtoLink(match)" class="value email">{{ match.target.submitter_email || 'N/A' }}</a>
                </div>
              </div>
            </div>

            <!-- Match Results Table for each match -->
            <div class="match-table-wrapper">
              <table class="match-table">
                <thead>
                  <tr>
                    <th rowspan="2"></th>
                    <th rowspan="2">Share ID</th>
                    <th colspan="5">Genotype Info</th>
                    <th colspan="3">Medical Info</th>
                    <th rowspan="2">Phenotype Info</th>
                    <th rowspan="2">comment</th>
                  </tr>
                  <tr>
                    <th>Gene Symbols</th>
                    <th>Ensembl IDs</th>
                    <th>NCBI Gene IDs</th>
                    <th>Zygosity</th>
                    <th>Inheritance</th>
                    <th>Suspected Diseases</th>
                    <th>Clinical Diagnoses</th>
                    <th>Final Diagnoses</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th>My case</th>
                    <td>{{ match.source.name }}</td>
                    <td>
                      <div v-for="(item, index) in match.source.gene_symbols" :key="index">{{ item }}</div>
                    </td>
                    <td>
                      <div v-for="(item, index) in match.source.ensembl_ids" :key="index">{{ item }}</div>
                    </td>
                    <td>
                      <div v-for="(item, index) in match.source.entrez_ids" :key="index">{{ item }}</div>
                    </td>
                    <td>
                      <div v-for="(item, index) in match.source.allelic_states" :key="index">{{ item }}</div>
                    </td>
                    <td>
                      <div v-for="(item, index) in match.source.inheritances" :key="index">{{ item }}</div>
                    </td>
                    <td>
                      <div v-for="(item, index) in match.source.suspected_diseases" :key="index">{{ item.id }}<br>{{ item.name }}</div>
                    </td>
                    <td>
                      <div v-for="(item, index) in match.source.clinical_diagnoses" :key="index">{{ item.id }}<br>{{ item.name }}</div>
                    </td>
                    <td>
                      <div v-for="(item, index) in match.source.final_diagnoses" :key="index">{{ item.id }}<br>{{ item.name }}</div>
                    </td>
                    <td>
                      <div v-for="(item, index) in match.source.phenotypes" :key="index">{{ item.id }}<br>{{ item.name }}</div>
                    </td>
                    <td>{{ match.source.comment }}</td>
                  </tr>
                  <tr>
                    <th>Matched case</th>
                    <td>{{ match.target.name }}</td>
                    <td>
                      <div v-for="(item, index) in match.target.gene_symbols" :key="index">{{ item }}</div>
                    </td>
                    <td>
                      <div v-for="(item, index) in match.target.ensembl_ids" :key="index">{{ item }}</div>
                    </td>
                    <td>
                      <div v-for="(item, index) in match.target.entrez_ids" :key="index">{{ item }}</div>
                    </td>
                    <td>
                      <div v-for="(item, index) in match.target.allelic_states" :key="index">{{ item }}</div>
                    </td>
                    <td>
                      <div v-for="(item, index) in match.target.inheritances" :key="index">{{ item }}</div>
                    </td>
                    <td>
                      <div v-for="(item, index) in match.target.suspected_diseases" :key="index">{{ item.id }}<br>{{ item.name }}</div>
                    </td>
                    <td>
                      <div v-for="(item, index) in match.target.clinical_diagnoses" :key="index">{{ item.id }}<br>{{ item.name }}</div>
                    </td>
                    <td>
                      <div v-for="(item, index) in match.target.final_diagnoses" :key="index">{{ item.id }}<br>{{ item.name }}</div>
                    </td>
                    <td>
                      <div v-for="(item, index) in match.target.phenotypes" :key="index">{{ item.id }}<br>{{ item.name }}</div>
                    </td>
                    <td>{{ match.target.comment }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </template>

      <!-- No matches message (shown when no matches found) -->
      <p v-else class="no-matches-message">
        No matches found for this submission.
      </p>
    </div>
  `
});
