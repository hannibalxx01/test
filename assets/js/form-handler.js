(function () {
  function getCurrentLang() {
    var htmlLang = document.documentElement.getAttribute('lang') || 'en';
    // Standalone /pl/ and /ru/ pages always declare their real language and never
    // switch client-side, so trust the attribute directly. Only the EN pages swap
    // visible text via a cookie while keeping <html lang="en"> fixed.
    if (htmlLang !== 'en') return htmlLang;
    if (typeof Cookies !== 'undefined') {
      var cookieLang = Cookies.get('selectedLanguage');
      if (cookieLang) return cookieLang;
    }
    return htmlLang;
  }

  function pickText(el, prefix) {
    var lang = getCurrentLang();
    return el.getAttribute('data-' + prefix + '-' + lang) || el.getAttribute('data-' + prefix + '-en') || '';
  }

  function showModal(messageEl, modal, text) {
    if (!modal || !messageEl) return;
    messageEl.textContent = text;
    modal.classList.add('show');
  }

  function initAjaxForms() {
    var modal = document.getElementById('form-status-modal');
    var messageEl = document.getElementById('form-status-message');

    document.querySelectorAll('form.ajax-inquiry-form').forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();

        var submitBtn = form.querySelector('button[type="submit"]');
        var originalLabel = submitBtn ? submitBtn.innerHTML : '';
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.style.opacity = '0.7';
        }

        fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' }
        })
          .then(function (response) {
            if (response.ok) {
              showModal(messageEl, modal, pickText(form, 'success'));
              form.reset();
            } else {
              showModal(messageEl, modal, pickText(form, 'error'));
            }
          })
          .catch(function () {
            showModal(messageEl, modal, pickText(form, 'error'));
          })
          .finally(function () {
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.style.opacity = '1';
              submitBtn.innerHTML = originalLabel;
            }
          });
      });
    });

    document.querySelectorAll('#close-modal').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (modal) modal.classList.remove('show');
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAjaxForms);
  } else {
    initAjaxForms();
  }
})();
