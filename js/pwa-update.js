// PWA Update Notification
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    const banner = document.createElement('div');
    banner.style.cssText = `
      position:fixed;top:0;left:0;right:0;z-index:9999;
      background:#c8a84b;color:#1a1a2e;padding:14px 20px;
      text-align:center;font-weight:700;font-size:14px;
      display:flex;align-items:center;justify-content:center;gap:12px;
    `;
    banner.innerHTML = `
      <span>🔄 يوجد تحديث جديد للموقع</span>
      <button onclick="location.reload()" style="background:#1a1a2e;color:#c8a84b;border:none;padding:6px 16px;border-radius:6px;font-weight:700;cursor:pointer;">تحديث الآن</button>
      <button onclick="this.parentElement.remove()" style="background:none;border:none;font-size:18px;cursor:pointer;">✕</button>
    `;
    document.body.prepend(banner);
  });
}
