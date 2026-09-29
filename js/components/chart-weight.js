/**
 * Weight Trend Chart — Smooth Area Chart
 * Canvas-based via Chart.js with gradient fill and 7-day rolling average.
 */

let chartInstance = null;

/**
 * Compute rolling average.
 * @param {number[]} data
 * @param {number} window
 * @returns {(number|null)[]}
 */
function rollingAverage(data, window = 7) {
  return data.map((_, i) => {
    if (i < window - 1) return null;
    const slice = data.slice(i - window + 1, i + 1);
    return parseFloat((slice.reduce((a, b) => a + b, 0) / slice.length).toFixed(1));
  });
}

/**
 * Render weight trend chart.
 * @param {HTMLCanvasElement} canvas
 * @param {Array} checkIns
 */
export function renderWeightChart(canvas, checkIns) {
  if (!canvas || !window.Chart) return;
  if (chartInstance) chartInstance.destroy();

  const ctx = canvas.getContext('2d');
  const labels = checkIns.map(c => c.date);
  const weights = checkIns.map(c => c.weight);
  const avg = rollingAverage(weights, 7);

  // Gradient fill
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.parentElement.clientHeight || 200);
  gradient.addColorStop(0, 'rgba(201, 161, 90, 0.25)');
  gradient.addColorStop(1, 'rgba(201, 161, 90, 0.0)');

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Weight',
          data: weights,
          borderColor: 'rgba(201, 161, 90, 0.5)',
          backgroundColor: gradient,
          fill: true,
          tension: 0.4,
          pointRadius: 2,
          pointBackgroundColor: '#C9A15A',
          pointBorderColor: 'transparent',
          pointHoverRadius: 5,
          pointHoverBackgroundColor: '#C9A15A',
          borderWidth: 1.5,
          order: 2
        },
        {
          label: '7-Day Average',
          data: avg,
          borderColor: '#C9A15A',
          backgroundColor: 'transparent',
          fill: false,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointHoverBackgroundColor: '#C9A15A',
          borderWidth: 2.5,
          borderDash: [],
          order: 1
        }
      ]
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
            label: (item) => {
              return `${item.dataset.label}: ${item.formattedValue} kg`;
            }
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
            callback: (val) => `${val} kg`
          }
        }
      }
    }
  });
}
