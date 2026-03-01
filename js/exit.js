function confirmExit(e) {
    e.preventDefault();
    const modal = document.getElementById('exitModal');
    modal.classList.remove('hidden');
  }
  
  function closeModal() {
    document.getElementById('exitModal').classList.add('hidden');
  }
  
  function goHome() {
    window.location.href = 'home.html';
  }
  
  window.confirmExit = confirmExit;
  window.closeModal = closeModal;
  window.goHome = goHome;