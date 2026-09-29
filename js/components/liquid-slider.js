/**
 * Liquid Glass Slider component
 * Follows iOS 26 Liquid Glass interaction pattern.
 */
export function createLiquidSlider(options = {}) {
  const { min = 0, max = 100, step = 1, value = 50, label = '', formatValue = v => v, onChange } = options;

  const container = document.createElement('div');
  container.className = 'liquid-slider-container';

  container.innerHTML = `
    <div class="liquid-slider-header" style="display:flex; justify-content:space-between; margin-bottom:var(--space-xs); overflow:hidden;">
      <span class="text-secondary text-small" style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; padding-right:10px;">${label}</span>
      <span class="text-accent text-small font-display" data-value-display style="white-space:nowrap; flex-shrink:0;">${formatValue(value)}</span>
    </div>
    <div class="liquid-slider-track">
      <div class="liquid-slider-fill" style="width: ${((value - min) / (max - min)) * 100}%"></div>
      <div class="liquid-slider-knob" style="left: ${((value - min) / (max - min)) * 100}%"></div>
    </div>
  `;

  const track = container.querySelector('.liquid-slider-track');
  const fill = container.querySelector('.liquid-slider-fill');
  const knob = container.querySelector('.liquid-slider-knob');
  const display = container.querySelector('[data-value-display]');
  
  let currentVal = value;
  let isDragging = false;

  function updateVisuals(val) {
    const pct = ((val - min) / (max - min)) * 100;
    fill.style.width = `${pct}%`;
    knob.style.left = `${pct}%`;
    display.textContent = formatValue(val);
  }

  function handleInteraction(clientX) {
    const rect = track.getBoundingClientRect();
    let pct = (clientX - rect.left) / rect.width;
    pct = Math.max(0, Math.min(1, pct));
    
    let newVal = min + (max - min) * pct;
    if (step) {
      newVal = Math.round(newVal / step) * step;
    }
    
    if (newVal !== currentVal) {
      currentVal = newVal;
      updateVisuals(currentVal);
      if (onChange) onChange(currentVal);
    }
  }

  const startDrag = (e) => {
    isDragging = true;
    knob.classList.add('liquid-slider-knob--active');
    handleInteraction(e.type.includes('touch') ? e.touches[0].clientX : e.clientX);
    
    document.addEventListener(e.type.includes('touch') ? 'touchmove' : 'mousemove', onDrag, { passive: false });
    document.addEventListener(e.type.includes('touch') ? 'touchend' : 'mouseup', endDrag);
  };

  const onDrag = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    handleInteraction(e.type.includes('touch') ? e.touches[0].clientX : e.clientX);
  };

  const endDrag = (e) => {
    isDragging = false;
    knob.classList.remove('liquid-slider-knob--active');
    
    document.removeEventListener('touchmove', onDrag);
    document.removeEventListener('touchend', endDrag);
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', endDrag);
  };

  track.addEventListener('mousedown', startDrag);
  track.addEventListener('touchstart', startDrag, { passive: true });

  return {
    element: container,
    getValue: () => currentVal,
    setValue: (v) => { currentVal = v; updateVisuals(v); }
  };
}
