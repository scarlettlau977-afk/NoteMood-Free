/* Emotion Earth scene, interactions, local notes, and optional GitHub sync. */
(() => {
  'use strict';

  const CONFIG = window.EMOTION_CONFIG;
  if (!window.THREE || !CONFIG) return;

  const THREE = window.THREE;
  const $ = (id) => document.getElementById(id);
  const STORAGE = 'emotion-earth-records';
  const LEGACY_STORAGE = 'weiguang-feelings';
  const SETTINGS_STORAGE = 'weiguang-github-config';
  const EMOTIONS = CONFIG.moods;
  const TWO_PI = Math.PI * 2;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  let scene, camera, renderer, globe, globeMesh, stars, starMaterial;
  let cityHits = [];
  let demoRecords = window.buildEmotionDemo();
  let localRecords = loadLocalRecords();
  let sharedRecords = [];
  let selectedEmotion = 'joy';
  let visitor = { country: '中国', region: '中国东部', city: 'Shanghai', latitude: 31.2304, longitude: 121.4737 };
  let dragging = false;
  let dragStart = null;
  let lastPointer = null;
  let lastInputAt = performance.now();
  let focusedCity = null;
  let savedGlobalQuaternion = new THREE.Quaternion();
  let savedGlobalZoom = 4.55;
  let targetQuaternion = null;
  let targetZoom = 4.55;
  let toastTimer;
  let pointer = new THREE.Vector2();
  const raycaster = new THREE.Raycaster();

  function showToast(message) {
    const el = $('toast');
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
  }

  function colorFor(emotion) {
    return new THREE.Color(EMOTIONS[emotion]?.color || '#a9d8d0');
  }

  function latLonVector(latitude, longitude, radius = 1.008) {
    const phi = (90 - latitude) * Math.PI / 180;
    const theta = (longitude + 180) * Math.PI / 180;
    return new THREE.Vector3(
      -radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );
  }

  function loadLocalRecords() {
    try {
      const current = JSON.parse(localStorage.getItem(STORAGE) || '[]');
      const legacy = JSON.parse(localStorage.getItem(LEGACY_STORAGE) || '[]');
      const moodLookup = { 开心: 'joy', 焦虑: 'anxiety', 平静: 'calm', 难过: 'sad', 愤怒: 'angry', 疲惫: 'tired' };
      const migrated = legacy.filter(item => !current.some(saved => saved.id === item.id)).map(item => ({
        id: item.id || `legacy_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        country: visitor.country, region: visitor.region, city: visitor.city,
        latitude: visitor.latitude, longitude: visitor.longitude,
        emotion: moodLookup[item.mood] || 'calm', message: item.text || '',
        timestamp: item.createdAt || new Date().toISOString(), isPublic: !!item.public, demo: false
      }));
      const merged = [...current, ...migrated];
      if (migrated.length) localStorage.setItem(STORAGE, JSON.stringify(merged));
      return merged;
    } catch (_) { return []; }
  }

  function saveLocalRecords() {
    try { localStorage.setItem(STORAGE, JSON.stringify(localRecords)); }
    catch (_) { showToast('浏览器存储空间不足，这条纸条只会保留到关闭页面'); }
  }

  function makeLandTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    const { width: w, height: h } = canvas;
    const ocean = ctx.createLinearGradient(0, 0, w * .7, h);
    ocean.addColorStop(0, '#102338');
    ocean.addColorStop(.48, '#19354a');
    ocean.addColorStop(1, '#0d1b31');
    ctx.fillStyle = ocean;
    ctx.fillRect(0, 0, w, h);

    const continents = [
      [[-168,71],[-151,68],[-139,59],[-130,53],[-126,47],[-124,40],[-117,32],[-108,29],[-105,24],[-97,18],[-91,19],[-86,22],[-83,26],[-81,31],[-78,35],[-74,41],[-68,45],[-61,49],[-58,54],[-68,59],[-78,61],[-88,65],[-102,68],[-114,73],[-130,72],[-147,74]],
      [[-80,12],[-74,9],[-77,2],[-80,-5],[-76,-13],[-73,-20],[-70,-28],[-67,-36],[-70,-45],[-74,-53],[-78,-50],[-80,-39],[-81,-24],[-78,-9]],
      [[-53,82],[-44,80],[-35,77],[-26,71],[-30,64],[-39,59],[-49,60],[-57,66],[-60,73]],
      [[-11,71],[-6,62],[1,58],[-5,51],[-9,44],[-2,43],[4,47],[9,44],[13,42],[17,46],[22,49],[28,55],[34,58],[40,56],[48,58],[56,55],[65,56],[74,60],[84,58],[93,55],[103,54],[111,50],[119,48],[127,52],[135,49],[143,54],[153,60],[165,61],[177,55],[169,47],[158,43],[149,43],[142,38],[136,34],[130,31],[124,23],[119,19],[114,12],[109,7],[104,4],[100,9],[96,17],[91,21],[84,22],[79,8],[74,8],[69,18],[65,24],[58,26],[52,24],[47,17],[43,12],[40,3],[36,-3],[31,-5],[28,2],[33,13],[35,22],[29,30],[22,33],[16,38],[10,43],[4,45],[-2,47],[-7,54],[-5,61]],
      [[-17,36],[-4,37],[7,35],[16,32],[25,30],[33,23],[39,13],[43,4],[50,-2],[43,-12],[40,-20],[35,-27],[30,-33],[22,-35],[16,-30],[12,-20],[8,-7],[4,4],[-1,5],[-7,4],[-12,9],[-16,18]],
      [[112,-11],[119,-18],[126,-17],[132,-14],[139,-17],[147,-20],[153,-27],[151,-36],[145,-40],[135,-43],[126,-40],[117,-34],[114,-25]],
      [[47,-13],[50,-17],[49,-23],[46,-25],[44,-19]],
      [[130,32],[135,35],[141,42],[145,44],[143,37],[138,34]],
      [[-8,58],[-5,59],[-2,55],[-4,51],[-7,50]],
      [[-180,-69],[-150,-73],[-120,-71],[-90,-74],[-60,-72],[-30,-75],[0,-72],[30,-74],[60,-71],[90,-74],[120,-71],[150,-73],[180,-69],[180,-90],[-180,-90]]
    ];

    const landMask = document.createElement('canvas');
    landMask.width = w; landMask.height = h;
    const mask = landMask.getContext('2d');
    for (const polygon of continents) {
      const path = new Path2D();
      polygon.forEach(([lon, lat], index) => {
        const x = (lon + 180) / 360 * w;
        const y = (90 - lat) / 180 * h;
        if (index) path.lineTo(x, y); else path.moveTo(x, y);
      });
      path.closePath();
      const land = ctx.createLinearGradient(100, 180, w * .85, h * .82);
      land.addColorStop(0, '#31534f');
      land.addColorStop(.5, '#3b6659');
      land.addColorStop(1, '#284d4c');
      ctx.fillStyle = land;
      ctx.fill(path);
      ctx.strokeStyle = 'rgba(154,194,173,.48)';
      ctx.lineWidth = 1.7;
      ctx.stroke(path);
      mask.fillStyle = '#fff';
      mask.fill(path);
    }

    // Fine terrain grain is clipped to the land mask so the continents stay soft, not flat.
    const terrain = document.createElement('canvas');
    terrain.width = w; terrain.height = h;
    const tctx = terrain.getContext('2d');
    tctx.fillStyle = '#c1d2ae';
    let seed = 54;
    for (let i = 0; i < 13500; i++) {
      seed = (seed * 16807) % 2147483647;
      const x = seed / 2147483647 * w;
      seed = (seed * 16807) % 2147483647;
      const y = seed / 2147483647 * h;
      const r = 1 + (seed % 12) / 5;
      tctx.globalAlpha = .025 + (seed % 20) / 500;
      tctx.beginPath(); tctx.ellipse(x, y, r * 2.4, r, 0, 0, TWO_PI); tctx.fill();
    }
    tctx.globalCompositeOperation = 'destination-in';
    tctx.drawImage(landMask, 0, 0);
    ctx.globalAlpha = .35;
    ctx.drawImage(terrain, 0, 0);
    ctx.globalAlpha = 1;

    ctx.strokeStyle = 'rgba(161,197,212,.12)';
    ctx.lineWidth = 1;
    for (let lon = -180; lon <= 180; lon += 30) {
      const x = (lon + 180) / 360 * w;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let lat = -60; lat <= 60; lat += 30) {
      const y = (90 - lat) / 180 * h;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.encoding = THREE.sRGBEncoding;
    texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    return texture;
  }

  function createAtmosphere() {
    return new THREE.Mesh(
      new THREE.SphereGeometry(1.055, 64, 48),
      new THREE.ShaderMaterial({
        transparent: true, side: THREE.BackSide, blending: THREE.AdditiveBlending,
        depthWrite: false,
        vertexShader: 'varying vec3 vNormal; varying vec3 vView; void main(){vNormal=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.0);vView=-mv.xyz;gl_Position=projectionMatrix*mv;}',
        fragmentShader: 'varying vec3 vNormal; varying vec3 vView; void main(){float rim=pow(1.0-max(dot(normalize(vNormal),normalize(vView)),0.0),2.35);gl_FragColor=vec4(0.24,0.50,0.84,rim*0.43);}'
      })
    );
  }

  function loadEarthMap(material) {
    new THREE.TextureLoader().load('assets/earth-daymap.jpg', (texture) => {
      texture.encoding = THREE.sRGBEncoding;
      texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      material.map = texture;
      material.needsUpdate = true;
    }, undefined, () => {
      // Keep the procedural fallback map if the external image cannot be read.
      showToast('地球纹理暂时无法加载，已使用内置地图');
    });
  }

  function createEmotionStars(records) {
    if (stars) { globe.remove(stars); stars.geometry.dispose(); starMaterial.dispose(); }
    const positions = new Float32Array(records.length * 3);
    const colors = new Float32Array(records.length * 3);
    const sizes = new Float32Array(records.length);
    records.forEach((record, index) => {
      const pos = latLonVector(record.latitude, record.longitude, 1.009);
      const color = colorFor(record.emotion);
      const offset = index * 3;
      positions[offset] = pos.x; positions[offset + 1] = pos.y; positions[offset + 2] = pos.z;
      colors[offset] = color.r; colors[offset + 1] = color.g; colors[offset + 2] = color.b;
      sizes[index] = record.demo ? 2.1 : 2.8;
    });
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    starMaterial = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, vertexColors: true, blending: THREE.AdditiveBlending,
      uniforms: { uPixelRatio: { value: Math.min(devicePixelRatio, 2) } },
      vertexShader: 'attribute float aSize;uniform float uPixelRatio;varying vec3 vColor;void main(){vec4 mv=modelViewMatrix*vec4(position,1.0);gl_PointSize=aSize*uPixelRatio*(3.8/max(1.0,-mv.z));gl_Position=projectionMatrix*mv;vColor=color;}',
      fragmentShader: 'varying vec3 vColor;void main(){vec2 p=gl_PointCoord-vec2(.5);float d=length(p);float alpha=1.0-smoothstep(.34,.5,d);if(alpha<.02)discard;gl_FragColor=vec4(vColor,alpha);}'
    });
    stars = new THREE.Points(geometry, starMaterial);
    stars.frustumCulled = false;
    globe.add(stars);
  }

  function createCityHotspots() {
    const hitMaterial = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
    for (const city of CONFIG.cities) {
      const group = new THREE.Group();
      group.position.copy(latLonVector(city.lat, city.lon, 1.01));
      group.userData.city = city;
      const glow = new THREE.Sprite(new THREE.SpriteMaterial({ color: '#c7d7ff', transparent: true, opacity: .4, depthWrite: false, blending: THREE.AdditiveBlending }));
      glow.scale.set(.11, .11, 1);
      group.add(glow);
      const core = new THREE.Mesh(new THREE.SphereGeometry(.012, 12, 10), new THREE.MeshBasicMaterial({ color: '#d8e8ed' }));
      group.add(core);
      const hit = new THREE.Mesh(new THREE.SphereGeometry(.068, 12, 10), hitMaterial);
      hit.userData.cityGroup = group;
      group.add(hit);
      globe.add(group);
      cityHits.push(hit);
    }
  }

  function setupScene() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(38, innerWidth / innerHeight, .1, 100);
    camera.position.set(0, 0, 4.55);
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.setSize(innerWidth, innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    $('earth').appendChild(renderer.domElement);
    scene.add(new THREE.AmbientLight(0x9bb9e2, 1.05));
    const key = new THREE.DirectionalLight(0xd8edff, 1.9);
    key.position.set(-3, 2, 4);
    scene.add(key);
    const rim = new THREE.PointLight(0x567fc2, 5.2, 9);
    rim.position.set(3, -1, -3);
    scene.add(rim);

    globe = new THREE.Group();
    scene.add(globe);
    const earthMaterial = new THREE.MeshStandardMaterial({ map: makeLandTexture(), roughness: .9, metalness: .04 });
    globeMesh = new THREE.Mesh(new THREE.SphereGeometry(1, 112, 80), earthMaterial);
    loadEarthMap(earthMaterial);
    globe.add(globeMesh, createAtmosphere());
    createEmotionStars([...demoRecords, ...localRecords, ...sharedRecords]);
    createCityHotspots();
    createFarStars();
    bindControls();
    buildLegend();
    buildMoodPicker();
    updateCounts();
    animate();
    $('loading').classList.add('hidden');
    locateVisitor();
  }

  function createFarStars() {
    const count = 1200;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const radius = 12 + Math.random() * 18;
      const azimuth = Math.random() * TWO_PI;
      const polar = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = radius * Math.sin(polar) * Math.cos(azimuth);
      positions[i * 3 + 1] = radius * Math.cos(polar);
      positions[i * 3 + 2] = radius * Math.sin(polar) * Math.sin(azimuth);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    scene.add(new THREE.Points(geometry, new THREE.PointsMaterial({ color: 0xaebfe0, size: .045, transparent: true, opacity: .58, sizeAttenuation: true })));
  }

  function buildLegend() {
    $('legend').innerHTML = Object.entries(EMOTIONS).map(([key, mood]) =>
      `<span class="legend-item"><i class="legend-dot" style="color:${mood.color};background:${mood.color}"></i>${mood.label}</span>`
    ).join('');
  }

  function buildMoodPicker() {
    const labels = Object.entries(EMOTIONS);
    $('moodPicker').innerHTML = labels.map(([key, mood]) =>
      `<button class="mood-chip${key === selectedEmotion ? ' selected' : ''}" style="--mood:${mood.color}" data-emotion="${key}" type="button"><i></i>${mood.label}</button>`
    ).join('');
    $('moodPicker').addEventListener('click', (event) => {
      const button = event.target.closest('[data-emotion]');
      if (!button) return;
      $('moodPicker').querySelector('.selected')?.classList.remove('selected');
      button.classList.add('selected');
      selectedEmotion = button.dataset.emotion;
    });
  }

  async function locateVisitor() {
    try {
      const response = await fetch('https://ipapi.co/json/', { cache: 'no-store' });
      if (!response.ok) throw new Error('IP city lookup failed');
      const data = await response.json();
      if (typeof data.latitude !== 'number' || typeof data.longitude !== 'number') throw new Error('Coordinates unavailable');
      visitor = { country: data.country_name || '', region: data.region || '', city: data.city || 'Nearby city', latitude: data.latitude, longitude: data.longitude };
      $('currentCity').textContent = visitor.city;
      addVisitorPin();
    } catch (_) {
      $('currentCity').textContent = '上海 · 示例位置';
      visitor = { country: '中国', region: '中国东部', city: 'Shanghai', latitude: 31.2304, longitude: 121.4737 };
      showToast('城市定位暂不可用，先使用上海示例位置');
    }
  }

  function addVisitorPin() {
    const group = new THREE.Group();
    group.position.copy(latLonVector(visitor.latitude, visitor.longitude, 1.018));
    const pin = new THREE.Mesh(new THREE.SphereGeometry(.021, 16, 12), new THREE.MeshBasicMaterial({ color: '#e9f4d2' }));
    const aura = new THREE.Sprite(new THREE.SpriteMaterial({ color: '#d3e8ae', transparent: true, opacity: .7, blending: THREE.AdditiveBlending, depthWrite: false }));
    aura.scale.set(.12, .12, 1);
    group.add(pin, aura);
    globe.add(group);
  }

  function bindControls() {
    const canvas = renderer.domElement;
    canvas.addEventListener('pointerdown', (event) => {
      dragging = true;
      dragStart = { x: event.clientX, y: event.clientY };
      lastPointer = { x: event.clientX, y: event.clientY };
      lastInputAt = performance.now();
      canvas.setPointerCapture(event.pointerId);
    });
    canvas.addEventListener('pointermove', (event) => {
      updatePointer(event);
      if (dragging && lastPointer) {
        const dx = event.clientX - lastPointer.x;
        const dy = event.clientY - lastPointer.y;
        if (Math.abs(dx) + Math.abs(dy) > 0) {
          globe.rotation.y += dx * .0042;
          globe.rotation.x = clamp(globe.rotation.x + dy * .0032, -1.14, 1.14);
          targetQuaternion = null;
          lastInputAt = performance.now();
        }
        lastPointer = { x: event.clientX, y: event.clientY };
      } else updateHover(event);
    });
    canvas.addEventListener('pointerup', (event) => {
      dragging = false;
      if (!dragStart) return;
      const distance = Math.hypot(event.clientX - dragStart.x, event.clientY - dragStart.y);
      if (distance < 6) {
        updatePointer(event);
        const city = pickCity();
        if (city) focusCity(city);
        else if (focusedCity) returnToGlobal();
      }
      dragStart = null;
      lastInputAt = performance.now();
    });
    canvas.addEventListener('pointercancel', () => { dragging = false; dragStart = null; });
    canvas.addEventListener('pointerleave', () => { if (!dragging) $('cityTooltip').style.display = 'none'; });
    canvas.addEventListener('wheel', (event) => {
      event.preventDefault();
      targetZoom = clamp(targetZoom + event.deltaY * .0022, focusedCity ? 2.2 : 2.9, 6.1);
      lastInputAt = performance.now();
    }, { passive: false });
    addEventListener('resize', resize);
    $('submitNote').addEventListener('click', submitNote);
    $('message').addEventListener('keydown', (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') submitNote();
    });
    $('backGlobal').addEventListener('click', returnToGlobal);
    $('syncNow').addEventListener('click', syncNow);
    $('openSync').addEventListener('click', openSyncDialog);
    $('saveSync').addEventListener('click', saveSyncSettings);
    loadSyncSettings();
  }

  function updatePointer(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
  }

  function pickCity() {
    raycaster.setFromCamera(pointer, camera);
    const intersections = raycaster.intersectObjects(cityHits, false);
    for (const hit of intersections) {
      const group = hit.object.userData.cityGroup;
      const world = new THREE.Vector3();
      group.getWorldPosition(world);
      const normal = world.clone().normalize();
      const cameraDirection = camera.position.clone().sub(world).normalize();
      if (normal.dot(cameraDirection) > .12) return group.userData.city;
    }
    return null;
  }

  function updateHover(event) {
    if (focusedCity) return;
    const city = pickCity();
    const tip = $('cityTooltip');
    if (!city) { tip.style.display = 'none'; renderer.domElement.style.cursor = 'grab'; return; }
    const count = demoRecords.filter(record => record.city === city.city).length + localRecords.filter(record => record.city === city.city).length;
    tip.innerHTML = `<b>${city.city}</b><small>${count.toLocaleString()} 份情绪 · 点击探索</small>`;
    tip.style.display = 'block';
    tip.style.left = `${Math.min(event.clientX + 15, innerWidth - 185)}px`;
    tip.style.top = `${Math.min(event.clientY + 15, innerHeight - 70)}px`;
    renderer.domElement.style.cursor = 'pointer';
  }

  function focusCity(city) {
    if (!focusedCity) {
      savedGlobalQuaternion.copy(globe.quaternion);
      savedGlobalZoom = targetZoom;
    }
    focusedCity = city;
    const localDirection = latLonVector(city.lat, city.lon, 1).normalize();
    const currentDirection = localDirection.clone().applyQuaternion(globe.quaternion).normalize();
    const align = new THREE.Quaternion().setFromUnitVectors(currentDirection, new THREE.Vector3(0, 0, 1));
    targetQuaternion = align.multiply(globe.quaternion.clone());
    targetZoom = 2.72;
    lastInputAt = performance.now();
    $('cityTooltip').style.display = 'none';
    document.body.classList.add('exploring');
    $('composer').setAttribute('aria-hidden', 'true');
    $('regionPanel').hidden = false;
    renderRegion(city);
  }

  function renderRegion(city) {
    const records = [...demoRecords, ...sharedRecords, ...localRecords].filter(record => record.city === city.city);
    $('regionName').textContent = city.city;
    $('regionCount').textContent = `${records.length.toLocaleString()} 份心情漂浮在这里`;
    const counts = Object.keys(EMOTIONS).map(key => [key, records.filter(record => record.emotion === key).length]);
    const total = Math.max(1, records.length);
    $('emotionBar').innerHTML = counts.filter(([,count]) => count > 0).map(([key,count]) =>
      `<span class="emotion-segment" style="width:${count / total * 100}%;background:${EMOTIONS[key].color}"></span>`
    ).join('');
    $('emotionSummary').innerHTML = counts.filter(([,count]) => count > 0).sort((a,b) => b[1] - a[1]).slice(0, 5).map(([key,count]) =>
      `<span class="emotion-percent"><i class="legend-dot" style="color:${EMOTIONS[key].color};background:${EMOTIONS[key].color}"></i>${EMOTIONS[key].label} <b>${Math.round(count / total * 100)}%</b></span>`
    ).join('');
    const samples = records.filter(record => !record.demo || Math.random() > .72).sort(() => Math.random() - .5).slice(0, 6);
    const fallbackMessages = CONFIG.cityMessages[city.city] || CONFIG.cityMessages.default;
    const bubbleData = samples.length ? samples : fallbackMessages.slice(0, 5).map((message, index) => ({ message, emotion: counts[index % counts.length]?.[0] || 'calm' }));
    $('bubbleList').innerHTML = bubbleData.map((record, index) => {
      const mood = EMOTIONS[record.emotion] || EMOTIONS.calm;
      return `<article class="emotion-bubble" style="--mood:${mood.color};--delay:${index * 75}ms">${escapeHtml(record.message)}<small class="bubble-meta">${mood.label} · 匿名</small></article>`;
    }).join('');
  }

  function returnToGlobal() {
    if (!focusedCity) return;
    focusedCity = null;
    targetQuaternion = savedGlobalQuaternion.clone();
    targetZoom = savedGlobalZoom || 4.55;
    lastInputAt = performance.now();
    $('regionPanel').hidden = true;
    document.body.classList.remove('exploring');
    $('composer').removeAttribute('aria-hidden');
  }

  function submitNote() {
    const message = $('message').value.trim();
    if (!message) { showToast('写下一点此刻的感受，再点亮星星吧'); $('message').focus(); return; }
    const entry = {
      id: `note_${crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}_${Math.random().toString(36).slice(2)}`}`,
      country: visitor.country, region: visitor.region || '附近', city: visitor.city,
      latitude: visitor.latitude, longitude: visitor.longitude,
      emotion: selectedEmotion, message, timestamp: new Date().toISOString(),
      isPublic: $('publish').checked, demo: false
    };
    localRecords.push(entry);
    saveLocalRecords();
    $('message').value = '';
    createEmotionStars([...demoRecords, ...localRecords, ...sharedRecords]);
    updateCounts();
    showToast(entry.isPublic ? '纸条已点亮；连接 GitHub 后可同步给其他人' : '纸条已点亮并保存在这台设备');
    if (focusedCity && focusedCity.city === entry.city) renderRegion(focusedCity);
    if (entry.isPublic && getSettings().token && getSettings().repo) syncNow(true);
  }

  function updateCounts() {
    const count = demoRecords.length + localRecords.length + sharedRecords.length;
    $('worldCount').innerHTML = `<strong>${count.toLocaleString()}</strong> 颗情绪星星正在发光`;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[char]);
  }

  function getSettings() {
    try { return JSON.parse(localStorage.getItem(SETTINGS_STORAGE) || '{}'); } catch (_) { return {}; }
  }

  function loadSyncSettings() {
    const settings = getSettings();
    $('repo').value = settings.repo || '';
    $('branch').value = settings.branch || 'main';
    $('filePath').value = settings.filePath || 'data/shared-emotions.json';
    $('token').value = settings.token || '';
  }

  function openSyncDialog() { loadSyncSettings(); $('syncDialog').showModal(); }

  function saveSyncSettings(event) {
    event.preventDefault();
    const settings = {
      repo: $('repo').value.trim(), branch: $('branch').value.trim() || 'main',
      filePath: $('filePath').value.trim() || 'data/shared-emotions.json', token: $('token').value.trim()
    };
    localStorage.setItem(SETTINGS_STORAGE, JSON.stringify(settings));
    $('syncDialog').close();
    showToast(settings.repo ? 'GitHub 连接已保存在这台设备' : '已清除 GitHub 连接');
  }

  async function githubFile(method, body) {
    const settings = getSettings();
    if (!settings.repo || !settings.token) throw new Error('先连接有写入权限的 GitHub 仓库');
    const safePath = settings.filePath.split('/').map(encodeURIComponent).join('/');
    const url = `https://api.github.com/repos/${settings.repo}/contents/${safePath}?ref=${encodeURIComponent(settings.branch || 'main')}`;
    const response = await fetch(url, {
      method,
      headers: { Authorization: `Bearer ${settings.token}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const failure = new Error(error.message || `GitHub 返回 ${response.status}`);
      failure.status = response.status;
      throw failure;
    }
    return response.json();
  }

  function decodeGitHubJson(content) {
    const binary = atob(content.replace(/\n/g, ''));
    const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  }

  async function syncNow(silent = false) {
    const settings = getSettings();
    if (!settings.repo || !settings.token) {
      $('syncDialog').showModal();
      if (!silent) showToast('填写仓库与令牌后即可同步公开纸条');
      return;
    }
    $('syncNow').disabled = true;
    $('syncNow').textContent = '同步中…';
    try {
      let sha = null;
      let remote = [];
      try {
        const file = await githubFile('GET');
        sha = file.sha;
        remote = decodeGitHubJson(file.content);
      } catch (error) {
        if (error.status !== 404) throw error;
      }
      const combined = new Map([...remote, ...sharedRecords, ...localRecords.filter(record => record.isPublic)].map(record => [record.id, record]));
      const entries = [...combined.values()];
      const bytes = new TextEncoder().encode(JSON.stringify(entries, null, 2));
      let binary = '';
      for (let offset = 0; offset < bytes.length; offset += 0x8000) {
        binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
      }
      const content = btoa(binary);
      await githubFile('PUT', { message: '同步匿名心情小纸条', content, branch: settings.branch || 'main', ...(sha ? { sha } : {}) });
      sharedRecords = entries.filter(record => !localRecords.some(local => local.id === record.id));
      createEmotionStars([...demoRecords, ...localRecords, ...sharedRecords]);
      updateCounts();
      if (focusedCity) renderRegion(focusedCity);
      showToast('共享星球已同步');
    } catch (error) {
      showToast(`同步未完成：${error.message}`);
    } finally {
      $('syncNow').disabled = false;
      $('syncNow').textContent = '同步星球';
    }
  }

  function resize() {
    if (!renderer || !camera) return;
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
    starMaterial.uniforms.uPixelRatio.value = Math.min(devicePixelRatio || 1, 2);
    lastInputAt = performance.now();
  }

  function animate() {
    requestAnimationFrame(animate);
    const now = performance.now();
    const delta = Math.min(.05, (now - (animate.last || now)) / 1000);
    animate.last = now;
    if (targetQuaternion) {
      globe.quaternion.slerp(targetQuaternion, 1 - Math.exp(-delta * 2.35));
      if (globe.quaternion.angleTo(targetQuaternion) < .001) { globe.quaternion.copy(targetQuaternion); targetQuaternion = null; }
    } else if (!focusedCity && now - lastInputAt > 2600 && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      globe.rotateY(delta * .012);
    }
    camera.position.z += (targetZoom - camera.position.z) * (1 - Math.exp(-delta * 2.1));
    renderer.render(scene, camera);
  }

  try { setupScene(); }
  catch (error) {
    console.error('Emotion Earth could not start:', error);
    $('loading').classList.add('loading-error');
    $('loading').innerHTML = '<span class="loading-star">✦</span><span>星球暂时无法展开，请检查浏览器的 WebGL 和网络设置。</span>';
  }
})();
