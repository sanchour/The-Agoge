/**
 * Phase Comparison Chart — Planned vs Actual Trajectory
 * Shows dual lines per phase with band fill for deviation.
 */

let chartInstance = null;

/**
 * Render phase comparison chart.
 * @param {HTMLCanvasElement} canvas
 * @param {Array} checkIns - All check-ins
 * @param {Array} phases - All phases
 */
export function renderComparisonChart(canvas, checkIns, phases) {
  if (!canvas || !window.Chart) return;
  if (chartInstance) chartInstance.destroy();

  // Build planned trajectory from phase targets
  const plannedLabels = [];
  const plannedWeights = [];
  const phaseColors = [];
  const phaseBoundaries = [];

  phases.forEach((phase, i) => {
    const label = phase.name;
    plannedLabels.push(label);
    plannedWeights.push(phase.targetWeight);
    
    if (phase.type === 'CUT') {
      phaseColors.push('rgba(140, 47, 47, 0.8)');
    } else {
      phaseColors.push('rgba(47, 74, 60, 0.8)');
    }
  });

  // Build actual trajectory from completed/active phases with actuals
  const actualWeights = phases.map(p => p.actualWeight);

  const ctx = canvas.getContext('2d');

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: plannedLabels,
      datasets: [
        {
          label: 'Planned',
          data: plannedWeights,
          borderColor: 'rgba(201, 161, 90, 0.5)',
          backgroundColor: 'transparent',
          borderDash: [6, 4],
          borderWidth: 2,
          tension: 0.3,
          pointRadius: 4,
          pointBackgroundColor: phaseColors,
          pointBorderColor: 'rgba(201, 161, 90, 0.5)',
          pointBorderWidth: 1,
          pointHoverRadius: 6,
          order: 2
        },
        {
          label: 'Actual',
          data: actualWeights,
          borderColor: '#C9A15A',
          backgroundColor: 'rgba(201, 161, 90, 0.1)',
          fill: false,
          borderWidth: 2.5,
          tension: 0.3,
          pointRadius: 5,
          pointBackgroundColor: '#C9A15A',
          pointBorderColor: '#0A0A0C',
          pointBorderWidth: 2,
          pointHoverRadius: 7,
          spanGaps: false,
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
        legend: {
          display: true,
          position: 'top',
          align: 'end',
          labels: {
            color: 'rgba(243, 239, 230, 0.6)',
            font: { family: 'Inter, sans-serif', size: 11 },
            boxWidth: 12,
            boxHeight: 2,
            padding: 16,
            usePointStyle: false
          }
        },
        tooltip: {
          backgroundColor: 'rgba(19, 19, 22, 0.9)',
          titleColor: '#F3EFE6',
          bodyColor: '#F3EFE6',
          borderColor: 'rgba(243, 239, 230, 0.1)',
          borderWidth: 1,
          cornerRadius: 8,
          padding: 12,
          callbacks: {
            label: (item) => {
              const val = item.raw;
              if (val == null) return `${item.dataset.label}: Not logged`;
              return `${item.dataset.label}: ${val} kg`;
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
            font: { family: 'Inter, sans-serif', size: 9 },
            maxRotation: 45
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
