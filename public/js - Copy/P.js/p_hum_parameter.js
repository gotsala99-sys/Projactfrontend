(() => {
    const socket = io(); // ✅ สร้าง socket connection
    const humCtx = document.getElementById('Humidity_99').getContext('2d');

    // ✅ Gradient สีสวยๆ (ฟ้าอมเขียว)
    const Humgradient = humCtx.createLinearGradient(0, 0, 0, 150);
    Humgradient.addColorStop(0, '#D1F7C4');  // เขียวอ่อน
    Humgradient.addColorStop(1, '#4CAF50');  // เขียวเข้ม

    let HumcurrentValue = 0;
    const HumminValue = 0;
    const HummaxValue = 100;

    // 🔧 Plugin แสดงค่า
    const centerTextPlugin = {
      id: 'centerText',
      afterDraw(chart) {
        const { ctx, chartArea: { width, height } } = chart;
        ctx.save();

        // ✅ ค่า %RH ตรงกลาง
        ctx.font = 'bold 40px Montserrat, sans-serif';
        ctx.fillStyle = '#2E7D32';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(HumcurrentValue + "%RH", width / 2, height / 1.1);

        // ✅ ค่า min
        ctx.font = 'bold 20px Montserrat, sans-serif';
        ctx.fillStyle = '#444';
        ctx.textAlign = 'left';
        ctx.fillText(HumminValue + "%", width * 0.01, height * 1.05);

        // ✅ ค่า max
        ctx.textAlign = 'right';
        ctx.fillText(HummaxValue + "%", width * 0.98, height * 1.05);

        ctx.restore();
      }
    };

    const humChart = new Chart(humCtx, {
      type: 'doughnut',
      data: {
        datasets: [{
          data: [0, 100],
          backgroundColor: [Humgradient, 'rgba(0,0,0,0.05)'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        rotation: -90,        // ✅ เริ่มจากด้านบน
        circumference: 180,   // ✅ ครึ่งวงกลม
        cutout: '65%',        // ✅ ความหนาของวง
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false },
          title: { display: true, text: 'Humidity Gauge', font: { size: 18 } }
        }
      },
      plugins: [centerTextPlugin]
    });

    humChart.canvas.parentNode.style.width = '300px';
    humChart.canvas.parentNode.style.height = '300px';

    // ✅ ฟังก์ชันอัปเดตค่า
    function updateHum(hum) {
      HumcurrentValue = hum;

      const percent = ((hum - HumminValue) / (HummaxValue - HumminValue)) * 100;
      const remaining = 100 - percent;

      humChart.data.datasets[0].data = [percent, remaining];
      humChart.update();
    }

    // ✅ ฟัง event จาก server
    socket.on("updateHumidityChart", ({ humidity }) => {
      updateHum(humidity);
    });
})();
