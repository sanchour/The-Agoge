/**
 * Body Fat % Trend Chart — Smooth Line Chart
 * Shows body fat percentage over time, skipping entries without BF data.
 */

let chartInstance = null;

/**
 * Render body fat trend chart.
 * @param {HTMLCanvasElement} canvas
 * @param {Array} checkIns
 */
export function renderBFChart(canvas, checkIns) {
  if (!canvas || !window.Chart) return;
  if (chartInstance) chartInstance.destroy();

  // Filter to only check-ins with BF data
  const withBF = checkIns.filter(c => c.bodyFat != null);
  
  if (withBF.length < 2) {
    // Not enough BF data — show inline message without destroying canvas
    canvas.style.display = 'none';
    let emptyMsg = canvas.parentElement.querySelector('.chart-empty-inline');
    if (!emptyMsg) {
      emptyMsg = document.createElement('div');
      emptyMsg.className = 'chart-empty-inline';
      emptyMsg.innerHTML = '<p class="text-secondary text-small text-center">Log body fat % with your check-ins to see this chart.</p>';
      canvas.parentElement.appendChild(emptyMsg);
    }
    emptyMsg.style.display = 'flex';
    return;
  }
  
  canvas.style.display = 'block';
  const emptyMsg = canvas.parentElement.querySelector('.chart-empty-inline');
  if (emptyMsg) emptyMsg.style.display = 'none';

  const ctx = canvas.getContext('2d');
  const labels = withBF.map(c => c.date);
  const bfData = withBF.map(c => c.bodyFat);

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Body Fat %',
        data: bfData,
        borderColor: '#C9A15A',
        backgroundColor: 'transparent',
        fill: false,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: '#C9A15A',
        pointBorderColor: '#0A0A0C',
        pointBorderWidth: 2,
        pointHoverRadius: 6,
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(19, 19, 22, 0.9)',
          titleColor: '#F3EFE6',
          bodyColor: '#F3EFE6',
          borderColor: 'rgba(243, 239, 230, 0.1)',
          borderWidth: 1,
          cornerRadius: 8,
          padding: 12,
          displayColors: false,
          callbacks: {
            title: (items) => {
              const d = new Date(items[0].label);
              return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            },
            label: (item) => `Body Fat: ${item.formattedValue}%`
          }
        }
      },
      scales: {
        x: {
          display: true,
          grid: { display: false },
          ticks: {
            color: 'rgba(243, 239, 230, 0.35)',
            font: { family: 'Inter, sans-serif', size: 10 },
            maxTicksLimit: 6,
            callback: function(val) {
              const label = this.getLabelForValue(val);
              const d = new Date(label);
              return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }
          }
        },
        y: {
          display: true,
          grid: { color: 'rgba(243, 239, 230, 0.05)' },
          ticks: {
            color: 'rgba(243, 239, 230, 0.35)',
            font: { family: 'Inter, sans-serif', size: 10 },
            callback: (val) => `${val}%`
          }
        }
      }
    }
  });
}
