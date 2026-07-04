export function flattenDfaData(nestedData) {
  const flat = [];
  nestedData.forEach(stateObj => {
    const { state, project_id, form_id } = stateObj;
    stateObj.regions.forEach(regionObj => {
      const region = regionObj.region;
      regionObj.districts.forEach(districtObj => {
        const district = districtObj.district;
        const dfa_cod = districtObj.dfa_cod;
        districtObj.campaign_days.forEach((dayObj, dayIdx) => {
          flat.push({
            state,
            region,
            district,
            dfa_cod,
            project_id,
            form_id,
            campaign_day: `Day ${dayIdx + 1}`, // Normalize to "Day 1", "Day 2", etc.
            ...dayObj
          });
        });
      });
    });
  });
  console.log("Flattened dfaData sample:", flat.slice(0, 2)); // Debug log
  return flat;
}