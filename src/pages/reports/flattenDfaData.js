// utils/flattenDfaData.js
export function flattenDfaData(nestedData) {
  const flat = [];
  nestedData.forEach(stateObj => {
    const state = stateObj.state;
    stateObj.regions.forEach(regionObj => {
      const region = regionObj.region;
      regionObj.districts.forEach(districtObj => {
        const district = districtObj.district;
        const dfa_cod = districtObj.dfa_cod;
        districtObj.campaign_days.forEach(dayObj => {
          flat.push({
            state,
            region,
            district,
            dfa_cod,
            ...dayObj
          });
        });
      });
    });
  });
  return flat;
}