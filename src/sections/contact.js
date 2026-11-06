// "Copy email" button: at a booth, a mailto link often opens a mail app nobody uses
export function initContact() {
  const toast = document.querySelector('.toast')
  let timer

  const show = (msg) => {
    if (!toast) return
    toast.textContent = msg
    toast.classList.add('is-on')
    clearTimeout(timer)
    timer = setTimeout(() => toast.classList.remove('is-on'), 2200)
  }

  document.querySelectorAll('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const text = btn.dataset.copy
      try {
        await navigator.clipboard.writeText(text)
      } catch {
        // Older browsers / non-secure contexts: hidden textarea fallback
        const ta = document.createElement('textarea')
        ta.value = text
        ta.setAttribute('readonly', '')
        ta.style.position = 'fixed'
        ta.style.opacity = '0'
        document.body.append(ta)
        ta.select()
        document.execCommand('copy')
        ta.remove()
      }
      show('Email copied ✓')
    })
  })
}
