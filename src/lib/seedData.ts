import { DatabaseSchema } from './types';

export const initialSeedData: DatabaseSchema = {
  countries: [
    { id: 'c-in', name: 'India' }
  ],
  states: [
    { id: 'st-tg', country_id: 'c-in', name: 'Telangana' },
    { id: 'st-ap', country_id: 'c-in', name: 'Andhra Pradesh' },
    { id: 'st-ka', country_id: 'c-in', name: 'Karnataka' },
    { id: 'st-mh', country_id: 'c-in', name: 'Maharashtra' },
    { id: 'st-tn', country_id: 'c-in', name: 'Tamil Nadu' },
    { id: 'st-dl', country_id: 'c-in', name: 'Delhi NCR' }
  ],
  cities: [
    { id: 'city-hyd', state_id: 'st-tg', name: 'Hyderabad' },
    { id: 'city-wgl', state_id: 'st-tg', name: 'Warangal' },
    { id: 'city-knr', state_id: 'st-tg', name: 'Karimnagar' },
    { id: 'city-nzb', state_id: 'st-tg', name: 'Nizamabad' },
    { id: 'city-vja', state_id: 'st-ap', name: 'Vijayawada' },
    { id: 'city-vzg', state_id: 'st-ap', name: 'Visakhapatnam' },
    { id: 'city-blr', state_id: 'st-ka', name: 'Bengaluru' },
    { id: 'city-pun', state_id: 'st-mh', name: 'Pune' },
    { id: 'city-chn', state_id: 'st-tn', name: 'Chennai' },
    { id: 'city-del', state_id: 'st-dl', name: 'Delhi' }
  ],
  colleges: [
    // ----------------------------------------------------
    // GHATKESAR / POCHARAM / MEDCHAL EAST
    // ----------------------------------------------------
    {
      id: 'col-snist',
      city_id: 'city-hyd',
      area: 'Ghatkesar / Pocharam',
      category_type: 'B.Tech / Engineering',
      name: 'SNIST - Sreenidhi Institute of Science and Technology',
      short_name: 'SNIST',
      address: 'Yamnampet, Ghatkesar, Hyderabad, Telangana 501301',
      email_domain: 'sreenidhi.edu.in',
      verification_required: true,
      active: true,
      created_at: '2026-01-10T00:00:00Z'
    },
    {
      id: 'col-anurag-u',
      city_id: 'city-hyd',
      area: 'Ghatkesar / Pocharam',
      category_type: 'University & Autonomous',
      name: 'Anurag University (Formerly CVSR)',
      short_name: 'Anurag Univ',
      address: 'Venkatapur, Ghatkesar, Hyderabad, Telangana 500088',
      email_domain: 'anurag.edu.in',
      verification_required: true,
      active: true,
      created_at: '2026-01-10T00:00:00Z'
    },
    {
      id: 'col-anurag-pharm',
      city_id: 'city-hyd',
      area: 'Ghatkesar / Pocharam',
      category_type: 'Pharmacy',
      name: 'Anurag College of Pharmacy',
      short_name: 'Anurag Pharmacy',
      address: 'Venkatapur, Ghatkesar, Hyderabad, Telangana 500088',
      email_domain: 'anurag.edu.in',
      verification_required: false,
      active: true,
      created_at: '2026-01-10T00:00:00Z'
    },
    {
      id: 'col-geethanjali',
      city_id: 'city-hyd',
      area: 'Ghatkesar / Pocharam',
      category_type: 'B.Tech / Engineering',
      name: 'Geethanjali College of Engineering and Technology',
      short_name: 'GCET',
      address: 'Cheeryal, Keesara, Ghatkesar Road, Hyderabad 501301',
      email_domain: 'geethanjaliinstitutions.com',
      verification_required: true,
      active: true,
      created_at: '2026-01-10T00:00:00Z'
    },
    {
      id: 'col-geethanjali-pharm',
      city_id: 'city-hyd',
      area: 'Ghatkesar / Pocharam',
      category_type: 'Pharmacy',
      name: 'Geethanjali College of Pharmacy',
      short_name: 'GCOP',
      address: 'Cheeryal, Keesara, Ghatkesar Road, Hyderabad 501301',
      email_domain: 'geethanjaliinstitutions.com',
      verification_required: false,
      active: true,
      created_at: '2026-01-10T00:00:00Z'
    },
    {
      id: 'col-samskruti-eng',
      city_id: 'city-hyd',
      area: 'Ghatkesar / Pocharam',
      category_type: 'B.Tech / Engineering',
      name: 'Samskruti College of Engineering and Technology',
      short_name: 'Samskruti Eng',
      address: 'Kondapur, Ghatkesar, Hyderabad 501301',
      email_domain: 'samskruti.ac.in',
      verification_required: true,
      active: true,
      created_at: '2026-01-10T00:00:00Z'
    },
    {
      id: 'col-samskruti-pharm',
      city_id: 'city-hyd',
      area: 'Ghatkesar / Pocharam',
      category_type: 'Pharmacy',
      name: 'Samskruti Institute of Pharmacy',
      short_name: 'Samskruti Pharmacy',
      address: 'Kondapur, Ghatkesar, Hyderabad 501301',
      email_domain: 'samskruti.ac.in',
      verification_required: false,
      active: true,
      created_at: '2026-01-10T00:00:00Z'
    },
    {
      id: 'col-gdc-ghatkesar',
      city_id: 'city-hyd',
      area: 'Ghatkesar / Pocharam',
      category_type: 'Degree & PG',
      name: 'Government Degree College, Ghatkesar',
      short_name: 'GDC Ghatkesar',
      address: 'Near Railway Station, Ghatkesar, Telangana 501301',
      email_domain: 'telangana.gov.in',
      verification_required: false,
      active: true,
      created_at: '2026-01-10T00:00:00Z'
    },
    {
      id: 'col-vignan-eng',
      city_id: 'city-hyd',
      area: 'Ghatkesar / Pocharam',
      category_type: 'B.Tech / Engineering',
      name: 'Vignan Institute of Technology and Science (VITS)',
      short_name: 'VITS Deshmukhi',
      address: 'Deshmukhi Village, Pochampally / Ghatkesar Zone 508284',
      email_domain: 'vignanits.ac.in',
      verification_required: true,
      active: true,
      created_at: '2026-01-10T00:00:00Z'
    },
    {
      id: 'col-princeton-pharm',
      city_id: 'city-hyd',
      area: 'Ghatkesar / Pocharam',
      category_type: 'Pharmacy',
      name: 'Princeton College of Pharmacy & Degree',
      short_name: 'Princeton',
      address: 'Korremula, Ghatkesar, Hyderabad 500088',
      email_domain: 'princeton.edu.in',
      verification_required: false,
      active: true,
      created_at: '2026-01-10T00:00:00Z'
    },
    {
      id: 'col-holymary-eng',
      city_id: 'city-hyd',
      area: 'Ghatkesar / Pocharam',
      category_type: 'B.Tech / Engineering',
      name: 'Holy Mary Institute of Technology and Science',
      short_name: 'HITS Bogaram',
      address: 'Bogaram, Keesara / Ghatkesar Road, Hyderabad 501301',
      email_domain: 'hits.ac.in',
      verification_required: true,
      active: true,
      created_at: '2026-01-10T00:00:00Z'
    },

    // ----------------------------------------------------
    // UPPAL / RAMANTHAPUR / TARNAKA / HABSIGUDA
    // ----------------------------------------------------
    {
      id: 'col-ouce',
      city_id: 'city-hyd',
      area: 'Uppal / Ramanthapur / Tarnaka',
      category_type: 'University & Autonomous',
      name: 'Osmania University - University College of Engineering',
      short_name: 'OUCE',
      address: 'Osmania University, Amberpet / Tarnaka, Hyderabad 500007',
      email_domain: 'uceou.edu',
      verification_required: true,
      active: true,
      created_at: '2026-01-15T00:00:00Z'
    },
    {
      id: 'col-ou-arts',
      city_id: 'city-hyd',
      area: 'Uppal / Ramanthapur / Tarnaka',
      category_type: 'Degree & PG',
      name: 'Osmania University - Arts & Science College',
      short_name: 'OU Arts',
      address: 'OU Campus, Tarnaka, Hyderabad 500007',
      email_domain: 'osmania.ac.in',
      verification_required: true,
      active: true,
      created_at: '2026-01-15T00:00:00Z'
    },
    {
      id: 'col-aurora-deg',
      city_id: 'city-hyd',
      area: 'Uppal / Ramanthapur / Tarnaka',
      category_type: 'Degree & PG',
      name: "Aurora's Degree and PG College",
      short_name: 'Aurora Degree',
      address: 'Ramanthapur / Chikkadpally, Hyderabad 500013',
      email_domain: 'aurora.edu.in',
      verification_required: true,
      active: true,
      created_at: '2026-01-15T00:00:00Z'
    },
    {
      id: 'col-littleflower-deg',
      city_id: 'city-hyd',
      area: 'Uppal / Ramanthapur / Tarnaka',
      category_type: 'Degree & PG',
      name: 'Little Flower Degree College, Uppal',
      short_name: 'LFDC Uppal',
      address: 'Uppal X Roads, Hyderabad 500039',
      email_domain: 'lfdc.edu.in',
      verification_required: false,
      active: true,
      created_at: '2026-01-15T00:00:00Z'
    },
    {
      id: 'col-stmarys-centenary',
      city_id: 'city-hyd',
      area: 'Uppal / Ramanthapur / Tarnaka',
      category_type: 'Degree & PG',
      name: "St. Mary's Centenary Degree College",
      short_name: "St. Mary's",
      address: 'St. Francis Road, Secunderabad / Tarnaka 500025',
      email_domain: 'smcdc.ac.in',
      verification_required: false,
      active: true,
      created_at: '2026-01-15T00:00:00Z'
    },
    {
      id: 'col-ramanthapur-poly',
      city_id: 'city-hyd',
      area: 'Uppal / Ramanthapur / Tarnaka',
      category_type: 'Degree & PG',
      name: 'Government Polytechnic / Degree College, Ramanthapur',
      short_name: 'Govt Ramanthapur',
      address: 'Ramanthapur, Hyderabad 500013',
      email_domain: 'telangana.gov.in',
      verification_required: false,
      active: true,
      created_at: '2026-01-15T00:00:00Z'
    },

    // ----------------------------------------------------
    // KUKATPALLY / NIZAMPET / PRAGATHI NAGAR / JNTU
    // ----------------------------------------------------
    {
      id: 'col-jntuh',
      city_id: 'city-hyd',
      area: 'Kukatpally / Nizampet / JNTU',
      category_type: 'University & Autonomous',
      name: 'JNTUH University College of Engineering Hyderabad',
      short_name: 'JNTUH CEH',
      address: 'Kukatpally, Hyderabad, Telangana 500085',
      email_domain: 'jntuh.ac.in',
      verification_required: true,
      active: true,
      created_at: '2026-01-15T00:00:00Z'
    },
    {
      id: 'col-vnr',
      city_id: 'city-hyd',
      area: 'Kukatpally / Nizampet / JNTU',
      category_type: 'B.Tech / Engineering',
      name: 'VNR VJIET - Vallurupalli Nageswara Rao Vignana Jyothi Institute',
      short_name: 'VNR VJIET',
      address: 'Pragathi Nagar, Nizampet, Hyderabad 500090',
      email_domain: 'vnrvjiet.in',
      verification_required: true,
      active: true,
      created_at: '2026-01-10T00:00:00Z'
    },
    {
      id: 'col-siddhartha-kphb',
      city_id: 'city-hyd',
      area: 'Kukatpally / Nizampet / JNTU',
      category_type: 'Degree & PG',
      name: 'Siddhartha Degree & PG College, Kukatpally',
      short_name: 'Siddhartha KPHB',
      address: 'KPHB Colony, Kukatpally, Hyderabad 500072',
      email_domain: 'siddharthadegree.edu.in',
      verification_required: false,
      active: true,
      created_at: '2026-01-15T00:00:00Z'
    },
    {
      id: 'col-mnr-kphb',
      city_id: 'city-hyd',
      area: 'Kukatpally / Nizampet / JNTU',
      category_type: 'Degree & PG',
      name: 'MNR Degree & PG College, Kukatpally',
      short_name: 'MNR KPHB',
      address: 'Phase 3, KPHB Colony, Hyderabad 500072',
      email_domain: 'mnrindia.org',
      verification_required: false,
      active: true,
      created_at: '2026-01-15T00:00:00Z'
    },

    // ----------------------------------------------------
    // BACHUPALLY / MIYAPUR / DUNDIGAL / BOWRAMPET
    // ----------------------------------------------------
    {
      id: 'col-griet',
      city_id: 'city-hyd',
      area: 'Bachupally / Miyapur / Dundigal',
      category_type: 'B.Tech / Engineering',
      name: 'GRIET - Gokaraju Rangaraju Institute of Engineering & Technology',
      short_name: 'GRIET',
      address: 'Bachupally, Kukatpally, Hyderabad, Telangana 500090',
      email_domain: 'griet.ac.in',
      verification_required: true,
      active: true,
      created_at: '2026-01-10T00:00:00Z'
    },
    {
      id: 'col-grcp-pharm',
      city_id: 'city-hyd',
      area: 'Bachupally / Miyapur / Dundigal',
      category_type: 'Pharmacy',
      name: 'Gokaraju Rangaraju College of Pharmacy (GRCP)',
      short_name: 'GRCP',
      address: 'Bachupally, Hyderabad 500090',
      email_domain: 'grcp.ac.in',
      verification_required: false,
      active: true,
      created_at: '2026-01-10T00:00:00Z'
    },
    {
      id: 'col-bvrit-women',
      city_id: 'city-hyd',
      area: 'Bachupally / Miyapur / Dundigal',
      category_type: 'B.Tech / Engineering',
      name: 'BVRIT Hyderabad College of Engineering for Women',
      short_name: 'BVRIT Hyderabad',
      address: 'Bachupally, Nizampet Road, Hyderabad 500090',
      email_domain: 'bvrithyderabad.edu.in',
      verification_required: true,
      active: true,
      created_at: '2026-01-10T00:00:00Z'
    },
    {
      id: 'col-mlrit-eng',
      city_id: 'city-hyd',
      area: 'Bachupally / Miyapur / Dundigal',
      category_type: 'B.Tech / Engineering',
      name: 'MLR Institute of Technology (MLRIT)',
      short_name: 'MLRIT',
      address: 'Dundigal Police Station Road, Hyderabad 500043',
      email_domain: 'mlrit.ac.in',
      verification_required: true,
      active: true,
      created_at: '2026-01-10T00:00:00Z'
    },
    {
      id: 'col-mlrip-pharm',
      city_id: 'city-hyd',
      area: 'Bachupally / Miyapur / Dundigal',
      category_type: 'Pharmacy',
      name: 'Marri Laxman Reddy Institute of Pharmacy (MLRIP)',
      short_name: 'MLR Pharmacy',
      address: 'Dundigal, Hyderabad 500043',
      email_domain: 'mlrip.ac.in',
      verification_required: false,
      active: true,
      created_at: '2026-01-10T00:00:00Z'
    },
    {
      id: 'col-iare-eng',
      city_id: 'city-hyd',
      area: 'Bachupally / Miyapur / Dundigal',
      category_type: 'B.Tech / Engineering',
      name: 'Institute of Aeronautical Engineering (IARE)',
      short_name: 'IARE',
      address: 'Dundigal, Hyderabad 500043',
      email_domain: 'iare.ac.in',
      verification_required: true,
      active: true,
      created_at: '2026-01-10T00:00:00Z'
    },

    // ----------------------------------------------------
    // MAISAMMAGUDA / KOMPALLY / MEDCHAL
    // ----------------------------------------------------
    {
      id: 'col-mallareddy-u',
      city_id: 'city-hyd',
      area: 'Maisammaguda / Kompally / Medchal',
      category_type: 'University & Autonomous',
      name: 'Malla Reddy University',
      short_name: 'MRU',
      address: 'Maisammaguda, Dhulapally, Medchal, Hyderabad 500100',
      email_domain: 'mallareddyuniversity.ac.in',
      verification_required: true,
      active: true,
      created_at: '2026-01-10T00:00:00Z'
    },
    {
      id: 'col-mrec-eng',
      city_id: 'city-hyd',
      area: 'Maisammaguda / Kompally / Medchal',
      category_type: 'B.Tech / Engineering',
      name: 'Malla Reddy Engineering College (MREC Autonomous)',
      short_name: 'MREC',
      address: 'Maisammaguda, Secunderabad / Medchal 500100',
      email_domain: 'mrec.ac.in',
      verification_required: true,
      active: true,
      created_at: '2026-01-10T00:00:00Z'
    },
    {
      id: 'col-mrcet-eng',
      city_id: 'city-hyd',
      area: 'Maisammaguda / Kompally / Medchal',
      category_type: 'B.Tech / Engineering',
      name: 'Malla Reddy College of Engineering & Technology (MRCET)',
      short_name: 'MRCET',
      address: 'Maisammaguda, Dhulapally, Hyderabad 500100',
      email_domain: 'mrcet.ac.in',
      verification_required: true,
      active: true,
      created_at: '2026-01-10T00:00:00Z'
    },
    {
      id: 'col-mrips-pharm',
      city_id: 'city-hyd',
      area: 'Maisammaguda / Kompally / Medchal',
      category_type: 'Pharmacy',
      name: 'Malla Reddy Institute of Pharmaceutical Sciences',
      short_name: 'MRIPS Pharmacy',
      address: 'Maisammaguda, Dhulapally, Hyderabad 500100',
      email_domain: 'mrips.ac.in',
      verification_required: false,
      active: true,
      created_at: '2026-01-10T00:00:00Z'
    },
    {
      id: 'col-cmr-eng',
      city_id: 'city-hyd',
      area: 'Maisammaguda / Kompally / Medchal',
      category_type: 'B.Tech / Engineering',
      name: 'CMR College of Engineering & Technology (CMRCET)',
      short_name: 'CMRCET',
      address: 'Kandlakoya, Medchal Road, Hyderabad 501401',
      email_domain: 'cmrcet.ac.in',
      verification_required: true,
      active: true,
      created_at: '2026-01-10T00:00:00Z'
    },
    {
      id: 'col-cmr-tech',
      city_id: 'city-hyd',
      area: 'Maisammaguda / Kompally / Medchal',
      category_type: 'B.Tech / Engineering',
      name: 'CMR Technical Campus (CMRTC)',
      short_name: 'CMRTC',
      address: 'Kandlakoya, Medchal Road, Hyderabad 501401',
      email_domain: 'cmrtc.ac.in',
      verification_required: true,
      active: true,
      created_at: '2026-01-10T00:00:00Z'
    },
    {
      id: 'col-cmr-pharm',
      city_id: 'city-hyd',
      area: 'Maisammaguda / Kompally / Medchal',
      category_type: 'Pharmacy',
      name: 'CMR College of Pharmacy',
      short_name: 'CMR Pharmacy',
      address: 'Kandlakoya, Medchal Road, Hyderabad 501401',
      email_domain: 'cmrcp.ac.in',
      verification_required: false,
      active: true,
      created_at: '2026-01-10T00:00:00Z'
    },
    {
      id: 'col-stmartins-eng',
      city_id: 'city-hyd',
      area: 'Maisammaguda / Kompally / Medchal',
      category_type: 'B.Tech / Engineering',
      name: "St. Martin's Engineering College",
      short_name: "St. Martin's",
      address: 'Dhulapally, Near Kompally, Secunderabad 500100',
      email_domain: 'smec.ac.in',
      verification_required: true,
      active: true,
      created_at: '2026-01-10T00:00:00Z'
    },
    {
      id: 'col-sivasivani-deg',
      city_id: 'city-hyd',
      area: 'Maisammaguda / Kompally / Medchal',
      category_type: 'Degree & PG',
      name: 'Siva Sivani Degree & PG College, Kompally',
      short_name: 'Siva Sivani',
      address: 'NH 44, Kompally, Secunderabad 500100',
      email_domain: 'sivasivani.org',
      verification_required: false,
      active: true,
      created_at: '2026-01-10T00:00:00Z'
    },

    // ----------------------------------------------------
    // GANDIPET / NARSINGI / SHANKARPALLY / IBRAHIMBAGH
    // ----------------------------------------------------
    {
      id: 'col-cbit',
      city_id: 'city-hyd',
      area: 'Gandipet / Shankarpally / Ibrahimbagh',
      category_type: 'B.Tech / Engineering',
      name: 'CBIT - Chaitanya Bharathi Institute of Technology',
      short_name: 'CBIT',
      address: 'Gandipet, Hyderabad, Telangana 500075',
      email_domain: 'cbit.ac.in',
      verification_required: true,
      active: true,
      created_at: '2026-01-10T00:00:00Z'
    },
    {
      id: 'col-mgit',
      city_id: 'city-hyd',
      area: 'Gandipet / Shankarpally / Ibrahimbagh',
      category_type: 'B.Tech / Engineering',
      name: 'MGIT - Mahatma Gandhi Institute of Technology',
      short_name: 'MGIT',
      address: 'Kokapet, Gandipet, Hyderabad 500075',
      email_domain: 'mgit.ac.in',
      verification_required: true,
      active: true,
      created_at: '2026-01-10T00:00:00Z'
    },
    {
      id: 'col-vasavi',
      city_id: 'city-hyd',
      area: 'Gandipet / Shankarpally / Ibrahimbagh',
      category_type: 'B.Tech / Engineering',
      name: 'Vasavi College of Engineering',
      short_name: 'Vasavi',
      address: '9-5-81, Ibrahimbagh, Hyderabad, Telangana 500031',
      email_domain: 'vce.ac.in',
      verification_required: true,
      active: true,
      created_at: '2026-01-12T00:00:00Z'
    },
    {
      id: 'col-lords-eng',
      city_id: 'city-hyd',
      area: 'Gandipet / Shankarpally / Ibrahimbagh',
      category_type: 'B.Tech / Engineering',
      name: 'Lords Institute of Engineering and Technology',
      short_name: 'Lords',
      address: 'Himayathsagar, Near Appa Junction, Hyderabad 500091',
      email_domain: 'lords.ac.in',
      verification_required: true,
      active: true,
      created_at: '2026-01-10T00:00:00Z'
    },
    {
      id: 'col-icfai-univ',
      city_id: 'city-hyd',
      area: 'Gandipet / Shankarpally / Ibrahimbagh',
      category_type: 'University & Autonomous',
      name: 'ICFAI Foundation for Higher Education (IFHE / IBS)',
      short_name: 'ICFAI',
      address: 'Donthanapally, Shankarpally Road, Hyderabad 501203',
      email_domain: 'ifheindia.org',
      verification_required: true,
      active: true,
      created_at: '2026-01-10T00:00:00Z'
    },

    // ----------------------------------------------------
    // GACHIBOWLI / MADHAPUR / HITEC CITY / KONDAPUR
    // ----------------------------------------------------
    {
      id: 'col-iiit-hyd',
      city_id: 'city-hyd',
      area: 'Gachibowli / Madhapur / Hitec City',
      category_type: 'University & Autonomous',
      name: 'IIIT Hyderabad (International Institute of Info Tech)',
      short_name: 'IIIT Hyderabad',
      address: 'Gachibowli, Hyderabad, Telangana 500032',
      email_domain: 'iiit.ac.in',
      verification_required: true,
      active: true,
      created_at: '2026-01-10T00:00:00Z'
    },
    {
      id: 'col-hcu-univ',
      city_id: 'city-hyd',
      area: 'Gachibowli / Madhapur / Hitec City',
      category_type: 'University & Autonomous',
      name: 'University of Hyderabad (HCU Central University)',
      short_name: 'HCU',
      address: 'Prof. C.R. Rao Road, Gachibowli, Hyderabad 500046',
      email_domain: 'uohyd.ac.in',
      verification_required: true,
      active: true,
      created_at: '2026-01-10T00:00:00Z'
    },
    {
      id: 'col-nift-hyd',
      city_id: 'city-hyd',
      area: 'Gachibowli / Madhapur / Hitec City',
      category_type: 'Degree & PG',
      name: 'National Institute of Fashion Technology (NIFT)',
      short_name: 'NIFT Hyderabad',
      address: 'Madhapur, Near Hitec City, Hyderabad 500081',
      email_domain: 'nift.ac.in',
      verification_required: false,
      active: true,
      created_at: '2026-01-10T00:00:00Z'
    },
    {
      id: 'col-villamarie-deg',
      city_id: 'city-hyd',
      area: 'Gachibowli / Madhapur / Hitec City',
      category_type: 'Degree & PG',
      name: 'Villa Marie Degree College for Women',
      short_name: 'Villa Marie',
      address: 'Somajiguda / Jubilee Hills, Hyderabad 500082',
      email_domain: 'villamariecollege.ac.in',
      verification_required: false,
      active: true,
      created_at: '2026-01-10T00:00:00Z'
    },

    // ----------------------------------------------------
    // IBRAHIMPATNAM / SAGAR ROAD / MANGALPALLI
    // ----------------------------------------------------
    {
      id: 'col-cvr-eng',
      city_id: 'city-hyd',
      area: 'Ibrahimpatnam / Sagar Road',
      category_type: 'B.Tech / Engineering',
      name: 'CVR College of Engineering',
      short_name: 'CVR',
      address: 'Vastunagar, Mangalpalli, Ibrahimpatnam, RR Dist 501510',
      email_domain: 'cvr.ac.in',
      verification_required: true,
      active: true,
      created_at: '2026-01-10T00:00:00Z'
    },
    {
      id: 'col-gnitc-eng',
      city_id: 'city-hyd',
      area: 'Ibrahimpatnam / Sagar Road',
      category_type: 'B.Tech / Engineering',
      name: 'Guru Nanak Institutions Technical Campus (GNITC)',
      short_name: 'GNITC',
      address: 'Khanapur, Ibrahimpatnam, Hyderabad 501506',
      email_domain: 'gniindia.org',
      verification_required: true,
      active: true,
      created_at: '2026-01-10T00:00:00Z'
    },
    {
      id: 'col-gnit-pharm',
      city_id: 'city-hyd',
      area: 'Ibrahimpatnam / Sagar Road',
      category_type: 'Pharmacy',
      name: 'Guru Nanak Institute of Pharmacy',
      short_name: 'GNI Pharmacy',
      address: 'Khanapur, Ibrahimpatnam, Hyderabad 501506',
      email_domain: 'gniindia.org',
      verification_required: false,
      active: true,
      created_at: '2026-01-10T00:00:00Z'
    },
    {
      id: 'col-biet-eng',
      city_id: 'city-hyd',
      area: 'Ibrahimpatnam / Sagar Road',
      category_type: 'B.Tech / Engineering',
      name: 'Bharat Institute of Engineering and Technology (BIET)',
      short_name: 'BIET',
      address: 'Mangalpalli, Ibrahimpatnam, Hyderabad 501510',
      email_domain: 'biet.ac.in',
      verification_required: true,
      active: true,
      created_at: '2026-01-10T00:00:00Z'
    },
    {
      id: 'col-avn-eng',
      city_id: 'city-hyd',
      area: 'Ibrahimpatnam / Sagar Road',
      category_type: 'B.Tech / Engineering',
      name: 'AVN Institute of Engineering and Technology',
      short_name: 'AVN Eng',
      address: 'Patelguda, Ibrahimpatnam, Hyderabad 501510',
      email_domain: 'avniet.ac.in',
      verification_required: false,
      active: true,
      created_at: '2026-01-10T00:00:00Z'
    },

    // ----------------------------------------------------
    // LB NAGAR / DILSUKHNAGAR / HAYATHNAGAR
    // ----------------------------------------------------
    {
      id: 'col-bhavans-newscience',
      city_id: 'city-hyd',
      area: 'LB Nagar / Dilsukhnagar / Hayathnagar',
      category_type: 'Degree & PG',
      name: 'Bhavans New Science Degree College',
      short_name: 'Bhavans New Science',
      address: 'Narayanguda / Dilsukhnagar, Hyderabad 500029',
      email_domain: 'bhavans.ac.in',
      verification_required: false,
      active: true,
      created_at: '2026-01-10T00:00:00Z'
    },
    {
      id: 'col-siddhartha-dilsukh',
      city_id: 'city-hyd',
      area: 'LB Nagar / Dilsukhnagar / Hayathnagar',
      category_type: 'Degree & PG',
      name: 'Siddhartha Degree College, Dilsukhnagar',
      short_name: 'Siddhartha Dilsukhnagar',
      address: 'Near Metro Station, Dilsukhnagar, Hyderabad 500036',
      email_domain: 'siddharthadegree.edu.in',
      verification_required: false,
      active: true,
      created_at: '2026-01-10T00:00:00Z'
    },
    {
      id: 'col-gdc-hayathnagar',
      city_id: 'city-hyd',
      area: 'LB Nagar / Dilsukhnagar / Hayathnagar',
      category_type: 'Degree & PG',
      name: 'Government Degree College, Hayathnagar',
      short_name: 'GDC Hayathnagar',
      address: 'Hayathnagar, Hyderabad, Telangana 501505',
      email_domain: 'telangana.gov.in',
      verification_required: false,
      active: true,
      created_at: '2026-01-10T00:00:00Z'
    },
    {
      id: 'col-vijaya-pharm',
      city_id: 'city-hyd',
      area: 'LB Nagar / Dilsukhnagar / Hayathnagar',
      category_type: 'Pharmacy',
      name: 'Vijaya College of Pharmacy, Hayathnagar',
      short_name: 'Vijaya Pharmacy',
      address: 'Hayathnagar, Hyderabad 501505',
      email_domain: 'vijayapharmacy.edu.in',
      verification_required: false,
      active: true,
      created_at: '2026-01-10T00:00:00Z'
    },

    // ----------------------------------------------------
    // AMEERPET / BEGUMPET / SOMAJIGUDA / PUNJAGUTTA
    // ----------------------------------------------------
    {
      id: 'col-nizam-deg',
      city_id: 'city-hyd',
      area: 'Ameerpet / Begumpet / Somajiguda',
      category_type: 'University & Autonomous',
      name: 'Nizam College (Autonomous - Osmania University)',
      short_name: 'Nizam College',
      address: 'Basheerbagh, Hyderabad 500001',
      email_domain: 'nizamcollege.ac.in',
      verification_required: true,
      active: true,
      created_at: '2026-01-10T00:00:00Z'
    },
    {
      id: 'col-stfrancis-deg',
      city_id: 'city-hyd',
      area: 'Ameerpet / Begumpet / Somajiguda',
      category_type: 'Degree & PG',
      name: 'St. Francis College for Women, Begumpet',
      short_name: 'St. Francis',
      address: 'Uma Nagar, Begumpet, Hyderabad 500016',
      email_domain: 'sfc.ac.in',
      verification_required: true,
      active: true,
      created_at: '2026-01-10T00:00:00Z'
    },
    {
      id: 'col-gdc-begumpet',
      city_id: 'city-hyd',
      area: 'Ameerpet / Begumpet / Somajiguda',
      category_type: 'Degree & PG',
      name: 'Government Degree College for Women, Begumpet',
      short_name: 'GDCW Begumpet',
      address: 'Begumpet, Hyderabad 500016',
      email_domain: 'telangana.gov.in',
      verification_required: false,
      active: true,
      created_at: '2026-01-10T00:00:00Z'
    },

    // ----------------------------------------------------
    // SECUNDERABAD / ALWAL / ECIL / MALKAJGIRI
    // ----------------------------------------------------
    {
      id: 'col-bhavans-vivekananda',
      city_id: 'city-hyd',
      area: 'Secunderabad / Alwal / ECIL',
      category_type: 'Degree & PG',
      name: "Bhavan's Vivekananda College of Science, Humanities & Commerce",
      short_name: 'BVC Sainikpuri',
      address: 'Sainikpuri, Secunderabad, Telangana 500094',
      email_domain: 'bhavansvc.ac.in',
      verification_required: true,
      active: true,
      created_at: '2026-01-10T00:00:00Z'
    },
    {
      id: 'col-loyola-alwal',
      city_id: 'city-hyd',
      area: 'Secunderabad / Alwal / ECIL',
      category_type: 'University & Autonomous',
      name: 'Loyola Academy Degree & PG College, Alwal',
      short_name: 'Loyola Academy',
      address: 'Old Alwal, Secunderabad 500010',
      email_domain: 'loyolaacademyugpg.ac.in',
      verification_required: true,
      active: true,
      created_at: '2026-01-10T00:00:00Z'
    },
    {
      id: 'col-stanns-sec',
      city_id: 'city-hyd',
      area: 'Secunderabad / Alwal / ECIL',
      category_type: 'Degree & PG',
      name: "St. Ann's College, Secunderabad",
      short_name: "St. Ann's Sec",
      address: 'Clock Tower, Secunderabad 500003',
      email_domain: 'stannscollege.in',
      verification_required: false,
      active: true,
      created_at: '2026-01-10T00:00:00Z'
    },

    // ----------------------------------------------------
    // MEHDIPATNAM / MASAB TANK / TOLICHOWKI
    // ----------------------------------------------------
    {
      id: 'col-stanns-mehdi',
      city_id: 'city-hyd',
      area: 'Mehdipatnam / Masab Tank / Tolichowki',
      category_type: 'Degree & PG',
      name: "St. Ann's College for Women, Mehdipatnam",
      short_name: "St. Ann's Mehdi",
      address: 'Santoshnagar Colony, Mehdipatnam, Hyderabad 500028',
      email_domain: 'stannscollegehyd.com',
      verification_required: true,
      active: true,
      created_at: '2026-01-10T00:00:00Z'
    },
    {
      id: 'col-mjcet-eng',
      city_id: 'city-hyd',
      area: 'Mehdipatnam / Masab Tank / Tolichowki',
      category_type: 'B.Tech / Engineering',
      name: 'Muffakham Jah College of Engineering & Technology (MJCET)',
      short_name: 'MJCET',
      address: 'Mount Pleasant, 8-2-249, Road No. 3, Banjara Hills 500034',
      email_domain: 'mjcollege.ac.in',
      verification_required: true,
      active: true,
      created_at: '2026-01-10T00:00:00Z'
    },
    {
      id: 'col-sultan-pharm',
      city_id: 'city-hyd',
      area: 'Mehdipatnam / Masab Tank / Tolichowki',
      category_type: 'Pharmacy',
      name: 'Sultan-Ul-Uloom College of Pharmacy',
      short_name: 'Sultan Pharmacy',
      address: 'Mount Pleasant, Road No 3, Banjara Hills, Hyderabad 500034',
      email_domain: 'supharmacy.ac.in',
      verification_required: false,
      active: true,
      created_at: '2026-01-10T00:00:00Z'
    },
    {
      id: 'col-shadan-eng',
      city_id: 'city-hyd',
      area: 'Mehdipatnam / Masab Tank / Tolichowki',
      category_type: 'B.Tech / Engineering',
      name: 'Shadan College of Engineering & Technology',
      short_name: 'Shadan Eng',
      address: 'Peerancheru, Himayatsagar Road, Hyderabad 500008',
      email_domain: 'scet.in',
      verification_required: false,
      active: true,
      created_at: '2026-01-10T00:00:00Z'
    },

    // ----------------------------------------------------
    // SHAMSHABAD / RAJENDRANAGAR
    // ----------------------------------------------------
    {
      id: 'col-pjtsau-univ',
      city_id: 'city-hyd',
      area: 'Shamshabad / Rajendranagar',
      category_type: 'University & Autonomous',
      name: 'PJTSAU - Agricultural University',
      short_name: 'PJTSAU',
      address: 'Rajendranagar, Hyderabad, Telangana 500030',
      email_domain: 'pjtsau.edu.in',
      verification_required: true,
      active: true,
      created_at: '2026-01-10T00:00:00Z'
    },
    {
      id: 'col-vardhaman-eng',
      city_id: 'city-hyd',
      area: 'Shamshabad / Rajendranagar',
      category_type: 'B.Tech / Engineering',
      name: 'Vardhaman College of Engineering',
      short_name: 'Vardhaman',
      address: 'Kacharam, Shamshabad, Hyderabad 501218',
      email_domain: 'vardhaman.org',
      verification_required: true,
      active: true,
      created_at: '2026-01-10T00:00:00Z'
    },

    // ----------------------------------------------------
    // OTHER CITIES (WARANGAL, BENGALURU, PUNE, ETC.)
    // ----------------------------------------------------
    {
      id: 'col-nitw',
      city_id: 'city-wgl',
      area: 'Kazipet / Hanamkonda',
      category_type: 'University & Autonomous',
      name: 'NIT Warangal - National Institute of Technology',
      short_name: 'NITW',
      address: 'Kazipet, Hanamkonda, Warangal, Telangana 506004',
      email_domain: 'nitw.ac.in',
      verification_required: true,
      active: true,
      created_at: '2026-01-18T00:00:00Z'
    },
    {
      id: 'col-kits',
      city_id: 'city-wgl',
      area: 'Hasanparthy',
      category_type: 'B.Tech / Engineering',
      name: 'KITS - Kakatiya Institute of Technology & Science',
      short_name: 'KITSW',
      address: 'Yerragattu Gutta, Hasanparthy, Warangal, Telangana 506015',
      email_domain: 'kitsw.ac.in',
      verification_required: true,
      active: true,
      created_at: '2026-01-18T00:00:00Z'
    },
    {
      id: 'col-rvce',
      city_id: 'city-blr',
      area: 'Mysore Road',
      category_type: 'B.Tech / Engineering',
      name: 'RV College of Engineering',
      short_name: 'RVCE',
      address: 'Mysore Road, Bengaluru, Karnataka 560059',
      email_domain: 'rvce.edu.in',
      verification_required: true,
      active: true,
      created_at: '2026-02-01T00:00:00Z'
    },
    {
      id: 'col-bmsce',
      city_id: 'city-blr',
      area: 'Basavanagudi',
      category_type: 'B.Tech / Engineering',
      name: 'BMS College of Engineering',
      short_name: 'BMSCE',
      address: 'Bull Temple Rd, Basavanagudi, Bengaluru, Karnataka 560019',
      email_domain: 'bmsce.ac.in',
      verification_required: true,
      active: true,
      created_at: '2026-02-01T00:00:00Z'
    }
  ],
  campuses: [
    { id: 'cam-snist-main', college_id: 'col-snist', name: 'Main Campus', location: 'Ghatkesar, Blocks A-E', active: true },
    { id: 'cam-cbit-main', college_id: 'col-cbit', name: 'Main Academic Campus', location: 'Gandipet Campus', active: true }
  ],
  college_requests: [],
  categories: [
    { id: 'cat-record', name: 'Record Writing', group: 'Academic & Creative', description: 'Handwritten lab record notebooks copying where permitted', icon: 'BookOpen', bgColor: '#FFD84D' },
    { id: 'cat-notes', name: 'Notes Copying', group: 'Academic & Creative', description: 'Neat handwriting copies of classroom & lecture notes', icon: 'FileText', bgColor: '#8DD8FF' },
    { id: 'cat-diagrams', name: 'Diagrams & Charts', group: 'Academic & Creative', description: 'Engineering, circuit, and biology diagrams on chart sheets', icon: 'PieChart', bgColor: '#FF8FB8' },
    { id: 'cat-ppt', name: 'PPT Creation', group: 'Academic & Creative', description: 'Seminar, project, and tech-talk PowerPoint slide decks', icon: 'Presentation', bgColor: '#FFD84D' },
    { id: 'cat-poster', name: 'Poster Design', group: 'Creative', description: 'College club banners, project posters, and Canva graphics', icon: 'Palette', bgColor: '#8DD8FF' },
    { id: 'cat-print', name: 'Printing & Binding', group: 'Student Services', description: 'High-speed xerox, color prints, and spiral binding pickup', icon: 'Printer', bgColor: '#FF8FB8' },
    { id: 'cat-scan', name: 'Scanning & Digitizing', group: 'Student Services', description: 'CamScanner / OCR scanning of physical notes into PDF', icon: 'Scan', bgColor: '#FFD84D' },
    { id: 'cat-format', name: 'Formatting & LaTeX', group: 'Academic & Creative', description: 'IEEE report styling, margins, bibliography formatting', icon: 'FileCode', bgColor: '#8DD8FF' },
    { id: 'cat-data', name: 'Data Entry', group: 'Student Services', description: 'Excel spreadsheets, Google Forms data compiling', icon: 'Database', bgColor: '#FF8FB8' },
    { id: 'cat-thumb', name: 'Thumbnail Design', group: 'Creative', description: 'YouTube thumbnails for student creators & college channels', icon: 'Image', bgColor: '#FFD84D' },
    { id: 'cat-errand', name: 'Campus Errands', group: 'Campus Help', description: 'Pickup stationary, cafeteria queue, library book drops', icon: 'ShoppingBag', bgColor: '#FF8FB8' },
    { id: 'cat-event', name: 'Event Assistance', group: 'Campus Help', description: 'Fest setup, registration desk, sound check support', icon: 'Users', bgColor: '#8DD8FF' },
    { id: 'cat-other', name: 'Other Assistance', group: 'Campus Help', description: 'Other legitimate student-to-student peer assistance', icon: 'HelpCircle', bgColor: '#FF8FB8' }
  ],
  // ZERO fake / demo accounts: only an internal lead admin account if needed
  users: [
    {
      id: 'usr-admin-1',
      name: 'Campus Lead Admin',
      email: 'admin@taskmate.campus',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Admin&backgroundColor=ffd84d',
      auth_provider: 'email',
      email_verified: true,
      college_verified: true,
      role: 'SUPER_ADMIN',
      country_id: 'c-in',
      state_id: 'st-tg',
      city_id: 'city-hyd',
      college_id: 'col-snist',
      campus_id: 'cam-snist-main',
      bio: 'TaskMate Lead Administrator.',
      skills: ['Administration', 'Support'],
      rating: 5.0,
      completed_tasks: 0,
      completion_rate: 100,
      onboarding_completed: true,
      earnings_total: 0,
      earnings_available: 0,
      earnings_pending: 0,
      spent_total: 0,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-09-25T12:00:00Z',
      last_login_at: '2026-09-25T15:00:00Z'
    }
  ],
  // ZERO fake tasks! Clean empty state ready for real students to post!
  tasks: [],
  task_files: [],
  applications: [],
  orders: [],
  payments: [],
  handovers: [],
  disputes: [],
  reviews: [],
  notifications: [],
  messages: [],
  verification_requests: [],
  moderation_reports: [],
  audit_logs: []
};
