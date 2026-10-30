const plans = {
  start: {
    name: 'Start - Recorrente - Am26',
    price: 'R$ 64,95',
    after: 'R$ 129,90 mensal',
    includes: ['MUSCULAÇÃO'],
  },
  open: {
    name: 'Open - Recorrente - Am26',
    price: 'R$ 69,95',
    after: 'R$ 139,90 mensal',
    includes: ['MUSCULAÇÃO', 'AULAS COLETIVAS'],
  },
};

const params = new URLSearchParams(window.location.search);
const planId = params.get('plano') === 'open' ? 'open' : 'start';
const plan = plans[planId];

document.getElementById('plan-name').textContent = plan.name;
document.getElementById('plan-price').textContent = plan.price;
document.getElementById('parcela-1').textContent = plan.price;
document.getElementById('parcela-demais').textContent = plan.after;

const includesList = document.getElementById('plan-includes');
includesList.innerHTML = plan.includes.map(item => `
  <li>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
    ${item}
  </li>
`).join('');

document.getElementById('btn-parcelas').addEventListener('click', () => {
  document.getElementById('parcelas-detail').classList.toggle('hidden');
});

document.getElementById('btn-remove-coupon').addEventListener('click', () => {
  document.querySelector('.summary-coupon').innerHTML = `
    <div class="field" style="margin:0">
      <input type="text" id="coupon-input" placeholder="Digite o cupom" style="max-width:100%">
    </div>
  `;
});

document.getElementById('checkout-form').addEventListener('submit', (e) => {
  e.preventDefault();
  alert('Cadastro enviado com sucesso! Em breve entraremos em contato.');
});
