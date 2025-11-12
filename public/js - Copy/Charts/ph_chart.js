(() => {
  const socket = io(); // ✅ สร้าง socket connection
  // ✅ Plugin แสดงค่าล่าสุด
  const latestValuePlugin = {
    id: "latestValue",
    afterDraw: (chart) => {
      const ctx = chart.ctx;
      const dataset = chart.data.datasets[0].data;
      const dataset2 = chart.data.datasets[1].data;
      if (dataset.length === 0 || dataset2.length === 0) return;

      const latestCathode = dataset[dataset.length - 1];
      const latestAnode = dataset2[dataset2.length - 1];

      ctx.save();
      ctx.font = "bold 16px Arial";
      ctx.textAlign = "right";

      ctx.fillStyle = "green";
      ctx.fillText("Cathode: " + latestCathode, chart.chartArea.right, chart.chartArea.top - 45);

      ctx.fillStyle = "orange";
      ctx.fillText("Anode: " + latestAnode, chart.chartArea.right, chart.chartArea.top - 20);
      ctx.restore();
    },
  };

  // ✅ เตรียม ctx
  const ctx1 = document.getElementById("phChart1").getContext("2d");
  // const ctx2 = document.getElementById("phChart2").getContext("2d");

  // ✅ กำหนดข้อมูลและ options ใช้ร่วมกัน
  const dataTemplate = {
    labels: [],
    datasets: [
      {
        label: "Cathode",
        data: [],
        borderColor: "green",
        backgroundColor: "rgba(0, 128, 0, 0.2)",
        borderWidth: 2,
        tension: 0.4,
        fill: true,
      },
      {
        label: "Anode",
        data: [],
        borderColor: "orange",
        backgroundColor: "rgba(255, 165, 0, 0.2)",
        borderWidth: 2,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const options = {
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
        text: "Cathode & Anode pH Over Time",
        font: { size: 22 },
      },
      tooltip: { enabled: true },
      annotation: {
        annotations: {
          pH7: {
            type: "line",
            yMin: 7,
            yMax: 7,
            borderColor: "red",
            borderWidth: 2,
            borderDash: [6, 6],
            label: {
              enabled: false,
              content: "Neutral pH (7)",
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
          text: "pH Value",
          color: "#222",
          font: { size: 18, weight: "bold" },
        },
        ticks: {
          color: "#333",
          font: { size: 16 },
        },
        min: 0,
        max: 14,
      },
    },
  };

  // ✅ สร้าง Chart 2 ตัว
  const chart1 = new Chart(ctx1, {
    type: "line",
    data: structuredClone(dataTemplate), // clone เพื่อไม่ให้แชร์ reference
    options,
    plugins: [latestValuePlugin],
  });

  // const chart2 = new Chart(ctx2, {
  //   type: "line",
  //   data: structuredClone(dataTemplate),
  //   options,
  //   plugins: [latestValuePlugin],
  // });
  // ✅ รับค่าจาก server ผ่าน socket.io
  socket.on("updatePHCharts", ({ cathode, anode, time }) => {
    [chart1].forEach(chart => {
      chart.data.labels.push(time);
      chart.data.datasets[0].data.push(cathode);
      chart.data.datasets[1].data.push(anode);

      if (chart.data.labels.length > 10) {
        chart.data.labels.shift();
        chart.data.datasets.forEach(ds => ds.data.shift());
      }
      chart.update();
    });
  });
})();