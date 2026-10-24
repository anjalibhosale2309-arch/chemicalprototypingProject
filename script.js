// ========================================================
// JavaScript for Herbal Neem Hand Sanitizer Project
// ========================================================

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide icons
  if (window.lucide) {
    lucide.createIcons();
  }

  // Mobile menu toggle
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });

    // Close mobile menu on clicking any link
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
      });
    });
  }

  // Setup Batch Calculator listeners
  initBatchCalculator();

  // Make editable team fields persist in localStorage
  initEditableFields();

  // Close lightbox on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeLightbox();
    }
  });

  // Close lightbox on backdrop click
  const lightbox = document.getElementById('lightboxModal');
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });
  }
});

/* ========================================================
   BATCH CALCULATOR LOGIC
   Formula based on standard 100 mL WHO + Neem Formulation:
   - Ethanol (95%): 83.14% (0.8314)
   - H2O2 (3%): 4.17% (0.0417)
   - Glycerol (98%): 1.47% (0.0147)
   - Neem Extract + Sterile Water: Balance 11.22% (0.1122)
   ======================================================== */

function initBatchCalculator() {
  const batchInput = document.getElementById('batchInput');
  const batchSlider = document.getElementById('batchSlider');

  if (!batchInput || !batchSlider) return;

  batchInput.addEventListener('input', (e) => {
    let val = parseFloat(e.target.value) || 0;
    if (val < 0) val = 0;
    batchSlider.value = Math.min(val, 1000);
    updateCalculations(val);
  });

  batchSlider.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    batchInput.value = val;
    updateCalculations(val);
  });

  // Initial calculation run
  updateCalculations(100);
}

function setBatchSize(volume) {
  const batchInput = document.getElementById('batchInput');
  const batchSlider = document.getElementById('batchSlider');

  if (batchInput && batchSlider) {
    batchInput.value = volume;
    batchSlider.value = Math.min(volume, 1000);
    updateCalculations(volume);

    // Update active preset button style
    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.classList.remove('active', 'bg-brand-500', 'shadow');
      btn.classList.add('bg-white/10');
      if (btn.innerText.includes(`${volume} mL`)) {
        btn.classList.add('active', 'bg-brand-500', 'shadow');
        btn.classList.remove('bg-white/10');
      }
    });
  }
}

function updateCalculations(totalVolume) {
  const vol = Math.max(0, parseFloat(totalVolume) || 0);

  // Volumetric breakdown ratios
  const ethVol = +(vol * 0.8314).toFixed(2);
  const h2o2Vol = +(vol * 0.0417).toFixed(2);
  const glycVol = +(vol * 0.0147).toFixed(2);
  const waterNeemVol = +(vol - ethVol - h2o2Vol - glycVol).toFixed(2);

  // Update DOM elements
  const currentBatchLabel = document.getElementById('currentBatchLabel');
  const resEthanol = document.getElementById('resEthanol');
  const resH2O2 = document.getElementById('resH2O2');
  const resGlycerol = document.getElementById('resGlycerol');
  const resWaterNeem = document.getElementById('resWaterNeem');
  const verificationSum = document.getElementById('verificationSum');

  if (currentBatchLabel) currentBatchLabel.textContent = `${vol} mL`;
  if (resEthanol) resEthanol.textContent = ethVol.toLocaleString('en-US', { minimumFractionDigits: 2 });
  if (resH2O2) resH2O2.textContent = h2o2Vol.toLocaleString('en-US', { minimumFractionDigits: 2 });
  if (resGlycerol) resGlycerol.textContent = glycVol.toLocaleString('en-US', { minimumFractionDigits: 2 });
  if (resWaterNeem) resWaterNeem.textContent = waterNeemVol.toLocaleString('en-US', { minimumFractionDigits: 2 });

  if (verificationSum) {
    verificationSum.textContent = `${ethVol} + ${h2o2Vol} + ${glycVol} + ${waterNeemVol} = ${vol.toFixed(2)} mL`;
  }
}

function copyCalculatedRecipe() {
  const batchInput = document.getElementById('batchInput');
  const vol = batchInput ? batchInput.value : 100;
  
  const eth = document.getElementById('resEthanol')?.textContent || '83.14';
  const h2o2 = document.getElementById('resH2O2')?.textContent || '4.17';
  const glyc = document.getElementById('resGlycerol')?.textContent || '1.47';
  const neem = document.getElementById('resWaterNeem')?.textContent || '11.22';

  const textToCopy = `HERBAL NEEM HAND SANITIZER RECIPE (${vol} mL Batch):
• Ethanol (95% v/v): ${eth} mL
• Hydrogen Peroxide (3% v/v): ${h2o2} mL
• Glycerol (98% v/v): ${glyc} mL
• Neem Extract + Sterile Distilled Water: ${neem} mL
Total Homogenized Volume: ${vol} mL
(Formulation based on WHO Guideline + Natural Neem Leaves Phyto-Decoction)`;

  navigator.clipboard.writeText(textToCopy).then(() => {
    const btn = document.getElementById('copyRecipeBtn');
    if (btn) {
      const originalHTML = btn.innerHTML;
      btn.innerHTML = `<i data-lucide="check" class="w-3.5 h-3.5 text-brand-600"></i><span class="text-brand-700 font-bold">Copied!</span>`;
      if (window.lucide) lucide.createIcons();
      setTimeout(() => {
        btn.innerHTML = originalHTML;
        if (window.lucide) lucide.createIcons();
      }, 2500);
    }
  }).catch(err => {
    alert("Recipe: " + textToCopy);
  });
}

/* ========================================================
   LIGHTBOX MODAL LOGIC
   ======================================================== */

function openLightbox(src, caption) {
  const modal = document.getElementById('lightboxModal');
  const img = document.getElementById('lightboxImg');
  const captionEl = document.getElementById('lightboxCaption');

  if (modal && img && captionEl) {
    img.src = src;
    captionEl.textContent = caption || '';
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
    if (window.lucide) lucide.createIcons();
  }
}

function closeLightbox() {
  const modal = document.getElementById('lightboxModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = 'auto';
  }
}

/* ========================================================
   QUIZ INTERACTION LOGIC
   ======================================================== */

function checkAnswer(qNum, choice, btnElement) {
  const parent = btnElement.closest('.quiz-item');
  if (!parent) return;

  // Disable all buttons in this question once answered
  const buttons = parent.querySelectorAll('.quiz-opt');
  const feedback = parent.querySelector('.quiz-feedback');
  const isCorrect = btnElement.getAttribute('data-correct') === 'true';

  buttons.forEach(b => {
    b.disabled = true;
    b.classList.remove('hover:bg-brand-50');
    if (b.getAttribute('data-correct') === 'true') {
      b.classList.add('correct');
    }
  });

  if (!isCorrect) {
    btnElement.classList.add('incorrect');
  }

  if (feedback) {
    feedback.classList.remove('hidden');
    if (isCorrect) {
      feedback.classList.add('bg-emerald-100', 'text-emerald-800', 'border', 'border-emerald-300');
      feedback.innerHTML = `<strong>Correct!</strong> Excellent chemistry understanding. This aligns with scientific and WHO guidelines.`;
    } else {
      feedback.classList.add('bg-rose-100', 'text-rose-800', 'border', 'border-rose-300');
      feedback.innerHTML = `<strong>Incorrect.</strong> The highlighted green option is the scientifically correct answer.`;
    }
  }
}

/* ========================================================
   EDITABLE TEAM NAMES & LOCALSTORAGE PERSISTENCE
   Allows students to click and type their real names/rolls
   ======================================================== */

function initEditableFields() {
  const editableFields = document.querySelectorAll('.editable-field');

  editableFields.forEach((el, index) => {
    el.contentEditable = "true";
    el.spellcheck = false;

    // Load persisted value if exists
    const saved = localStorage.getItem(`neem_team_member_${index}`);
    if (saved) {
      el.textContent = saved;
    }

    el.addEventListener('blur', () => {
      localStorage.setItem(`neem_team_member_${index}`, el.textContent.trim());
    });
  });
}
