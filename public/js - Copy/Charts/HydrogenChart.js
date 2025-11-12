
(() => {
  const socket = io(); // ✅ สร้าง socket connection
  const ctx = document.getElementById("hydrogenLine").getContext("2d");

  // ✅ Plugin แสดงค่าล่าสุด
  const latestValuePlugin = {
    id: "latestValue",
    afterDraw: (chart) => {
      const ctx = chart.ctx;
      const dataset = chart.data.datasets[0].data;
      if (dataset.length === 0) return;

      const latestVal = dataset[dataset.length - 1];

      ctx.save();
      ctx.font = "bold 18px Arial";
      ctx.textAlign = "right";
      ctx.fillStyle = "#9900ffff"; // เขียวสำหรับ Hydrogen
      ctx.fillText("Latest: " + latestVal + " ppm", chart.chartArea.right, chart.chartArea.top - 10);
      ctx.restore();
    },
  };

  const hydrogenLineChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: "Hydrogen",
        data: [],
        borderColor: "#9900ffff",
        backgroundColor: "rgba(153, 0, 255, 0.2)",
        borderWidth: 2,
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      animation: false,
      plugins: {
        legend: {
          display: true,
          position: "top",
          labels: { font: { size: 16 } },
        },
        title: {
          display: true,
          text: "Hydrogen Concentration Over Time",
          font: { size: 22 },
        },
        tooltip: { enabled: true },
        annotation: {
          annotations: {
            safeLevel: {
              type: "line",
              yMin: 500,
              yMax: 500,
              borderColor: "red",
              borderWidth: 2,
              borderDash: [6, 6],
              label: {
                enabled: false,
                content: "Safety Threshold",
                position: "end",
                yAdjust: -10,
                font: { size: 14 },
              },
            },
          },
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Time",
            color: "#222",
            font: { size: 18, weight: "bold" },
          },
          ticks: {
            color: "#333",
            font: { size: 16 },
          },
        },
        y: {
          title: {
            display: true,
            text: "Hydrogen (ppm)",
            color: "#222",
            font: { size: 18, weight: "bold" },
          },
          ticks: {
            color: "#333",
            font: { size: 16 },
          },
          min: 0,
          max: 1000
        },
      }
    },
    plugins: [latestValuePlugin] // ✅ เพิ่ม plugin เข้ามา
  });

  // ✅ อัปเดตข้อมูล Hydrogen
  socket.on("updateHydrogenChart", ({ Hydrogen, time }) => {
    hydrogenLineChart.data.labels.push(time);
    hydrogenLineChart.data.datasets[0].data.push(Hydrogen);

    if (hydrogenLineChart.data.labels.length > 10) {
      hydrogenLineChart.data.labels.shift();
      hydrogenLineChart.data.datasets[0].data.shift();
    }
    hydrogenLineChart.update('active');
  });
})();
