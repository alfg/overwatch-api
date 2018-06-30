const svgBuilder = require('svg-builder');

const Constants = {
  r: 15.91549430918954,
  width: 40,
  height: 40,
  offset: 25,
  strokeWidth: 3,
  cx: '50%',
  cy: '50%',
};

const Colors = {
  gray: '#2a2b2e',
  orange: '#f19512',
  magenta: '#c81af5',
  green: '#40ce44',
  white: '#f6f6f6',
  transparent: 'transparent',
};

// Builds data to be used by the svg-builder in svg.buildSVG.
function getSVGData(endorsementsObj) {
  const sportsmanshipRate = endorsementsObj.sportsmanship.rate || 0;
  const shotcallerRate = endorsementsObj.shotcaller.rate || 0;
  const teammateRate = endorsementsObj.teammate.rate || 0;

  return {
    level: endorsementsObj.level,
    shotcaller: {
      dasharray: `${Math.round(shotcallerRate)} ${Math.round(100 - shotcallerRate)}`,
      dashoffset: 25, // Start offset at 12 o'clock.
    },
    teammate: {
      dasharray: `${Math.round(teammateRate)} ${Math.round(100 - teammateRate)}`,
      dashoffset: 100 - Math.round(shotcallerRate) + 25, // Bump offset. 
    },
    sportsmanship: {
      dasharray: `${Math.round(sportsmanshipRate)} ${Math.round(100 - sportsmanshipRate)}`,
      dashoffset: 100 - Math.round(shotcallerRate + teammateRate) + 25,
    }
  }
}

// Builds the SVG endorements icon using data from svg.getSVGData.
function buildSVG(data) {
  const svg = svgBuilder.newInstance()
  svg.width(40).height(40);

  // Shot caller circle.
  svg.circle({
    r: Constants.r,
    fill: Colors.gray,
    'stroke-dasharray': data.shotcaller.dasharray,
    'stroke-dashoffset': data.shotcaller.dashoffset,
    'stroke-width': Constants.strokeWidth, 
    stroke: Colors.orange,
    cx: Constants.cx,
    cy: Constants.cy,
  });

  // Teammate circle.
  svg.circle({
    r: Constants.r,
    fill: Colors.transparent,
    'stroke-dasharray': data.teammate.dasharray,
    'stroke-dashoffset': data.teammate.dashoffset,
    'stroke-width': Constants.strokeWidth, 
    stroke: Colors.magenta,
    cx: Constants.cx,
    cy: Constants.cy,
  });

  // Sportsmanship circle.
  svg.circle({
    r: Constants.r,
    fill: Colors.transparent,
    'stroke-dasharray': data.sportsmanship.dasharray,
    'stroke-dashoffset': data.sportsmanship.dashoffset,
    'stroke-width': Constants.strokeWidth, 
    stroke: Colors.green,
    cx: Constants.cx,
    cy: Constants.cy,
  });

  // Centered text with endorsement level.
  svg.text({
    x: '50%',
    y: '50%',
    dy: '.3em',
    'font-family': 'century gothic,arial,sans-serif',
    'font-weight': 300,
    'font-size': 16,
    stroke: Colors.white,
    'stroke-width': '1',
    fill: Colors.white,
    'text-anchor': 'middle',
  }, `${data.level}`);

  // Output SVG as a base64 encoded data URI.
  const b64 = new Buffer.from(svg.render()).toString('base64');
  return `data:image/svg+xml;base64,${b64}`;
}

export function createEndorsementSVG(endorsementsObj) {
  const svgData = getSVGData(endorsementsObj);
  const svg = buildSVG(svgData);
  return svg;
}