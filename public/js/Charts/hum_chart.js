(() => {
  socket = io(); // ✅ สร้าง socket connection
  const ctx = document.getElementById("humidityLine").getContext("2d");

  // ✅ Plugin แสดงค่าล่าสุด
  const latestValuePlugin = {
    id: "latestValue",
    afterDraw: (chart) => {
      const ctx = chart.ctx;
      const dataset = chart.data.datasets[0].data;
      if (dataset.length === 0) return;

      const latestHum = dataset[dataset.length - 1];

      ctx.save();
      ctx.font = "bold 18px Arial";
      ctx.textAlign = "right";
      ctx.fillStyle = "#2E7D32"; // ✅ ใช้สีเขียวแทน
      ctx.fillText("Latest: " + latestHum + "%RH", chart.chartArea.right, chart.chartArea.top - 10);
      ctx.restore();
    },
  };

  const humidityLineChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: "Humidity",
        data: [],
        borderColor: "#2E7D32",             // ✅ เปลี่ยนเป็นสีเขียว
        backgroundColor: "rgba(46, 125, 50, 0.2)",
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
          text: "Humidity Over Time",
          font: { size: 22 },
        },
        tooltip: { enabled: true },
        annotation: {
          annotations: {
            hum50: {
              type: "line",
              yMin: 50,
              yMax: 50,
              borderColor: "red",
              borderWidth: 2,
              borderDash: [6, 6],
              label: {
                enabled: false,
                content: "Reference 50%RH",
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
            text: "Humidity (%RH)",
            color: "#222",
            font: { size: 18, weight: "bold" },
          },
          ticks: {
            color: "#333",
            font: { size: 16 },
          },
          min: 0,
          max: 100, // ✅ ความชื้นอยู่ในช่วง 0-100%
        },
      }
    },
    plugins: [latestValuePlugin] // ✅ เพิ่ม plugin เข้ามา
  });

  // ✅ อัปเดตข้อมูลทุก 2 วินาที
  socket.on("updateHumidityChart", ({ humidity, time }) => {
    humidityLineChart.data.labels.push(time);
    humidityLineChart.data.datasets[0].data.push(humidity);

    if (humidityLineChart.data.labels.length > 10) {
      humidityLineChart.data.labels.shift();
      humidityLineChart.data.datasets[0].data.shift();
    }
    humidityLineChart.update('active');
  });
})();
