
(() => {
  const socket = io(); // ✅ สร้าง socket connection
  const ctx = document.getElementById("flowLine").getContext("2d");

  // ✅ Plugin แสดงค่าล่าสุด
  const latestValuePlugin = {
    id: "latestValue",
    afterDraw: (chart) => {
      const ctx = chart.ctx;
      const dataset = chart.data.datasets[0].data;
      if (dataset.length === 0) return;

      const latestFlow = dataset[dataset.length - 1];

      ctx.save();
      ctx.font = "bold 18px Arial";
      ctx.textAlign = "right";
      ctx.fillStyle = "#FFAE4C"; // สีเหลือง
      ctx.fillText("Latest: " + latestFlow + " L/min", chart.chartArea.right, chart.chartArea.top - 10);
      ctx.restore();
    },
  };

  // ✅ กราฟ Flow-rate
  const flowLineChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: "Flow-rate",
        data: [],
        borderColor: "#FFAE4C",
        backgroundColor: "rgba(255, 174, 77, 0.2)",
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
          text: "Flow-rate Over Time",
          font: { size: 22 },
        },
        tooltip: { enabled: true },
        annotation: {
          annotations: {
            vRef: {
              type: "line",
              yMin: 5,
              yMax: 5,
              borderColor: "red",
              borderWidth: 2,
              borderDash: [6, 6],
              label: {
                enabled: false,
                content: "Reference Flow-rate",
                position: "end",
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
            text: "Flow-rate (L/min)",
            color: "#222",
            font: { size: 18, weight: "bold" },
          },
          ticks: {
            color: "#333",
            font: { size: 16 },
          },
          min: 0,
          max: 10
        },
      }
    },
    plugins: [latestValuePlugin] // ✅ plugin
  });

  // ✅ อัปเดตข้อมูลจาก socket
  socket.on("updateLitreChart", ({ Litre, time }) => {
    flowLineChart.data.labels.push(time);
    flowLineChart.data.datasets[0].data.push(Litre);

    if (flowLineChart.data.labels.length > 10) {
      flowLineChart.data.labels.shift();
      flowLineChart.data.datasets[0].data.shift();
    }
    flowLineChart.update('active');
  });

})();
