// Utilitários de performance

// Debounce: Executa função apenas após período de inatividade
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle: Limita execução da função a uma vez por período
export function throttle(func, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// RequestAnimationFrame wrapper para animações suaves
export function rafThrottle(func) {
  let rafId = null;
  return function throttled(...args) {
    if (rafId === null) {
      rafId = requestAnimationFrame(() => {
        func(...args);
        rafId = null;
      });
    }
  };
}

// Detectar se está em dispositivo mobile
export function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Lazy loading de imagens
export function lazyLoadImage(img) {
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const lazyImg = entry.target;
          lazyImg.src = lazyImg.dataset.src;
          lazyImg.classList.remove('lazy');
          observer.unobserve(lazyImg);
        }
      });
    });
    observer.observe(img);
  } else {
    // Fallback para navegadores sem suporte
    img.src = img.dataset.src;
  }
}
