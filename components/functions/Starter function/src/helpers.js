// Helper functions for scholarship matching

export function normalizeDate(dateString) {
  if (!dateString || dateString === 'Not Specified' || dateString === 'Open Deadline') {
    return null;
  }
  
  const cleaned = dateString.replace(/(\d+)(st|nd|rd|th)/g, '$1');
  const date = new Date(cleaned);
  
  return isNaN(date.getTime()) ? null : date;
}

export function arrayIncludesCaseInsensitive(arr, value) {
  if (!arr || !value) return false;
  const valueLower = value.toLowerCase();
  return arr.some(item => item?.toLowerCase() === valueLower);
}

export function hasAllWildcard(arr) {
  if (!arr || arr.length === 0) return false;
  return arr.some(item => item?.toUpperCase() === 'ALL');
}

export function checkTrackMatch(track, userProfile) {
  if (track.allowed_levels?.length > 0) {
    const userLevel = Number(userProfile.level);
    const levelMatch = track.allowed_levels.some(level => Number(level) === userLevel);
    if (!levelMatch) return false;
  }

  if (track.min_cgpa > 0 && userProfile.cgpa < track.min_cgpa) return false;
  if (track.min_jamb_score > 0 && userProfile.jamb < track.min_jamb_score) return false;

  const genderUpper = track.required_gender?.toUpperCase();
  const userGenderUpper = userProfile.gender?.toUpperCase();
  if (track.required_gender && genderUpper !== 'ANY' && genderUpper !== 'ALL' && genderUpper !== userGenderUpper) {
    return false;
  }

  if (track.required_state_of_origin?.length > 0 && !hasAllWildcard(track.required_state_of_origin) &&
      !arrayIncludesCaseInsensitive(track.required_state_of_origin, userProfile.state)) {
    return false;
  }

  if (track.required_lga_list?.length > 0 && !hasAllWildcard(track.required_lga_list) &&
      !arrayIncludesCaseInsensitive(track.required_lga_list, userProfile.lga)) {
    return false;
  }

  if (track.required_universities?.length > 0 && !hasAllWildcard(track.required_universities) &&
      !arrayIncludesCaseInsensitive(track.required_universities, userProfile.uni)) {
    return false;
  }

  if (track.course_category?.length > 0 && !hasAllWildcard(track.course_category) &&
      !arrayIncludesCaseInsensitive(track.course_category, userProfile.course)) {
    return false;
  }

  const religionUpper = track.required_religion?.toUpperCase();
  if (track.required_religion && religionUpper !== 'NONE' && religionUpper !== 'ANY' &&
      religionUpper !== 'ALL' && track.required_religion?.toLowerCase() !== userProfile.rel?.toLowerCase()) {
    return false;
  }

  if (track.is_disability_specific && !userProfile.chal) {
    return false;
  }

  return true;
}

export function generateEmailHTML(userName, scholarships) {
  const scholarshipRows = scholarships.map((s, index) => {
    const hasLink = s.official_link && s.official_link.toLowerCase() !== 'none';
    const applyButton = hasLink
      ? `<a href="${s.official_link}" 
           style="display: inline-block; background-color: #2563eb; color: white; padding: 8px 16px; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500;">
          Apply Now →
        </a>`
      : `<span style="display: inline-block; background-color: #6b7280; color: white; padding: 8px 16px; border-radius: 6px; font-size: 14px; font-weight: 500;">
          Check Requirements on Website
        </span>`;

    return `
    <tr style="background-color: ${index % 2 === 0 ? '#f9fafb' : '#ffffff'};">
      <td style="padding: 16px; border-bottom: 1px solid #e5e7eb;">
        <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px; font-weight: 600;">
          ${s.scholarship_name}
        </h3>
        <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;">
          <strong>Provider:</strong> ${s.provider}
        </p>
        <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;">
          <strong>Award:</strong> ${s.award_amount || 'Tuition Support'}
        </p>
        <p style="margin: 0 0 12px 0; color: #ef4444; font-size: 14px;">
          <strong>Deadline:</strong> ${s.deadline}
        </p>
        ${applyButton}
      </td>
    </tr>
  `;
  }).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px;">
          <tr>
            <td style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 32px 24px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px;">🎓 New Scholarship Matches!</h1>
              <p style="margin: 8px 0 0 0; color: #dbeafe; font-size: 14px;">ScholarAI</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px;">
              <h2 style="margin: 0 0 16px 0; color: #1f2937;">Hello ${userName}! 👋</h2>
              <p style="margin: 0 0 16px 0; color: #4b5563;">
                We found <strong>${scholarships.length}</strong> new scholarship${scholarships.length !== 1 ? 's' : ''} for you!
              </p>
            </td>
          </tr>
          <tr>
            <td>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${scholarshipRows}
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px; text-align: center; color: #6b7280; font-size: 12px;">
              <p>Good luck with your applications! 🎉</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
