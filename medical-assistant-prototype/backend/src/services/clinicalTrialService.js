import {fetchJson} from '../utils/http.js';

export async function fetchClinicalTrialCandidates(query, limit = 80) {
  const url = new URL('https://clinicaltrials.gov/api/v2/studies');
  url.searchParams.set('query.term', query);
  url.searchParams.set('pageSize', String(Math.min(100, limit)));
  url.searchParams.set(
    'fields',
    [
      'protocolSection.identificationModule.briefTitle',
      'protocolSection.statusModule.overallStatus',
      'protocolSection.eligibilityModule.eligibilityCriteria',
      'protocolSection.contactsLocationsModule.centralContacts',
      'protocolSection.contactsLocationsModule.locations',
      'protocolSection.identificationModule.nctId',
    ].join(','),
  );

  const data = await fetchJson(url.toString());
  return (data.studies || []).map((study) => {
    const protocol = study.protocolSection || {};
    const identification = protocol.identificationModule || {};
    const status = protocol.statusModule || {};
    const eligibility = protocol.eligibilityModule || {};
    const contacts = protocol.contactsLocationsModule || {};

    const location = (contacts.locations || [])[0] || {};
    const centralContact = (contacts.centralContacts || [])[0] || {};

    return {
      source: 'ClinicalTrials.gov',
      sourceType: 'clinicaltrials',
      id: identification.nctId,
      title: identification.briefTitle,
      status: status.overallStatus,
      eligibility: eligibility.eligibilityCriteria || 'Not specified',
      location:
        [location.city, location.state, location.country].filter(Boolean).join(', ') || 'Not specified',
      contact:
        [centralContact.name, centralContact.phone, centralContact.email].filter(Boolean).join(' | ') ||
        'Not listed',
      url: identification.nctId
        ? `https://clinicaltrials.gov/study/${identification.nctId}`
        : 'https://clinicaltrials.gov/',
    };
  });
}
