const fs = require('fs');
const content = fs.readFileSync('constants.ts', 'utf8');

const NIGERIAN_UNIVERSITIES = [
  "ABU - Ahmadu Bello University",
  "ATBU - Abubakar Tafawa Balewa University",
  "BUK - Bayero University Kano",
  "FUAAM - Federal University of Agriculture, Makurdi",
  "FUNAAB - Federal University of Agriculture, Abeokuta",
  "FUTA - Federal University of Technology, Akure",
  "FUTMINNA - Federal University of Technology, Minna",
  "FUTO - Federal University of Technology, Owerri",
  "MOUAU - Michael Okpara University of Agriculture",
  "NOUN - National Open University of Nigeria",
  "NOVENA - Novena University",
  "OAU - Obafemi Awolowo University",
  "UI - University of Ibadan",
  "UNIBEN - University of Benin",
  "UNIBUJA - University of Abuja",
  "UNCAL - University of Calabar",
  "UNIJOS - University of Jos",
  "UNILAG - University of Lagos",
  "UNILORIN - University of Ilorin",
  "UNIMAID - University of Maiduguri",
  "UNIPORT - University of Port Harcourt",
  "UNIUYO - University of Uyo",
  "UNIZIK - Nnamdi Azikiwe University",
  "UNN - University of Nigeria, Nsukka",
  "UDUSOK - Usmanu Danfodiyo University",
  "Other"
];

const exportStr = `\n\nexport const NIGERIAN_UNIVERSITIES = ${JSON.stringify(NIGERIAN_UNIVERSITIES, null, 2)};\n`;

fs.writeFileSync('constants.ts', content + exportStr);
