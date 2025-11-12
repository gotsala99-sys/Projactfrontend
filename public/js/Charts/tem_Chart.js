

(() => {
  socket = io(); // ✅ สร้าง socket connection
  const ctx = document.getElementById("temperatureLine").getContext("2d");

  // ✅ Plugin แสดงค่าล่าสุด
  const latestValuePlugin = {
    id: "latestValue",
    afterDraw: (chart) => {
      const ctx = chart.ctx;
      const dataset = chart.data.datasets[0].data;
      if (dataset.length === 0) return;

      const latestTemp = dataset[dataset.length - 1];

      ctx.save();
      ctx.font = "bold 18px Arial";
      ctx.textAlign = "right";
      ctx.fillStyle = "#0d8aa3ff";
      ctx.fillText("Latest: " + latestTemp + "°C", chart.chartArea.right, chart.chartArea.top - 10);
      ctx.restore();
    },
  };

  const temperatureLineChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: "Temperature",
        data: [],
        borderColor: "#0d8aa3ff",
        backgroundColor: "rgba(13, 138, 163, 0.2)",
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
          text: "Temperature Over Time",
          font: { size: 22 },
        },
        tooltip: { enabled: true },
        annotation: {
          annotations: {
          ionic50: {
            type: "line",
            yMin: 20,
            yMax: 20,
            borderColor: "red",
            borderWidth: 2,
            borderDash: [6, 6],
            label: {
              enabled: false,
              content: "Neutral Temperature (50%)",
              position: "end",
              yAdjust: 100,
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
            text: "Temperature (°C)",
            color: "#222",
            font: { size: 18, weight: "bold" },
          },
          ticks: {
            color: "#333",
            font: { size: 16 },
          },
          min: -40,
          max: 80
        },
      }
    },
    plugins: [latestValuePlugin] // ✅ เพิ่ม plugin เข้ามา
  });

  // ✅ อัปเดตข้อมูลทุก 2 วินาที
  socket.on("updateTemperatureChart", ({ temperature, time }) => {
    temperatureLineChart.data.labels.push(time);
    temperatureLineChart.data.datasets[0].data.push(temperature);

    if (temperatureLineChart.data.labels.length > 10) {
      temperatureLineChart.data.labels.shift();
      temperatureLineChart.data.datasets[0].data.shift();
    }
    temperatureLineChart.update('active');
    });
})();
