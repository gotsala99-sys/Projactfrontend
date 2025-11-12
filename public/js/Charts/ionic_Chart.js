
(() => {
  const socket = io(); // ✅ สร้าง socket connection
  const ctx = document.getElementById("ionicLine").getContext("2d");

  // ✅ Plugin แสดงค่าล่าสุด
  const latestValuePlugin = {
    id: "latestValue",
    afterDraw: (chart) => {
      const ctx = chart.ctx;
      const dataset = chart.data.datasets[0].data;
      if (dataset.length === 0) return;

      const latestIonic = dataset[dataset.length - 1];

      ctx.save();
      ctx.font = "bold 18px Arial";
      ctx.textAlign = "right";
      ctx.fillStyle = "#DF3C9E";
      ctx.fillText("Latest: " + latestIonic + "%", chart.chartArea.right, chart.chartArea.top - 10);
      ctx.restore();
    },
  };

  const ionicLineChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: "Ionic Conductivity",
        data: [],
        borderColor: "#DF3C9E",
        backgroundColor: "rgba(223,60,158,0.2)",
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
        text: "Ionic Conductivity Over Time",
        font: { size: 22 },
      },
      tooltip: { enabled: true },
      annotation: {
        annotations: {
          ionic50: {
            type: "line",
            yMin: 50,
            yMax: 50,
            borderColor: "red",
            borderWidth: 2,
            borderDash: [6, 6],
            label: {
              enabled: false,
              content: "Neutral Ionic (50%)",
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
          text: "Ionic Conductivity (%)",
          color: "#222",
          font: { size: 18, weight: "bold" },
        },
        ticks: {
          color: "#333",
          font: { size: 16 },
        },
        min: 0,
        max: 100,
      },
      }
    },
    plugins: [latestValuePlugin] // ✅ เพิ่ม plugin เข้ามา
  });

  // ✅ อัปเดตข้อมูลทุก 2 วินาที
   socket.on("updateIonicChart", ({ ionic, time }) => {
    ionicLineChart.data.labels.push(time);
    ionicLineChart.data.datasets[0].data.push(ionic);

    if (ionicLineChart.data.labels.length > 10) {
      ionicLineChart.data.labels.shift();
      ionicLineChart.data.datasets[0].data.shift();
    }
    ionicLineChart.update('active');
    });
  
})();