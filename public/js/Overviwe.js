(() => {
  const socket = io();

  // ฟังก์ชันอัปเดตค่าใน element ตาม id
  function updateOverview(id, newValue, unit = "") {
    const el = document.getElementById(id);
    if (el) el.textContent = `${newValue} ${unit}`.trim();
  }

  // กำหนดค่าเริ่มต้น
  updateOverview("OverviewH2", 0, "cm³");
  updateOverview("OverviewPHA", 0, "pH");
  updateOverview("OverviewPHC", 0, "pH");
  updateOverview("OverviewL", 0, "L/min");
  updateOverview("OverviewV", 0, "V");
  updateOverview("OverviewTem", 0, "°C");
  updateOverview("OverviewHum", 0, "%");
  updateOverview("OverviewIonic", 0, "%");

  // ✅ Event จาก server
  socket.on("updateHydrogenChart", ({ Hydrogen }) => {
    updateOverview("OverviewH2", Hydrogen, "cm³");
  });

  socket.on("updatePHCharts", ({ anode, cathode }) => {
    updateOverview("OverviewPHA", anode, "pH");
    updateOverview("OverviewPHC", cathode, "pH");
  });

  socket.on("updateTemperatureChart", ({ temperature }) => {
    updateOverview("OverviewTem", temperature, "°C");
  });

  socket.on("updateLitreChart", ({ Litre }) => {
    updateOverview("OverviewL", Litre, "L/min");
  });

  socket.on("updateVoltageChart", ({ voltage }) => {
    updateOverview("OverviewV", voltage, "V");
  });

  socket.on("updateHumidityChart", ({ humidity }) => {
    updateOverview("OverviewHum", humidity, "%");
  });

  socket.on("updateIonicChart", ({ ionic }) => {
    updateOverview("OverviewIonic", ionic, "%");
  });
})();
