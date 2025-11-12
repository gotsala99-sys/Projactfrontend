(() => {
    const socket = io();
    const CathodeCtx = document.getElementById('phCathodeCircle').getContext('2d');

    // ✅ Gradient สี
    const Cathodegradient = CathodeCtx.createLinearGradient(0, 0, 0, 300);
    Cathodegradient.addColorStop(0, '#58b335ff');
    Cathodegradient.addColorStop(1, '#0b3d12ff');

    let CathodecurrentValue = 0;
    const CathodeminValue = 0;
    const CathodemaxValue = 14;

    // 🔧 Plugin แสดงค่า
    const centerTextPlugin = {
        id: 'centerText',
        afterDraw(chart) {
            const { ctx, chartArea: { width, height } } = chart;
            ctx.save();

            // ✅ ค่า pH ตรงกลาง
            ctx.font = 'bold 26px Montserrat, sans-serif';
            ctx.fillStyle = '#0c5217ff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(CathodecurrentValue.toFixed(1), width / 2, height / 1.35);

            ctx.restore();
        }
    };

    const CathodeChart = new Chart(CathodeCtx, {
        type: 'doughnut', // ✅ ใช้ doughnut
        data: {
            datasets: [{
                data: [0, 100], // [ค่า pH %, ส่วนที่เหลือ]
                backgroundColor: [Cathodegradient, 'rgba(0,0,0,0.08)'],
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
                title: { display: true, text: 'pH Cathode Circle', font: { size: 16 } }
            }
        },
        plugins: [centerTextPlugin]
    });

    // ✅ ขนาดกราฟ
    CathodeChart.canvas.parentNode.style.width = '200px';
    CathodeChart.canvas.parentNode.style.height = '200px';

    // ฟังก์ชันอัปเดตค่า
    function updateCathode(value) {
        CathodecurrentValue = value;
        const safeValue = Math.max(CathodeminValue, Math.min(CathodemaxValue, value));
        const percent = ((safeValue - CathodeminValue) / (CathodemaxValue - CathodeminValue)) * 100;

        CathodeChart.data.datasets[0].data = [percent, 100 - percent];
        CathodeChart.update();
    }

    // ✅ รับค่าจาก WebSocket
    socket.on("updatePHCharts", ({ cathode }) => {
        updateCathode(cathode);
    });
})();
