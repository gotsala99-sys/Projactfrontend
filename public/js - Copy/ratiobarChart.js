(() => {
    const ctx = document.getElementById('ratioBarChart').getContext('2d');

    const data = [20, 15, 65]; // ตัวอย่างข้อมูลอัตราส่วน
    const labels = ['KOH', 'Na₂SO₄', 'H₂O'];
    // สร้างกราฟแท่งแนวนอน
    const ratioBarChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Composition (%)',
                data: data,
                backgroundColor: [
                    '#4caf50',   // KOH
                    '#ff9800',   // Na₂SO₄
                    '#2196f3'    // H₂O
                ],
                borderRadius: 8 // มุมโค้งสวยงาม
            }]
        },
        options: {
            indexAxis: 'y', // ✅ ทำให้เป็นแท่งแนวนอน
            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Composition Ratio (KOH / Na₂SO₄ / H₂O)',
                    font: { size: 18 }
                },
                tooltip: {
                    callbacks: {
                        label: (context) => `${context.raw}%`
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    max: 100, // เพราะเป็น % รวมกัน 100%
                    ticks: {
                        callback: (value) => value + '%'
                    }
                }
            }
        }
    });
})();