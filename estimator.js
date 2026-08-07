/* ==========================================================================
   LOGIN COMPUTERS - Interactive Fix Estimator Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initEstimatorTool();
});

function initEstimatorTool() {
  const deviceOptions = document.querySelectorAll('[data-estimator-device]');
  const serviceOptions = document.querySelectorAll('[data-estimator-service]');
  const tierOptions = document.querySelectorAll('[data-estimator-tier]');

  const priceAmountEl = document.getElementById('estimate-price-val');
  const selectedDeviceTextEl = document.getElementById('summary-device');
  const selectedServiceTextEl = document.getElementById('summary-service');
  const selectedTierTextEl = document.getElementById('summary-tier');
  const whatsappBookBtn = document.getElementById('estimator-whatsapp-btn');

  if (!priceAmountEl) return;

  let state = {
    device: 'Laptop / Notebook',
    service: 'SSD Upgrade (Super Fast Boot)',
    servicePrice: 2500,
    tier: 'Standard OEM Grade',
    tierPrice: 0
  };

  // Event Listeners for Device Cards
  deviceOptions.forEach(card => {
    card.addEventListener('click', () => {
      deviceOptions.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      state.device = card.getAttribute('data-estimator-device');
      updateEstimate();
    });
  });

  // Event Listeners for Service Cards
  serviceOptions.forEach(card => {
    card.addEventListener('click', () => {
      serviceOptions.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      state.service = card.getAttribute('data-service-name');
      state.servicePrice = parseInt(card.getAttribute('data-service-price'), 10);
      updateEstimate();
    });
  });

  // Event Listeners for Component Tiers
  tierOptions.forEach(card => {
    card.addEventListener('click', () => {
      tierOptions.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      state.tier = card.getAttribute('data-tier-name');
      state.tierPrice = parseInt(card.getAttribute('data-tier-price'), 10);
      updateEstimate();
    });
  });

  function updateEstimate() {
    const totalPrice = state.servicePrice + state.tierPrice;

    // Update UI elements
    if (priceAmountEl) {
      priceAmountEl.textContent = `₹${totalPrice.toLocaleString('en-IN')}`;
    }

    if (selectedDeviceTextEl) selectedDeviceTextEl.textContent = state.device;
    if (selectedServiceTextEl) selectedServiceTextEl.textContent = state.service;
    if (selectedTierTextEl) selectedTierTextEl.textContent = state.tier;

    // Build WhatsApp Booking Payload
    if (whatsappBookBtn) {
      const message = encodeURIComponent(
        `Hi Login Computers! I calculated an estimate on your website and would like to book a slot:\n\n` +
        `📱 *Device Type:* ${state.device}\n` +
        `🛠️ *Service Required:* ${state.service}\n` +
        `⚙️ *Component Quality:* ${state.tier}\n` +
        `💰 *Estimated Starting Price:* ₹${totalPrice.toLocaleString('en-IN')}\n\n` +
        `Please confirm repair turnaround and schedule!`
      );
      whatsappBookBtn.href = `https://wa.me/919906405769?text=${message}`;
    }
  }

  // Initial recalculation
  updateEstimate();
}
