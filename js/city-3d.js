(() => {
  'use strict';

  const contactEmail = 'shukfit' + '@' + 'gmail.com';
  const mobileQuery = window.matchMedia('(max-width: 760px), (pointer: coarse)');
  const localAsset = (path) => path.split('/').map(encodeURIComponent).join('/');

  const sections = [
    {
      id:'accueil', label:'Accueil', short:'Shuklel', object:'accueil', objectLabel:'Carte Shuklel',
      kind:'home',
      focus:{zoom:'1.04', panX:'0vw', panY:'0vh', x:'50%', y:'62%'},
      mobileFocus:{zoom:'1.08', panX:'0vw', panY:'-2vh', x:'50%', y:'62%'}
    },
    {
      id:'album', label:'Album', short:'RS Vol.2', object:'album', objectLabel:'Dossier RS Vol.2',
      kind:'album',
      focus:{zoom:'1.18', panX:'-8vw', panY:'-2vh', x:'66%', y:'68%'},
      mobileFocus:{zoom:'1.13', panX:'-42vw', panY:'-6vh', x:'66%', y:'68%'}
    },
    {
      id:'music', label:'Musique', short:'Music', object:'music', objectLabel:'Tourne-disque',
      kind:'music',
      focus:{zoom:'1.16', panX:'12vw', panY:'2vh', x:'31%', y:'56%'},
      mobileFocus:{zoom:'1.12', panX:'45vw', panY:'-4vh', x:'31%', y:'56%'}
    },
    {
      id:'merch', label:'Boutique', short:'Boutique', object:'merch', objectLabel:'Magazine',
      kind:'merch',
      focus:{zoom:'1.2', panX:'-18vw', panY:'0vh', x:'87%', y:'67%'},
      mobileFocus:{zoom:'1.12', panX:'-74vw', panY:'-5vh', x:'87%', y:'67%'}
    },
    {
      id:'cart', label:'Panier', short:'Panier', object:'cart', objectLabel:'Ticket panier',
      kind:'cart',
      focus:{zoom:'1.18', panX:'-17vw', panY:'-8vh', x:'80%', y:'82%'},
      mobileFocus:{zoom:'1.12', panX:'-62vw', panY:'-10vh', x:'80%', y:'82%'}
    },
    {
      id:'contact', label:'Contact', short:'Contact', object:'contact', objectLabel:'Carte contact',
      kind:'contact',
      focus:{zoom:'1.16', panX:'1vw', panY:'-8vh', x:'50%', y:'80%'},
      mobileFocus:{zoom:'1.12', panX:'0vw', panY:'-10vh', x:'50%', y:'80%'}
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
    {id:'hoodie', title:'Hoodie Shuklel', price:60, gallery:['assets/city/hoodie-1.webp','assets/city/hoodie-2.webp','assets/city/hoodie-3.webp','assets/city/hoodie-4.webp']},
    {id:'tshirt', title:'T-shirt Shuklel', price:35, gallery:['assets/city/tee-1.webp','assets/city/tee-2.webp','assets/city/tee-3.webp','assets/city/tee-4.webp']}
  ];

  const byId = Object.fromEntries(sections.map((section) => [section.id, section]));
  const order = sections.map((section) => section.id);
  const state = {
    current:'accueil',
    albumIndex:0,
    productId:'hoodie',
    productImageIndex:{hoodie:0, tshirt:0},
    touchStart:null,
    toastTimer:0
  };
  const cart = loadCart();

  let experience;
  let panel;
  let dock;

  function init(){
    experience = document.getElementById('cityExperience');
    panel = document.getElementById('storyPanel');
    dock = document.getElementById('routeDock');
    if(!experience || !panel || !dock) return;

    buildWorld();
    buildDock();
    bindEvents();

    const requested = window.location.hash.replace('#', '');
    selectSection(byId[requested] ? requested : 'accueil', {push:false});
  }

  function buildWorld(){
    const world = document.getElementById('deskWorld');
    if(!world) return;
    world.innerHTML = `
      <div class="desk-frame" id="deskFrame">
        ${sections.map((section) => `
          <button class="object-hotspot" type="button" data-go="${section.id}" data-object="${section.object}" aria-label="${attr(section.objectLabel)}">
            <span class="object-label">${section.objectLabel}</span>
          </button>
        `).join('')}
      </div>
      <div class="scene-toast" id="sceneToast" role="status" aria-live="polite"></div>
    `;
  }

  function buildDock(){
    dock.innerHTML = sections.map((section) => {
      const badge = section.id === 'cart' ? '<span class="dock-badge" id="cartCountDock">0</span>' : '';
      return `
        <button class="icon-step" type="button" data-go="${section.id}" aria-label="${attr(section.label)}">
          <span class="step-light" aria-hidden="true"></span>
          <span>${section.short}</span>
          ${badge}
        </button>
      `;
    }).join('');
    refreshCart();
  }

  function bindEvents(){
    document.body.addEventListener('click', (event) => {
      const route = event.target.closest('[data-go]');
      if(route){
        event.preventDefault();
        selectSection(route.dataset.go);
        return;
      }

      const album = event.target.closest('[data-play-album]');
      if(album){
        event.preventDefault();
        playAlbum(Number(album.dataset.playAlbum));
        return;
      }

      const product = event.target.closest('[data-product-select]');
      if(product){
        event.preventDefault();
        selectProduct(product.dataset.productSelect);
        return;
      }

      const productImage = event.target.closest('[data-product-image]');
      if(productImage){
        event.preventDefault();
        nextProductImage(productImage.dataset.productImage);
        return;
      }

      const add = event.target.closest('[data-floating-add], [data-add-cart]');
      if(add){
        event.preventDefault();
        addCurrentProductToCart();
        return;
      }

      const buy = event.target.closest('[data-buy-now]');
      if(buy){
        event.preventDefault();
        immediatePurchase(buy.dataset.product, Number(buy.dataset.price), buy.dataset.zone);
        return;
      }

      const checkout = event.target.closest('[data-checkout]');
      if(checkout){
        event.preventDefault();
        checkoutCart();
        return;
      }

      const clear = event.target.closest('[data-clear-cart]');
      if(clear){
        event.preventDefault();
        clearCart();
      }
    });

    experience.addEventListener('touchstart', (event) => {
      if(event.touches.length !== 1) return;
      const touch = event.touches[0];
      state.touchStart = {x:touch.clientX, y:touch.clientY};
    }, {passive:true});

    experience.addEventListener('touchend', (event) => {
      if(!state.touchStart || !event.changedTouches.length) return;
      const touch = event.changedTouches[0];
      const dx = touch.clientX - state.touchStart.x;
      const dy = touch.clientY - state.touchStart.y;
      state.touchStart = null;
      if(Math.abs(dx) < 54 || Math.abs(dx) < Math.abs(dy) * 1.15) return;
      selectRelative(dx < 0 ? 1 : -1);
    }, {passive:true});

    window.addEventListener('hashchange', () => {
      const requested = window.location.hash.replace('#', '');
      if(byId[requested] && requested !== state.current){
        selectSection(requested, {push:false});
      }
    });

    if(mobileQuery.addEventListener){
      mobileQuery.addEventListener('change', () => applyFocus(byId[state.current]));
    }
  }

  function selectRelative(delta){
    const index = order.indexOf(state.current);
    const next = Math.max(0, Math.min(order.length - 1, index + delta));
    if(next !== index) selectSection(order[next]);
  }

  function selectSection(id, options = {}){
    const section = byId[id];
    if(!section) return;
    state.current = id;
    experience.dataset.section = id;
    applyFocus(section);
    updateActiveControls(id);
    renderPanel(section);
    updateFloatingAdd();
    if(options.push !== false && window.location.hash !== '#' + id){
      window.location.hash = id;
    }
  }

  function applyFocus(section){
    const focus = mobileQuery.matches ? section.mobileFocus : section.focus;
    experience.style.setProperty('--scene-zoom', focus.zoom);
    experience.style.setProperty('--pan-x', focus.panX);
    experience.style.setProperty('--pan-y', focus.panY);
    experience.style.setProperty('--focus-x', focus.x);
    experience.style.setProperty('--focus-y', focus.y);
  }

  function updateActiveControls(id){
    document.querySelectorAll('[data-go]').forEach((element) => {
      element.classList.toggle('is-active', element.dataset.go === id);
    });
  }

  function renderPanel(section){
    panel.dataset.section = section.id;
    if(section.kind === 'home') panel.innerHTML = renderHome();
    if(section.kind === 'album') panel.innerHTML = renderAlbum();
    if(section.kind === 'music') panel.innerHTML = renderMusic();
    if(section.kind === 'merch') panel.innerHTML = renderMerch();
    if(section.kind === 'cart') panel.innerHTML = renderCart();
    if(section.kind === 'contact') panel.innerHTML = renderContact();
  }

  function renderHome(){
    return `
      <span class="panel-tag">Bureau Shuklel</span>
      <h1>Shuklel</h1>
      <p>Artiste, producteur et rappeur base a Montreal. Explore le bureau: chaque objet ouvre une section du site.</p>
      <div class="panel-actions">
        <a class="action" href="https://www.youtube.com/@shuklel" target="_blank" rel="noopener">YouTube</a>
        <a class="ghost-action" href="https://www.instagram.com/ultimate_dini/" target="_blank" rel="noopener">Instagram</a>
        <a class="ghost-action" href="mailto:${contactEmail}">Contact</a>
      </div>
    `;
  }

  function renderAlbum(){
    return `
      <span class="panel-tag">Top secret</span>
      <h1>Rigide et Scrupuleux Vol.2</h1>
      <p>Un nouveau chapitre se prepare. Fragments, nuit et tension: ouvre le dossier, entre dans le teasing et garde le lien sous la main.</p>
      <div class="panel-actions">
        <a class="action" href="https://distrokid.com/hyperfollow/shuklel/rigide-et-scrupuleux" target="_blank" rel="noopener">Precommander / ecouter</a>
        <button class="ghost-action" type="button" data-go="music">Discographie</button>
      </div>
    `;
  }

  function renderMusic(){
    const selected = albums[state.albumIndex] || albums[0];
    return `
      <span class="panel-tag">Tourne-disque</span>
      <div class="vinyl-stage" id="vinylStage">
        <div class="vinyl-disc" aria-hidden="true"><img src="${localAsset(selected.image)}" alt="" /></div>
        <div>
          <div class="stage-title">${escapeHtml(selected.title)}</div>
          <div class="stage-meta">${escapeHtml(selected.meta)}</div>
          <p class="fineprint">Choisis un projet, clique sur une pochette et lance le streaming.</p>
        </div>
      </div>
      <div class="vinyl-grid" aria-label="Discographie">
        ${albums.map((album, index) => `
          <button class="vinyl-card${index === state.albumIndex ? ' is-active' : ''}" type="button" data-play-album="${index}">
            <img class="vinyl-thumb" src="${localAsset(album.image)}" alt="" />
            <span>
              <span class="row-title">${escapeHtml(album.title)}</span>
              <span class="row-meta">${escapeHtml(album.meta)}</span>
            </span>
          </button>
        `).join('')}
      </div>
    `;
  }

  function renderMerch(){
    const product = currentProduct();
    const image = currentProductImage(product);
    return `
      <span class="panel-tag">Magazine boutique</span>
      <p>Ouvre le magazine, touche l'image pour changer le visuel, puis ajoute la piece au panier.</p>
      <div class="magazine-spread">
        <button class="product-hero" type="button" data-product-image="${product.id}" aria-label="Changer le visuel ${attr(product.title)}">
          <img src="${localAsset(image)}" alt="${attr(product.title)}" />
        </button>
        <div>
          <h2>${escapeHtml(product.title)}</h2>
          <div class="row-meta">${product.price} $</div>
          <div class="row-actions">
            <button class="tiny-action" type="button" data-product-image="${product.id}">Image</button>
            <button class="tiny-action" type="button" data-buy-now data-product="${attr(product.title)}" data-price="${product.price}" data-zone="paypal-zone-${product.id}">Acheter</button>
          </div>
          <div class="paypal-zone" id="paypal-zone-${product.id}"></div>
        </div>
      </div>
      <div class="product-list" aria-label="Articles boutique">
        ${products.map((item) => `
          <button class="product-row${item.id === product.id ? ' is-active' : ''}" type="button" data-product-select="${item.id}">
            <span>
              <span class="row-title">${escapeHtml(item.title)}</span>
              <span class="row-meta">${item.price} $</span>
            </span>
            <span class="row-meta">Voir</span>
          </button>
        `).join('')}
      </div>
    `;
  }

  function renderCart(){
    if(!cart.length){
      return `
        <span class="panel-tag">Ticket panier</span>
        <p>Aucun article pour le moment. Passe par le magazine Boutique pour ajouter une piece.</p>
        <div class="panel-actions"><button class="action" type="button" data-go="merch">Voir la boutique</button></div>
      `;
    }
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    return `
      <span class="panel-tag">Ticket panier</span>
      <div class="cart-list">
        ${cart.map((item) => `
          <div class="cart-row">
            <span>
              <span class="row-title">${escapeHtml(item.product)}</span>
              <span class="row-meta">${item.price} $</span>
            </span>
          </div>
        `).join('')}
      </div>
      <p class="fineprint">Total: ${total.toFixed(2)} $</p>
      <div class="panel-actions">
        <button class="action" type="button" data-checkout>Paiement</button>
        <button class="ghost-action" type="button" data-clear-cart>Vider</button>
      </div>
      <div class="paypal-zone" id="paypal-zone-cart"></div>
    `;
  }

  function renderContact(){
    return `
      <span class="panel-tag">Carte contact</span>
      <h2>Contact & reseaux</h2>
      <p>Booking, collaboration, precommande ou question: envoie un message depuis la carte.</p>
      <p><a class="text-link" href="mailto:${contactEmail}">${contactEmail}</a></p>
      <div class="panel-actions">
        <a class="action" href="mailto:${contactEmail}">Email</a>
        <a class="ghost-action" href="https://www.youtube.com/@shuklel" target="_blank" rel="noopener">YouTube</a>
        <a class="ghost-action" href="https://www.instagram.com/ultimate_dini/" target="_blank" rel="noopener">Instagram</a>
      </div>
    `;
  }

  function playAlbum(index){
    const album = albums[index] || albums[0];
    state.albumIndex = index;
    updateAlbumSelection();
    const stage = document.getElementById('vinylStage');
    if(stage){
      stage.classList.remove('is-playing');
      void stage.offsetWidth;
      stage.classList.add('is-playing');
    }
    showToast('Le disque se lance...');
    window.setTimeout(() => {
      window.open(album.href, '_blank', 'noopener');
    }, 620);
  }

  function updateAlbumSelection(){
    const album = albums[state.albumIndex] || albums[0];
    document.querySelectorAll('[data-play-album]').forEach((card) => {
      card.classList.toggle('is-active', Number(card.dataset.playAlbum) === state.albumIndex);
    });
    const stage = document.getElementById('vinylStage');
    if(stage){
      const img = stage.querySelector('.vinyl-disc img');
      const title = stage.querySelector('.stage-title');
      const meta = stage.querySelector('.stage-meta');
      if(img) img.src = localAsset(album.image);
      if(title) title.textContent = album.title;
      if(meta) meta.textContent = album.meta;
    }
  }

  function selectProduct(id){
    if(!products.some((product) => product.id === id)) return;
    state.productId = id;
    renderPanel(byId.merch);
    updateFloatingAdd();
  }

  function nextProductImage(id){
    const product = products.find((item) => item.id === id);
    if(!product) return;
    state.productImageIndex[id] = ((state.productImageIndex[id] || 0) + 1) % product.gallery.length;
    if(state.productId !== id) state.productId = id;
    renderPanel(byId.merch);
    const hero = panel.querySelector('.product-hero');
    if(hero){
      hero.classList.add('is-turning');
      window.setTimeout(() => hero.classList.remove('is-turning'), 360);
    }
    updateFloatingAdd();
  }

  function currentProduct(){
    return products.find((product) => product.id === state.productId) || products[0];
  }

  function currentProductImage(product){
    const index = state.productImageIndex[product.id] || 0;
    return product.gallery[index] || product.gallery[0];
  }

  function addCurrentProductToCart(){
    const product = currentProduct();
    addToCart(product.title, product.price);
  }

  function addToCart(product, price){
    cart.push({product, price});
    saveCart();
    refreshCart();
    showToast(product + ' ajoute au panier');
    if(state.current === 'cart') renderPanel(byId.cart);
  }

  function clearCart(){
    cart.length = 0;
    saveCart();
    refreshCart();
    renderPanel(byId.cart);
    showToast('Panier vide');
  }

  function refreshCart(){
    const badge = document.getElementById('cartCountDock');
    if(badge) badge.textContent = String(cart.length);
  }

  function updateFloatingAdd(){
    const button = document.getElementById('floatingAdd');
    if(!button) return;
    const visible = state.current === 'merch';
    button.classList.toggle('is-visible', visible);
    if(!visible) return;
    const product = currentProduct();
    button.setAttribute('aria-label', 'Ajouter ' + product.title + ' au panier');
    button.innerHTML = `<span aria-hidden="true">+</span><strong>Ajouter</strong><small>${product.price} $</small>`;
  }

  function checkoutCart(){
    if(!cart.length){
      showToast('Panier vide');
      return;
    }
    const zone = document.getElementById('paypal-zone-cart');
    if(!zone || zone.dataset.rendered) return;
    if(!window.paypal || !window.paypal.Buttons){
      alert('Paiement PayPal indisponible pour le moment.');
      return;
    }
    const total = cart.reduce((sum, item) => sum + item.price, 0).toFixed(2);
    zone.style.minHeight = '46px';
    window.paypal.Buttons({
      createOrder:(_, actions) => actions.order.create({purchase_units:[{amount:{value:total}}]}),
      onApprove:(_, actions) => actions.order.capture().then((details) => {
        sendPurchaseEmail('Commande panier', Number(total));
        alert('Merci ' + details.payer.name.given_name + ' ! Paiement OK.');
        cart.length = 0;
        saveCart();
        refreshCart();
        renderPanel(byId.cart);
      })
    }).render('#paypal-zone-cart');
    zone.dataset.rendered = '1';
  }

  function immediatePurchase(item, price, zoneId){
    const zone = document.getElementById(zoneId);
    if(!zone || zone.dataset.rendered) return;
    if(!window.paypal || !window.paypal.Buttons){
      alert('Paiement PayPal indisponible pour le moment.');
      return;
    }
    zone.style.minHeight = '46px';
    window.paypal.Buttons({
      createOrder:(_, actions) => actions.order.create({purchase_units:[{description:item, amount:{value:price.toFixed(2)}}]}),
      onApprove:(_, actions) => actions.order.capture().then((details) => {
        alert('Merci ' + details.payer.name.given_name + ' ! Paiement confirme.');
        sendPurchaseEmail(item, price);
      })
    }).render('#' + zoneId);
    zone.dataset.rendered = '1';
  }

  function sendPurchaseEmail(product, price){
    fetch('https://formspree.io/f/xldjpwzz', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({_subject:'Achat sur le site Shuklel', message:`Produit : ${product}\nMontant : ${price} $`, email:contactEmail})
    }).catch(() => {});
  }

  function showToast(message){
    const toast = document.getElementById('sceneToast');
    if(!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    window.clearTimeout(state.toastTimer);
    state.toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 1600);
  }

  function loadCart(){
    try{
      const saved = JSON.parse(localStorage.getItem('shuklel-cart') || '[]');
      return Array.isArray(saved) ? saved : [];
    }catch(_error){
      return [];
    }
  }

  function saveCart(){
    localStorage.setItem('shuklel-cart', JSON.stringify(cart));
  }

  function escapeHtml(value){
    return String(value).replace(/[&<>"']/g, (character) => ({
      '&':'&amp;',
      '<':'&lt;',
      '>':'&gt;',
      '"':'&quot;',
      "'":'&#039;'
    })[character]);
  }

  function attr(value){
    return escapeHtml(value);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  }else{
    init();
  }
})();
