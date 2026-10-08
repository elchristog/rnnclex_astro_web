// Datos de los 50 estados para las guias /examen-nclex/requisitos/<estado>/.
// nlc: 'full' = miembro del Nurse Licensure Compact con implementacion completa,
//      'enacted' = aprobado, implementacion pendiente, 'none' = no pertenece.
// Estado del NLC revisado en oct-2026 (nursecompact.org / NCSBN). Las tarifas NO se guardan aqui a proposito:
// cada junta las fija y cambian; la pagina remite al sitio oficial.
// Los sitios oficiales se revisan en CI con scripts/check-links.mjs.
const rows = [
  ['alabama', 'Alabama', 'AL', 'Alabama Board of Nursing', 'https://abn.alabama.gov/', 'full'],
  ['alaska', 'Alaska', 'AK', 'Alaska Board of Nursing', 'https://www.commerce.alaska.gov/web/cbpl/ProfessionalLicensing/BoardofNursing', 'none'],
  ['arizona', 'Arizona', 'AZ', 'Arizona State Board of Nursing', 'https://azbn.gov/', 'full'],
  ['arkansas', 'Arkansas', 'AR', 'Arkansas State Board of Nursing', 'https://www.arsbn.org/', 'full'],
  ['california', 'California', 'CA', 'California Board of Registered Nursing (BRN)', 'https://www.rn.ca.gov/', 'none'],
  ['colorado', 'Colorado', 'CO', 'Colorado Board of Nursing', 'https://dpo.colorado.gov/Nursing', 'full'],
  ['connecticut', 'Connecticut', 'CT', 'Connecticut Department of Public Health', 'https://portal.ct.gov/dph', 'full'],
  ['delaware', 'Delaware', 'DE', 'Delaware Board of Nursing', 'https://dpr.delaware.gov/boards/nursing/', 'full'],
  ['florida', 'Florida', 'FL', 'Florida Board of Nursing', 'https://floridasnursing.gov/', 'full'],
  ['georgia', 'Georgia', 'GA', 'Georgia Board of Nursing', 'https://sos.ga.gov/georgia-board-nursing', 'full'],
  ['hawaii', 'Hawaii', 'HI', 'Hawaii Board of Nursing', 'https://cca.hawaii.gov/pvl/boards/nursing/', 'none'],
  ['idaho', 'Idaho', 'ID', 'Idaho Board of Nursing', 'https://ibn.idaho.gov/', 'full'],
  ['illinois', 'Illinois', 'IL', 'Illinois Department of Financial and Professional Regulation (IDFPR)', 'https://idfpr.illinois.gov/', 'none'],
  ['indiana', 'Indiana', 'IN', 'Indiana State Board of Nursing', 'https://www.in.gov/pla/professions/nursing-home/', 'full'],
  ['iowa', 'Iowa', 'IA', 'Iowa Board of Nursing', 'https://nursing.iowa.gov/', 'full'],
  ['kansas', 'Kansas', 'KS', 'Kansas State Board of Nursing', 'https://ksbn.kansas.gov/', 'full'],
  ['kentucky', 'Kentucky', 'KY', 'Kentucky Board of Nursing', 'https://kbn.ky.gov/', 'full'],
  ['louisiana', 'Louisiana', 'LA', 'Louisiana State Board of Nursing', 'https://www.lsbn.state.la.us/', 'full'],
  ['maine', 'Maine', 'ME', 'Maine State Board of Nursing', 'https://www.maine.gov/boardofnursing/', 'full'],
  ['maryland', 'Maryland', 'MD', 'Maryland Board of Nursing', 'https://mbon.maryland.gov/', 'full'],
  ['massachusetts', 'Massachusetts', 'MA', 'Massachusetts Board of Registration in Nursing', 'https://www.mass.gov/orgs/board-of-registration-in-nursing', 'enacted'],
  ['michigan', 'Michigan', 'MI', 'Michigan Board of Nursing (LARA)', 'https://www.michigan.gov/lara', 'none'],
  ['minnesota', 'Minnesota', 'MN', 'Minnesota Board of Nursing', 'https://mn.gov/boards/nursing/', 'none'],
  ['mississippi', 'Mississippi', 'MS', 'Mississippi Board of Nursing', 'https://www.msbn.ms.gov/', 'full'],
  ['missouri', 'Missouri', 'MO', 'Missouri State Board of Nursing', 'https://pr.mo.gov/nursing.asp', 'full'],
  ['montana', 'Montana', 'MT', 'Montana Board of Nursing', 'https://boards.bsd.dli.mt.gov/nur', 'full'],
  ['nebraska', 'Nebraska', 'NE', 'Nebraska DHHS, Licensure Unit (Nursing)', 'https://dhhs.ne.gov/', 'full'],
  ['nevada', 'Nevada', 'NV', 'Nevada State Board of Nursing', 'https://nevadanursingboard.org/', 'none'],
  ['new-hampshire', 'New Hampshire', 'NH', 'New Hampshire Board of Nursing', 'https://www.oplc.nh.gov/office-professional-licensure-and-certification/nursing', 'full'],
  ['new-jersey', 'New Jersey', 'NJ', 'New Jersey Board of Nursing', 'https://www.njconsumeraffairs.gov/nur', 'full'],
  ['new-mexico', 'New Mexico', 'NM', 'New Mexico Board of Nursing', 'https://nmbon.sks.com/', 'full'],
  ['new-york', 'New York', 'NY', 'NYSED, Office of the Professions (Enfermería)', 'https://www.op.nysed.gov/professions/registered-professional-nursing', 'none'],
  ['north-carolina', 'North Carolina', 'NC', 'North Carolina Board of Nursing', 'https://www.ncbon.com/', 'full'],
  ['north-dakota', 'North Dakota', 'ND', 'North Dakota Board of Nursing', 'https://www.ndbon.org/', 'full'],
  ['ohio', 'Ohio', 'OH', 'Ohio Board of Nursing', 'https://nursing.ohio.gov/', 'full'],
  ['oklahoma', 'Oklahoma', 'OK', 'Oklahoma Board of Nursing', 'https://nursing.ok.gov/', 'full'],
  ['oregon', 'Oregon', 'OR', 'Oregon State Board of Nursing', 'https://www.oregon.gov/osbn', 'none'],
  ['pennsylvania', 'Pennsylvania', 'PA', 'Pennsylvania State Board of Nursing', 'https://www.pa.gov/agencies/dos/department-and-offices/bpoa/boards-commissions/nursing', 'full'],
  ['rhode-island', 'Rhode Island', 'RI', 'Rhode Island Department of Health (Nursing)', 'https://health.ri.gov/licenses', 'full'],
  ['south-carolina', 'South Carolina', 'SC', 'South Carolina Board of Nursing', 'https://llr.sc.gov/nurse/', 'full'],
  ['south-dakota', 'South Dakota', 'SD', 'South Dakota Board of Nursing', 'https://doh.sd.gov/boards/nursing/', 'full'],
  ['tennessee', 'Tennessee', 'TN', 'Tennessee Board of Nursing', 'https://www.tn.gov/health/health-program-areas/health-professional-boards/nursing-board.html', 'full'],
  ['texas', 'Texas', 'TX', 'Texas Board of Nursing', 'https://www.bon.texas.gov/', 'full'],
  ['utah', 'Utah', 'UT', 'Utah Board of Nursing', 'https://dopl.utah.gov/nurse/', 'full'],
  ['vermont', 'Vermont', 'VT', 'Vermont State Board of Nursing', 'https://sos.vermont.gov/nursing/', 'full'],
  ['virginia', 'Virginia', 'VA', 'Virginia Board of Nursing', 'https://www.dhp.virginia.gov/Boards/Nursing/', 'full'],
  ['washington', 'Washington', 'WA', 'Washington State Nursing Care Quality Assurance Commission', 'https://doh.wa.gov/licenses-permits-and-certificates/nursing-commission', 'full'],
  ['west-virginia', 'West Virginia', 'WV', 'West Virginia RN Board', 'https://wvrnboard.wv.gov/', 'full'],
  ['wisconsin', 'Wisconsin', 'WI', 'Wisconsin Department of Safety and Professional Services', 'https://dsps.wi.gov/', 'full'],
  ['wyoming', 'Wyoming', 'WY', 'Wyoming State Board of Nursing', 'https://wsbn.wyo.gov/', 'full'],
];

export const states = rows.map(([slug, name, abbr, board, url, nlc]) => ({ slug, name, abbr, board, url, nlc }));

// Estados más consultados por enfermeros hispanos (se muestran primero)
export const priority = ['florida', 'california', 'new-york', 'texas', 'arizona', 'georgia', 'massachusetts'];

export function nlcShort(s) {
  if (s.nlc === 'full') return 'Miembro del NLC';
  if (s.nlc === 'enacted') return 'NLC pendiente';
  return 'Licencia de un solo estado';
}

export function nlcLong(s) {
  if (s.nlc === 'full') {
    return s.name + ' es miembro del Nurse Licensure Compact (NLC). Si ' + s.name + ' es tu estado de residencia principal, podrías obtener una licencia multiestado que te permite ejercer también en otros estados miembros. Confirma tu elegibilidad con ' + s.board + '.';
  }
  if (s.nlc === 'enacted') {
    return s.name + ' aprobó su ingreso al NLC, pero la implementación todavía está pendiente. Por ahora la licencia sigue siendo válida solo en ' + s.name + '. Verifica el estado actual con ' + s.board + ' y en nursecompact.org.';
  }
  return s.name + ' no pertenece al NLC: la licencia que obtengas será válida solo en ' + s.name + '. Si después quieres ejercer en otros estados, tendrás que solicitar licencia en cada uno (por endorsement).';
}
