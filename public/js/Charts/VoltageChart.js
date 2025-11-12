(() => {
  const socket = io();
  const ctx = document.getElementById("voltageLine").getContext("2d");

  // ✅ Plugin แสดงค่าล่าสุด
  const latestValuePlugin = {
    id: "latestValue",
    afterDraw: (chart) => {
      const ctx = chart.ctx;
      const dataset = chart.data.datasets[0].data;
      if (dataset.length === 0) return;

      const latestVolt = dataset[dataset.length - 1];

      ctx.save();
      ctx.font = "bold 18px Arial";
      ctx.textAlign = "right";
      ctx.fillStyle = "#007f5f"; // ✅ เขียวเข้ม
      ctx.fillText("Latest: " + latestVolt + " V", chart.chartArea.right, chart.chartArea.top - 10);
      ctx.restore();
    },
  };

  const voltageLineChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: "Voltage",
        data: [],
        borderColor: "#0077b6",              // ✅ ฟ้าน้ำทะเล
        backgroundColor: "rgba(0, 119, 182, 0.2)", // ✅ ฟ้าอ่อนโปร่งใส
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
          labels: { font: { size: 16 }, color: "#222" },
        },
        title: {
          display: true,
          text: "Voltage Over Time",
          font: { size: 22, weight: "bold" },
          color: "#1e3a4c" // ✅ น้ำเงินเข้ม
        },
        tooltip: { enabled: true },
        annotation: {
          annotations: {
            vRef: {
              type: "line",
              yMin: 2.5,
              yMax: 2.5,
              borderColor: "#ff6b6b", // ✅ แดงสด
              borderWidth: 2,
              borderDash: [6, 6],
              label: {
                enabled: false,
                content: "Reference Voltage",
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
            text: "Voltage (V)",
            color: "#222",
            font: { size: 18, weight: "bold" },
          },
          ticks: {
            color: "#333",
            font: { size: 16 },
          },
          min: 0,
          max: 5
        },
      }
    },
    plugins: [latestValuePlugin]
  });

  // ✅ อัปเดตข้อมูลจาก server
  socket.on("updateVoltageChart", ({ voltage, time }) => {
    voltageLineChart.data.labels.push(time);
    voltageLineChart.data.datasets[0].data.push(voltage);

    if (voltageLineChart.data.labels.length > 10) {
      voltageLineChart.data.labels.shift();
      voltageLineChart.data.datasets[0].data.shift();
    }
    voltageLineChart.update('active');
  });
})();
