(() => {
  'use strict';

  const localAsset = (path) => path.split('/').map(encodeURIComponent).join('/');
  const contactEmail = 'shukfit' + '@' + 'gmail.com';
  const cart = JSON.parse(localStorage.getItem('shuklel-cart') || '[]');
  const mobileQuery = window.matchMedia('(max-width: 760px), (pointer: coarse)');
  const isMobileScene = () => mobileQuery.matches;

  const stops = [
    {
      id:'accueil', label:'Accueil', short:'Shuklel', kicker:'Montréal nocturne', title:'Shuklel',
      description:'Artiste, producteur et rappeur basé à Montréal, Shuklel fusionne rap, afro-beat et synthwave. Plus de 150 000 écoutes et 5 000 abonnés soutiennent déjà son parcours.',
      poster:'assets/city/logo.webp', mediaClass:'logo-fit', accent:0xd9e2eb, light:'#d9e2eb',
      road:{x:-15,z:0}, building:{x:-15,z:-5.2,w:8.8,h:8.8,d:2.7},
      actions:[
        {kind:'link', label:'YouTube', href:'https://www.youtube.com/@shuklel'},
        {kind:'link', label:'Instagram', href:'https://www.instagram.com/ultimate_dini/'},
        {kind:'email', label:'Contact'}
      ]
    },
    {
      id:'album', label:'Album', short:'RS Vol.2', kicker:'Projet mis en avant', title:'Rigide et Scrupuleux Vol.2',
      description:'Un nouveau chapitre se prépare. Fragments, nuit, chrome et tension : entre dans le teasing de Rigide et Scrupuleux Vol.2.',
      poster:'assets/cover.webp', accent:0xd6ae72, light:'#d6ae72',
      road:{x:-9,z:0}, building:{x:-9,z:5.2,w:9.0,h:10.2,d:2.8},
      actions:[
        {kind:'link', label:'Écouter le projet', href:'https://distrokid.com/hyperfollow/shuklel/rigide-et-scrupuleux'},
        {kind:'go', label:'Discographie', target:'music'},
        {kind:'go', label:'Contact', target:'contact'}
      ]
    },
    {
      id:'music', label:'Musique', short:'Music', kicker:'Catalogue', title:'Discographie',
      description:'Choisis un projet dans la discographie, puis clique pour streamer. La façade suit ta sélection.',
      poster:'assets/city/rigide.webp', accent:0x4eb7c7, light:'#4eb7c7',
      road:{x:-3,z:0}, building:{x:-3,z:-5.2,w:9.0,h:9.8,d:2.8},
      type:'music'
    },
    {
      id:'merch', label:'Boutique', short:'Boutique', kicker:'Boutique', title:'Boutique Shuklel',
      description:'Fais défiler les articles, touche la façade pour changer le visuel, puis ajoute la pièce au panier.',
      poster:'assets/city/hoodie-1.webp', accent:0x72b77b, light:'#72b77b',
      road:{x:3,z:0}, building:{x:3,z:5.2,w:9.0,h:10.0,d:2.8},
      type:'merch', viewerProduct:'hoodie'
    },
    {
      id:'cart', label:'Panier', short:'Panier', kicker:'Commande', title:'Panier',
      description:'Les articles ajoutés restent disponibles pendant la visite.',
      poster:'assets/city/logo.webp', accent:0xf0b64d, light:'#f0b64d',
      road:{x:9,z:0}, building:{x:9,z:-5.2,w:8.4,h:8.8,d:2.7},
      type:'cart'
    },
    {
      id:'contact', label:'Contact', short:'Contact', kicker:'Réseaux', title:'Contact & Réseaux',
      description:'Booking, questions, précommande ou collaboration : le bureau reste ouvert au bout de la route.',
      poster:'assets/city/logo.webp', accent:0xd9e2eb, light:'#d9e2eb',
      road:{x:15,z:0}, building:{x:15,z:5.2,w:8.4,h:9.2,d:2.7},
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
  const state = {current:'accueil', target:'accueil', moving:false, speed:18, hovered:null};
  const musicState = {albumIndex:0};
  const merchState = {productId:'hoodie', imageIndex:{hoodie:0, tshirt:0}};
  let scene, camera, renderer, clock, car, raycaster, pointer, textureLoader, cityGroup, lookTarget, homeBillboard;
  const buildingGroups = new Map();
  const posterMeshes = new Map();
  const interactive = [];
  const wheels = [];
  let touchStart = null;

  function init(){
    const requested = window.location.hash.replace('#', '');
    const initial = byId[requested] ? requested : 'accueil';
    state.current = initial;
    state.target = initial;
    buildNavigation();
    renderStop(byId[initial]);
    refreshCart();
    setupEvents();
    setupThree();
  }

  function buildNavigation(){
    const nav = document.getElementById('navRail');
    const dock = document.getElementById('routeDock');
    if(nav) nav.innerHTML = stops.map((stop) => `<button class="nav-button" type="button" data-go="${stop.id}">${stop.label}</button>`).join('');
    dock.innerHTML = stops.map((stop) => {
      const badge = stop.id === 'cart' ? '<span class="dock-badge" id="cartCountDock">0</span>' : '';
      return `<button class="icon-step" type="button" data-go="${stop.id}" title="${stop.label}"><span class="step-light"></span><span>${stop.short}</span>${badge}</button>`;
    }).join('');
    updateActiveControls(state.target);
  }

  function setupEvents(){
    document.body.addEventListener('click', (event) => {
      const go = event.target.closest('[data-go]');
      if(go){
        event.preventDefault();
        selectStop(go.dataset.go);
        return;
      }
      const floatingAdd = event.target.closest('[data-floating-add]');
      if(floatingAdd){
        addCurrentProductToCart();
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
      const gallery = event.target.closest('[data-gallery-next]');
      if(gallery){
        nextProductImage(gallery.dataset.galleryNext);
        return;
      }
      const openViewer = event.target.closest('[data-open-viewer]');
      if(openViewer){
        const productImage = document.getElementById(openViewer.dataset.openViewer + '-image');
        openProductViewer(openViewer.dataset.openViewer, Number(productImage?.dataset.index || 0));
        return;
      }
      const viewerStep = event.target.closest('[data-viewer-step]');
      if(viewerStep){
        stepProductViewer(viewerStep.dataset.viewerProduct, Number(viewerStep.dataset.viewerStep));
        return;
      }
      if(event.target.closest('[data-viewer-close]') || event.target.classList.contains('product-viewer')){
        closeProductViewer();
        return;
      }
      const albumSelect = event.target.closest('[data-album-index]');
      if(albumSelect && !event.target.closest('a,button')){
        selectAlbum(Number(albumSelect.dataset.albumIndex), true);
        return;
      }
      const productSelect = event.target.closest('[data-product-select]');
      if(productSelect && !event.target.closest('a,button')){
        selectProduct(productSelect.dataset.productSelect, true);
      }
    });

    document.addEventListener('keydown', (event) => {
      const viewer = document.querySelector('.product-viewer');
      if(!viewer) return;
      if(event.key === 'Escape') closeProductViewer();
      if(event.key === 'ArrowRight') stepProductViewer(viewer.dataset.product, 1);
      if(event.key === 'ArrowLeft') stepProductViewer(viewer.dataset.product, -1);
    });

    setupSwipeEvents();

    window.addEventListener('hashchange', () => {
      const requested = window.location.hash.replace('#', '');
      if(byId[requested] && requested !== state.target) selectStop(requested);
    });
  }

  function setupSwipeEvents(){
    const experience = document.getElementById('cityExperience');
    if(!experience) return;
    experience.addEventListener('touchstart', (event) => {
      if(event.touches.length !== 1) return;
      const touch = event.touches[0];
      touchStart = {x:touch.clientX, y:touch.clientY};
    }, {passive:true});

    experience.addEventListener('touchend', (event) => {
      if(!touchStart || !event.changedTouches.length) return;
      const touch = event.changedTouches[0];
      const dx = touch.clientX - touchStart.x;
      const dy = touch.clientY - touchStart.y;
      touchStart = null;
      if(Math.abs(dx) < 56 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
      selectRelativeStop(dx < 0 ? 1 : -1);
    }, {passive:true});
  }

  function selectRelativeStop(delta){
    const index = stops.findIndex((stop) => stop.id === state.target);
    const next = Math.max(0, Math.min(stops.length - 1, index + delta));
    if(next !== index) selectStop(stops[next].id);
  }

  function selectStop(id){
    const stop = byId[id];
    if(!stop) return;
    closeProductViewer();
    state.target = id;
    renderStop(stop);
    syncSectionVisuals(stop);
    updateActiveControls(id);
    updateBuildingFocus(id);
    updateFloatingAdd();
    window.location.hash = id;
  }

  function updateActiveControls(id){
    document.querySelectorAll('[data-go]').forEach((item) => item.classList.toggle('is-active', item.dataset.go === id));
  }

  function renderStop(stop){
    const panel = document.getElementById('storyPanel');
    panel.dataset.section = stop.id;
    panel.classList.toggle('is-home', stop.id === 'accueil');
    panel.innerHTML = `
      <span class="kicker">${stop.kicker}</span>
      <h1>${stop.title}</h1>
      ${stop.id === 'accueil' ? '' : `<p>${stop.description}</p>`}
      ${renderStopBody(stop)}
    `;
    requestAnimationFrame(() => wireSectionControls(stop));
  }

  function renderStopBody(stop){
    if(stop.type === 'music') return renderMusic();
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
      <div class="album-list" data-scroll-menu="music">
        ${albums.map((album, index) => `
          <div class="album-row text-only${index === musicState.albumIndex ? ' is-active' : ''}" data-album-index="${index}" role="button" tabindex="0">
            <div>
              <div class="row-title">${album.title}</div>
              <div class="row-meta">${album.meta}</div>
              <div class="row-actions"><a class="tiny-action" href="${album.href}" target="_blank" rel="noopener">Streamer</a></div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  function renderMerch(){
    return `
      <div class="product-list" data-scroll-menu="merch">
        ${products.map((product) => `
          <div class="product-row${product.id === merchState.productId ? ' is-active' : ''}" data-product-select="${product.id}" role="button" tabindex="0">
            <img class="product-thumb" src="${localAsset(product.gallery[merchState.imageIndex[product.id] || 0])}" alt="${product.title}" id="${product.id}-image" data-index="${merchState.imageIndex[product.id] || 0}" />
            <div>
              <div class="row-title">${product.title}</div>
              <div class="row-meta">${product.price} $</div>
              <div class="row-actions">
                <button class="tiny-action" type="button" data-gallery-next="${product.id}">Image</button>
                <button class="tiny-action" type="button" data-buy-now data-product="${product.title}" data-price="${product.price}" data-zone="paypal-zone-${product.id}">Acheter</button>
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

  function wireSectionControls(stop){
    if(stop.type === 'music'){
      selectAlbum(musicState.albumIndex, false);
      wireNearestScroll('.album-list', '.album-row', (row) => selectAlbum(Number(row.dataset.albumIndex), false));
    }
    if(stop.type === 'merch'){
      selectProduct(merchState.productId, false);
      wireNearestScroll('.product-list', '.product-row', (row) => selectProduct(row.dataset.productSelect, false));
    }
  }

  function wireNearestScroll(listSelector, rowSelector, onSelect){
    const list = document.querySelector(listSelector);
    if(!list || list.dataset.wired === '1') return;
    list.dataset.wired = '1';
    let frame = 0;
    list.addEventListener('scroll', () => {
      if(frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const rows = Array.from(list.querySelectorAll(rowSelector));
        if(!rows.length) return;
        const listRect = list.getBoundingClientRect();
        const center = listRect.top + listRect.height / 2;
        const nearest = rows.reduce((best, row) => {
          const rect = row.getBoundingClientRect();
          const distance = Math.abs(rect.top + rect.height / 2 - center);
          return distance < best.distance ? {row, distance} : best;
        }, {row:rows[0], distance:Infinity}).row;
        onSelect(nearest);
      });
    }, {passive:true});
  }

  function selectAlbum(index, focusRow){
    const albumIndex = Math.max(0, Math.min(albums.length - 1, index || 0));
    musicState.albumIndex = albumIndex;
    document.querySelectorAll('[data-album-index]').forEach((row) => {
      const active = Number(row.dataset.albumIndex) === albumIndex;
      row.classList.toggle('is-active', active);
      if(active && focusRow) row.scrollIntoView({block:'nearest', behavior:'smooth'});
    });
    if(state.target === 'music') setBuildingPoster('music', albums[albumIndex].image);
  }

  function selectProduct(id, focusRow){
    const product = products.find((item) => item.id === id) || products[0];
    merchState.productId = product.id;
    document.querySelectorAll('[data-product-select]').forEach((row) => {
      const active = row.dataset.productSelect === product.id;
      row.classList.toggle('is-active', active);
      if(active && focusRow) row.scrollIntoView({block:'nearest', behavior:'smooth'});
    });
    const imageIndex = merchState.imageIndex[product.id] || 0;
    const img = document.getElementById(product.id + '-image');
    if(img){
      img.dataset.index = String(imageIndex);
      img.src = localAsset(product.gallery[imageIndex]);
    }
    if(state.target === 'merch') setBuildingPoster('merch', product.gallery[imageIndex]);
    updateFloatingAdd();
  }

  function syncSectionVisuals(stop){
    if(stop.type === 'music'){
      selectAlbum(musicState.albumIndex, false);
      return;
    }
    if(stop.type === 'merch'){
      selectProduct(merchState.productId, false);
      return;
    }
    setBuildingPoster(stop.id, stop.poster);
  }

  function currentProduct(){
    return products.find((item) => item.id === merchState.productId) || products[0];
  }

  function addCurrentProductToCart(){
    const product = currentProduct();
    addToCart(product.title, product.price);
  }

  function updateFloatingAdd(){
    const button = document.getElementById('floatingAdd');
    if(!button) return;
    const visible = state.target === 'merch';
    button.classList.toggle('is-visible', visible);
    if(!visible) return;
    const product = currentProduct();
    button.setAttribute('aria-label', `Ajouter ${product.title} au panier`);
    button.innerHTML = `<span aria-hidden="true">+</span><strong>Ajouter</strong><small>${product.price} $</small>`;
  }

  function addToCart(product, price){
    cart.push({product, price});
    localStorage.setItem('shuklel-cart', JSON.stringify(cart));
    refreshCart();
    if(state.target === 'cart') renderStop(byId.cart);
  }

  function refreshCart(){
    const badge = document.getElementById('cartCountBadge');
    const dockBadge = document.getElementById('cartCountDock');
    if(badge) badge.textContent = String(cart.length);
    if(dockBadge) dockBadge.textContent = String(cart.length);
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
    if(!product) return;
    const current = merchState.imageIndex[id] || 0;
    const next = (current + 1) % product.gallery.length;
    merchState.imageIndex[id] = next;
    if(img){
      img.dataset.index = String(next);
      img.src = localAsset(product.gallery[next]);
    }
    if(state.target === 'merch' && merchState.productId === id){
      setBuildingPoster('merch', product.gallery[next]);
    }
  }

  function setBuildingPoster(stopId, imagePath){
    const poster = posterMeshes.get(stopId);
    if(!poster || !textureLoader || !imagePath) return;
    poster.userData.imagePath = imagePath;
    textureLoader.load(localAsset(imagePath), (texture) => {
      if(poster.userData.imagePath !== imagePath) return;
      configurePosterTexture(texture);
      if(poster.material.map) poster.material.map.dispose();
      poster.material.map = texture;
      poster.material.needsUpdate = true;
    });
  }

  function configurePosterTexture(texture){
    texture.encoding = THREE.sRGBEncoding;
    texture.anisotropy = renderer ? Math.min(renderer.capabilities.getMaxAnisotropy(), isMobileScene() ? 4 : 8) : 1;
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
  }

  function openProductViewer(id, index = 0){
    const product = products.find((item) => item.id === id);
    if(!product) return;
    closeProductViewer();
    const viewer = document.createElement('div');
    viewer.className = 'product-viewer';
    viewer.dataset.product = id;
    viewer.dataset.index = String(index);
    viewer.innerHTML = productViewerMarkup(product, index);
    document.body.appendChild(viewer);
  }

  function productViewerMarkup(product, index){
    const image = localAsset(product.gallery[index]);
    return `
      <div class="product-viewer-card" role="dialog" aria-modal="true" aria-label="${product.title}">
        <button class="viewer-close" type="button" data-viewer-close aria-label="Fermer">×</button>
        <button class="viewer-arrow viewer-prev" type="button" data-viewer-product="${product.id}" data-viewer-step="-1" aria-label="Image précédente">‹</button>
        <img class="viewer-image" src="${image}" alt="${product.title}" />
        <button class="viewer-arrow viewer-next" type="button" data-viewer-product="${product.id}" data-viewer-step="1" aria-label="Image suivante">›</button>
        <div class="viewer-caption">
          <strong>${product.title}</strong>
          <span>${product.price} $</span>
        </div>
      </div>
    `;
  }

  function stepProductViewer(id, delta){
    const product = products.find((item) => item.id === id);
    const viewer = document.querySelector('.product-viewer');
    if(!product || !viewer) return;
    const current = Number(viewer.dataset.index || 0);
    const next = (current + delta + product.gallery.length) % product.gallery.length;
    viewer.dataset.index = String(next);
    viewer.innerHTML = productViewerMarkup(product, next);
  }

  function closeProductViewer(){
    const viewer = document.querySelector('.product-viewer');
    if(viewer) viewer.remove();
  }

  function setupThree(){
    const mount = document.getElementById('cityCanvas');
    if(!window.THREE){
      mount.innerHTML = `<div class="fallback"><div class="fallback-inner"><img src="${localAsset('assets/city/logo.webp')}" alt="Logo Shuklel" /><h1>Shuklel</h1><p>La ville 3D n'a pas pu charger.</p></div></div>`;
      return;
    }

    const mobile = isMobileScene();
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x071018, mobile ? 0.014 : 0.02);
    camera = new THREE.PerspectiveCamera(mobile ? 48 : 52, window.innerWidth / window.innerHeight, 0.1, 160);
    camera.position.set(-25, 10, 22);
    lookTarget = new THREE.Vector3(-20, 3.5, -6);

    renderer = new THREE.WebGLRenderer({antialias:!mobile, alpha:true, powerPreference:mobile ? 'low-power' : 'high-performance'});
    renderer.setPixelRatio(scenePixelRatio());
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = mobile ? 1 : 1.08;
    renderer.shadowMap.enabled = !mobile;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    clock = new THREE.Clock();
    textureLoader = new THREE.TextureLoader();
    raycaster = new THREE.Raycaster();
    pointer = new THREE.Vector2();
    cityGroup = new THREE.Group();
    scene.add(cityGroup);

    addLights();
    addRoad();
    addMainBuildings();
    homeBillboard = createHomeBillboard();
    scene.add(homeBillboard);
    if(!mobile) addStreetDetails();
    car = createCar();
    scene.add(car);
    car.position.set(byId[state.target].road.x, .38, 0);
    updateBuildingFocus(state.target);
    syncSectionVisuals(byId[state.target]);
    updateFloatingAdd();

    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerleave', () => setHover(null));
    renderer.domElement.addEventListener('click', onCanvasClick);
    window.addEventListener('resize', onResize);
    animate();
  }

  function scenePixelRatio(){
    const limit = isMobileScene() ? 1.15 : 1.7;
    return Math.min(window.devicePixelRatio || 1, limit);
  }

  function addLights(){
    const mobile = isMobileScene();
    scene.add(new THREE.HemisphereLight(0xb7d4e8, 0x09080a, mobile ? 1.35 : 1.15));
    const moon = new THREE.DirectionalLight(0xe8eef5, mobile ? .82 : 1.2);
    moon.position.set(-22, 34, 20);
    moon.castShadow = !mobile;
    if(!mobile) moon.shadow.mapSize.set(1024, 1024);
    scene.add(moon);
    if(mobile) return;
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
    const mobile = isMobileScene();
    group.position.set(b.x, 0, b.z);
    group.userData.stopId = stop.id;

    const windowTexture = createWindowTexture(stop.light, index + 4);
    windowTexture.repeat.set(Math.max(1.8, b.w / 2.7), Math.max(1.4, b.h / 5.2));
    const material = new THREE.MeshStandardMaterial({
      color:0x151d27,
      roughness:.38,
      metalness:.42,
      map:windowTexture,
      emissive:new THREE.Color(stop.accent),
      emissiveIntensity:.025
    });
    const tower = new THREE.Mesh(new THREE.BoxGeometry(b.w, b.h, b.d), material);
    tower.position.y = b.h / 2;
    tower.castShadow = !mobile;
    tower.receiveShadow = !mobile;
    tower.userData.stopId = stop.id;
    group.add(tower);
    interactive.push(tower);

    const base = new THREE.Mesh(
      new THREE.BoxGeometry(b.w + .85, .72, b.d + .55),
      new THREE.MeshStandardMaterial({color:0x0b1017, roughness:.32, metalness:.62})
    );
    base.position.y = .36;
    base.castShadow = !mobile;
    base.receiveShadow = !mobile;
    group.add(base);

    const trimMat = new THREE.MeshStandardMaterial({
      color:0xb9c7d3,
      roughness:.22,
      metalness:.86,
      emissive:new THREE.Color(stop.accent),
      emissiveIntensity:.045
    });
    [-1,1].forEach((side) => {
      const trim = new THREE.Mesh(new THREE.BoxGeometry(.12, b.h * .9, .16), trimMat);
      trim.position.set(side * (b.w / 2 + .09), b.h * .51, b.z < 0 ? b.d / 2 + .08 : -b.d / 2 - .08);
      group.add(trim);
    });

    const cap = new THREE.Mesh(
      new THREE.BoxGeometry(b.w + .72, .24, b.d + .72),
      new THREE.MeshStandardMaterial({color:0x2b3541, metalness:.72, roughness:.28})
    );
    cap.position.y = b.h + .13;
    group.add(cap);

    const frontZ = b.z < 0 ? b.d / 2 + .035 : -b.d / 2 - .035;
    const poster = createPoster(stop, b, b.z < 0 ? 0 : Math.PI);
    const posterY = Math.min(b.h * .55, 6.15);
    const posterOffset = b.z < 0 ? .05 : -.05;
    const frame = new THREE.Mesh(
      new THREE.PlaneGeometry(poster.userData.posterW + .32, poster.userData.posterH + .32),
      new THREE.MeshBasicMaterial({color:0x080b10})
    );
    frame.rotation.y = b.z < 0 ? 0 : Math.PI;
    frame.position.set(0, posterY, frontZ + posterOffset * .5);
    group.add(frame);
    poster.position.set(0, posterY, frontZ + posterOffset);
    poster.userData.stopId = stop.id;
    if(stop.viewerProduct) poster.userData.viewerProduct = stop.viewerProduct;
    group.add(poster);
    posterMeshes.set(stop.id, poster);
    interactive.push(poster);

    const canopy = new THREE.Mesh(new THREE.BoxGeometry(poster.userData.posterW + .75, .16, .34), trimMat);
    canopy.position.set(0, posterY + poster.userData.posterH / 2 + .28, frontZ + posterOffset * .75);
    group.add(canopy);

    addSectionFlavor(group, stop, b, frontZ, posterY, posterOffset, trimMat);

    const label = createLabel(stop.short, stop.light);
    label.position.set(0, b.h + .55, frontZ + (b.z < 0 ? .04 : -.04));
    label.rotation.y = b.z < 0 ? 0 : Math.PI;
    label.userData.stopId = stop.id;
    group.add(label);
    interactive.push(label);

    const beacon = new THREE.PointLight(stop.accent, .55, 10);
    beacon.position.set(0, b.h + .8, 0);
    if(!mobile) group.add(beacon);

    return group;
  }

  function createPoster(stop, building, rotationY){
    const texture = textureLoader.load(localAsset(stop.poster));
    configurePosterTexture(texture);
    const mat = new THREE.MeshBasicMaterial({map:texture, toneMapped:false, transparent:true});
    const posterW = Math.min(building.w * .9, 7.6);
    const posterH = posterW;
    const poster = new THREE.Mesh(new THREE.PlaneGeometry(posterW, posterH), mat);
    poster.rotation.y = rotationY;
    poster.userData.posterW = posterW;
    poster.userData.posterH = posterH;
    return poster;
  }

  function addSectionFlavor(group, stop, b, frontZ, posterY, posterOffset, trimMat){
    const front = frontZ + posterOffset * 1.35;
    const rotationY = b.z < 0 ? 0 : Math.PI;
    const accent = typeof stop.light === 'string' ? stop.light : '#d9e2eb';

    if(stop.id === 'album'){
      [
        {text:'TEASER', x:-2.95, y:posterY + 2.55, w:1.85},
        {text:'VOL.2', x:2.95, y:posterY + 2.55, w:1.85},
        {text:'CHROME NIGHT', x:0, y:posterY - 2.8, w:3.1}
      ].forEach((item) => {
        const tag = createNeonPanel(item.text, accent, item.w, .58);
        tag.position.set(item.x, item.y, front);
        tag.rotation.y = rotationY;
        group.add(tag);
      });
    }

    if(stop.type === 'music'){
      const discMat = new THREE.MeshStandardMaterial({color:0x05070b, roughness:.26, metalness:.72});
      const rimMat = new THREE.MeshBasicMaterial({color:stop.accent});
      [-3.35, 3.35].forEach((x) => {
        const disc = new THREE.Mesh(new THREE.CylinderGeometry(.48, .48, .055, 40), discMat);
        disc.rotation.x = Math.PI / 2;
        disc.position.set(x, posterY - 2.75, front);
        group.add(disc);
        const center = new THREE.Mesh(new THREE.CylinderGeometry(.13, .13, .06, 28), rimMat);
        center.rotation.x = Math.PI / 2;
        center.position.copy(disc.position);
        center.position.z += posterOffset * .4;
        group.add(center);
      });
      for(let i = 0; i < 9; i += 1){
        const h = .38 + (i % 5) * .18;
        const bar = new THREE.Mesh(new THREE.BoxGeometry(.22, h, .08), trimMat);
        bar.position.set(-1.25 + i * .31, posterY + 2.75 + h / 2, front);
        group.add(bar);
      }
    }

    if(stop.type === 'merch'){
      const awningMat = new THREE.MeshStandardMaterial({color:0x10161d, roughness:.24, metalness:.58, emissive:new THREE.Color(stop.accent), emissiveIntensity:.06});
      const awning = new THREE.Mesh(new THREE.BoxGeometry(Math.min(b.w * .82, 6.7), .32, .42), awningMat);
      awning.position.set(0, posterY - 3.05, front);
      group.add(awning);
      const shop = createNeonPanel('SHOPPING', accent, 2.6, .58);
      shop.position.set(0, posterY + 2.8, front);
      shop.rotation.y = rotationY;
      group.add(shop);
      [-2.7, 2.7].forEach((x) => {
        const display = new THREE.Mesh(new THREE.BoxGeometry(.72, .72, .42), trimMat);
        display.position.set(x, 1.12, front);
        group.add(display);
      });
    }

    if(stop.type === 'cart'){
      const checkout = createNeonPanel('CHECKOUT', accent, 2.65, .56);
      checkout.position.set(0, posterY + 2.8, front);
      checkout.rotation.y = rotationY;
      group.add(checkout);
      for(let i = 0; i < 3; i += 1){
        const coin = new THREE.Mesh(new THREE.CylinderGeometry(.22, .22, .05, 24), new THREE.MeshBasicMaterial({color:0xf0b64d}));
        coin.rotation.x = Math.PI / 2;
        coin.position.set(-.6 + i * .6, posterY - 2.85, front);
        group.add(coin);
      }
    }

    if(stop.type === 'contact'){
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(.045, .06, 2.4, 12), trimMat);
      mast.position.set(3.15, b.h + 1.2, 0);
      group.add(mast);
      [.52, .82, 1.12].forEach((radius, index) => {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, .025, 8, 48), new THREE.MeshBasicMaterial({color:stop.accent, transparent:true, opacity:.72 - index * .14}));
        ring.position.set(3.15, b.h + 2.1, 0);
        ring.rotation.x = Math.PI / 2;
        group.add(ring);
      });
    }
  }

  function createNeonPanel(text, color, width, height){
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 160;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(4,7,11,.9)';
    ctx.fillRect(0, 0, 512, 160);
    ctx.strokeStyle = color;
    ctx.lineWidth = 6;
    ctx.strokeRect(10, 10, 492, 140);
    ctx.font = '800 46px Montserrat, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#f3f5f6';
    ctx.fillText(text, 256, 82, 440);
    const texture = new THREE.CanvasTexture(canvas);
    texture.encoding = THREE.sRGBEncoding;
    texture.anisotropy = renderer ? renderer.capabilities.getMaxAnisotropy() : 1;
    return new THREE.Mesh(new THREE.PlaneGeometry(width, height), new THREE.MeshBasicMaterial({map:texture, transparent:true, toneMapped:false}));
  }

  function createHomeBillboard(){
    const stop = byId.accueil;
    const group = new THREE.Group();
    const mobile = isMobileScene();
    const canvas = document.createElement('canvas');
    canvas.width = 1400;
    canvas.height = 620;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(4,7,11,.94)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#d9e2eb';
    ctx.lineWidth = 10;
    ctx.strokeRect(26, 26, canvas.width - 52, canvas.height - 52);
    ctx.strokeStyle = '#d6ae72';
    ctx.lineWidth = 3;
    ctx.strokeRect(52, 52, canvas.width - 104, canvas.height - 104);
    ctx.font = '800 76px Cinzel, Georgia, serif';
    ctx.fillStyle = '#f3f5f6';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('Shuklel', 92, 76);
    ctx.font = '800 28px Montserrat, Arial, sans-serif';
    ctx.fillStyle = '#d6ae72';
    ctx.fillText('MONTRÉAL NOCTURNE', 94, 172);
    ctx.font = '500 42px Montserrat, Arial, sans-serif';
    ctx.fillStyle = '#d9e2eb';
    wrapCanvasText(ctx, stop.description, 94, 238, 1180, 58, 5);
    const texture = new THREE.CanvasTexture(canvas);
    texture.encoding = THREE.sRGBEncoding;
    texture.anisotropy = renderer ? renderer.capabilities.getMaxAnisotropy() : 1;
    const board = new THREE.Mesh(
      new THREE.PlaneGeometry(7.8, 3.45),
      new THREE.MeshBasicMaterial({map:texture, toneMapped:false})
    );
    board.userData.stopId = 'accueil';
    board.position.set(0, 2.95, .03);
    group.add(board);
    interactive.push(board);

    const frameMat = new THREE.MeshStandardMaterial({color:0xb9c7d3, metalness:.88, roughness:.18});
    const frameTop = new THREE.Mesh(new THREE.BoxGeometry(8.05, .12, .16), frameMat);
    frameTop.position.set(0, 4.74, 0);
    const frameBottom = frameTop.clone();
    frameBottom.position.y = 1.16;
    const frameLeft = new THREE.Mesh(new THREE.BoxGeometry(.12, 3.6, .16), frameMat);
    frameLeft.position.set(-4.05, 2.95, 0);
    const frameRight = frameLeft.clone();
    frameRight.position.x = 4.05;
    group.add(frameTop, frameBottom, frameLeft, frameRight);
    [-3.45, 3.45].forEach((x) => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(.06, .08, 2.4, 12), frameMat);
      post.position.set(x, .55, 0);
      group.add(post);
    });
    if(!mobile){
      const glow = new THREE.PointLight(stop.accent, .9, 9);
      glow.position.set(0, 3.2, 1.6);
      group.add(glow);
    }
    group.position.set(stop.road.x, 0, 2.75);
    return group;
  }

  function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight, maxLines){
    const words = text.split(' ');
    let line = '';
    let lineCount = 0;
    for(let i = 0; i < words.length; i += 1){
      const test = line ? line + ' ' + words[i] : words[i];
      if(ctx.measureText(test).width > maxWidth && line){
        ctx.fillText(line, x, y);
        y += lineHeight;
        line = words[i];
        lineCount += 1;
        if(lineCount >= maxLines - 1) break;
      }else{
        line = test;
      }
    }
    if(line) ctx.fillText(line, x, y);
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
    for(let i = 0; i < 28; i += 1){
      const side = i % 2 === 0 ? -1 : 1;
      const x = -38 + i * 2.8 + (Math.random() - .5) * 1.2;
      const z = side * (42 + Math.random() * 12);
      const h = 3.2 + Math.random() * 6.8;
      const w = .9 + Math.random() * 1.45;
      const d = .9 + Math.random() * 1.5;
      const material = new THREE.MeshStandardMaterial({
        color:matColors[i % matColors.length],
        roughness:.64,
        metalness:.16,
        map:createWindowTexture(i % 3 === 0 ? '#4eb7c7' : '#d9e2eb', i + 20),
        emissive:new THREE.Color(i % 5 === 0 ? 0xb82935 : 0x4eb7c7),
        emissiveIntensity:.007
      });
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
      mesh.position.set(x, h / 2, z);
      mesh.castShadow = false;
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
    const mobile = isMobileScene();
    const bodyMat = new THREE.MeshStandardMaterial({color:0x090a0d, metalness:.72, roughness:.22});
    const accentMat = new THREE.MeshStandardMaterial({color:0x161b20, metalness:.62, roughness:.2});
    const chrome = new THREE.MeshStandardMaterial({color:0xd9e2eb, metalness:.96, roughness:.14});
    const glass = new THREE.MeshStandardMaterial({color:0x172330, metalness:.18, roughness:.05, transparent:true, opacity:.68});
    const red = new THREE.MeshBasicMaterial({color:0xb82935});
    const light = new THREE.MeshBasicMaterial({color:0xf4e4b8});

    const body = new THREE.Mesh(new THREE.BoxGeometry(3.45, .46, 1.18), bodyMat);
    body.position.y = .45;
    body.castShadow = true;
    group.add(body);

    const nose = new THREE.Mesh(new THREE.BoxGeometry(1.18, .24, 1.1), bodyMat);
    nose.position.set(1.02, .65, 0);
    nose.castShadow = true;
    group.add(nose);

    const rearDeck = new THREE.Mesh(new THREE.BoxGeometry(.92, .2, 1.04), bodyMat);
    rearDeck.position.set(-1.12, .66, 0);
    rearDeck.castShadow = true;
    group.add(rearDeck);

    const hood = new THREE.Mesh(new THREE.BoxGeometry(1.16, .055, 1.05), chrome);
    hood.position.set(.8, .81, 0);
    hood.castShadow = true;
    group.add(hood);

    const roof = new THREE.Mesh(new THREE.BoxGeometry(.92, .18, .82), bodyMat);
    roof.position.set(-.3, 1.12, 0);
    roof.castShadow = true;
    group.add(roof);

    const windshield = new THREE.Mesh(new THREE.BoxGeometry(.12, .48, .74), glass);
    windshield.position.set(.18, .96, 0);
    windshield.rotation.z = -.18;
    windshield.castShadow = true;
    group.add(windshield);

    const rearGlass = new THREE.Mesh(new THREE.BoxGeometry(.12, .44, .72), glass);
    rearGlass.position.set(-.78, .96, 0);
    rearGlass.rotation.z = .2;
    rearGlass.castShadow = true;
    group.add(rearGlass);

    const cabin = new THREE.Mesh(new THREE.BoxGeometry(.78, .52, .78), glass);
    cabin.position.set(-.3, .92, 0);
    cabin.castShadow = true;
    group.add(cabin);

    const stripe = new THREE.Mesh(new THREE.BoxGeometry(3.56, .045, .08), chrome);
    stripe.position.set(0, .72, -.62);
    const stripeRight = stripe.clone();
    stripeRight.position.z = .62;
    group.add(stripe, stripeRight);

    const bumperFront = new THREE.Mesh(new THREE.BoxGeometry(.12, .14, 1.16), chrome);
    bumperFront.position.set(1.8, .42, 0);
    const bumperRear = bumperFront.clone();
    bumperRear.position.x = -1.8;
    group.add(bumperFront, bumperRear);

    const fenderGeo = new THREE.SphereGeometry(.38, 24, 12);
    [[-1.05,-.66],[1.05,-.66],[-1.05,.66],[1.05,.66]].forEach(([x,z]) => {
      const fender = new THREE.Mesh(fenderGeo, accentMat);
      fender.scale.set(1.28, .42, .62);
      fender.position.set(x, .47, z);
      fender.castShadow = true;
      group.add(fender);
    });

    [-.36,.36].forEach((z) => {
      const tail = new THREE.Mesh(new THREE.BoxGeometry(.08, .13, .22), red);
      tail.position.set(-1.86, .52, z);
      group.add(tail);

      const head = new THREE.Mesh(new THREE.SphereGeometry(.12, 16, 10), light);
      head.scale.set(1, .78, 1);
      head.position.set(1.86, .57, z);
      group.add(head);
    });

    const wheelMat = new THREE.MeshStandardMaterial({color:0x040506, metalness:.5, roughness:.4});
    const rimMat = new THREE.MeshStandardMaterial({color:0xd9e2eb, metalness:.9, roughness:.16});
    const wheelGeo = new THREE.CylinderGeometry(.31, .31, .25, mobile ? 18 : 28);
    const rimGeo = new THREE.TorusGeometry(.19, .025, 8, mobile ? 18 : 28);
    [[-1.05,-.66],[1.05,-.66],[-1.05,.66],[1.05,.66]].forEach(([x,z]) => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.rotation.x = Math.PI / 2;
      wheel.position.set(x, .23, z);
      wheel.castShadow = true;
      wheels.push(wheel);
      group.add(wheel);

      const rim = new THREE.Mesh(rimGeo, rimMat);
      rim.rotation.x = Math.PI / 2;
      rim.position.set(x, .23, z > 0 ? z + .13 : z - .13);
      group.add(rim);
    });

    if(!mobile){
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
    }
    if(mobile){
      group.traverse((obj) => {
        obj.castShadow = false;
        obj.receiveShadow = false;
      });
    }
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
    if(!hit) return;
    if(hit.id === state.target && hit.id === 'merch'){
      nextProductImage(merchState.productId);
      return;
    }
    if(hit.id === state.target && hit.id === 'music'){
      window.open(albums[musicState.albumIndex].href, '_blank', 'noopener');
      return;
    }
    selectStop(hit.id);
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
    for(const hit of hits){
      let obj = hit.object;
      let visible = true;
      while(obj){
        if(!obj.visible) visible = false;
        obj = obj.parent;
      }
      if(!visible) continue;
      obj = hit.object;
      while(obj){
        if(obj.userData && obj.userData.stopId){
          return {id:obj.userData.stopId, viewerProduct:obj.userData.viewerProduct || null};
        }
        obj = obj.parent;
      }
    }
    return null;
  }

  function setHover(id){
    state.hovered = id;
    if(renderer && renderer.domElement) renderer.domElement.style.cursor = id ? 'pointer' : 'default';
  }

  function updateBuildingFocus(id){
    const activeStop = byId[id];
    const activeSide = Math.sign(activeStop.building.z);
    const mobile = isMobileScene();
    if(homeBillboard) homeBillboard.visible = id === 'accueil';
    buildingGroups.forEach((group, key) => {
      const stop = byId[key];
      group.visible = key === id || (!mobile && Math.sign(stop.building.z) === activeSide);
      group.traverse((obj) => {
        if(obj.material && obj.material.emissiveIntensity !== undefined){
          obj.material.emissiveIntensity = key === id ? .14 : .022;
        }
      });
      group.scale.setScalar(key === id ? 1.055 : 1);
    });
  }

  function animate(){
    requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), .033);
    updateCar(dt);
    updateCamera();
    if(!isMobileScene()){
      const time = clock.elapsedTime;
      buildingGroups.forEach((group, key) => {
        const active = key === state.target;
        group.position.y = active ? Math.sin(time * 2.4) * .035 : 0;
      });
    }
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
    car.position.z += (stop.road.z - car.position.z) * (isMobileScene() ? .16 : .08);
  }

  function updateCamera(){
    const stop = byId[state.target];
    const side = stop.building.z < 0 ? 1 : -1;
    const mobile = isMobileScene();
    const desired = new THREE.Vector3(
      stop.road.x + (mobile ? 0 : side * 1.1),
      mobile ? 7.9 : 7.2,
      side * (mobile ? 12.4 : 13.6)
    );
    camera.position.lerp(desired, mobile ? .14 : .07);
    const desiredLook = new THREE.Vector3(stop.building.x, mobile ? 4.35 : 4.6, stop.building.z * .62);
    lookTarget.lerp(desiredLook, mobile ? .18 : .1);
    camera.lookAt(lookTarget);
  }

  function onResize(){
    if(!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.fov = isMobileScene() ? 48 : 52;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(scenePixelRatio());
    renderer.setSize(window.innerWidth, window.innerHeight);
    updateBuildingFocus(state.target);
  }

  init();
})();
