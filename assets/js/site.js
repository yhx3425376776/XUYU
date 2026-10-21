/* =========================================================
   序屿 XUYU · 下载页脚本
   —— 只改上面这一块 CONFIG，其余不用动
   ========================================================= */
const CONFIG = {
  // ① 你的 GitHub 用户名（分发仓库 XUYU 所在账号）
  githubUser: 'yhx3425376776',
  // ② 分发仓库名
  repo: 'XUYU',
  // ③ 安装包在 Release 里的文件名；用 releases/latest/download/ 直链，
  //    所以打包时让 electron-builder 固定输出这个名字（不带版本号），
  //    以后每次发版覆盖同名附件即可，页面链接永远有效。
  assetName: 'XUYU-Setup.exe',
  // ④ 页面上显示的版本信息（留空则自动从 GitHub 读最新 Release）
  version: 'v1.0.0',
  size: '约 80 MB',
  // ⑤ 打开后向 GitHub API 读取最新版本号 / 文件大小（未认证限 60 次/小时，
  //    只影响显示，不影响下载按钮；读不到就退回上面写的 version / size）
  liveReleaseInfo: true
};

(function () {
  'use strict';

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 链接注入 ---------- */
  const REPO_URL = `https://github.com/${CONFIG.githubUser}/${CONFIG.repo}`;
  const RELEASES_URL = REPO_URL + '/releases';
  const DOWNLOAD_URL = CONFIG.assetName
    ? `${RELEASES_URL}/latest/download/${encodeURIComponent(CONFIG.assetName)}`
    : RELEASES_URL + '/latest';

  const $ = (sel) => document.querySelector(sel);
  const setAttr = (sel, attr, val) => { const el = $(sel); if (el) el.setAttribute(attr, val); };

  setAttr('#downloadBtn', 'href', DOWNLOAD_URL);
  setAttr('#releasesBtn', 'href', RELEASES_URL);
  setAttr('#footRepo', 'href', REPO_URL);
  setAttr('#footReleases', 'href', RELEASES_URL);

  const vt = $('#metaVersion');
  if (vt && CONFIG.version) vt.textContent = CONFIG.version;
  const sz = $('#metaSize');
  if (sz && CONFIG.size) sz.textContent = CONFIG.size;

  /* 下载按钮文案带上版本号，点击前给一次明确反馈 */
  const dlBtn = $('#downloadBtn');
  if (dlBtn) {
    dlBtn.addEventListener('click', () => {
      const label = $('#downloadLabel');
      if (!label) return;
      const old = label.textContent;
      label.textContent = '正在前往下载…';
      setTimeout(() => { label.textContent = old; }, 2400);
    });
  }

  /* ---------- 可选：读取最新 Release ---------- */
  if (CONFIG.liveReleaseInfo && CONFIG.githubUser && CONFIG.githubUser !== 'XUYU') {
    fetch(`https://api.github.com/repos/${CONFIG.githubUser}/${CONFIG.repo}/releases/latest`)
      .then((r) => (r.ok ? r.json() : null))
      .then((rel) => {
        if (!rel) return;
        if (vt && rel.tag_name) vt.textContent = rel.tag_name;
        const asset = (rel.assets || []).find((a) => a.name === CONFIG.assetName) || (rel.assets || [])[0];
        if (sz && asset && asset.size) {
          sz.textContent = '约 ' + Math.max(1, Math.round(asset.size / 1048576)) + ' MB';
        }
      })
      .catch(() => { /* 离线或无网络时静默跳过 */ });
  }

  /* ---------- 首屏视频：mp4 → gif → 静态图 逐级回退 ---------- */
  (function heroMedia() {
    const media = $('#heroMedia');
    const video = $('#heroVideo');
    if (!media || !video) return;

    const still = media.querySelector('.hero-still');

    /* 若放了原始动图 assets/img/hero.gif，优先用它（动图比静态帧更生动） */
    if (still) {
      const probe = new Image();
      probe.onload = () => { still.src = 'assets/img/hero.gif'; };
      probe.src = 'assets/img/hero.gif';
    }

    let ready = false;
    const fallback = () => { if (!ready) media.classList.add('no-video'); };

    video.addEventListener('loadeddata', () => { ready = true; media.classList.remove('no-video'); });
    video.addEventListener('error', fallback, true);
    const src = video.querySelector('source');
    if (src) src.addEventListener('error', fallback);

    const p = video.play();
    if (p && typeof p.catch === 'function') p.catch(() => {});

    setTimeout(fallback, 2000);
  })();

  /* ---------- 导航：滚动后玻璃化、下滑隐藏 ---------- */
  const nav = $('#nav');
  const bar = $('#progressBar');
  let lastY = window.scrollY;

  const pinWrap = $('#canvas');
  const pinImg = pinWrap ? pinWrap.querySelector('.pin-media img') : null;
  const pinMedia = $('#pinMedia');

  const bandMedia = document.querySelector('.band-media img');
  const heroMediaEl = $('#heroMedia');
  const heroContent = document.querySelector('.hero-content');

  function onScroll() {
    const y = window.scrollY;
    const docH = document.documentElement.scrollHeight - window.innerHeight;

    if (nav) {
      nav.classList.toggle('is-stuck', y > 24);
      const goingDown = y > lastY + 4;
      const goingUp = y < lastY - 4;
      if (goingUp || y < 160) nav.classList.remove('is-hidden');
      else if (goingDown && y > 320) nav.classList.add('is-hidden');
    }
    lastY = y;

    if (bar) bar.style.width = (docH > 0 ? (y / docH) * 100 : 0) + '%';

    if (!reduce) {
      /* 首屏：媒体轻微下沉，字标上浮淡出 */
      if (heroMediaEl && y < window.innerHeight * 1.2) {
        heroMediaEl.style.transform = `translate3d(0, ${y * 0.22}px, 0)`;
        if (heroContent) {
          const t = Math.min(1, y / (window.innerHeight * 0.75));
          heroContent.style.transform = `translate3d(0, ${y * -0.12}px, 0)`;
          heroContent.style.opacity = String(1 - t * 0.9);
        }
      }

      /* 岛屿段：视差 */
      if (bandMedia) {
        const r = bandMedia.getBoundingClientRect();
        if (r.bottom > -100 && r.top < window.innerHeight + 100) {
          bandMedia.style.transform = `translate3d(0, ${(r.top - window.innerHeight / 2) * -0.07}px, 0) scale(1.06)`;
        }
      }

      /* 画布段：随滚动推进放大 */
      if (pinWrap && pinImg) {
        const r = pinWrap.getBoundingClientRect();
        const total = pinWrap.offsetHeight - window.innerHeight;
        const p = Math.min(1, Math.max(0, -r.top / (total || 1)));
        const ease = p * p * (3 - 2 * p);
        pinImg.style.transform = `scale(${1.16 - ease * 0.13}) translate3d(0, ${ease * -26}px, 0)`;
        if (pinMedia) pinMedia.style.opacity = String(1 - p * 0.28);
      }
    }
  }

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { onScroll(); ticking = false; });
  }, { passive: true });
  onScroll();

  /* ---------- 滚动进入 ---------- */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('in'));
  }

  /* ---------- 图片倾斜 + 光斑跟随 ---------- */
  document.querySelectorAll('[data-tilt]').forEach((wrap) => {
    const frame = wrap.querySelector('.art-frame');
    if (!frame || reduce) return;

    let raf = null;
    let tx = 0, ty = 0, mx = 50, my = 50;

    const apply = () => {
      frame.style.transform = `rotateX(${ty.toFixed(2)}deg) rotateY(${tx.toFixed(2)}deg) translateY(-4px)`;
      frame.style.setProperty('--mx', mx + '%');
      frame.style.setProperty('--my', my + '%');
      raf = null;
    };

    wrap.addEventListener('pointermove', (e) => {
      const r = wrap.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      tx = (px - 0.5) * 11;
      ty = (0.5 - py) * 8;
      mx = px * 100;
      my = py * 100;
      if (!raf) raf = requestAnimationFrame(apply);
    });

    wrap.addEventListener('pointerleave', () => {
      if (raf) { cancelAnimationFrame(raf); raf = null; }
      frame.style.transform = '';
    });
  });

  /* ---------- 按钮磁吸 ---------- */
  if (!reduce) {
    document.querySelectorAll('[data-magnetic]').forEach((btn) => {
      btn.addEventListener('pointermove', (e) => {
        const r = btn.getBoundingClientRect();
        const dx = (e.clientX - r.left - r.width / 2) / r.width;
        const dy = (e.clientY - r.top - r.height / 2) / r.height;
        btn.style.transform = `translate(${(dx * 9).toFixed(2)}px, ${(dy * 7 - 2).toFixed(2)}px)`;
      });
      btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
    });
  }

  /* ---------- 卡片光斑随鼠标 ---------- */
  document.querySelectorAll('[data-spot]').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', ((e.clientX - r.left) / r.width) * 100 + '%');
      card.style.setProperty('--my', ((e.clientY - r.top) / r.height) * 100 + '%');
    });
  });
})();
