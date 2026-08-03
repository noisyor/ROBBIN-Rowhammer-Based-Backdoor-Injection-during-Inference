(() => {
  const repoUrl = "https://github.com/noisyor/ROBBIN-Rowhammer-Based-Backdoor-Injection-during-Inference.git";
  const quickstarts = {
    "sample-int8": {
      label: "Sample profile · INT8",
      title: "Reproduce with the supplied profile",
      note: "CIFAR-10 downloads automatically. The INT8 runner expects a native INT8 checkpoint with scale factors at the path shown below.",
      code: `git clone ${repoUrl}
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
      label: "Sample profile · FP32",
      title: "Reproduce with the supplied profile",
      note: "CIFAR-10 downloads automatically. The current FP32 runner expects CUDA and the ResNet-20 checkpoint path shown below.",
      code: `git clone ${repoUrl}
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
      label: "My DRAM profile · INT8",
      title: "Use a profile from your test system",
      note: "Profile only authorized hardware. After conversion, set profiling_file in main_8bit_mvm.py to profile_results/custom.npy before running.",
      code: `# First complete the sample-profile setup, then convert your
# authorized Blacksmith JSON profile into ROBBIN's matrix format.
python create_bitflip_matrix.py \\
  --profile /path/to/your_profile.json \\
  --output profile_results/custom.npy

# In main_8bit_mvm.py, set:
# profiling_file = './profile_results/custom.npy'

python analyze_memory_layout.py \\
  --model saved_models/ResNet20_INT8.pth.tar \\
  --output pagemaps/ResNet20_INT8_pagemap.txt

python main_8bit_mvm.py`
    },
    "custom-fp32": {
      label: "My DRAM profile · FP32",
      title: "Use a profile from your test system",
      note: "Profile only authorized hardware. After conversion, set profiling_file in main_32bit_mvm.py to profile_results/custom.npy before running.",
      code: `# First complete the sample-profile setup, then convert your
# authorized Blacksmith JSON profile into ROBBIN's matrix format.
python create_bitflip_matrix.py \\
  --profile /path/to/your_profile.json \\
  --output profile_results/custom.npy

# In main_32bit_mvm.py, set:
# profiling_file = './profile_results/custom.npy'

python analyze_memory_layout.py \\
  --model saved_model/resnet20_fp32/model_best.pth.tar \\
  --output pagemaps/resnet20_fp32_pagemap.txt

python main_32bit_mvm.py`
    }
  };

  const results = {
    int8: {
      src: "assets/figures/int8-results.png",
      alt: "INT8 attack success rate and test accuracy for ROBBIN and Don't Knock across three DRAM devices.",
      caption: "<strong>INT8 ResNet-20.</strong> ROBBIN reaches roughly 90% ASR on all three devices while retaining 83.0–87.0% clean test accuracy.",
      cards: [
        ["Device consistency", "90.2 / 90.1 / 90.9%", "ASR on Devices A, B, and C."],
        ["Clean accuracy", "83.0–87.0%", "TA after the INT8 attack."],
        ["Page efficiency", "64–73% fewer", "DRAM pages than Don’t Knock on ResNet-20."]
      ]
    },
    fp32: {
      src: "assets/figures/fp32-results.png",
      alt: "FP32 attack success rate and test accuracy for ROBBIN and OneFlip across three DRAM devices.",
      caption: "<strong>FP32 ResNet-20.</strong> ROBBIN maintains about 90% ASR and 85–86% TA across all devices; OneFlip degrades sharply on denser fault profiles.",
      cards: [
        ["Device consistency", "90.7 / 90.0 / 90.2%", "ASR on Devices A, B, and C."],
        ["Clean accuracy", "85.0–86.0%", "TA after the FP32 attack."],
        ["Collateral damage", "64.2% TA", "OneFlip on the densest evaluated profile."]
      ]
    }
  };

  let profile = "sample";
  let precision = "int8";
  const code = document.querySelector("#quickstart-code");
  const runPathLabel = document.querySelector("#run-path-label");
  const commandTitle = document.querySelector("#command-title");
  const commandNote = document.querySelector("#command-note");

  function renderQuickstart() {
    const item = quickstarts[`${profile}-${precision}`];
    code.textContent = item.code;
    runPathLabel.textContent = item.label;
    commandTitle.textContent = item.title;
    commandNote.innerHTML = `<strong>Before you run:</strong> ${item.note}`;
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

  document.querySelectorAll(".copy-button").forEach((button) => {
    button.addEventListener("click", async () => {
      const target = document.getElementById(button.dataset.copyTarget);
      const label = button.textContent;
      try {
        await navigator.clipboard.writeText(target.textContent);
        button.textContent = "Copied";
        setTimeout(() => { button.textContent = label; }, 1600);
      } catch {
        button.textContent = "Select and copy";
      }
    });
  });

  document.querySelectorAll("[data-result]").forEach((button) => {
    button.addEventListener("click", () => {
      const item = results[button.dataset.result];
      document.querySelectorAll("[data-result]").forEach((tab) => tab.setAttribute("aria-pressed", String(tab === button)));
      const image = document.querySelector("#result-image");
      image.src = item.src;
      image.alt = item.alt;
      document.querySelector("#result-caption").innerHTML = item.caption;
      document.querySelector("#result-cards").innerHTML = item.cards.map(([label, value, note]) => `<article><span>${label}</span><strong>${value}</strong><p>${note}</p></article>`).join("");
    });
  });

  const sectionLinks = [...document.querySelectorAll('.site-tabs a[href^="#"]')];
  const sections = sectionLinks.map((link) => document.querySelector(link.getAttribute("href"))).filter(Boolean);
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      sectionLinks.forEach((link) => link.toggleAttribute("aria-current", link.getAttribute("href") === `#${visible.target.id}`));
    }, { rootMargin: "-20% 0px -65%", threshold: [0, 0.2, 0.5] });
    sections.forEach((section) => observer.observe(section));
  }

  renderQuickstart();
})();
