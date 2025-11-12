(() => {
  socket = io(); // จะ connect ไปที่ server อัตโนมัติ
  const pumpBtn = document.getElementById("pumpBtn");
  const pumpSwitch = document.getElementById("pumpSwitch");
  const pumpStatus = document.getElementById("pumpStatus");

  let pumpRunning = false;

  pumpBtn.addEventListener("click", () => {
    pumpRunning = !pumpRunning;

    if (pumpRunning) {
      pumpBtn.classList.add("running");
      pumpSwitch.classList.add("running");
      pumpStatus.textContent = "online";
      pumpStatus.classList.add("online");
      console.log("👉 ส่ง ON ไป server");
      // ✅ ส่งเป็น string "ON"
      socket?.emit("pumpControl", "ON");
    } else {
      pumpBtn.classList.remove("running");
      pumpSwitch.classList.remove("running");
      pumpStatus.textContent = "offline";
      pumpStatus.classList.remove("online");
      console.log("👉 ส่ง OFF ไป server");
      // ✅ ส่งเป็น string "OFF"
      socket?.emit("pumpControl", "OFF");
    }
  });

  socket.on("pumpStatusUpdate", ({ status }) => {
    pumpRunning = status === "ON";
    pumpBtn.classList.toggle("running", pumpRunning);
    pumpSwitch.classList.toggle("running", pumpRunning);
    pumpStatus.textContent = pumpRunning ? "online" : "offline";
    pumpStatus.classList.toggle("online", pumpRunning);
  });
})();
