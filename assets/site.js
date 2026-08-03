(() => {
  const reports = {
    fp32: {
      label: "ResNet-20 / CIFAR-10 / FP32",
      asr: [56.48,57.11,58.12,59.61,63.67,64.77,66.48,71.25,72.73,74.69,74.92,76.48,79.30,79.92,80.70,81.80,82.34,82.97,84.45,85.86,87.03,87.19,87.27,87.34,87.42,87.50,87.58,87.66,87.81,87.89,87.97,88.05,88.20,88.28,88.36,88.59,88.67,88.75,88.83,89.06,89.14,89.22,89.30,89.53,89.69,89.77,89.84,89.92,90.00],
      accuracy: [91.25,91.25,91.64,91.41,90.86,90.31,90.00,88.83,88.75,88.36,88.36,88.36,87.42,87.11,87.11,86.95,86.80,86.41,85.94,85.08,85.23,85.23,85.23,85.00,85.00,85.00,85.00,85.00,85.08,85.16,85.08,85.00,85.00,85.00,85.00,85.08,85.08,85.08,85.08,85.23,85.31,85.08,85.16,85.00,85.00,85.00,85.00,85.00,85.00]
    },
    int8: {
      label: "ResNet-20 / CIFAR-10 / INT8",
      asr: [59.78,66.91,68.20,69.97,71.91,74.67,77.83,78.69,79.78,80.75,83.22,84.44,85.12,85.61,86.19,86.88,87.53,88.36,88.75,90.17],
      accuracy: [90.73,88.64,88.30,88.23,87.19,86.98,86.28,85.73,85.20,85.28,85.14,84.50,84.50,84.56,84.50,84.42,84.02,83.78,83.70,83.00]
    }
  };

  const grid = document.querySelector("#memory-grid");
  if (grid) {
    const vulnerable = new Set([7, 19, 33, 46, 67, 79, 92, 105]);
    const mapped = new Set([20, 45, 66, 91]);
    for (let index = 0; index < 120; index += 1) {
      const cell = document.createElement("span");
      cell.className = "memory-cell";
      if (vulnerable.has(index)) cell.classList.add("vulnerable");
      if (mapped.has(index)) cell.classList.add("mapped");
      grid.appendChild(cell);
    }
  }

  const canvas = document.querySelector("#robbin-chart");
  const range = document.querySelector("#attack-progress");
  if (!canvas || !range) return;

  const context = canvas.getContext("2d");
  const buttons = [...document.querySelectorAll("[data-precision]")];
  const mappingValue = document.querySelector("#mapping-value");
  const asrValue = document.querySelector("#asr-value");
  const accuracyValue = document.querySelector("#accuracy-value");
  const configLabel = document.querySelector("#config-label");
  const statusLabel = document.querySelector("#status-label");
  const progressMax = document.querySelector("#progress-max");
  let precision = "fp32";

  function drawLine(values, count, color, width, height, dpr) {
    const min = 50;
    const max = 95;
    context.beginPath();
    values.slice(0, count + 1).forEach((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - ((value - min) / (max - min)) * height;
      if (index === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    });
    context.strokeStyle = color;
    context.lineWidth = 2 * dpr;
    context.lineJoin = "round";
    context.lineCap = "round";
    context.stroke();
  }

  function draw() {
    const report = reports[precision];
    const count = Number(range.value);
    const bounds = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.round(bounds.width * dpr));
    canvas.height = Math.max(1, Math.round(bounds.height * dpr));
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawLine(report.asr, count, "#82c7d8", canvas.width, canvas.height, dpr);
    drawLine(report.accuracy, count, "#7ed7a8", canvas.width, canvas.height, dpr);
    mappingValue.textContent = String(count);
    asrValue.textContent = `${report.asr[count].toFixed(2)}%`;
    accuracyValue.textContent = `${report.accuracy[count].toFixed(2)}%`;
    statusLabel.textContent = report.asr[count] >= 90 ? "Target ASR reached" : "Optimization in progress";
  }

  function selectPrecision(nextPrecision) {
    precision = nextPrecision;
    const report = reports[precision];
    const max = report.asr.length - 1;
    range.max = String(max);
    range.value = String(max);
    configLabel.textContent = report.label;
    progressMax.textContent = `${max} pages`;
    buttons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.precision === precision)));
    draw();
  }

  buttons.forEach((button) => button.addEventListener("click", () => selectPrecision(button.dataset.precision)));
  range.addEventListener("input", draw);
  window.addEventListener("resize", draw);
  selectPrecision("fp32");
})();
