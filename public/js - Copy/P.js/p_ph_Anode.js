

(() => {
    const socket = io(); // ✅ สร้าง socket connection
    const AnodeCtx = document.getElementById('phAnode').getContext('2d');

    // ✅ Gradient สี
    const Anodegradient = AnodeCtx.createLinearGradient(0, 0, 0, 150);
    Anodegradient.addColorStop(0, '#F6E0CA');  // ฟ้าอ่อน
    Anodegradient.addColorStop(1, '#FFAE4C');  // ฟ้าเข้ม

    let AnodecurrentValue = 0;
    const AnodeminValue = 0;
    const AnodemaxValue = 14;

    // 🔧 Plugin แสดงค่า + Min/Max
    const centerTextPlugin = {
        id: 'centerText',
        afterDraw(chart) {
            const { ctx, chartArea: { width, height } } = chart;
            ctx.save();

            // ✅ ค่า pH ตรงกลาง
            ctx.font = 'bold 40px Montserrat, sans-serif';
            ctx.fillStyle = '#FFAE4C';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(AnodecurrentValue.toFixed(1), width / 2, height / 1.1);

            // ✅ Min/Max
            ctx.font = 'bold 20px Montserrat, sans-serif';
            ctx.fillStyle = '#444';
            ctx.textAlign = 'left';
            ctx.fillText(AnodeminValue, width * 0.08, height * 1.05);

            ctx.textAlign = 'right';
            ctx.fillText(AnodemaxValue, width * 0.95, height * 1.05);

            ctx.restore();
        }
    };

    const AnodeChart = new Chart(AnodeCtx, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [0, 100],
                backgroundColor: [Anodegradient, 'rgba(0,0,0,0.08)'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            rotation: -90,
            circumference: 180,
            cutout: '65%', // ✅ ให้ดูเรียวสวยขึ้น
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false },
                title: { 
                    display: true, 
                    text: 'pH Anode Gauge', 
                    font: { size: 18 }
                }
            }
        },
        plugins: [centerTextPlugin]
    });

    // ✅ ขนาดกราฟ
    AnodeChart.canvas.parentNode.style.width = '300px';
    AnodeChart.canvas.parentNode.style.height = '300px';

    // ฟังก์ชันอัปเดตค่า
    function updateAnode(value) {
        AnodecurrentValue = value;

        // ✅ Clamp ค่าให้อยู่ระหว่าง 0-14
        const safeValue = Math.max(AnodeminValue, Math.min(AnodemaxValue, value));

        const percent = ((safeValue - AnodeminValue) / (AnodemaxValue - AnodeminValue)) * 100;
        const remaining = 100 - percent;

        AnodeChart.data.datasets[0].data = [percent, remaining];
        AnodeChart.update();
    }

    // ✅  pH ทุก 2 วินาที
   socket.on( "updatePHCharts", ( { anode } ) => {
        updateAnode( anode );
    });
})();
