(() => {
    const socket = io(); // ✅ สร้าง socket connection
    const CathodeCtx = document.getElementById('phCathode').getContext('2d');

    // ✅ Gradient สี
    const Cathodegradient = CathodeCtx.createLinearGradient(0, 0, 0, 150);
    Cathodegradient.addColorStop(0, '#98cc84ff');
    Cathodegradient.addColorStop(1, '#0c5217ff');

    let CathodecurrentValue = 0;
    const CathodeminValue = 0;
    const CathodemaxValue = 14;

    // 🔧 Plugin แสดงค่า + Min/Max
    const centerTextPlugin = {
        id: 'centerText',
        afterDraw(chart) {
            const { ctx, chartArea: { width, height } } = chart;
            ctx.save();

            // ✅ ค่า pH ตรงกลาง
            ctx.font = 'bold 40px Montserrat, sans-serif';
            ctx.fillStyle = '#0c5217ff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(CathodecurrentValue.toFixed(1), width / 2, height / 1.1);

            // ✅ Min/Max
            ctx.font = 'bold 20px Montserrat, sans-serif';
            ctx.fillStyle = '#444';
            ctx.textAlign = 'left';
            ctx.fillText(CathodeminValue, width * 0.08, height * 1.05);

            ctx.textAlign = 'right';
            ctx.fillText(CathodemaxValue, width * 0.95, height * 1.05);

            ctx.restore();
        }
    };

    const CathodeChart = new Chart(CathodeCtx, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [0, 100],
                backgroundColor: [Cathodegradient, 'rgba(0,0,0,0.08)'],
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
                title: { display: true, text: 'pH Cathode Gauge', font: { size: 18 } }
            }
        },
        plugins: [centerTextPlugin]
    });

    // ✅ ขนาดกราฟ responsive
    CathodeChart.canvas.parentNode.style.width = '300px';
    CathodeChart.canvas.parentNode.style.height = '300px';

    // ฟังก์ชันอัปเดตค่า
    function updateCathode(value) {
        CathodecurrentValue = value;

        const safeValue = Math.max(CathodeminValue, Math.min(CathodemaxValue, value));
        const percent = ((safeValue - CathodeminValue) / (CathodemaxValue - CathodeminValue)) * 100;

        CathodeChart.data.datasets[0].data = [percent, 100 - percent];
        CathodeChart.update();
    }

    // รับค่าจาก WebSocket
    socket.on( "updatePHCharts", ( { cathode } ) => {
        updateCathode( cathode );
    });
})();
