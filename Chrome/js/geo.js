var Geo = {};  // Geo namespace, representing static class
Geo.parseDMS = function(dms, ref) {

  // check for signed decimal degrees without NSEW, if so return it directly
  if (typeof dms === 'number') return Number(dms);
  
  // and convert to decimal degrees...
  switch (dms && dms.length) {
    case 3:  // interpret 3-part result as d/m/s
      var deg = dms[0]/1 + dms[1]/60 + (parseInt(dms[2])?dms[2]/3600:0); 
      break;
    case 2:  // interpret 2-part result as d/m
      var deg = dms[0]/1 + dms[1]/60; 
      break;
    case 1:  // just d (possibly decimal) or non-separated dddmmss
      var deg = dms[0];
      // check for fixed-width unseparated format eg 0033709W
      if (/[NS]/i.test(ref)) deg = '0' + deg;  // - normalise N/S to 3-digit degrees
      if (/[0-9]{7}/.test(deg)) deg = deg.slice(0,3)/1 + deg.slice(3,5)/60 + deg.slice(5)/3600; 
      break;
    default:
      return NaN;
  }
  if (/^-|[WS]$/i.test(ref)) deg = -deg; // take '-', west and south as -ve
  return Number(deg);
}