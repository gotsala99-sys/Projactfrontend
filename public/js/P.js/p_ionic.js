(() => {
    const socket = io(); // ✅ สร้าง socket connection
    const ionicCtx = document.getElementById('Ionic').getContext('2d');

    // ✅ สร้าง Gradient สวยๆ
    const ionicgradient = ionicCtx.createLinearGradient(0, 0, 0, 150);
    ionicgradient.addColorStop(0, '#FF69B4');  // ชมพูอ่อนด้านบน
    ionicgradient.addColorStop(1, '#DF3C9E');  // ชมพูเข้มด้านล่าง

    let ioniccurrentValue = 0;
    const ionicminValue = 0;
    const ionicmaxValue = 100;

    // 🔧 Plugin สำหรับแสดงค่าเปอร์เซ็นต์ตรงกลางกราฟ
    const centerTextPlugin = {
        id: 'centerText',
        afterDraw(chart) {
            const { ctx, chartArea: { width, height } } = chart;
            ctx.save();
            ctx.font = 'bold 40px sans-serif';
            ctx.fillStyle = '#DF3C9E';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(ioniccurrentValue , width / 2, height / 1.1);

            // เพิ่มข้อความ min และ max ที่ด้านล่าง
            ctx.font = 'bold 20px "Montserrat", sans-serif';
            ctx.fillStyle = '#444';
            ctx.textAlign = 'left';
            ctx.fillText(ionicminValue, width * 0.07, height * 1.05 );   // min ด้านซ้าย
            ctx.textAlign = 'right';
            ctx.fillText(ionicmaxValue, width * 0.955, height * 1.05 );   // max ด้านขวา

            ctx.restore();
        }
    };

    const ionicChart = new Chart(ionicCtx, {
        type: 'doughnut',
        data: {
            labels: ['Ionic Conductivity', 'Remaining'],
            datasets: [{
                label: 'Ionic Conductivity Level',
                data: [0, 100],
                backgroundColor: [
                    ionicgradient, 
                    'rgba(223, 60, 158, 0.1)'
                ],
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
                title: {
                    display: true,
                    text: 'Ionic Conductivity Level',
                    font: { size: 18 }
                },
                tooltip: { enabled: false }
            }
        },
        plugins: [centerTextPlugin]
    });

    ionicChart.canvas.parentNode.style.width = '300px';
    ionicChart.canvas.parentNode.style.height = '300px';

    function updateChart(value) {
        ioniccurrentValue = value;
        const remaining = 100 - value;
        ionicChart.data.datasets[0].data = [value, remaining];
        ionicChart.update();
    }

    socket.on("updateIonicChart", ({ ionic }) => {
        updateChart(ionic);
    });
})();
