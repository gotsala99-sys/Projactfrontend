(() => {
    const socket = io();
    const AnodeCtx = document.getElementById('phAnodeCircle').getContext('2d');

    // ✅ Gradient สี
    const Anodegradient = AnodeCtx.createLinearGradient(0, 0, 0, 300);
    Anodegradient.addColorStop(0, '#f3c699ff' );
    Anodegradient.addColorStop(1, '#f59d32ff');

    let AnodecurrentValue = 0;
    const AnodeminValue = 0;
    const AnodemaxValue = 14;

    // 🔧 Plugin แสดงค่า
    const centerTextPlugin = {
        id: 'centerText',
        afterDraw(chart) {
            const { ctx, chartArea: { width, height } } = chart;
            ctx.save();

            // ✅ ค่า pH ตรงกลาง
            ctx.font = 'bold 26px Montserrat, sans-serif';
            ctx.fillStyle = '#80531dff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(AnodecurrentValue.toFixed(1), width / 2, height / 1.35);

            ctx.restore();
        }
    };

    const AnodeChart = new Chart(AnodeCtx, {
        type: 'doughnut', // ✅ ใช้ doughnut
        data: {
            datasets: [{
                data: [0, 100], // [ค่า pH %, ส่วนที่เหลือ]
                backgroundColor: [Anodegradient, 'rgba(0,0,0,0.08)'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            rotation: -90,        // เริ่มจากด้านบน
            circumference: 360,   // ✅ เต็มวงกลม
            cutout: '50%',        // ความหนาของวง
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false },
                title: { display: true, text: 'pH Anode Circle', font: { size: 16 } }
            }
        },
        plugins: [centerTextPlugin]
    });

    // ✅ ขนาดกราฟ
    AnodeChart.canvas.parentNode.style.width = '200px';
    AnodeChart.canvas.parentNode.style.height = '200px';

    // ฟังก์ชันอัปเดตค่า
    function updateAnode(value) {
        AnodecurrentValue = value;
        const safeValue = Math.max(AnodeminValue, Math.min(AnodemaxValue, value));
        const percent = ((safeValue - AnodeminValue) / (AnodemaxValue - AnodeminValue)) * 100;

        AnodeChart.data.datasets[0].data = [percent, 100 - percent];
        AnodeChart.update();
    }

    // ✅ รับค่าจาก WebSocket
    socket.on("updatePHCharts", ({ anode }) => {
        updateAnode(anode);
    });
})();
