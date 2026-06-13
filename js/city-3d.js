(() => {
  'use strict';

  const localAsset = (path) => path.split('/').map(encodeURIComponent).join('/');
  const contactEmail = 'shukfit' + '@' + 'gmail.com';
  const cart = JSON.parse(localStorage.getItem('shuklel-cart') || '[]');

  const stops = [
    {
      id:'accueil', label:'Accueil', short:'Shuklel', kicker:'Montréal nocturne', title:'Shuklel',
      description:'Artiste, producteur et rappeur basé à Montréal, Shuklel fusionne rap, afro-beat et synthwave. Plus de 150 000 écoutes et 5 000 abonnés soutiennent déjà son parcours.',
      poster:'assets/city/logo.webp', mediaClass:'logo-fit', accent:0xd9e2eb, light:'#d9e2eb',
      road:{x:-24,z:0}, building:{x:-24,z:-9,w:4.2,h:9.4,d:4.2},
      actions:[
        {kind:'link', label:'YouTube', href:'https://www.youtube.com/@shuklel'},
        {kind:'link', label:'Instagram', href:'https://www.instagram.com/ultimate_dini/'},
        {kind:'email', label:'Contact'}
      ]
    },
    {
      id:'album', label:'Album', short:'RS Vol.2', kicker:'Projet mis en avant', title:'Rigide et Scrupuleux Vol.2',
      description:'Une direction artistique sombre, premium et urbaine : chrome, nuit, ville et tension cinématique autour du nouveau projet.',
      poster:'assets/cover.webp', accent:0xd6ae72, light:'#d6ae72',
      road:{x:-16,z:0}, building:{x:-16,z:9,w:4.8,h:12.6,d:4.4},
      actions:[
        {kind:'link', label:'Écouter le projet', href:'https://distrokid.com/hyperfollow/shuklel/rigide-et-scrupuleux'},
        {kind:'go', label:'Discographie', target:'music'},
        {kind:'go', label:'Précommande', target:'contact'}
      ]
    },
    {
      id:'music', label:'Musique', short:'Music', kicker:'Catalogue', title:'Discographie',
      description:'Les projets Shuklel réunis comme des affiches sur la skyline : chaque façade ouvre vers un album, un univers ou une époque.',
      poster:'assets/city/rigide.webp', accent:0x4eb7c7, light:'#4eb7c7',
      road:{x:-8,z:0}, building:{x:-8,z:-9,w:4.4,h:11.2,d:4.2},
      type:'music'
    },
    {
      id:'book', label:'Livre', short:'Livre', kicker:'Livre', title:'De la méthode rigide et scrupuleuse',
      description:'Le livre prolonge l’univers du projet avec une pièce numérique à 5 $.',
      poster:'assets/cover.webp', accent:0xb82935, light:'#b82935',
      road:{x:0,z:0}, building:{x:0,z:9,w:4.6,h:10.4,d:4.4},
      type:'book'
    },
    {
      id:'merch', label:'Vêtements', short:'Merch', kicker:'Boutique', title:'Vêtements Shuklel',
      description:'Hoodie et t-shirt dans l’esthétique sombre du projet, accessibles directement depuis le quartier merch.',
      poster:'assets/city/hoodie-1.webp', accent:0x72b77b, light:'#72b77b',
      road:{x:8,z:0}, building:{x:8,z:-9,w:5,h:11.9,d:4.6},
      type:'merch'
    },
    {
      id:'cart', label:'Panier', short:'Panier', kicker:'Commande', title:'Panier',
      description:'Les articles ajoutés restent disponibles pendant la visite.',
      poster:'assets/city/logo.webp', accent:0xf0b64d, light:'#f0b64d',
      road:{x:16,z:0}, building:{x:16,z:9,w:4.2,h:9.7,d:4},
      type:'cart'
    },
    {
      id:'contact', label:'Contact', short:'Contact', kicker:'Réseaux', title:'Contact & Réseaux',
      description:'Booking, questions, précommande ou collaboration : le bureau reste ouvert au bout de la route.',
      poster:'assets/city/logo.webp', accent:0xd9e2eb, light:'#d9e2eb',
      road:{x:24,z:0}, building:{x:24,z:-9,w:4.6,h:10.8,d:4.4},
      type:'contact'
    }
  ];

  const albums = [
    {title:'Rigide et Scrupuleux Vol.2', meta:'Projet mis en avant', image:'assets/cover.webp', href:'https://distrokid.com/hyperfollow/shuklel/rigide-et-scrupuleux'},
    {title:'Rigide et scrupuleux', meta:'2025', image:'assets/city/rigide.webp', href:'https://distrokid.com/hyperfollow/shuklel/rigide-et-scrupuleux'},
    {title:'The Chronics', meta:'2024', image:'assets/city/chronics.webp', href:'https://distrokid.com/hyperfollow/shuklel/chronics'},
    {title:'Nightmares 3', meta:'2023', image:'assets/city/nightmares-3.webp', href:'https://distrokid.com/hyperfollow/shuklel/nightmares-3--paradoxical-sleep'},
    {title:'Nightmares 2', meta:'2022', image:'assets/city/nightmares-2.webp', href:'https://music.apple.com/ng/album/nightmares-2-lucid-dreams/1757700981'},
    {title:'Nightmares 1', meta:'2021', image:'assets/city/nightmares-1.webp', href:'https://www.youtube.com/watch?v=5tFkm6VHHkc&list=PLm2uy-m9rn8iYt26hr6-FGiCrykDRUm--&index=7'}
  ];

  const products = [
    {id:'hoodie', title:'Hoodie Shuklel', price:60, image:'assets/city/hoodie-1.webp', gallery:['assets/city/hoodie-1.webp','assets/city/hoodie-2.webp','assets/city/hoodie-3.webp','assets/city/hoodie-4.webp']},
    {id:'tshirt', title:'T-shirt Shuklel', price:35, image:'assets/city/tee-1.webp', gallery:['assets/city/tee-1.webp','assets/city/tee-2.webp','assets/city/tee-3.webp','assets/city/tee-4.webp']}
  ];

  const byId = Object.fromEntries(stops.map((stop) => [stop.id, stop]));
  const state = {current:'accueil', target:'accueil', moving:false, speed:9.2, hovered:null};
  let scene, camera, renderer, clock, car, raycaster, pointer, textureLoader, cityGroup, lookTarget;
  const buildingGroups = new Map();
  const interactive = [];
  const wheels = [];

  function init(){
    buildNavigation();
    renderStop(byId.accueil);
    refreshCart();
    setupEvents();
    setupThree();
  }

  function buildNavigation(){
    const nav = document.getElementById('navRail');
    const dock = document.getElementById('routeDock');
    nav.innerHTML = stops.map((stop) => `<button class="nav-button" type="button" data-go="${stop.id}">${stop.label}</button>`).join('');
    dock.innerHTML = stops.map((stop) => `<button class="icon-step" type="button" data-go="${stop.id}" title="${stop.label}"><span class="step-light"></span><span>${stop.short}</span></button>`).join('');
    updateActiveControls('accueil');
  }

  function setupEvents(){
    document.body.addEventListener('click', (event) => {
      const go = event.target.closest('[data-go]');
      if(go){
        event.preventDefault();
        selectStop(go.dataset.go);
        return;
      }
      const add = event.target.closest('[data-add-cart]');
      if(add){
        addToCart(add.dataset.product, Number(add.dataset.price));
        return;
      }
      const buy = event.target.closest('[data-buy-now]');
      if(buy){
        immediatePurchase(buy.dataset.product, Number(buy.dataset.price), buy.dataset.zone);
        return;
      }
      const checkout = event.target.closest('[data-checkout]');
      if(checkout){
        checkoutCart();
        return;
      }
      const secretToggle = event.target.closest('[data-secret-toggle]');
      if(secretToggle){
        const zone = document.getElementById('secretZone');
        if(zone) zone.style.display = zone.style.display === 'block' ? 'none' : 'block';
        return;
      }
      const gallery = event.target.closest('[data-gallery-next]');
      if(gallery) nextProductImage(gallery.dataset.galleryNext);
    });
  }

  function selectStop(id){
    const stop = byId[id];
    if(!stop) return;
    state.target = id;
    renderStop(stop);
    updateActiveControls(id);
    updateBuildingFocus(id);
    window.location.hash = id;
  }

  function updateActiveControls(id){
    document.querySelectorAll('[data-go]').forEach((item) => item.classList.toggle('is-active', item.dataset.go === id));
  }

  function renderStop(stop){
    const panel = document.getElementById('storyPanel');
    const mediaClass = stop.mediaClass ? ` ${stop.mediaClass}` : '';
    panel.innerHTML = `
      <div class="panel-media${mediaClass}"><img src="${localAsset(stop.poster)}" alt="${stop.title}" /></div>
      <span class="kicker">${stop.kicker}</span>
      <h1>${stop.title}</h1>
      <p>${stop.description}</p>
      ${renderStopBody(stop)}
    `;
    wireDynamicForms(stop);
  }

  function renderStopBody(stop){
    if(stop.type === 'music') return renderMusic();
    if(stop.type === 'book') return renderBook();
    if(stop.type === 'merch') return renderMerch();
    if(stop.type === 'cart') return renderCart();
    if(stop.type === 'contact') return renderContact();
    return renderActions(stop.actions || []);
  }

  function renderActions(actions){
    if(!actions.length) return '';
    return `<div class="panel-actions">${actions.map((action) => {
      if(action.kind === 'link') return `<a class="action" href="${action.href}" target="_blank" rel="noopener">${action.label}</a>`;
      if(action.kind === 'email') return `<a class="action" href="mailto:${contactEmail}">${action.label}</a>`;
      return `<button class="ghost-action" type="button" data-go="${action.target}">${action.label}</button>`;
    }).join('')}</div>`;
  }

  function renderMusic(){
    return `
      <div class="album-list">
        ${albums.map((album) => `
          <div class="album-row">
            <img src="${localAsset(album.image)}" alt="${album.title}" />
            <div>
              <div class="row-title">${album.title}</div>
              <div class="row-meta">${album.meta}</div>
              <div class="row-actions"><a class="tiny-action" href="${album.href}" target="_blank" rel="noopener">Écouter</a></div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  function renderBook(){
    return `
      <div class="product-list">
        <div class="product-row">
          <img src="${localAsset('assets/cover.webp')}" alt="Livre De la méthode rigide et scrupuleuse" />
          <div>
            <div class="row-title">Livre numérique</div>
            <div class="row-meta">5 $</div>
            <div class="row-actions">
              <button class="tiny-action" type="button" data-buy-now data-product="Livre - De la méthode" data-price="5" data-zone="paypal-zone-book">Acheter</button>
              <button class="tiny-action" type="button" data-add-cart data-product="Livre - De la méthode" data-price="5">Ajouter</button>
              <button class="tiny-action" type="button" data-secret-toggle>Code secret</button>
            </div>
          </div>
        </div>
      </div>
      <div class="paypal-zone" id="paypal-zone-book"></div>
      <div class="secret-zone" id="secretZone">
        <form id="secretForm">
          <input class="field" type="text" id="secretCode" name="code" placeholder="Code secret" required />
          <input class="field" type="email" id="secretMail" name="email" placeholder="Votre email" required />
          <button class="action" type="submit">Valider</button>
        </form>
        <a class="action secret-download" id="secretDownload" href="${localAsset('assets/city/book.pdf')}" download>Télécharger le livre</a>
      </div>
    `;
  }

  function renderMerch(){
    return `
      <div class="product-list">
        ${products.map((product) => `
          <div class="product-row">
            <img src="${localAsset(product.image)}" alt="${product.title}" id="${product.id}-image" />
            <div>
              <div class="row-title">${product.title}</div>
              <div class="row-meta">${product.price} $</div>
              <div class="row-actions">
                <button class="tiny-action" type="button" data-gallery-next="${product.id}">Voir</button>
                <button class="tiny-action" type="button" data-buy-now data-product="${product.title}" data-price="${product.price}" data-zone="paypal-zone-${product.id}">Acheter</button>
                <button class="tiny-action" type="button" data-add-cart data-product="${product.title}" data-price="${product.price}">Ajouter</button>
              </div>
              <div class="paypal-zone" id="paypal-zone-${product.id}"></div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  function renderCart(){
    if(!cart.length){
      return `<div class="cart-list"><div class="cart-row"><div><div class="row-title">Panier vide</div><div class="row-meta">Aucun article pour le moment.</div></div></div></div><div class="panel-actions"><button class="action" type="button" data-go="merch">Voir la boutique</button></div>`;
    }
    const total = cart.reduce((sum,item) => sum + item.price, 0);
    return `
      <div class="cart-list">
        ${cart.map((item) => `<div class="cart-row"><div><div class="row-title">${item.product}</div><div class="row-meta">${item.price} $</div></div></div>`).join('')}
      </div>
      <p style="margin-top:12px;color:#fff;font-weight:800">Total : ${total.toFixed(2)} $</p>
      <div class="panel-actions"><button class="action" type="button" data-checkout>Paiement</button></div>
      <div class="paypal-zone" id="paypal-zone-cart"></div>
    `;
  }

  function renderContact(){
    return `
      <p>Pour toute demande : <a class="text-link" href="mailto:${contactEmail}">${contactEmail}</a></p>
      <div class="panel-actions">
        <a class="action" href="mailto:${contactEmail}">Email</a>
        <a class="ghost-action" href="https://www.youtube.com/@shuklel" target="_blank" rel="noopener">YouTube</a>
        <a class="ghost-action" href="https://www.instagram.com/ultimate_dini/" target="_blank" rel="noopener">Instagram</a>
      </div>
    `;
  }

  function wireDynamicForms(stop){
    if(stop.type !== 'book') return;
    const form = document.getElementById('secretForm');
    if(!form) return;
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const code = document.getElementById('secretCode').value.trim();
      const email = document.getElementById('secretMail').value.trim();
      if(code === '500ANS'){
        document.getElementById('secretDownload').style.display = 'inline-flex';
        form.style.display = 'none';
        fetch('https://formspree.io/f/xldjpwzz', {
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify({_subject:'Accès livre gratuit', code, email})
        }).catch(() => {});
      }else{
        alert('Code incorrect, réessayez.');
      }
    });
  }

  function addToCart(product, price){
    cart.push({product, price});
    localStorage.setItem('shuklel-cart', JSON.stringify(cart));
    refreshCart();
    if(state.target === 'cart') renderStop(byId.cart);
  }

  function refreshCart(){
    const badge = document.getElementById('cartCountBadge');
    if(!badge) return;
    badge.textContent = String(cart.length);
  }

  function immediatePurchase(item, price, zoneId){
    const zone = document.getElementById(zoneId);
    if(!zone) return;
    if(zone.dataset.rendered) return;
    if(!window.paypal || !window.paypal.Buttons){
      alert('Paiement PayPal indisponible pour le moment.');
      return;
    }
    zone.style.minHeight = '45px';
    window.paypal.Buttons({
      createOrder:(_, actions) => actions.order.create({purchase_units:[{description:item, amount:{value:price.toFixed(2)}}]}),
      onApprove:(_, actions) => actions.order.capture().then((details) => {
        alert('Merci ' + details.payer.name.given_name + ' ! Paiement confirmé.');
        sendPurchaseEmail(item, price);
      })
    }).render('#' + zoneId);
    zone.dataset.rendered = '1';
  }

  function checkoutCart(){
    if(!cart.length){
      alert('Panier vide');
      return;
    }
    const zone = document.getElementById('paypal-zone-cart');
    if(!zone || zone.dataset.rendered) return;
    if(!window.paypal || !window.paypal.Buttons){
      alert('Paiement PayPal indisponible pour le moment.');
      return;
    }
    const total = cart.reduce((sum,item) => sum + item.price, 0).toFixed(2);
    zone.style.minHeight = '45px';
    window.paypal.Buttons({
      createOrder:(_, actions) => actions.order.create({purchase_units:[{amount:{value:total}}]}),
      onApprove:(_, actions) => actions.order.capture().then((details) => {
        sendPurchaseEmail('Commande Panier', Number(total));
        alert('Merci ' + details.payer.name.given_name + ' ! Paiement OK.');
        cart.length = 0;
        localStorage.setItem('shuklel-cart', JSON.stringify(cart));
        refreshCart();
        renderStop(byId.cart);
      })
    }).render('#paypal-zone-cart');
    zone.dataset.rendered = '1';
  }

  function sendPurchaseEmail(product, price){
    fetch('https://formspree.io/f/xldjpwzz', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({_subject:'Achat sur le site Shuklel', message:`Produit : ${product}\nMontant : ${price} $`, email:contactEmail})
    }).catch(() => {});
  }

  function nextProductImage(id){
    const product = products.find((item) => item.id === id);
    const img = document.getElementById(id + '-image');
    if(!product || !img) return;
    const current = Number(img.dataset.index || 0);
    const next = (current + 1) % product.gallery.length;
    img.dataset.index = String(next);
    img.src = localAsset(product.gallery[next]);
  }

  function setupThree(){
    const mount = document.getElementById('cityCanvas');
    if(!window.THREE){
      mount.innerHTML = `<div class="fallback"><div class="fallback-inner"><img src="${localAsset('assets/city/logo.webp')}" alt="Logo Shuklel" /><h1>Shuklel</h1><p>La ville 3D n'a pas pu charger.</p></div></div>`;
      return;
    }

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x071018, 0.022);
    camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.1, 220);
    camera.position.set(-25, 10, 22);
    lookTarget = new THREE.Vector3(-20, 3.5, -6);

    renderer = new THREE.WebGLRenderer({antialias:true, alpha:true, powerPreference:'high-performance'});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    clock = new THREE.Clock();
    textureLoader = new THREE.TextureLoader();
    raycaster = new THREE.Raycaster();
    pointer = new THREE.Vector2();
    cityGroup = new THREE.Group();
    scene.add(cityGroup);

    addLights();
    addSky();
    addGround();
    addRoad();
    addMainBuildings();
    addSkyline();
    addStreetDetails();
    car = createCar();
    scene.add(car);
    car.position.set(byId.accueil.road.x, .38, 0);
    updateBuildingFocus('accueil');

    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerleave', () => setHover(null));
    renderer.domElement.addEventListener('click', onCanvasClick);
    window.addEventListener('resize', onResize);
    animate();
  }

  function addLights(){
    scene.add(new THREE.HemisphereLight(0xb7d4e8, 0x09080a, 1.15));
    const moon = new THREE.DirectionalLight(0xe8eef5, 1.2);
    moon.position.set(-22, 34, 20);
    moon.castShadow = true;
    moon.shadow.mapSize.set(1024, 1024);
    scene.add(moon);
    const redGlow = new THREE.PointLight(0xb82935, 1.15, 38);
    redGlow.position.set(20, 11, -12);
    scene.add(redGlow);
    const tealGlow = new THREE.PointLight(0x4eb7c7, 1.05, 42);
    tealGlow.position.set(-14, 10, 12);
    scene.add(tealGlow);
  }

  function addSky(){
    const stars = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    for(let i = 0; i < 1100; i += 1){
      positions.push((Math.random() - .5) * 170, Math.random() * 72 + 18, (Math.random() - .5) * 170);
      const tone = Math.random() > .82 ? .95 : .58;
      colors.push(tone, tone, tone + .08);
    }
    stars.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    stars.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    const material = new THREE.PointsMaterial({size:.11, vertexColors:true, transparent:true, opacity:.82});
    scene.add(new THREE.Points(stars, material));
  }

  function addGround(){
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(120, 90),
      new THREE.MeshStandardMaterial({color:0x07090d, roughness:.74, metalness:.12})
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -.02;
    ground.receiveShadow = true;
    scene.add(ground);
  }

  function addRoad(){
    const road = new THREE.Mesh(
      new THREE.PlaneGeometry(72, 7.8),
      new THREE.MeshStandardMaterial({color:0x11161d, roughness:.48, metalness:.28})
    );
    road.rotation.x = -Math.PI / 2;
    road.position.y = .015;
    road.receiveShadow = true;
    scene.add(road);

    const laneMaterial = new THREE.MeshBasicMaterial({color:0xd6ae72, transparent:true, opacity:.78});
    for(let x = -33; x <= 33; x += 6){
      const lane = new THREE.Mesh(new THREE.PlaneGeometry(2.8, .08), laneMaterial);
      lane.rotation.x = -Math.PI / 2;
      lane.position.set(x, .035, 0);
      scene.add(lane);
    }

    const curbMat = new THREE.MeshStandardMaterial({color:0x1e2630, roughness:.38, metalness:.45});
    [-4.25,4.25].forEach((z) => {
      const curb = new THREE.Mesh(new THREE.BoxGeometry(73, .18, .2), curbMat);
      curb.position.set(0, .11, z);
      curb.receiveShadow = true;
      scene.add(curb);
    });
  }

  function addMainBuildings(){
    stops.forEach((stop, index) => {
      const group = createBuilding(stop, index);
      cityGroup.add(group);
      buildingGroups.set(stop.id, group);
    });
  }

  function createBuilding(stop, index){
    const group = new THREE.Group();
    const b = stop.building;
    group.position.set(b.x, 0, b.z);
    group.userData.stopId = stop.id;

    const windowTexture = createWindowTexture(stop.light, index + 4);
    const material = new THREE.MeshStandardMaterial({
      color:0x151d27,
      roughness:.46,
      metalness:.34,
      map:windowTexture,
      emissive:new THREE.Color(stop.accent),
      emissiveIntensity:.025
    });
    const tower = new THREE.Mesh(new THREE.BoxGeometry(b.w, b.h, b.d), material);
    tower.position.y = b.h / 2;
    tower.castShadow = true;
    tower.receiveShadow = true;
    tower.userData.stopId = stop.id;
    group.add(tower);
    interactive.push(tower);

    const cap = new THREE.Mesh(
      new THREE.BoxGeometry(b.w + .36, .22, b.d + .36),
      new THREE.MeshStandardMaterial({color:0x2b3541, metalness:.72, roughness:.28})
    );
    cap.position.y = b.h + .13;
    group.add(cap);

    const frontZ = b.z < 0 ? b.d / 2 + .035 : -b.d / 2 - .035;
    const poster = createPoster(stop, b.z < 0 ? 0 : Math.PI);
    poster.position.set(0, Math.min(b.h * .56, 6.8), frontZ);
    poster.userData.stopId = stop.id;
    group.add(poster);
    interactive.push(poster);

    const label = createLabel(stop.short, stop.light);
    label.position.set(0, b.h + .55, frontZ + (b.z < 0 ? .04 : -.04));
    label.rotation.y = b.z < 0 ? 0 : Math.PI;
    label.userData.stopId = stop.id;
    group.add(label);
    interactive.push(label);

    const beacon = new THREE.PointLight(stop.accent, .55, 10);
    beacon.position.set(0, b.h + .8, 0);
    group.add(beacon);

    return group;
  }

  function createPoster(stop, rotationY){
    const texture = textureLoader.load(localAsset(stop.poster));
    texture.encoding = THREE.sRGBEncoding;
    const mat = new THREE.MeshBasicMaterial({map:texture});
    const poster = new THREE.Mesh(new THREE.PlaneGeometry(2.75, 3.72), mat);
    poster.rotation.y = rotationY;
    return poster;
  }

  function createWindowTexture(color, seed){
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#101821';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(0,0,0,.26)';
    for(let y = 0; y < 512; y += 22) ctx.fillRect(0, y, 256, 2);
    const palette = [color, '#d9e2eb', '#f0b64d', '#b82935'];
    let n = seed * 101;
    for(let y = 24; y < 486; y += 34){
      for(let x = 18; x < 230; x += 34){
        n = (n * 9301 + 49297) % 233280;
        if(n / 233280 > .47){
          ctx.fillStyle = palette[(x + y + seed) % palette.length];
          ctx.globalAlpha = .34 + ((x + seed) % 6) * .07;
          ctx.fillRect(x, y, 13, 18);
          ctx.globalAlpha = .14;
          ctx.fillRect(x - 3, y - 3, 19, 24);
          ctx.globalAlpha = 1;
        }
      }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);
    texture.encoding = THREE.sRGBEncoding;
    return texture;
  }

  function createLabel(text, color){
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 512, 128);
    ctx.fillStyle = 'rgba(5,8,12,.82)';
    ctx.fillRect(18, 28, 476, 72);
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.strokeRect(18, 28, 476, 72);
    ctx.font = '700 38px Cinzel, Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#f3f5f6';
    ctx.fillText(text, 256, 65, 430);
    const texture = new THREE.CanvasTexture(canvas);
    texture.encoding = THREE.sRGBEncoding;
    return new THREE.Mesh(new THREE.PlaneGeometry(3.8, .95), new THREE.MeshBasicMaterial({map:texture, transparent:true}));
  }

  function addSkyline(){
    const matColors = [0x0c121a,0x121922,0x151d27,0x0e151d];
    for(let i = 0; i < 46; i += 1){
      const side = i % 2 === 0 ? -1 : 1;
      const x = -34 + i * 1.55 + (Math.random() - .5) * 1.8;
      const z = side * (18 + Math.random() * 14);
      const h = 5 + Math.random() * 13;
      const w = 1.4 + Math.random() * 2.4;
      const d = 1.6 + Math.random() * 2.8;
      const material = new THREE.MeshStandardMaterial({
        color:matColors[i % matColors.length],
        roughness:.58,
        metalness:.22,
        map:createWindowTexture(i % 3 === 0 ? '#4eb7c7' : '#d9e2eb', i + 20),
        emissive:new THREE.Color(i % 5 === 0 ? 0xb82935 : 0x4eb7c7),
        emissiveIntensity:.018
      });
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
      mesh.position.set(x, h / 2, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      cityGroup.add(mesh);
    }
  }

  function addStreetDetails(){
    const postMat = new THREE.MeshStandardMaterial({color:0x202b36, metalness:.65, roughness:.25});
    const lampMat = new THREE.MeshBasicMaterial({color:0xf0b64d});
    for(let x = -32; x <= 32; x += 8){
      [-5.2,5.2].forEach((z) => {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(.045, .06, 2.2, 10), postMat);
        pole.position.set(x, 1.1, z);
        scene.add(pole);
        const bulb = new THREE.Mesh(new THREE.SphereGeometry(.16, 12, 12), lampMat);
        bulb.position.set(x, 2.26, z);
        scene.add(bulb);
        const light = new THREE.PointLight(0xf0b64d, .46, 8);
        light.position.set(x, 2.2, z);
        scene.add(light);
      });
    }
  }

  function createCar(){
    const group = new THREE.Group();
    const blackMetal = new THREE.MeshStandardMaterial({color:0x07080a, metalness:.8, roughness:.24});
    const chrome = new THREE.MeshStandardMaterial({color:0xd9e2eb, metalness:.92, roughness:.18});
    const glass = new THREE.MeshStandardMaterial({color:0x172330, metalness:.25, roughness:.08, transparent:true, opacity:.78});
    const red = new THREE.MeshBasicMaterial({color:0xb82935});
    const light = new THREE.MeshBasicMaterial({color:0xf4e4b8});

    const body = new THREE.Mesh(new THREE.BoxGeometry(2.8, .52, 1.22), blackMetal);
    body.position.y = .42;
    body.castShadow = true;
    group.add(body);

    const hood = new THREE.Mesh(new THREE.BoxGeometry(1.05, .12, 1.28), chrome);
    hood.position.set(.58, .74, 0);
    hood.castShadow = true;
    group.add(hood);

    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.1, .54, .9), glass);
    cabin.position.set(-.36, .88, 0);
    cabin.castShadow = true;
    group.add(cabin);

    const tail = new THREE.Mesh(new THREE.BoxGeometry(.18, .15, .92), red);
    tail.position.set(-1.48, .47, 0);
    group.add(tail);

    const headLeft = new THREE.Mesh(new THREE.BoxGeometry(.12, .12, .25), light);
    headLeft.position.set(1.47, .5, -.33);
    const headRight = headLeft.clone();
    headRight.position.z = .33;
    group.add(headLeft, headRight);

    const wheelMat = new THREE.MeshStandardMaterial({color:0x040506, metalness:.5, roughness:.4});
    const wheelGeo = new THREE.CylinderGeometry(.27, .27, .24, 24);
    [[-.9,-.66],[.9,-.66],[-.9,.66],[.9,.66]].forEach(([x,z]) => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.rotation.x = Math.PI / 2;
      wheel.position.set(x, .2, z);
      wheel.castShadow = true;
      wheels.push(wheel);
      group.add(wheel);
    });

    const coneMat = new THREE.MeshBasicMaterial({color:0xf4e4b8, transparent:true, opacity:.16, depthWrite:false});
    const coneGeo = new THREE.ConeGeometry(.48, 4.2, 24, 1, true);
    [-.34,.34].forEach((z) => {
      const beam = new THREE.Mesh(coneGeo, coneMat);
      beam.rotation.z = -Math.PI / 2;
      beam.position.set(3.35, .42, z);
      group.add(beam);
    });

    const spot = new THREE.SpotLight(0xf4e4b8, 1.4, 18, .34, .45, 1.2);
    spot.position.set(1.3, .62, 0);
    const target = new THREE.Object3D();
    target.position.set(8, .15, 0);
    spot.target = target;
    group.add(spot, target);
    return group;
  }

  function onPointerMove(event){
    updatePointer(event);
    const hit = getIntersection();
    setHover(hit ? hit.id : null);
  }

  function onCanvasClick(event){
    updatePointer(event);
    const hit = getIntersection();
    if(hit) selectStop(hit.id);
  }

  function updatePointer(event){
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  function getIntersection(){
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(interactive, true);
    if(!hits.length) return null;
    let obj = hits[0].object;
    while(obj){
      if(obj.userData && obj.userData.stopId) return byId[obj.userData.stopId];
      obj = obj.parent;
    }
    return null;
  }

  function setHover(id){
    state.hovered = id;
    if(renderer && renderer.domElement) renderer.domElement.style.cursor = id ? 'pointer' : 'default';
  }

  function updateBuildingFocus(id){
    buildingGroups.forEach((group, key) => {
      group.traverse((obj) => {
        if(obj.material && obj.material.emissiveIntensity !== undefined){
          obj.material.emissiveIntensity = key === id ? .11 : .025;
        }
      });
      group.scale.setScalar(key === id ? 1.035 : 1);
    });
  }

  function animate(){
    requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), .033);
    updateCar(dt);
    updateCamera();
    const time = clock.elapsedTime;
    buildingGroups.forEach((group, key) => {
      const active = key === state.target;
      group.position.y = active ? Math.sin(time * 2.4) * .035 : 0;
    });
    renderer.render(scene, camera);
  }

  function updateCar(dt){
    const stop = byId[state.target];
    const dx = stop.road.x - car.position.x;
    if(Math.abs(dx) > .045){
      const dir = Math.sign(dx);
      car.rotation.y = dir >= 0 ? 0 : Math.PI;
      car.position.x += dir * Math.min(Math.abs(dx), state.speed * dt);
      state.moving = true;
      wheels.forEach((wheel) => { wheel.rotation.y -= dir * dt * 9; });
    }else if(state.moving){
      state.moving = false;
      state.current = state.target;
      updateBuildingFocus(state.current);
    }
    car.position.z += (stop.road.z - car.position.z) * .08;
  }

  function updateCamera(){
    const stop = byId[state.target];
    const side = stop.building.z < 0 ? 1 : -1;
    const mobile = window.innerWidth < 720;
    const desired = new THREE.Vector3(
      stop.road.x + (mobile ? 0 : side * 2.4),
      mobile ? 11.5 : 9.6,
      side * (mobile ? 25 : 20)
    );
    camera.position.lerp(desired, .045);
    const desiredLook = new THREE.Vector3(stop.building.x, mobile ? 4.5 : 4.2, stop.building.z * .55);
    lookTarget.lerp(desiredLook, .08);
    camera.lookAt(lookTarget);
  }

  function onResize(){
    if(!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  init();
})();
