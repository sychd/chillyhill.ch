const svgNamespace = "http://www.w3.org/2000/svg";
const viewBoxSize = 1200;
const palette = ["#7688ff", "#a15eff", "#d951ff", "#ff7f91", "#ff3f46"];
const renderProfiles = {
  desktop: {
    columns: 33,
    rows: 27,
    marginX: 190,
    marginY: 220,
    includeDiagonalLinks: true,
    minFrameMs: 1000 / 30,
    nodeOpacityMultiplier: 1,
    useNodeGlow: true,
  },
  mobile: {
    columns: 13,
    rows: 9,
    marginX: 255,
    marginY: 275,
    includeDiagonalLinks: false,
    minFrameMs: 1000 / 16,
    nodeOpacityMultiplier: 1.2,
    useNodeGlow: false,
  },
};

const reducedMotionQuery = createMediaQuery("(prefers-reduced-motion: reduce)");
const compactViewportQuery = createMediaQuery("(max-width: 720px)");
const coarsePointerQuery = createMediaQuery("(pointer: coarse)");
const svg = globalThis.document?.querySelector?.("#orbit-background");

if (svg) {
  initializeOrbitBackground(svg);
}

export function selectOrbitBackgroundProfile({
  isCompactViewport = false,
  isCoarsePointer = false,
} = {}) {
  return isCompactViewport || isCoarsePointer
    ? renderProfiles.mobile
    : renderProfiles.desktop;
}

function initializeOrbitBackground(svgElement) {
  let profile = getCurrentRenderProfile();
  let scene = buildOrbitScene(svgElement, profile);
  let animationFrame = 0;
  let frameTimer = 0;
  let previousTimestamp = 0;
  let lastRenderedTimestamp = 0;
  let phaseTime = 0;

  function render(timestamp = 0) {
    const elapsedTime = timestamp / 1000;
    const delta =
      previousTimestamp === 0
        ? 0
        : Math.min((timestamp - previousTimestamp) / 1000, 0.12);
    const breath = breathingCurve(elapsedTime);

    animationFrame = 0;
    previousTimestamp = timestamp;
    lastRenderedTimestamp = timestamp;
    phaseTime += delta * breath.speed;

    updateProjectedNodes(
      scene.projectedNodes,
      scene.nodes,
      profile,
      phaseTime,
      breath.amount,
    );
    updateGradient(scene.gradientStops, phaseTime);
    updateLinks(scene.linkPaths, scene.links, scene.projectedNodes, profile);
    updateContours(scene.contourPaths, scene.projectedNodes, profile);
    updateNodes(scene.nodeCircles, scene.projectedNodes);
    scene.meshGroup.setAttribute(
      "opacity",
      String(0.82 + breath.amount * 0.12),
    );

    scheduleRender();
  }

  function scheduleRender() {
    if (reducedMotionQuery.matches || globalThis.document?.hidden) {
      return;
    }

    const delay = Math.max(
      0,
      profile.minFrameMs - (performance.now() - lastRenderedTimestamp),
    );

    clearFrameTimer();
    frameTimer = window.setTimeout(() => {
      animationFrame = window.requestAnimationFrame(render);
    }, delay);
  }

  function cancelRender() {
    clearFrameTimer();

    if (animationFrame) {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    }
  }

  function clearFrameTimer() {
    if (frameTimer) {
      window.clearTimeout(frameTimer);
      frameTimer = 0;
    }
  }

  function renderStaticFrame() {
    cancelRender();
    previousTimestamp = 0;
    lastRenderedTimestamp = 0;
    render(0);
  }

  function handleVisibilityChange() {
    if (globalThis.document?.hidden) {
      cancelRender();
      return;
    }

    previousTimestamp = 0;
    scheduleRender();
  }

  function rebuildScene() {
    const nextProfile = getCurrentRenderProfile();

    if (profile === nextProfile) {
      return;
    }

    cancelRender();
    profile = nextProfile;
    scene = buildOrbitScene(svgElement, profile);
    renderStaticFrame();
  }

  render(0);

  addMediaQueryListener(reducedMotionQuery, "change", renderStaticFrame);
  addMediaQueryListener(compactViewportQuery, "change", rebuildScene);
  addMediaQueryListener(coarsePointerQuery, "change", rebuildScene);
  globalThis.document?.addEventListener?.(
    "visibilitychange",
    handleVisibilityChange,
  );
}

function getCurrentRenderProfile() {
  return selectOrbitBackgroundProfile({
    isCompactViewport: compactViewportQuery.matches,
    isCoarsePointer: coarsePointerQuery.matches,
  });
}

function buildOrbitScene(svgElement, profile) {
  const { gradientStops, meshGroup, linkGroup, contourGroup, nodeGroup } =
    buildScene(svgElement, profile);
  const nodes = createNodes(profile);
  const links = createLinks(nodes, profile);
  const projectedNodes = createProjectedNodes(nodes);
  const contourPaths = createContourPaths(contourGroup, profile);
  const linkPaths = links.map(() => createPath(linkGroup, "orbit-bg-link"));
  const nodeCircles = nodes.map((node) => createCircle(nodeGroup, node));

  return {
    gradientStops,
    meshGroup,
    nodes,
    links,
    projectedNodes,
    contourPaths,
    linkPaths,
    nodeCircles,
  };
}

function buildScene(svgElement, profile) {
  svgElement.setAttribute("width", String(viewBoxSize));
  svgElement.setAttribute("height", String(viewBoxSize));

  const defs = createElement("defs");
  const gradient = createElement("linearGradient", {
    id: "orbit-bg-gradient",
    x1: "170",
    y1: "160",
    x2: "1030",
    y2: "1040",
    gradientUnits: "userSpaceOnUse",
  });
  const gradientStops = [0, 0.28, 0.52, 0.76, 1].map((offset, index) => {
    const stop = createElement("stop", {
      offset: String(offset),
      "stop-color": palette[index],
    });

    gradient.append(stop);
    return stop;
  });
  const nodeGlow = createElement("filter", {
    id: "orbit-bg-node-glow",
    x: "-80%",
    y: "-80%",
    width: "260%",
    height: "260%",
  });
  nodeGlow.append(
    createElement("feGaussianBlur", { stdDeviation: "3.8", result: "blur" }),
    createElement("feMerge", {}),
  );
  nodeGlow.lastElementChild?.append(
    createElement("feMergeNode", { in: "blur" }),
    createElement("feMergeNode", { in: "SourceGraphic" }),
  );
  const fadeGradient = createElement("radialGradient", {
    id: "orbit-bg-fade-gradient",
    cx: "50%",
    cy: "50%",
    r: "50%",
  });
  fadeGradient.append(
    createElement("stop", {
      offset: "0%",
      "stop-color": "#ffffff",
      "stop-opacity": "1",
    }),
    createElement("stop", {
      offset: "58%",
      "stop-color": "#ffffff",
      "stop-opacity": "0.86",
    }),
    createElement("stop", {
      offset: "78%",
      "stop-color": "#ffffff",
      "stop-opacity": "0.28",
    }),
    createElement("stop", {
      offset: "100%",
      "stop-color": "#ffffff",
      "stop-opacity": "0",
    }),
  );
  const fadeMask = createElement("mask", { id: "orbit-bg-fade-mask" });
  fadeMask.append(
    createElement("rect", {
      width: String(viewBoxSize),
      height: String(viewBoxSize),
      fill: "url(#orbit-bg-fade-gradient)",
    }),
  );

  if (profile.useNodeGlow) {
    defs.append(gradient, nodeGlow, fadeGradient, fadeMask);
  } else {
    defs.append(gradient, fadeGradient, fadeMask);
  }

  const softShell = createElement("ellipse", {
    cx: "600",
    cy: "600",
    rx: "470",
    ry: "455",
    fill: "#ffffff",
    opacity: "0.1",
  });
  const meshGroup = createElement("g", {
    mask: "url(#orbit-bg-fade-mask)",
  });
  const contourGroup = createElement("g", {
    fill: "none",
    stroke: "url(#orbit-bg-gradient)",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
  });
  const linkGroup = createElement("g", {
    fill: "none",
    stroke: "url(#orbit-bg-gradient)",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
  });
  const nodeGroupAttributes = {
    fill: "url(#orbit-bg-gradient)",
  };
  const nodeGroup = createElement(
    "g",
    profile.useNodeGlow
      ? { ...nodeGroupAttributes, filter: "url(#orbit-bg-node-glow)" }
      : nodeGroupAttributes,
  );

  meshGroup.append(contourGroup, linkGroup, nodeGroup);
  svgElement.replaceChildren(defs, softShell, meshGroup);

  return { gradientStops, meshGroup, linkGroup, contourGroup, nodeGroup };
}

export function createNodes(profile = renderProfiles.desktop) {
  const spacingX = (viewBoxSize - profile.marginX * 2) / (profile.columns - 1);
  const spacingY = (viewBoxSize - profile.marginY * 2) / (profile.rows - 1);

  return Array.from({ length: profile.rows * profile.columns }, (_, index) => {
    const row = Math.floor(index / profile.columns);
    const column = index % profile.columns;
    const seed = seededNoise(row * 31 + column * 17);

    return {
      row,
      column,
      seed,
      baseX: profile.marginX + column * spacingX + (seed - 0.5) * 20,
      baseY:
        profile.marginY + row * spacingY + (seededNoise(index + 91) - 0.5) * 26,
    };
  });
}

export function createLinks(nodes, profile = renderProfiles.desktop) {
  const links = [];
  const nodeAt = (row, column) => nodes[row * profile.columns + column];

  for (let row = 0; row < profile.rows; row += 1) {
    for (let column = 0; column < profile.columns; column += 1) {
      const source = nodeAt(row, column);

      if (column < profile.columns - 1) {
        links.push({ source, target: nodeAt(row, column + 1), weight: 1 });
      }

      if (row < profile.rows - 1) {
        links.push({ source, target: nodeAt(row + 1, column), weight: 0.82 });
      }

      if (
        profile.includeDiagonalLinks &&
        row < profile.rows - 1 &&
        column < profile.columns - 1 &&
        (row + column) % 2 === 0
      ) {
        links.push({
          source,
          target: nodeAt(row + 1, column + 1),
          weight: 0.54,
        });
      }

      if (
        profile.includeDiagonalLinks &&
        row < profile.rows - 1 &&
        column > 0 &&
        (row + column) % 3 === 0
      ) {
        links.push({
          source,
          target: nodeAt(row + 1, column - 1),
          weight: 0.42,
        });
      }
    }
  }

  return links;
}

function createProjectedNodes(nodes) {
  return nodes.map((node) => ({
    x: node.baseX,
    y: node.baseY,
    depth: 0,
    opacity: 0.16,
    radius: 2,
  }));
}

function createContourPaths(group, profile) {
  return Array.from({ length: profile.rows }, (_, index) => {
    const path = createPath(group, "orbit-bg-contour");
    path.setAttribute("stroke-width", String(1.25 + index * 0.06));
    return path;
  });
}

function updateProjectedNodes(
  projectedNodes,
  nodes,
  profile,
  time,
  breathAmount,
) {
  nodes.forEach((node, index) => {
    projectNode(projectedNodes[index], node, profile, time, breathAmount);
  });
}

function projectNode(projectedNode, node, profile, time, breathAmount) {
  const centerX = (profile.columns - 1) / 2;
  const centerY = (profile.rows - 1) / 2;
  const normalizedX = (node.column - centerX) / centerX;
  const normalizedY = (node.row - centerY) / centerY;
  const distance = Math.hypot(normalizedX, normalizedY);
  const diagonalPhase = normalizedX * 1.65 + normalizedY * 1.1;
  const amplitude = 0.72 + breathAmount * 0.34;
  const swell = Math.sin(time * 0.5 + diagonalPhase * 2.6 + node.seed * 5.8);
  const undertow = Math.cos(time * 0.27 - normalizedY * 4.1 + node.seed * 4.2);
  const height =
    (swell * 30 + undertow * 15 + Math.sin(time * 0.15 + distance * 7) * 12) *
    amplitude;
  const perspective = 1 + height * 0.00155;
  const edgeFade = clamp(1 - distance * 0.34, 0.18, 1);

  projectedNode.x =
    600 +
    (node.baseX - 600) * perspective +
    Math.sin(time * 0.23 + node.seed * 8) * 5;
  projectedNode.y = 600 + (node.baseY - 600) * perspective + height;
  projectedNode.depth = height;
  projectedNode.opacity = clamp(
    (0.16 + (height + 58) / 190) * edgeFade * profile.nodeOpacityMultiplier,
    0.08,
    0.58,
  );
  projectedNode.radius = clamp(1.25 + (height + 58) / 48, 1.2, 3.7);
}

function updateLinks(paths, links, nodes, profile) {
  paths.forEach((path, index) => {
    const link = links[index];
    const source =
      nodes[link.source.row * profile.columns + link.source.column];
    const target =
      nodes[link.target.row * profile.columns + link.target.column];
    const midpointX = (source.x + target.x) / 2;
    const midpointY =
      (source.y + target.y) / 2 - (source.depth + target.depth) * 0.08;
    const opacity = clamp(
      (source.opacity + target.opacity) * 0.32 * link.weight,
      0.04,
      0.2,
    );

    path.setAttribute(
      "d",
      `M${source.x.toFixed(2)} ${source.y.toFixed(2)} Q${midpointX.toFixed(2)} ${midpointY.toFixed(
        2,
      )} ${target.x.toFixed(2)} ${target.y.toFixed(2)}`,
    );
    path.setAttribute("opacity", String(opacity));
    path.setAttribute("stroke-width", String(0.5 + link.weight * 0.58));
  });
}

function updateContours(paths, nodes, profile) {
  paths.forEach((path, row) => {
    const rowNodes = nodes.slice(
      row * profile.columns,
      row * profile.columns + profile.columns,
    );
    const normalizedRow = row / Math.max(profile.rows - 1, 1);
    const opacity = 0.06 + Math.sin(normalizedRow * Math.PI) * 0.08;

    path.setAttribute("d", createSmoothPath(rowNodes));
    path.setAttribute("opacity", String(opacity));
  });
}

function breathingCurve(time) {
  const wave = (Math.sin(time * 0.36 - Math.PI / 2) + 1) / 2;
  const longWave = (Math.sin(time * 0.085 + 1.4) + 1) / 2;
  const amount = easeInOutSine(wave);

  return {
    amount,
    speed: 0.52 + amount * 0.68 + longWave * 0.12,
  };
}

function easeInOutSine(value) {
  return -(Math.cos(Math.PI * value) - 1) / 2;
}

function updateNodes(circles, nodes) {
  circles.forEach((circle, index) => {
    const node = nodes[index];

    circle.setAttribute("cx", node.x.toFixed(2));
    circle.setAttribute("cy", node.y.toFixed(2));
    circle.setAttribute("r", node.radius.toFixed(2));
    circle.setAttribute("opacity", String(node.opacity));
  });
}

function updateGradient(stops, time) {
  stops.forEach((stop, index) => {
    const colorIndex = (index + Math.floor(time / 7)) % palette.length;
    const nextColorIndex = (colorIndex + 1) % palette.length;
    const amount = (Math.sin(time * 0.16 + index * 0.9) + 1) / 2;

    stop.setAttribute(
      "stop-color",
      mixHexColors(palette[colorIndex], palette[nextColorIndex], amount),
    );
  });
}

function createSmoothPath(points) {
  return points.reduce((path, point, index) => {
    if (index === 0) {
      return `M${point.x.toFixed(2)} ${point.y.toFixed(2)}`;
    }

    const previous = points[index - 1];
    const controlX = ((previous.x + point.x) / 2).toFixed(2);

    return `${path} C${controlX} ${previous.y.toFixed(2)} ${controlX} ${point.y.toFixed(
      2,
    )} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`;
  }, "");
}

function createPath(group, className) {
  const path = createElement("path", { class: className });
  group.append(path);
  return path;
}

function createCircle(group, node) {
  const circle = createElement("circle", {
    cx: String(node.baseX),
    cy: String(node.baseY),
    r: "3",
  });

  group.append(circle);
  return circle;
}

function createElement(name, attributes = {}) {
  const element = document.createElementNS(svgNamespace, name);

  Object.entries(attributes).forEach(([attribute, value]) => {
    element.setAttribute(attribute, value);
  });

  return element;
}

function seededNoise(value) {
  return fract(Math.sin(value * 12.9898) * 43758.5453);
}

function fract(value) {
  return value - Math.floor(value);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function mixHexColors(from, to, amount) {
  const fromRgb = hexToRgb(from);
  const toRgb = hexToRgb(to);
  const mixed = fromRgb.map((channel, index) => {
    return Math.round(channel + (toRgb[index] - channel) * amount);
  });

  return `#${mixed.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

function hexToRgb(hexColor) {
  const hex = hexColor.replace("#", "");

  return [
    Number.parseInt(hex.slice(0, 2), 16),
    Number.parseInt(hex.slice(2, 4), 16),
    Number.parseInt(hex.slice(4, 6), 16),
  ];
}

function createMediaQuery(query) {
  if (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function"
  ) {
    return window.matchMedia(query);
  }

  return {
    matches: false,
    addEventListener: undefined,
    removeEventListener: undefined,
  };
}

function addMediaQueryListener(mediaQuery, eventName, listener) {
  if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener(eventName, listener);
    return;
  }

  mediaQuery.addListener?.(listener);
}
