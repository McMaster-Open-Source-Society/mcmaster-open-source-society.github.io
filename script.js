
function showEmail() {
  document.getElementById('email-popup').style.display = 'block';
}

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('year').textContent = new Date().getFullYear();
});
