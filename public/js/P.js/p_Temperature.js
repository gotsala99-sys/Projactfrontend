
(() => {
    const socket = io(); // ✅ สร้าง socket connection
    const tempCtx = document.getElementById('Temperature_99').getContext('2d');

    // ✅ Gradient สีสวยๆ
    const Temgradient = tempCtx.createLinearGradient(0, 0, 0, 150);
    Temgradient.addColorStop(0, '#B6F0FB');  // ฟ้าอ่อน
    Temgradient.addColorStop(1, '#3CC3DF');  // ฟ้าเข้ม

    let TemcurrentValue = 0;
    const TemminValue = -40;
    const TemmaxValue = 80;

    // 🔧 Plugin แสดงค่า
    const centerTextPlugin = {
      id: 'centerText',
      afterDraw(chart) {
        const { ctx, chartArea: { width, height } } = chart;
        ctx.save();

        ctx.font = 'bold 40px Montserrat, sans-serif';
        ctx.fillStyle = '#0d8aa3ff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(TemcurrentValue + "°C", width / 2, height / 1.1);

        ctx.font = 'bold 20px Montserrat, sans-serif';
        ctx.fillStyle = '#444';
        ctx.textAlign = 'left';
        ctx.fillText(TemminValue + "°C", width * 0.01, height * 1.05);

        ctx.textAlign = 'right';
        ctx.fillText(TemmaxValue + "°C", width * 0.98, height * 1.05);

        ctx.restore();
      }
    };

    const tempChart = new Chart(tempCtx, {
      type: 'doughnut',
      data: {
        datasets: [{
          data: [0, 100],
          backgroundColor: [Temgradient, 'rgba(0,0,0,0.05)'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        rotation: -90,
        circumference: 180,
        cutout: '65%',
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false },
          title: { display: true, text: 'Temperature Gauge', font: { size: 18 } }
        }
      },
      plugins: [centerTextPlugin]
    });

    tempChart.canvas.parentNode.style.width = '300px';
    tempChart.canvas.parentNode.style.height = '300px';

    function updateTemp(temp) {
      TemcurrentValue = temp;

      const percent = ((temp - TemminValue) / (TemmaxValue - TemminValue)) * 100;
      const remaining = 100 - percent;

      tempChart.data.datasets[0].data = [percent, remaining];
      tempChart.update();
    }

    socket.on("updateTemperatureChart", ({ temperature }) => {
      updateTemp(temperature);
    });
})();
