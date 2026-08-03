(() => {
  const repo = "https://github.com/noisyor/ROBBIN-Rowhammer-Based-Backdoor-Injection-during-Inference.git";
  const quickstarts = {
    "sample-int8": {
      label: "Sample · INT8",
      title: "Reproduce with the supplied profile",
      note: "CIFAR-10 downloads automatically. Add a native INT8 checkpoint at the path below.",
      code: `git clone ${repo}
cd ROBBIN-Rowhammer-Based-Backdoor-Injection-during-Inference

python -m venv .venv
source .venv/bin/activate
pip install "torch>=1.9.0" torchvision numpy matplotlib

unzip profile_results/device1_256MB_4row.npy.zip -d profile_results
mkdir -p saved_models
cp /path/to/ResNet20_INT8.pth.tar saved_models/ResNet20_INT8.pth.tar

python analyze_memory_layout.py \\
  --model saved_models/ResNet20_INT8.pth.tar \\
  --output pagemaps/ResNet20_INT8_pagemap.txt
python main_8bit_mvm.py`
    },
    "sample-fp32": {
      label: "Sample · FP32",
      title: "Reproduce with the supplied profile",
      note: "CIFAR-10 downloads automatically. The current FP32 runner expects CUDA.",
      code: `git clone ${repo}
cd ROBBIN-Rowhammer-Based-Backdoor-Injection-during-Inference

python -m venv .venv
source .venv/bin/activate
pip install "torch>=1.9.0" torchvision numpy matplotlib

unzip profile_results/device1_256MB_4row.npy.zip -d profile_results
mkdir -p saved_model/resnet20_fp32
cp /path/to/model_best.pth.tar saved_model/resnet20_fp32/model_best.pth.tar

python analyze_memory_layout.py \\
  --model saved_model/resnet20_fp32/model_best.pth.tar \\
  --output pagemaps/resnet20_fp32_pagemap.txt
python main_32bit_mvm.py`
    },
    "custom-int8": {
      label: "My DRAM · INT8",
      title: "Use an authorized DRAM profile",
      note: "Set profiling_file in main_8bit_mvm.py to profile_results/custom.npy.",
      code: `# Complete the sample setup first, then convert your profile.
python create_bitflip_matrix.py \\
  --profile /path/to/profile.json \\
  --output profile_results/custom.npy

# In main_8bit_mvm.py, set:
# profiling_file = './profile_results/custom.npy'

python analyze_memory_layout.py \\
  --model saved_models/ResNet20_INT8.pth.tar \\
  --output pagemaps/ResNet20_INT8_pagemap.txt
python main_8bit_mvm.py`
    },
    "custom-fp32": {
      label: "My DRAM · FP32",
      title: "Use an authorized DRAM profile",
      note: "Set profiling_file in main_32bit_mvm.py to profile_results/custom.npy.",
      code: `# Complete the sample setup first, then convert your profile.
python create_bitflip_matrix.py \\
  --profile /path/to/profile.json \\
  --output profile_results/custom.npy

# In main_32bit_mvm.py, set:
# profiling_file = './profile_results/custom.npy'

python analyze_memory_layout.py \\
  --model saved_model/resnet20_fp32/model_best.pth.tar \\
  --output pagemaps/resnet20_fp32_pagemap.txt
python main_32bit_mvm.py`
    }
  };

  const resultData = {
    int8: {
      src: "assets/figures/int8-results.png",
      alt: "INT8 attack success and test accuracy across three devices.",
      caption: "INT8 ResNet-20 · ROBBIN versus Don’t Knock",
      asr: "90.2 / 90.1 / 90.9%",
      ta: "83.0–87.0%",
      thirdLabel: "Page efficiency",
      efficiency: "64–73% fewer",
      note: "Pages than Don’t Knock"
    },
    fp32: {
      src: "assets/figures/fp32-results.png",
      alt: "FP32 attack success and test accuracy across three devices.",
      caption: "FP32 ResNet-20 · ROBBIN versus OneFlip",
      asr: "90.7 / 90.0 / 90.2%",
      ta: "85.0–86.0%",
      thirdLabel: "Collateral damage",
      efficiency: "64.2% TA",
      note: "OneFlip on the densest profile"
    }
  };

  const tabs = [...document.querySelectorAll("[data-tab]")];
  const panels = [...document.querySelectorAll(".tab-panel")];

  function activateTab(id, updateHash = true) {
    const target = document.getElementById(id);
    if (!target) return;
    tabs.forEach((tab) => {
      const active = tab.dataset.tab === id;
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    panels.forEach((panel) => { panel.hidden = panel.id !== id; });
    document.querySelector(".tab-content")?.scrollTo(0, 0);
    window.scrollTo(0, 0);
    if (updateHash) history.replaceState(null, "", `#${id}`);
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activateTab(tab.dataset.tab));
    tab.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      let next = index;
      if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
      if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = tabs.length - 1;
      tabs[next].focus();
      activateTab(tabs[next].dataset.tab);
    });
  });

  document.querySelectorAll("[data-tab-link]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      activateTab(link.dataset.tabLink);
    });
  });

  window.addEventListener("hashchange", () => activateTab(location.hash.slice(1) || "overview", false));

  let profile = "sample";
  let precision = "int8";
  function renderQuickstart() {
    const item = quickstarts[`${profile}-${precision}`];
    document.getElementById("run-path-label").textContent = item.label;
    document.getElementById("command-title").textContent = item.title;
    document.getElementById("quickstart-code").textContent = item.code;
    document.getElementById("command-note").innerHTML = `<strong>Before you run:</strong> ${item.note}`;
  }

  document.querySelectorAll("[data-profile]").forEach((button) => {
    button.addEventListener("click", () => {
      profile = button.dataset.profile;
      document.querySelectorAll("[data-profile]").forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
      renderQuickstart();
    });
  });

  document.querySelectorAll("[data-precision]").forEach((button) => {
    button.addEventListener("click", () => {
      precision = button.dataset.precision;
      document.querySelectorAll("[data-precision]").forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
      renderQuickstart();
    });
  });

  document.querySelectorAll("[data-result]").forEach((button) => {
    button.addEventListener("click", () => {
      const data = resultData[button.dataset.result];
      document.querySelectorAll("[data-result]").forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
      Object.assign(document.getElementById("result-image"), { src: data.src, alt: data.alt });
      document.getElementById("result-caption").textContent = data.caption;
      document.getElementById("result-asr").textContent = data.asr;
      document.getElementById("result-ta").textContent = data.ta;
      document.getElementById("result-third-label").textContent = data.thirdLabel;
      document.getElementById("result-efficiency").textContent = data.efficiency;
      document.getElementById("result-efficiency-note").textContent = data.note;
    });
  });

  document.querySelectorAll(".copy-button").forEach((button) => {
    button.addEventListener("click", async () => {
      const original = button.textContent;
      try {
        await navigator.clipboard.writeText(document.getElementById(button.dataset.copyTarget).textContent);
        button.textContent = "Copied";
      } catch {
        button.textContent = "Select text";
      }
      setTimeout(() => { button.textContent = original; }, 1500);
    });
  });

  activateTab(location.hash.slice(1) || "overview", false);
  renderQuickstart();
})();
